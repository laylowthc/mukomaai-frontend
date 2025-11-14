
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { personaBasedAIChat } from '@/ai/flows/persona-based-ai-chat';
import { summarizeChatHistory } from '@/ai/flows/summarize-chat-history';
import { collection, doc, updateDoc, arrayUnion, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import type { ChatMessage, UserSettings } from '@/lib/types';
import { personas } from '@/lib/personas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, Languages, User as UserIcon } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarTrigger } from '../ui/sidebar';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const GUEST_MESSAGE_LIMIT = 5;

export function ChatView({ chatId }: { chatId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({ language: 'Shona', defaultPersona: 'mukoma' });
  
  const [selectedPersona, setSelectedPersona] = useState(settings.defaultPersona);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isGuest = user?.isAnonymous;
  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const isMessageLimitReached = isGuest && userMessagesCount >= GUEST_MESSAGE_LIMIT;

  const chatDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'chats', chatId);
  }, [user, firestore, chatId]);

  const { data: chatDoc, isLoading: chatLoading } = useDoc<{messages: ChatMessage[], summary?: string}>(chatDocRef);

  useEffect(() => {
    if (chatDoc?.messages) {
      setMessages(chatDoc.messages.sort((a, b) => (a.timestamp?.toMillis() ?? 0) - (b.timestamp?.toMillis() ?? 0)));
    } else {
      setMessages([]);
    }
  }, [chatDoc]);

  const userSettingsDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userSettingsDoc } = useDoc<UserSettings>(userSettingsDocRef);

  useEffect(() => {
    if (userSettingsDoc) {
        const data = userSettingsDoc;
        setSettings(data);
        if (chatId === 'new') { // Only set defaults for a new chat
            setSelectedPersona(data.defaultPersona || 'mukoma');
            setSelectedLanguage(data.language || 'Shona');
        }
    }
  }, [userSettingsDoc, chatId]);

  
  useEffect(() => {
      if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if(viewport) {
              viewport.scrollTop = viewport.scrollHeight;
          }
      }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || loading || isMessageLimitReached || !chatDocRef) return;

    setLoading(true);
    const text = newMessage;
    setNewMessage('');

    const userMessage: ChatMessage = {
      role: 'user',
      text: text,
      language: selectedLanguage,
      timestamp: new Date(), // Use JS Date for optimistic update
    };
    
    // Optimistically update UI
    setMessages(currentMessages => [...currentMessages, userMessage]);
    
    // Prepare data for Firestore with serverTimestamp
    const userMessageForFirestore = {
      ...userMessage,
      timestamp: serverTimestamp(),
    };

    updateDocumentNonBlocking(chatDocRef, {
      messages: arrayUnion(userMessageForFirestore),
    });
    
    try {
      const response = await personaBasedAIChat({
        userId: user.uid,
        message: text,
        selectedPersona,
        language: selectedLanguage,
      });

      const assistantMessageForFirestore = {
        role: 'assistant' as const,
        text: response.response,
        persona: selectedPersona,
        language: selectedLanguage,
        timestamp: serverTimestamp(),
      };

      updateDocumentNonBlocking(chatDocRef, {
        messages: arrayUnion(assistantMessageForFirestore),
      });

      // Optimistically update for summary
      const assistantMessageForUI = {
        ...assistantMessageForFirestore,
        timestamp: new Date(), // Use JS Date for UI
      };
      const updatedMessages = [...messages, userMessage, assistantMessageForUI];
      if (updatedMessages.length > 2 && updatedMessages.length % 5 === 0) {
        // We don't need to wait for this background task
        summarizeAndUpdate();
      }

    } catch (error) {
      console.error('Error with AI chat:', error);
       toast({
        variant: "destructive",
        title: "AI Error",
        description: "Sorry, I encountered an error. Please try again.",
      });
      // Optionally remove the optimistic user message if AI fails
      setMessages(currentMessages => currentMessages.filter(m => m !== userMessage));
      // You might also want to remove it from Firestore here if needed.
    } finally {
      setLoading(false);
    }
  };

  const summarizeAndUpdate = async () => {
    if (!chatDocRef) return;
    const currentDoc = await getDoc(chatDocRef);
    const currentMessages = currentDoc.data()?.messages || [];
    
    if (currentMessages.length > 2) {
      const chatHistoryForSummary = currentMessages.map((m: any) => ({ // Use 'any' to handle both server and client timestamps
        role: m.role,
        text: m.text,
        language: m.language,
        timestamp: m.timestamp?.toMillis ? m.timestamp.toMillis() : (m.timestamp instanceof Date ? m.timestamp.getTime() : Date.now()),
      }));

      try {
        const { summary } = await summarizeChatHistory({ chatHistory: chatHistoryForSummary });
        updateDocumentNonBlocking(chatDocRef, { summary });
      } catch (e) {
        console.error("Failed to summarize chat history:", e);
      }
    }
  };

  const renderGuestLimitMessage = () => {
    if (!isMessageLimitReached) return null;
    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-secondary rounded-lg">
                <UserIcon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Message Limit Reached</h3>
                <p className="text-muted-foreground mb-4">
                    You've reached your message limit for guest mode. Please create an account to continue chatting.
                </p>
                <Button asChild>
                    <Link href="/auth">Sign Up / Sign In</Link>
                </Button>
            </div>
        </div>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-secondary/50 px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold font-headline">{chatDoc?.summary || "Chat"}</h1>
      </header>
      {chatLoading ? (
        <div className="flex flex-1 items-center justify-center">
            <Bot className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {loading && <MessageBubble message={{role: 'assistant', text: '...'}} />}
        </div>
        {renderGuestLimitMessage()}
      </ScrollArea>
      )}
      <div className="border-t bg-secondary/50 p-4">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedPersona} onValueChange={setSelectedPersona} disabled={isMessageLimitReached || loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isMessageLimitReached || loading}>
              <SelectTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Shona">Shona</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Ndebele">Ndebele</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              autoComplete="off"
              placeholder="Nyora pano..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading || isMessageLimitReached}
            />
            <Button type="submit" disabled={loading || !newMessage.trim() || isMessageLimitReached}>
              {loading ? (
                <Bot className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
