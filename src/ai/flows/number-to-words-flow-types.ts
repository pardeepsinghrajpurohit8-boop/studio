/**
 * @fileOverview Shared types for the number-to-words flow.
 */

import { z } from 'genkit';

export const NumberToWordsInputSchema = z.object({
    number: z.number().describe("The number to convert to words."),
});
export type NumberToWordsInput = z.infer<typeof NumberToWordsInputSchema>;

export const NumberToWordsOutputSchema = z.object({
    words: z.string().describe("The number in English words, formatted as currency (e.g., 'one hundred twenty-three and 45/100')."),
});
export type NumberToWordsOutput = z.infer<typeof NumberToWordsOutputSchema>;
