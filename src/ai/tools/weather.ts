'use server';
/**
 * @fileOverview A tool that fetches real-time weather data for a given location.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

export const getCurrentWeather = ai.defineTool(
    {
        name: 'getCurrentWeather',
        description: 'Get the current weather for a specific city.',
        inputSchema: z.object({
            city: z.string().describe('The city name, e.g., "San Francisco"'),
        }),
        outputSchema: z.object({
            temperature: z.number().describe('The current temperature in Celsius.'),
            condition: z.string().describe('A brief description of the weather conditions, e.g., "Clear sky", "Light rain".'),
            windSpeed: z.number().describe('The wind speed in meters per second.'),
        }),
    },
    async (input) => {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
            throw new Error('OPENWEATHERMAP_API_KEY is not configured in environment variables.');
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${input.city}&appid=${apiKey}&units=metric`;

        try {
            const response = await axios.get(url);
            const data = response.data;
            return {
                temperature: data.main.temp,
                condition: data.weather[0].description,
                windSpeed: data.wind.speed,
            };
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            throw new Error(`Could not retrieve weather for ${input.city}. The city may be invalid.`);
        }
    }
);
