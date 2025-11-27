'use server';
/**
 * @fileOverview Implements a persona-based AI chat flow where the user can select a persona to tailor the AI's responses.
 *
 * - personaBasedAIChat - A function that handles the persona-based AI chat.
 * - PersonaBasedAIChatInput - The input type for the personaBasedAIChat function.
 * - PersonaBasedAIChatOutput - The return type for the personaBasedAIChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { personas } from '@/lib/personas';

const PersonaBasedAIChatInputSchema = z.object({
  userId: z.string().describe('The ID of the user initiating the chat.'),
  message: z.string().describe('The user message to be sent to the AI assistant.'),
  selectedPersona: z.string().describe('The selected persona ID for the AI assistant.'),
  language: z.string().describe('The language in which the conversation should be conducted.'),
});
export type PersonaBasedAIChatInput = z.infer<typeof PersonaBasedAIChatInputSchema>;

const PersonaBasedAIChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response, tailored to the selected persona."),
});
export type PersonaBasedAIChatOutput = z.infer<typeof PersonaBasedAIChatOutputSchema>;

// For now we hardcode the backend URL used by Mukoma.ai (Render backend)
const MUKOMA_BACKEND_URL = 'https://mukomaai-backend.onrender.com/mukoma-ai';

export async function personaBasedAIChat(
  input: PersonaBasedAIChatInput
): Promise<PersonaBasedAIChatOutput> {
  return personaBasedAIChatFlow(input);
}

const personaBasedAIChatFlow = ai.defineFlow(
  {
    name: 'personaBasedAIChatFlow',
    inputSchema: PersonaBasedAIChatInputSchema,
    outputSchema: PersonaBasedAIChatOutputSchema,
  },
  async (input) => {
    const persona = personas.find((p) => p.id === input.selectedPersona);
    if (!persona) {
      throw new Error(`Persona with id "${input.selectedPersona}" not found.`);
    }

    // We still use the persona’s system prompt to give the backend context if we want
    const systemPrompt = persona.systemPrompt;

    // This is what we send to the MukomaAI backend
    const payload = {
      message: `${systemPrompt}\n\nUser language: ${input.language}\n\nUser: ${input.message}`,
      persona: input.selectedPersona,
      language: input.language,
    };

    // Call your Render backend instead of Gemini directly
    const res = await fetch(MUKOMA_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Mukoma backend error status:', res.status);
      throw new Error(`Mukoma.ai backend returned ${res.status}`);
    }

    const data = await res.json().catch((err) => {
      console.error('Failed to parse Mukoma backend JSON:', err);
      throw new Error('Invalid JSON from Mukoma.ai backend');
    });

    const reply =
      data?.reply ??
      data?.response ??
      'Sorry, something went wrong talking to Mukoma.ai backend.';

    return { response: reply };
  }
);
