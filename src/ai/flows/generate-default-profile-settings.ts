'use server';

/**
 * @fileOverview Generates default profile settings and persona recommendations for new users.
 *
 * - generateDefaultProfileSettings - A function that generates default profile settings.
 * - GenerateDefaultProfileSettingsInput - The input type for the generateDefaultProfileSettings function (currently empty).
 * - GenerateDefaultProfileSettingsOutput - The return type for the generateDefaultProfileSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDefaultProfileSettingsInputSchema = z.object({});
export type GenerateDefaultProfileSettingsInput = z.infer<typeof GenerateDefaultProfileSettingsInputSchema>;

const GenerateDefaultProfileSettingsOutputSchema = z.object({
  theme: z.enum(['light', 'dark']).describe('The default theme for the user interface.'),
  language: z.enum(['Shona', 'English', 'Ndebele']).describe('The default language for the user interface.'),
  defaultPersona: z.string().describe('The key of the recommended default persona.'),
});
export type GenerateDefaultProfileSettingsOutput = z.infer<typeof GenerateDefaultProfileSettingsOutputSchema>;

export async function generateDefaultProfileSettings(
  input: GenerateDefaultProfileSettingsInput
): Promise<GenerateDefaultProfileSettingsOutput> {
  return generateDefaultProfileSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDefaultProfileSettingsPrompt',
  input: {schema: GenerateDefaultProfileSettingsInputSchema},
  output: {schema: GenerateDefaultProfileSettingsOutputSchema},
  prompt: `You are an AI assistant that helps new users set up their profile.

  Based on common preferences, provide a default theme (light or dark), a default language (Shona, English, or Ndebele), and a recommended default persona key.  Do not justify your choices.
  The available personas are Mukoma, Muzukuru, Tateguru, Ghetto Oracle, and Corporate Guru.
  Return only a JSON object that conforms to the following schema:
  {
    "theme": "light | dark",
    "language": "Shona | English | Ndebele",
    "defaultPersona": "Mukoma | Muzukuru | Tateguru | Ghetto Oracle | Corporate Guru"
  }
  `,
});

const generateDefaultProfileSettingsFlow = ai.defineFlow(
  {
    name: 'generateDefaultProfileSettingsFlow',
    inputSchema: GenerateDefaultProfileSettingsInputSchema,
    outputSchema: GenerateDefaultProfileSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
