'use server';
/**
 * @fileOverview An AI agent that suggests an outfit based on real-time weather data.
 * 
 * - suggestOutfitForWeather - The main function to get an outfit suggestion.
 * - SuggestOutfitForWeatherInput - The input type.
 * - SuggestOutfitForWeatherOutput - The output type.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCurrentWeather } from '@/ai/tools/weather';

export const SuggestOutfitForWeatherInputSchema = z.object({
    city: z.string().describe('The city where the user wants to wear the outfit.'),
    style_preference: z.string().optional().describe('The user\'s preferred style, e.g., "casual", "business", "chic".'),
});
export type SuggestOutfitForWeatherInput = z.infer<typeof SuggestOutfitForWeatherInputSchema>;

export const SuggestOutfitForWeatherOutputSchema = z.object({
    outfit: z.object({
        top: z.string().describe('A suggested top, e.g., "Lightweight linen shirt".'),
        bottom: z.string().describe('Suggested bottoms, e.g., "Beige chino shorts".'),
        outerwear: z.string().optional().describe('Suggested outerwear, if necessary, e.g., "Denim jacket".'),
        footwear: z.string().describe('Suggested footwear, e.g., "White sneakers".'),
    }),
    reasoning: z.string().describe('A brief explanation for why this outfit is suitable for the current weather.'),
    weather: z.object({
        temperature: z.number(),
        condition: z.string(),
    }),
});
export type SuggestOutfitForWeatherOutput = z.infer<typeof SuggestOutfitForWeatherOutputSchema>;

export async function suggestOutfitForWeather(input: SuggestOutfitForWeatherInput): Promise<SuggestOutfitForWeatherOutput> {
    return suggestOutfitForWeatherFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestOutfitForWeatherPrompt',
    input: { schema: SuggestOutfitForWeatherInputSchema },
    output: { schema: SuggestOutfitForWeatherOutputSchema },
    tools: [getCurrentWeather],
    prompt: `You are a "Weather-Aware" personal stylist. Your goal is to recommend a practical and stylish outfit based on the current weather in a given city and the user's style preferences.
    
    1.  First, you MUST use the \`getCurrentWeather\` tool to get the real-time weather for the user's specified city.
    2.  Based on the weather data (temperature, condition, wind), create a suitable outfit recommendation.
    3.  Consider the user's style preference (e.g., {{{style_preference}}}). If no preference is given, suggest a versatile, casual outfit.
    4.  Provide a brief reasoning for your choices. For example, if it's windy, suggest a windbreaker. If it's hot, suggest breathable fabrics.
    5.  Return the weather data along with your suggestion.
    
    User request:
    - City: {{{city}}}
    - Style: {{{style_preference}}}
    `,
});

const suggestOutfitForWeatherFlow = ai.defineFlow(
    {
        name: 'suggestOutfitForWeatherFlow',
        inputSchema: SuggestOutfitForWeatherInputSchema,
        outputSchema: SuggestOutfitForWeatherOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Could not generate an outfit suggestion.');
        }
        return output;
    }
);
