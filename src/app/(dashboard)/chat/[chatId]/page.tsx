
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ChatView } from '@/components/chat/chat-view';
import { Bot } from 'lucide-react';

const useNewChatRedirect = (chatId: string) => {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (chatId === 'new' && user && firestore) {
      const newChatId = uuidv4();
      const chatRef = doc(firestore, 'users', user.uid, 'chats', newChatId);
      
      // Use a then() to handle successful navigation, errors are caught by the non-blocking helper
      setDocumentNonBlocking(chatRef, { 
        createdAt: new Date(),
        id: newChatId,
        userId: user.uid,
        messages: [],
        summary: "New Chat"
      }, { merge: true });
      
      // We can optimistically navigate
      router.replace(`/chat/${newChatId}`);
    }
  }, [chatId, user, router, firestore]);

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
