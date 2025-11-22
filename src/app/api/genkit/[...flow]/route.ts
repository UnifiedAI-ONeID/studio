/**
 * @fileoverview A Genkit Next.js route handler.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {createNextApiHandler} from '@genkit-ai/next';

import '@/ai/flows/personalized-event-recommendations';
import '@/ai/flows/personalized-directory-recommendations';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

export const {GET, POST} = createNextApiHandler();
