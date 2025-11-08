'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { ChatView } from '@/components/chat/chat-view';
import { Bot } from 'lucide-react';

// This is a client-side workaround to generate a new chat ID and redirect.
// In a real-world scenario, this might be handled by a server action.
const useNewChatRedirect = (chatId: string) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (chatId === 'new' && user) {
      const newChatId = uuidv4();
      const chatRef = doc(db, 'users', user.uid, 'chats', newChatId);
      
      // We create an empty chat document to make it appear in the sidebar
      setDoc(chatRef, { 
        createdAt: new Date(),
        id: newChatId,
        messages: [],
        summary: "New Chat"
      }).then(() => {
        router.replace(`/chat/${newChatId}`);
      });
    }
  }, [chatId, user, router]);

  return chatId === 'new';
};


export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const isRedirecting = useNewChatRedirect(chatId);

  if (isRedirecting || !chatId || chatId === 'new') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Bot className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Starting new chat...</p>
      </div>
    );
  }

  return <ChatView chatId={chatId} />;
}
