import { z } from 'zod';

export const GetItemDescriptionInputSchema = z.object({
    photoDataUri: z
        .string()
        .describe(
            "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
});
export type GetItemDescriptionInput = z.infer<typeof GetItemDescriptionInputSchema>;


export const GetItemDescriptionOutputSchema = z.object({
    description: z.string().describe("A brief, 3-5 word description of the clothing item (e.g., 'Blue Denim Jacket', 'Black Leather Boots')."),
});
export type GetItemDescriptionOutput = z.infer<typeof GetItemDescriptionOutputSchema>;
