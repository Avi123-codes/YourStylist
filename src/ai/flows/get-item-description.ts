'use server';
/**
 * @fileOverview An AI agent that describes a clothing item from a photo.
 *
 * - getItemDescription - The main function to get an item description.
 * - GetItemDescriptionInput - The input type.
 * - GetItemDescriptionOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GetItemDescriptionInputSchema = z.object({
    photoDataUri: z
        .string()
        .describe(
            "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
});
export type GetItemDescriptionInput = z.infer<typeof GetItemDescriptionInputSchema>;

export const GetItemDescriptionOutputSchema = z.object({
    description: z.string().describe("A brief, 3-5 word description of the clothing item (e.g., 'Blue Denim Jacket', 'Black Leather Boots')."),
});
export type GetItemDescriptionOutput = z.infer<typeof GetItemDescriptionOutputSchema>;

export async function getItemDescription(input: GetItemDescriptionInput): Promise<GetItemDescriptionOutput> {
    return getItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getItemDescriptionPrompt',
    input: { schema: GetItemDescriptionInputSchema },
    output: { schema: GetItemDescriptionOutputSchema },
    prompt: `Analyze the provided image of a clothing item. Provide a brief, 3-5 word description. Be specific about color and type.

    Examples:
    - "Blue Denim Jacket"
    - "White Cotton T-Shirt"
    - "Black Leather Boots"

    Image: {{media url=photoDataUri}}
    `,
});

const getItemDescriptionFlow = ai.defineFlow(
    {
        name: 'getItemDescriptionFlow',
        inputSchema: GetItemDescriptionInputSchema,
        outputSchema: GetItemDescriptionOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("Failed to generate item description.");
        }
        return output;
    }
);
