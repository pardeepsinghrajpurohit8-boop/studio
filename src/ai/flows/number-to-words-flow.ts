'use server';
/**
 * @fileOverview A flow for converting a number to its English word representation.
 *
 * - numberToWords - A function that takes a number and returns it in words.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NumberToWordsInputSchema, NumberToWordsOutputSchema, type NumberToWordsOutput } from './number-to-words-flow-types';

export async function numberToWords(number: number): Promise<NumberToWordsOutput> {
    return numberToWordsFlow({ number });
}

const prompt = ai.definePrompt({
    name: 'numberToWordsPrompt',
    input: { schema: NumberToWordsInputSchema },
    output: { schema: NumberToWordsOutputSchema },
    prompt: `Convert the following number to its English word representation. For the decimal part, represent it as a fraction over 100. For example, 123.45 should be "one hundred twenty-three and 45/100". Only return the words.

Number: {{{number}}}`,
});


const numberToWordsFlow = ai.defineFlow(
    {
        name: 'numberToWordsFlow',
        inputSchema: NumberToWordsInputSchema,
        outputSchema: NumberToWordsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
