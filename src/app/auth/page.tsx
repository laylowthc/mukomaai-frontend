'use client';

import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bot } from 'lucide-react';

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Bot className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
                <Bot className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold font-headline">MukomaAI</h1>
            </div>
          <p className="text-muted-foreground">Your Shona-First AI Assistant</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
