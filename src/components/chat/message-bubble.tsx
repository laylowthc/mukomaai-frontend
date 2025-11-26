'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { personas } from '@/lib/personas';
import { useUser } from '@/firebase';

interface MessageBubbleProps {
  message: Partial<ChatMessage>;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user: authUser } = useUser();
  const isUser = message.role === 'user';
  const persona = message.persona ? personas.find(p => p.id === message.persona) : null;
  const personaImage = persona?.avatarUrl;
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const avatarSrc = isUser ? authUser?.photoURL : personaImage;
  const avatarFallback = isUser 
    ? <AvatarFallback>{getInitials(authUser?.displayName)}</AvatarFallback> 
    : <AvatarFallback><Bot /></AvatarFallback>;

  return (
    <div className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={personaImage} />
          <AvatarFallback><Bot /></AvatarFallback>
        </Avatar>
      )}
      <div className="max-w-[75%] space-y-1">
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm md:text-base',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          )}
        >
          {message.text === '...' ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-current animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
              <span className="h-2 w-2 rounded-full bg-current animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-current animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.4s]"></span>
            </div>
          ) : (
            <p>{message.text}</p>
          )}
        </div>
        {!isUser && persona && (
          <p className="text-xs text-muted-foreground">{persona.displayName}</p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={authUser?.photoURL ?? undefined} />
           <AvatarFallback>{getInitials(authUser?.displayName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
