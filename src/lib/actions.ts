'use server';

import { rateOutfitAndSuggestImprovements, type OutfitRatingAndSuggestionsInput } from '@/ai/flows/outfit-rating-and-suggestions';
import { suggestHairstylesFromPhoto, type SuggestHairstylesFromPhotoInput } from '@/ai/flows/suggest-hairstyles-from-photo';
import { suggestWardrobeFromPreferences, type SuggestWardrobeFromPreferencesInput } from '@/ai/flows/suggest-wardrobe-from-preferences';
import { analyzeColors as analyzeColorsFlow, type AnalyzeColorsInput } from '@/ai/flows/analyze-colors';
import { virtualTryOn as virtualTryOnFlow, type VirtualTryOnInput } from '@/ai/flows/virtual-try-on';
import { createOutfitFromCloset as createOutfitFromClosetFlow, type CreateOutfitFromClosetInput, type CreateOutfitFromClosetOutput } from '@/ai/flows/create-outfit-from-closet';


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
        
        if (!result || !result.outfit || result.outfit.length === 0) {
            const errorMessage = result?.reasoning || 'The AI stylist could not create an outfit. Please try a different occasion or add more items.';
            return { success: false, error: errorMessage };
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Error in createOutfitFromCloset action:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while creating the outfit.';
        return { success: false, error: errorMessage };
    }
}
