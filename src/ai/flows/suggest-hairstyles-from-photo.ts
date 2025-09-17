'use server';
/**
 * @fileOverview An AI agent that suggests hairstyles based on a user's face photo.
 *
 * - suggestHairstylesFromPhoto - A function that handles the hairstyle suggestion process.
 * - SuggestHairstylesFromPhotoInput - The input type for the suggestHairstylesFromPhoto function.
 * - SuggestHairstylesFromPhotoOutput - The return type for the suggestHairstylesFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHairstylesFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestHairstylesFromPhotoInput = z.infer<
  typeof SuggestHairstylesFromPhotoInputSchema
>;

const SuggestHairstylesFromPhotoOutputSchema = z.array(
  z.object({
    hairstyle: z.string().describe('The name of the suggested hairstyle.'),
    suitabilityScore: z
      .number()
      .describe(
        'A score indicating the suitability of the hairstyle for the user, ranging from 0 to 1.'
      ),
    description: z.string().describe('A description of the hairstyle.'),
  })
);
export type SuggestHairstylesFromPhotoOutput = z.infer<
  typeof SuggestHairstylesFromPhotoOutputSchema
>;

export async function suggestHairstylesFromPhoto(
  input: SuggestHairstylesFromPhotoInput
): Promise<SuggestHairstylesFromPhotoOutput> {
  return suggestHairstylesFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHairstylesFromPhotoPrompt',
  input: {schema: SuggestHairstylesFromPhotoInputSchema},
  output: {schema: SuggestHairstylesFromPhotoOutputSchema},
  prompt: `You are a professional hairstylist with a keen eye for matching hairstyles to facial features.

  Based on the photo provided, suggest ten hairstyles that would be most suitable for the user.

  Rank the hairstyles by suitability, with the most suitable hairstyle listed first.

  Provide a suitability score (0-1) for each hairstyle.

  Photo: {{media url=photoDataUri}}
  `,
});

const suggestHairstylesFromPhotoFlow = ai.defineFlow(
  {
    name: 'suggestHairstylesFromPhotoFlow',
    inputSchema: SuggestHairstylesFromPhotoInputSchema,
    outputSchema: SuggestHairstylesFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
