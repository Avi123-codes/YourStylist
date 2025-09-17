'use server';

import { rateOutfitAndSuggestImprovements, OutfitRatingAndSuggestionsInput } from '@/ai/flows/outfit-rating-and-suggestions';
import { suggestHairstylesFromPhoto, SuggestHairstylesFromPhotoInput } from '@/ai/flows/suggest-hairstyles-from-photo';
import { suggestWardrobeFromPreferences, SuggestWardrobeFromPreferencesInput } from '@/ai/flows/suggest-wardrobe-from-preferences';

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
