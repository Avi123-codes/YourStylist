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
    })).optional().describe("An array of 2-4 clothing items that form a cohesive outfit. This can be empty if no suitable outfit is found."),
    reasoning: z.string().describe("A brief explanation for why this outfit was chosen, considering the occasion and how the items complement each other."),
});
export type CreateOutfitFromClosetOutput = z.infer<typeof CreateOutfitFromClosetOutputSchema>;

export async function createOutfitFromCloset(input: CreateOutfitFromClosetInput): Promise<CreateOutfitFromClosetOutput | null> {
    return createOutfitFromClosetFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createOutfitFromClosetPrompt',
    input: { schema: CreateOutfitFromClosetInputSchema },
    output: { schema: CreateOutfitFromClosetOutputSchema },
    prompt: `You are a personal stylist. Your task is to create a stylish outfit for the specified occasion using ONLY the items provided.

    Occasion: {{{occasion}}}

    Available Clothing Items:
    {{#each clothingItems}}
    - Item Image: {{media url=this.imageDataUri}} (imageDataUri: {{{this.imageDataUri}}})
    {{/each}}
    
    Instructions:
    1.  Analyze the provided clothing items and the occasion.
    2.  Select between 2 and 4 items that form a cohesive and appropriate outfit.
    3.  For EACH selected item, you MUST return the original 'imageDataUri' that was provided with the image.
    4.  Also return a descriptive 'itemName' and 'category' for each item.
    5.  Provide a 'reasoning' for your outfit choice.
    6.  If you cannot create a suitable outfit from the items, return an empty 'outfit' array and explain why in the 'reasoning' field.
    `,
});


const createOutfitFromClosetFlow = ai.defineFlow(
    {
        name: 'createOutfitFromClosetFlow',
        inputSchema: CreateOutfitFromClosetInputSchema,
        outputSchema: CreateOutfitFromClosetOutputSchema,
    },
    async (input): Promise<CreateOutfitFromClosetOutput | null> => {
        const { output } = await prompt(input);
        return output;
    }
);
