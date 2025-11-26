import React from 'react';
import { ChatView } from '@/components/chat/chat-view';

export default function Page({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = React.use(params);
  return <ChatView chatId={chatId} />;
}
