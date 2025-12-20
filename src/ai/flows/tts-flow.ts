'use server';
/**
 * @fileOverview A flow for generating speech from text.
 *
 * - speakPrice - A function that takes text and returns audio data.
 * - SpeakPriceOutput - The return type for the speakPrice function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

export const SpeakPriceOutputSchema = z.object({
    media: z.string().describe("The base64 encoded audio data with a data URI."),
});
export type SpeakPriceOutput = z.infer<typeof SpeakPriceOutputSchema>;


export async function speakPrice(text: string): Promise<SpeakPriceOutput> {
    return ttsFlow(text);
}

const ttsFlow = ai.defineFlow(
    {
        name: 'ttsFlow',
        inputSchema: z.string(),
        outputSchema: SpeakPriceOutputSchema,
    },
    async (query) => {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'hi-IN-Wavenet-B' }, // Standard Hindi Male Voice
                    },
                },
            },
            prompt: query,
        });
        if (!media) {
            throw new Error('no media returned');
        }
        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        return {
            media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
        };
    }
);

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        const bufs: any[] = [];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}
