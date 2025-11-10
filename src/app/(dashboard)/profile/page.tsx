'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import Link from 'next/link';


export default function ProfilePage() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [loading, setLoading] = useState(false);
    const isGuest = user?.isAnonymous;

    if (!user) return null;
    
    if (isGuest) {
        return (
            <main className="flex h-full flex-col">
                <header className="flex h-16 items-center border-b bg-secondary/50 px-6 shrink-0">
                    <h1 className="text-xl font-semibold font-headline">Profile</h1>
                </header>
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                    <Card className="max-w-md w-full mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">Guest Mode</CardTitle>
                             <CardDescription className="text-center">
                                Create an account to access your profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                            <UserIcon className="h-16 w-16 text-muted-foreground" />
                            <p>You are currently browsing as a guest.</p>
                            <Button asChild>
                                <Link href="/auth">Sign Up / Sign In</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    const handleSaveChanges = async () => {
        if (!user) return;
        setLoading(true);

        try {
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
            }

            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { displayName }, { merge: true });

            toast({
                title: "Profile Updated",
                description: "Your display name has been updated.",
            });
            // This will trigger a re-render in useAuth and update the UI
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error updating profile",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="flex h-full flex-col">
            <header className="flex h-16 items-center border-b bg-secondary/50 px-6 shrink-0">
                <h1 className="text-xl font-semibold font-headline">Profile</h1>
            </header>
            <div className="flex-1 overflow-auto p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                                <AvatarFallback className="text-2xl">
                                    {user.photoURL ? <UserIcon /> : getInitials(user.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-semibold">{user.displayName || 'Anonymous User'}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email ?? ''} disabled />
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={handleSaveChanges} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
