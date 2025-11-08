'use server';
/**
 * @fileOverview Implements a persona-based AI chat flow where the user can select a persona to tailor the AI's responses.
 *
 * - personaBasedAIChat - A function that handles the persona-based AI chat.
 * - PersonaBasedAIChatInput - The input type for the personaBasedAIChat function.
 * - PersonaBasedAIChatOutput - The return type for the personaBasedAIChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonaBasedAIChatInputSchema = z.object({
  userId: z.string().describe('The ID of the user initiating the chat.'),
  message: z.string().describe('The user message to be sent to the AI assistant.'),
  selectedPersona: z.string().describe('The selected persona for the AI assistant.'),
  language: z.string().describe('The language in which the conversation should be conducted.'),
});
export type PersonaBasedAIChatInput = z.infer<typeof PersonaBasedAIChatInputSchema>;

const PersonaBasedAIChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response, tailored to the selected persona.'),
});
export type PersonaBasedAIChatOutput = z.infer<typeof PersonaBasedAIChatOutputSchema>;

export async function personaBasedAIChat(input: PersonaBasedAIChatInput): Promise<PersonaBasedAIChatOutput> {
  return personaBasedAIChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personaBasedAIChatPrompt',
  input: {schema: PersonaBasedAIChatInputSchema},
  output: {schema: PersonaBasedAIChatOutputSchema},
  prompt: `You are an AI assistant. Your persona is: {{{selectedPersona}}}. Respond to the user in the following language: {{{language}}}.\n\nUser: {{{message}}}`,
});

const personaBasedAIChatFlow = ai.defineFlow(
  {
    name: 'personaBasedAIChatFlow',
    inputSchema: PersonaBasedAIChatInputSchema,
    outputSchema: PersonaBasedAIChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
