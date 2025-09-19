'use server';
/**
 * @fileOverview An AI agent that creates an outfit from a user's digital closet based on text descriptions.
 * 
 * - createOutfitFromCloset - The main function to get an outfit suggestion.
 * - CreateOutfitFromClosetInput - The input type.
 * - CreateOutfitFromClosetOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClothingItemSchema = z.object({
    id: z.string().describe("The unique identifier for the clothing item."),
    description: z.string().describe("A brief text description of the clothing item."),
});

const CreateOutfitFromClosetInputSchema = z.object({
    clothingItems: z.array(ClothingItemSchema).describe("An array of available clothing items with their descriptions."),
    occasion: z.string().describe("The occasion the user is dressing for, e.g., 'Work meeting', 'Casual brunch'."),
});
export type CreateOutfitFromClosetInput = z.infer<typeof CreateOutfitFromClosetInputSchema>;

const ChosenItemSchema = z.object({
    id: z.string().describe("The unique ID of the chosen clothing item, which must match one of the input IDs."),
    category: z.string().describe("The category of the item, e.g., 'Top', 'Bottoms', 'Outerwear', 'Footwear', 'Accessory'."),
});

const CreateOutfitFromClosetOutputSchema = z.object({
    outfit: z.array(ChosenItemSchema).optional().describe("An array of 2-4 items that form a cohesive outfit. Returns the IDs of the chosen items."),
    reasoning: z.string().describe("A brief explanation for why this outfit was chosen, or why no outfit could be created."),
});
export type CreateOutfitFromClosetOutput = z.infer<typeof CreateOutfitFromClosetOutputSchema>;


export async function createOutfitFromCloset(input: CreateOutfitFromClosetInput): Promise<CreateOutfitFromClosetOutput> {
    return createOutfitFromClosetFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createOutfitFromClosetPrompt',
    input: { schema: CreateOutfitFromClosetInputSchema },
    output: { schema: CreateOutfitFromClosetOutputSchema },
    prompt: `You are a personal stylist. Create a cohesive outfit for the specified occasion using ONLY the items from the provided list.

    Occasion: {{{occasion}}}

    Available Items:
    {{#each clothingItems}}
    - ID: {{{this.id}}}, Description: {{{this.description}}}
    {{/each}}
    
    Your task is to select 2-4 items from the list that create a great outfit. For each item you select, you MUST return its original 'id' and assign a 'category'.
    
    Provide a 'reasoning' for your choice.
    
    If no suitable outfit can be made from the given items for the occasion, return an empty or null 'outfit' array and explain why in the 'reasoning' field. Your response must always include the reasoning.
    `,
});

const createOutfitFromClosetFlow = ai.defineFlow(
    {
        name: 'createOutfitFromClosetFlow',
        inputSchema: CreateOutfitFromClosetInputSchema,
        outputSchema: CreateOutfitFromClosetOutputSchema,
    },
    async (input): Promise<CreateOutfitFromClosetOutput> => {
        const { output } = await prompt(input);
        if (!output) {
            // This should rarely happen with a well-defined prompt, but it's a safeguard.
            return {
                reasoning: "The AI stylist was unable to process the request. Please try again.",
                outfit: [],
            };
        }
        return output;
    }
);
