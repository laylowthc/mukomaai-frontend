'use client';

import { useTheme } from '@/hooks/use-theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { personas } from '@/lib/personas';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import Link from 'next/link';

type UserSettings = {
    language: 'Shona' | 'English' | 'Ndebele';
    defaultPersona: string;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { user } = useUser();
    const firestore = useFirestore();
    const [settings, setSettings] = useState<UserSettings>({ language: 'Shona', defaultPersona: 'Mukoma' });
    const [loading, setLoading] = useState(true);
    const isGuest = user?.isAnonymous;

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userDoc, isLoading: userDocLoading } = useDoc<UserSettings>(userDocRef);
    
    useEffect(() => {
        if (userDoc) {
            setSettings({
                language: userDoc.language || 'Shona',
                defaultPersona: userDoc.defaultPersona || 'Mukoma',
            });
        }
        setLoading(userDocLoading);
    }, [userDoc, userDocLoading]);

    const handleSave = async () => {
        if (!userDocRef) return;
        setDocumentNonBlocking(userDocRef, { ...settings }, { merge: true });
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        });
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center"><p>Loading settings...</p></div>
    }
    
    if (isGuest) {
        return (
            <main className="flex h-full flex-col">
                <header className="flex h-16 items-center border-b bg-secondary/50 px-6 shrink-0">
                    <h1 className="text-xl font-semibold font-headline">Settings</h1>
                </header>
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                    <Card className="max-w-md w-full mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">Guest Mode</CardTitle>
                            <CardDescription className="text-center">
                                Create an account to customize your experience.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                            <User className="h-16 w-16 text-muted-foreground" />
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

    return (
        <main className="flex h-full flex-col">
            <header className="flex h-16 items-center border-b bg-secondary/50 px-6 shrink-0">
                <h1 className="text-xl font-semibold font-headline">Settings</h1>
            </header>
            <div className="flex-1 overflow-auto p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>
                            Customize your MukomaAI experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="dark-mode">Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                            </div>
                            <Switch
                                id="dark-mode"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>                            <Select
                                value={settings.language}
                                onValueChange={(value) => setSettings(s => ({ ...s, language: value as UserSettings['language'] }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Shona">Shona</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Ndebele">Ndebele</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">Choose your preferred language for conversation.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="persona">Default Persona</Label>
                            <Select
                                value={settings.defaultPersona}
                                onValueChange={(value) => setSettings(s => ({ ...s, defaultPersona: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select default persona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {personas.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">This persona will be selected by default for new chats.</p>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={handleSave}>Save Preferences</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
