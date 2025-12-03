'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { LogOut, MessageSquare, MessageSquarePlus, Settings, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Chat } from '@/lib/types';

export function AppSidebar() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();

  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'chats'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: chats = [] } = useCollection<Chat>(chatsQuery);

  const isGuest = user?.isAnonymous;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderUserProfile = () => {
    if (isGuest) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/auth">
              <User />
              <span>Sign Up / Sign In</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    }

    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL ?? ''} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <span>{user?.displayName || 'Profile'}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => auth.signOut()}>
            <LogOut />
            Logout
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    )
  }

  const newChatHref = isGuest ? '/auth' : '/chat/new';

  return (
    <>
      <div className="absolute top-4 left-4 z-20 md:hidden">
        <SidebarTrigger />
      </div>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="MukomaAI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold">MukomaAI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/chat')}>
                <Link href="/chat">
                  <MessageSquare />
                  Chat
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/market'}>
                <Link href="/market">
                  <ShoppingCart />
                  Marketplace
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={newChatHref}>
                    <MessageSquarePlus />
                    Hurukuro Itsva
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {chats && chats.map(chat => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`} variant="ghost" size="sm">
                    <Link href={`/chat/${chat.id}`}>
                      {chat.summary || 'New Chat'}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {renderUserProfile()}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
