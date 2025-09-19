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
import { GetItemDescriptionInputSchema, GetItemDescriptionOutputSchema } from '@/lib/schema';
import type { GetItemDescriptionInput, GetItemDescriptionOutput } from '@/lib/schema';

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
