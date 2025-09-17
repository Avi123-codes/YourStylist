'use server';
/**
 * @fileOverview Rates an outfit provided as an image and provides suggestions for improvement.
 *
 * - rateOutfitAndSuggestImprovements - A function that handles the outfit rating and suggestion process.
 * - OutfitRatingAndSuggestionsInput - The input type for the rateOutfitAndSuggestImprovements function.
 * - OutfitRatingAndSuggestionsOutput - The return type for the rateOutfitAndSuggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OutfitRatingAndSuggestionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the outfit to be rated, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OutfitRatingAndSuggestionsInput = z.infer<typeof OutfitRatingAndSuggestionsInputSchema>;

const OutfitRatingAndSuggestionsOutputSchema = z.object({
  rating: z.number().describe('The rating of the outfit out of 10.'),
  suggestions: z.string().describe('Specific suggestions for improving the outfit.'),
});
export type OutfitRatingAndSuggestionsOutput = z.infer<typeof OutfitRatingAndSuggestionsOutputSchema>;

export async function rateOutfitAndSuggestImprovements(
  input: OutfitRatingAndSuggestionsInput
): Promise<OutfitRatingAndSuggestionsOutput> {
  return outfitRatingAndSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'outfitRatingAndSuggestionsPrompt',
  input: {schema: OutfitRatingAndSuggestionsInputSchema},
  output: {schema: OutfitRatingAndSuggestionsOutputSchema},
  prompt: `You are a personal stylist with expertise in rating outfits and providing constructive feedback.

You will be given a photo of an outfit and must rate it out of 10, and provide specific suggestions for improvement.

Analyze the outfit in the following photo:
{{media url=photoDataUri}}

Consider these factors:
* Color coordination
* Fit and silhouette
* Appropriateness for the occasion
* Overall style and cohesiveness`,
});

const outfitRatingAndSuggestionsFlow = ai.defineFlow(
  {
    name: 'outfitRatingAndSuggestionsFlow',
    inputSchema: OutfitRatingAndSuggestionsInputSchema,
    outputSchema: OutfitRatingAndSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
