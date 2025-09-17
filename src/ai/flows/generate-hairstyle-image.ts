'use server';
/**
 * @fileOverview Generates an image of a user with a suggested hairstyle.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export type GenerateHairstyleImageInput = {
  photoDataUri: string;
  hairstyle: string;
};
const GenerateHairstyleImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  hairstyle: z.string().describe('The name of the hairstyle to apply.'),
});

export type GenerateHairstyleImageOutput = {
  imageUrl: string;
};
const GenerateHairstyleImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});

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
    const response = await ai.generate({
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

    const imagePart = response.output?.message.content.find(part => part.media);

    if (!imagePart || !imagePart.media?.url) {
      console.error('Image generation failed. Full response:', JSON.stringify(response, null, 2));
      throw new Error('Image generation failed.');
    }

    return {imageUrl: imagePart.media.url};
  }
);
