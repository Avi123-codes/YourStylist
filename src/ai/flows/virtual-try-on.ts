'use server';
/**
 * @fileOverview An AI agent that rates and provides feedback on a user's chosen outfit.
 *
 * - virtualTryOn - A function that handles the virtual try-on analysis.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualTryOnInputSchema = z.object({
  bodyScanDataUri: z
    .string()
    .describe(
      "The user's body scan as a data URI. This is used to understand the user's body shape."
    ),
  clothingItems: z.array(z.object({
    category: z.string().describe("The category of the clothing item, e.g., 'Top', 'Bottoms'."),
    imageDataUri: z.string().describe("The image of the clothing item as a data URI."),
  })).describe('An array of clothing items to analyze.'),
   userProfile: z.object({
    height: z.string(),
    weight: z.string(),
    gender: z.string(),
    age: z.string(),
  }).describe("The user's profile information."),
  occasion: z.string().describe("The occasion the user is dressing for, e.g., 'Date Night', 'Casual Hangout'."),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

const VirtualTryOnOutputSchema = z.object({
  rating: z.number().describe('The rating of the outfit out of 10.'),
  suggestions: z.string().describe('A concise (6-7 lines) set of specific, detailed suggestions and the reasoning for the rating, considering the occasion, color theory, fit for the user\'s height, and overall coherence of the outfit.'),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(
  input: VirtualTryOnInput
): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}


const prompt = ai.definePrompt({
    name: 'virtualOutfitAnalysisPrompt',
    input: {schema: VirtualTryOnInputSchema},
    output: {schema: VirtualTryOnOutputSchema},
    prompt: `You are an expert personal stylist. Your task is to analyze an outfit combination for a user and provide a rating out of 10, along with a detailed thought process for your suggestions.

    USER PROFILE:
    - Age: {{{userProfile.age}}}
    - Height: {{{userProfile.height}}} cm
    - Weight: {{{userProfile.weight}}} kg
    - Gender: {{{userProfile.gender}}}
    - Body Scan (for body shape reference): {{media url=bodyScanDataUri}}

    CLOTHING ITEMS:
    {{#each clothingItems}}
    - Category: {{{this.category}}}
      - Image: {{media url=this.imageDataUri}}
    {{/each}}
    
    OCCASION: {{{occasion}}}

    ANALYSIS:
    Based on all the information above, please provide a rating and detailed suggestions.

    Your "suggestions" should include your thought process in a concise manner (about 6-7 lines). Explain WHY you are giving this rating. Consider the following:
    1.  **Occasion Suitability:** Is the outfit appropriate for the specified occasion?
    2.  **Color Coordination & Theory:** Do the colors of the items complement each other?
    3.  **Fit & Proportions:** How will these items likely fit on someone with the user's height and body shape? Do they create a balanced silhouette?
    4.  **Overall Cohesion & Style:** Does the outfit tell a coherent style story?
    5.  **Actionable Advice:** Provide clear, constructive feedback. For example, instead of saying "the pants are bad," say "a slim-fit chino in a neutral color would create a more elongated silhouette for your height."

    Provide the output in the specified JSON format.`,
});


const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate outfit analysis.');
    }
    return output;
  }
);
