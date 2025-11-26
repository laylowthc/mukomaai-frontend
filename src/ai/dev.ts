import { config } from 'dotenv';
config();

import '@/ai/flows/generate-default-profile-settings.ts';
import '@/ai/flows/summarize-chat-history.ts';
import '@/ai/flows/persona-based-ai-chat.ts';