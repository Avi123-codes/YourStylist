'use server';
/**
 * @fileOverview An AI agent that creates an outfit from a user's digital closet.
 * 
 * - createOutfitFromCloset - The main function to get an outfit suggestion.
 * - CreateOutfitFromClosetInput - The input type.
 * - CreateOutfitFromClosetOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClothingItemInputSchema = z.object({
    imageDataUri: z.string().describe("An image of a clothing item from the user's closet as a data URI."),
});

const CreateOutfitFromClosetInputSchema = z.object({
    clothingItems: z.array(ClothingItemInputSchema).describe("An array of all clothing items available in the user's closet."),
    occasion: z.string().describe("The occasion the user is dressing for, e.g., 'Work meeting', 'Casual brunch'."),
});
export type CreateOutfitFromClosetInput = z.infer<typeof CreateOutfitFromClosetInputSchema>;

const CreateOutfitFromClosetOutputSchema = z.object({
    outfit: z.array(z.object({
        itemName: z.string().describe("The descriptive name of the clothing item chosen for the outfit, e.g., 'Blue Denim Jacket'."),
        category: z.string().describe("The category of the item, e.g., 'Top', 'Bottoms', 'Outerwear', 'Footwear', 'Accessory'."),
        imageDataUri: z.string().describe("The original data URI of the selected clothing item image."),
    })).describe("An array of 2-4 clothing items that form a cohesive outfit."),
    reasoning: z.string().describe("A brief explanation for why this outfit was chosen, considering the occasion and how the items complement each other."),
});
export type CreateOutfitFromClosetOutput = z.infer<typeof CreateOutfitFromClosetOutputSchema>;

export async function createOutfitFromCloset(input: CreateOutfitFromClosetInput): Promise<CreateOutfitFromClosetOutput> {
    return createOutfitFromClosetFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createOutfitFromClosetPrompt',
    input: { schema: CreateOutfitFromClosetInputSchema },
    output: { schema: CreateOutfitFromClosetOutputSchema },
    prompt: `You are an expert personal stylist. Your task is to create a cohesive and stylish outfit from a collection of clothing items provided by the user for a specific occasion.

    AVAILABLE CLOTHING ITEMS:
    {{#each clothingItems}}
    - Item: {{media url=this.imageDataUri}}
    {{/each}}
    
    OCCASION: {{{occasion}}}

    INSTRUCTIONS:
    1.  Analyze all the provided clothing items.
    2.  Select 2-4 items that create a complete and appropriate outfit for the specified occasion.
    3.  For each selected item, you MUST return the original imageDataUri that was provided for it.
    4.  For each selected item, also provide a descriptive name (e.g., "Black Leather Loafers", "Striped Cotton T-Shirt") and its category.
    5.  Provide a brief reasoning for your outfit selection. Explain why the items work well together for the given occasion.
    6.  It is crucial that you only use the items provided in the images. Do not invent new items.
    `,
});

const createOutfitFromClosetFlow = ai.defineFlow(
    {
        name: 'createOutfitFromClosetFlow',
        inputSchema: CreateOutfitFromClosetInputSchema,
        outputSchema: CreateOutfitFromClosetOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Could not generate an outfit suggestion.');
        }
        return output;
    }
);
