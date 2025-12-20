/**
 * @fileOverview Shared types for the TTS flow.
 */

import { z } from 'genkit';

export const SpeakPriceOutputSchema = z.object({
    media: z.string().describe("The base64 encoded audio data with a data URI."),
});
export type SpeakPriceOutput = z.infer<typeof SpeakPriceOutputSchema>;
