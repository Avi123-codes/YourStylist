'use server';
/**
 * @fileOverview An AI agent that analyzes a user's photo to suggest flattering colors.
 *
 * - analyzeColors - A function that performs the color analysis.
 * - AnalyzeColorsInput - The input type for the analyzeColors function.
 * - AnalyzeColorsOutput - The return type for the analyzeColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeColorsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeColorsInput = z.infer<typeof AnalyzeColorsInputSchema>;

const AnalyzeColorsOutputSchema = z.object({
  analysis: z.string().describe("A brief (2-3 sentences) analysis of the user's color profile based on their features."),
  bestColors: z.array(z.string().describe("A list of 5-7 color names (e.g., 'Soft Autumn', 'Deep Winter') or specific hex codes that are most flattering for the user.")).describe('An array of recommended colors.'),
  colorsToAvoid: z.array(z.string().describe("A list of 3-4 color names or hex codes that the user should probably avoid.")).describe('An array of colors to avoid.'),
});
export type AnalyzeColorsOutput = z.infer<typeof AnalyzeColorsOutputSchema>;

export async function analyzeColors(
  input: AnalyzeColorsInput
): Promise<AnalyzeColorsOutput> {
  return analyzeColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeColorsPrompt',
  input: {schema: AnalyzeColorsInputSchema},
  output: {schema: AnalyzeColorsOutputSchema},
  prompt: `You are an expert color analyst. Based on the user's photo, analyze their skin tone, hair color, and eye color to determine their color season.

  Provide a brief analysis of their features.

  Then, suggest an array of 5-7 "bestColors" (as hex codes) that would be most flattering for them.
  
  Also, provide an array of 3-4 "colorsToAvoid" (as hex codes).

  Photo: {{media url=photoDataUri}}
  `,
});

const analyzeColorsFlow = ai.defineFlow(
  {
    name: 'analyzeColorsFlow',
    inputSchema: AnalyzeColorsInputSchema,
    outputSchema: AnalyzeColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
