'use server';
/**
 * @fileOverview An AI agent that superimposes clothing items onto a user's body scan.
 *
 * - virtualTryOn - A function that handles the virtual try-on process.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const VirtualTryOnInputSchema = z.object({
  bodyScanDataUri: z
    .string()
    .describe(
      "The user's body scan as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  clothingItems: z.array(z.object({
    category: z.string().describe("The category of the clothing item, e.g., 'Top', 'Bottoms'."),
    imageDataUri: z.string().describe("The image of the clothing item as a data URI."),
  })).describe('An array of clothing items to try on.'),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

export const VirtualTryOnOutputSchema = z.object({
  image: z.string().url().describe('The generated image of the user wearing the clothes, as a data URI.'),
  rating: z.number().describe('The rating of the outfit out of 10.'),
  suggestions: z.string().describe('Specific suggestions for improving the outfit.'),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(
  input: VirtualTryOnInput
): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    const { bodyScanDataUri, clothingItems } = input;

    // Generate the image
    const promptParts = [
        { media: { url: bodyScanDataUri } },
        { text: "Superimpose the following clothing items onto the person in the body scan. The person should look realistic and be wearing all the provided items. Only show the person wearing the clothes, with a clean studio background. The output should be just the final image."}
    ];

    for (const item of clothingItems) {
        promptParts.push({ media: { url: item.imageDataUri } });
        promptParts.push({ text: `This is a ${item.category}.` });
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: promptParts,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    const generatedImageUri = media.url;
    if (!generatedImageUri) {
        throw new Error('Image generation failed.');
    }

    // Rate the outfit
    const { output: ratingOutput } = await ai.run('outfitRatingAndSuggestionsFlow', {
      photoDataUri: generatedImageUri,
    });
    
    if (!ratingOutput) {
      throw new Error('Failed to get outfit rating.');
    }

    return {
      image: generatedImageUri,
      rating: ratingOutput.rating,
      suggestions: ratingOutput.suggestions,
    };
  }
);
