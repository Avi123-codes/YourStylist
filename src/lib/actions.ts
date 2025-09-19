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

export async function createOutfitFromCloset(input: CreateOutfitFromClosetInput): Promise<{ success: boolean; data?: CreateOutfitFromClosetOutput | null; error?: string }> {
    try {
        const result = await createOutfitFromClosetFlow(input);

        // Case 1: The AI flow itself failed catastrophically.
        if (!result) {
            console.error('createOutfitFromClosetFlow returned null.');
            return { success: false, error: 'The AI stylist encountered a critical error. Please try again.' };
        }

        // Case 2: The AI determined no outfit could be made.
        if (!result.outfit || result.outfit.length === 0) {
            const reasoning = result.reasoning || 'The AI could not create an outfit from the selected items.';
            return { success: false, error: reasoning };
        }
        
        // Case 3: Success! A valid outfit was returned.
        return { success: true, data: result };

    } catch (error) {
        // Case 4: An unexpected error occurred within the server action.
        console.error('Error in createOutfitFromCloset action:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return { success: false, error: errorMessage };
    }
}