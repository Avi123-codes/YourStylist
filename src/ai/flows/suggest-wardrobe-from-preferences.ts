'use server';
/**
 * @fileOverview An AI agent that suggests clothing items based on user preferences, body scan data, and trend data.
 *
 * - suggestWardrobeFromPreferences - A function that suggests clothing items based on user preferences.
 * - SuggestWardrobeFromPreferencesInput - The input type for the suggestWardrobeFromPreferences function.
 * - SuggestWardrobeFromPreferencesOutput - The return type for the suggestWardrobeFromPreferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWardrobeFromPreferencesInputSchema = z.object({
  style: z.string().describe('The preferred style of clothing (e.g., casual, formal, business).'),
  color: z.string().describe('The preferred color of clothing.'),
  bodyScanDataUri: z
    .string()
    .describe(
      "A body scan as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  trendData: z.string().optional().describe('Trend data to incorporate into the suggestions.'),
});
export type SuggestWardrobeFromPreferencesInput = z.infer<typeof SuggestWardrobeFromPreferencesInputSchema>;

const SuggestWardrobeFromPreferencesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of clothing item suggestions based on the provided preferences.'),
  suitabilityScores: z
    .array(z.number())
    .describe('An array of suitability scores for each clothing item suggestion.'),
});
export type SuggestWardrobeFromPreferencesOutput = z.infer<typeof SuggestWardrobeFromPreferencesOutputSchema>;

export async function suggestWardrobeFromPreferences(
  input: SuggestWardrobeFromPreferencesInput
): Promise<SuggestWardrobeFromPreferencesOutput> {
  return suggestWardrobeFromPreferencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWardrobeFromPreferencesPrompt',
  input: {schema: SuggestWardrobeFromPreferencesInputSchema},
  output: {schema: SuggestWardrobeFromPreferencesOutputSchema},
  prompt: `You are a personal stylist AI. You will suggest clothing items based on the user's preferences, body scan data, and trend data.

  Preferences:
  Style: {{{style}}}
  Color: {{{color}}}
  Body Scan: {{media url=bodyScanDataUri}}
  Trend Data: {{{trendData}}}

  Suggest clothing items incorporating trend data and suitability scores. Provide the output as a JSON object with "suggestions" and "suitabilityScores" fields.
  `,
});

const suggestWardrobeFromPreferencesFlow = ai.defineFlow(
  {
    name: 'suggestWardrobeFromPreferencesFlow',
    inputSchema: SuggestWardrobeFromPreferencesInputSchema,
    outputSchema: SuggestWardrobeFromPreferencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
