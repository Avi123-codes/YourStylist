'use server';
/**
 * @fileOverview Generates an image of a user with a suggested hairstyle.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHairstyleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  hairstyle: z.string().describe('The name of the hairstyle to apply.'),
});
export type GenerateHairstyleImageInput = z.infer<typeof GenerateHairstyleImageInputSchema>;

const GenerateHairstyleImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateHairstyleImageOutput = z.infer<typeof GenerateHairstyleImageOutputSchema>;

export async function generateHairstyleImage(
  input: GenerateHairstyleImageInput
): Promise<GenerateHairstyleImageOutput> {
  return generateHairstyleImageFlow(input);
}

const generateHairstyleImageFlow = ai.defineFlow(
  {
    name: 'generateHairstyleImageFlow',
    inputSchema: GenerateHairstyleImageInputSchema,
    outputSchema: GenerateHairstyleImageOutputSchema,
  },
  async ({photoDataUri, hairstyle}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: photoDataUri}},
        {
          text: `Generate a realistic image of this person with a ${hairstyle} hairstyle. Maintain the person's facial features.`,
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return {imageUrl: media.url};
  }
);
