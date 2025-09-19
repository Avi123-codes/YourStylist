'use server';
import { z } from 'zod';
import { rateOutfitAndSuggestImprovements, type OutfitRatingAndSuggestionsInput } from '@/ai/flows/outfit-rating-and-suggestions';
import { suggestHairstylesFromPhoto, type SuggestHairstylesFromPhotoInput } from '@/ai/flows/suggest-hairstyles-from-photo';
import { suggestWardrobeFromPreferences, type SuggestWardrobeFromPreferencesInput } from '@/ai/flows/suggest-wardrobe-from-preferences';
import { analyzeColors as analyzeColorsFlow, type AnalyzeColorsInput } from '@/ai/flows/analyze-colors';
import { virtualTryOn as virtualTryOnFlow, type VirtualTryOnInput } from '@/ai/flows/virtual-try-on';
import { createOutfitFromCloset as createOutfitFromClosetFlow, type CreateOutfitFromClosetInput, type CreateOutfitFromClosetOutput } from '@/ai/flows/create-outfit-from-closet';
import { getItemDescription as getItemDescriptionFlow } from '@/ai/flows/get-item-description';
import type { GetItemDescriptionInput as GetItemDescriptionInputType } from '@/ai/flows/get-item-description';

// Define Zod schemas here to avoid exporting them from a 'use server' file.
export const GetItemDescriptionOutputSchema = z.object({
    description: z.string(),
});
export type GetItemDescriptionOutput = z.infer<typeof GetItemDescriptionOutputSchema>;


export async function getHairstyleSuggestions(input: SuggestHairstylesFromPhotoInput) {
    try {
        const result = await suggestHairstylesFromPhoto(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get hairstyle suggestions.' };
    }
}


export async function getWardrobeSuggestions(input: SuggestWardrobeFromPreferencesInput) {
    try {
        const result = await suggestWardrobeFromPreferences(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get wardrobe suggestions.' };
    }
}

export async function getOotdRating(input: OutfitRatingAndSuggestionsInput) {
    try {
        const result = await rateOutfitAndSuggestImprovements(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to rate outfit.' };
    }
}

export async function analyzeColors(input: AnalyzeColorsInput) {
    try {
        const result = await analyzeColorsFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to analyze colors.' };
    }
}

export async function virtualTryOn(input: VirtualTryOnInput) {
    try {
        const result = await virtualTryOnFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to perform virtual try-on.' };
    }
}

export async function createOutfitFromCloset(input: CreateOutfitFromClosetInput): Promise<{ success: boolean; data?: CreateOutfitFromClosetOutput; error?: string }> {
    try {
        const result = await createOutfitFromClosetFlow(input);
        if (result && result.outfit && result.outfit.length > 0) {
            return { success: true, data: result };
        } else {
            const reasoning = result?.reasoning || "The AI stylist couldn't create an outfit from the provided items.";
            return { success: false, error: reasoning };
        }
    } catch (error) {
        console.error('Error in createOutfitFromCloset action:', error);
        return { success: false, error: 'An unexpected error occurred while creating the outfit.' };
    }
}

export async function getItemDescription(input: GetItemDescriptionInputType): Promise<{ success: boolean; data?: GetItemDescriptionOutput; error?: string }> {
    try {
        const result = await getItemDescriptionFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error in getItemDescription action:', error);
        return { success: false, error: 'Failed to get item description.' };
    }
}
