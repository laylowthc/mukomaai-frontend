import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md">
        <MessageSquarePlus className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold font-headline">Welcome to MukomaAI</h1>
        <p className="mt-2 text-muted-foreground">
          Select a conversation from the sidebar or start a new one to begin chatting.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/chat/new">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </div>
    </main>
  );
}
