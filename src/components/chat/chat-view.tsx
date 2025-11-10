'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { personaBasedAIChat } from '@/ai/flows/persona-based-ai-chat';
import { summarizeChatHistory } from '@/ai/flows/summarize-chat-history';
import { collection, doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
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

const GUEST_MESSAGE_LIMIT = 5;

export function ChatView({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({ language: 'Shona', defaultPersona: 'Mukoma' });
  
  const [selectedPersona, setSelectedPersona] = useState(settings.defaultPersona);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const isGuest = user?.isAnonymous;
  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const isMessageLimitReached = isGuest && userMessagesCount >= GUEST_MESSAGE_LIMIT;


  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserSettings;
          setSettings(data);
          setSelectedPersona(data.defaultPersona);
          setSelectedLanguage(data.language);
        }
      };
      fetchSettings();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setChatLoading(true);
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'chats', chatId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMessages((data.messages || []).sort((a: ChatMessage, b: ChatMessage) => a.timestamp?.toMillis() - b.timestamp?.toMillis()));
      }
      setChatLoading(false);
    });
    return () => unsub();
  }, [chatId, user]);
  
  useEffect(() => {
      // Auto-scroll to bottom
      if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if(viewport) {
              viewport.scrollTop = viewport.scrollHeight;
          }
      }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || loading || isMessageLimitReached) return;

    setLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      text: newMessage,
      language: selectedLanguage,
      timestamp: serverTimestamp() as any, // Let server set the timestamp
    };
    
    setNewMessage('');
    const chatDocRef = doc(db, 'users', user.uid, 'chats', chatId);
    await updateDoc(chatDocRef, {
      messages: arrayUnion(userMessage),
    });
    
    try {
      const response = await personaBasedAIChat({
        userId: user.uid,
        message: newMessage,
        selectedPersona,
        language: selectedLanguage,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: response.response,
        persona: selectedPersona,
        language: selectedLanguage,
        timestamp: serverTimestamp() as any,
      };

      await updateDoc(chatDocRef, {
        messages: arrayUnion(assistantMessage),
      });

      // Update chat summary in background
      const updatedMessages = [...messages, userMessage, assistantMessage];
      if (updatedMessages.length > 2 && updatedMessages.length % 5 === 0) { // Update summary every 5 messages
        const chatHistoryForSummary = updatedMessages.map(m => ({...m, text: m.text, timestamp: Date.now()}));
        summarizeChatHistory({ chatHistory: chatHistoryForSummary as any }).then(({ summary }) => {
          updateDoc(chatDocRef, { summary });
        });
      }

    } catch (error) {
      console.error('Error with AI chat:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        text: "Sorry, I encountered an error. Please try again.",
        persona: 'system',
        language: 'English',
        timestamp: serverTimestamp() as any,
      };
      await updateDoc(chatDocRef, {
        messages: arrayUnion(errorMessage),
      });
    } finally {
      setLoading(false);
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
        <h1 className="text-xl font-semibold font-headline">Chat</h1>
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
            <Select value={selectedPersona} onValueChange={setSelectedPersona} disabled={isMessageLimitReached}>
              <SelectTrigger>
                <SelectValue placeholder="Select Persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isMessageLimitReached}>
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
              placeholder="Type your message..."
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
