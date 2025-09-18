'use server';
/**
 * @fileOverview An AI agent that suggests clothing items based on user preferences.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWardrobeFromPreferencesInputSchema = z.object({
  style: z
    .string()
    .describe('The preferred style of clothing (e.g., casual, formal, business).'),
  color: z
    .string()
    .describe('The preferred color of clothing (e.g. any, bright, dark, neutral).'),
  price: z.string().describe("The user's preferred price range for items."),
  bodyScanDataUri: z
    .string()
    .describe(
      "A body scan as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  trendData: z.string().optional().describe('Trend data to incorporate into the suggestions.'),
});
export type SuggestWardrobeFromPreferencesInput = z.infer<typeof SuggestWardrobeFromPreferencesInputSchema>;

const ClothingItemSchema = z.object({
    itemName: z.string().describe("The name of the clothing item, e.g., 'Slim-Fit Linen Shirt'."),
    itemType: z.string().describe("The type of clothing, e.g., 'Shirt', 'Trousers'."),
    store: z.string().describe("The name of a popular online store or brand where the user could find this item, e.g., 'Zara', 'H&M', 'Nike'."),
    suitabilityScore: z.number().min(0).max(1).describe("A score from 0 to 1 indicating how well this item matches the user's preferences."),
});

const SuggestWardrobeFromPreferencesOutputSchema = z.object({
  suggestions: z
    .array(ClothingItemSchema)
    .describe('An array of 4 clothing item suggestions based on the provided preferences.'),
});
export type SuggestWardrobeFromPreferencesOutput = z.infer<typeof SuggestWardrobeFromPreferencesOutputSchema>;


const suggestionPrompt = ai.definePrompt({
  name: 'suggestWardrobeFromPreferencesPrompt',
  input: {schema: SuggestWardrobeFromPreferencesInputSchema},
  output: {schema: SuggestWardrobeFromPreferencesOutputSchema},
  prompt: `You are a personal stylist AI. You will suggest 4 clothing items based on the user's preferences, body scan, and current trends.

  For each item, you must provide:
  1.  A specific item name (e.g., "Vintage Wash Denim Jacket").
  2.  The general item type (e.g., "Jacket").
  3.  A popular online store or brand where this type of item can be found (e.g., "Zara", "ASOS", "Nike").
  4.  A suitability score (0-1) indicating how well the item matches the user's preferences.

  User Preferences:
  Style: {{{style}}}
  Color: {{{color}}}
  Price Range: {{{price}}}
  Body Scan: {{media url=bodyScanDataUri}}
  Trend Data: {{{trendData}}}

  Provide exactly 4 suggestions.
  `,
});

export async function suggestWardrobeFromPreferences(
  input: SuggestWardrobeFromPreferencesInput
): Promise<SuggestWardrobeFromPreferencesOutput> {
  return suggestWardrobeFromPreferencesFlow(input);
}


const suggestWardrobeFromPreferencesFlow = ai.defineFlow(
  {
    name: 'suggestWardrobeFromPreferencesFlow',
    inputSchema: SuggestWardrobeFromPreferencesInputSchema,
    outputSchema: SuggestWardrobeFromPreferencesOutputSchema,
  },
  async input => {
    const {output} = await suggestionPrompt(input);
    if (!output) {
      throw new Error('Could not generate wardrobe suggestions.');
    }
    return output;
  }
);
