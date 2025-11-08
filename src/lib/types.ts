import type { Timestamp } from 'firebase/firestore';

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatarUrl?: string;
  imageHint?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  language: 'Shona' | 'English' | 'Ndebele';
  timestamp: Timestamp;
  persona?: string;
}

export interface Chat {
    id: string;
    createdAt: Timestamp;
    messages: ChatMessage[];
    summary?: string;
}

export interface UserSettings {
    language: 'Shona' | 'English' | 'Ndebele';
    defaultPersona: string;
    theme?: 'light' | 'dark';
}
