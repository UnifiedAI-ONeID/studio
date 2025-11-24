'use server';

/**
 * @fileOverview An AI flow to enrich user-generated thread content with a suggested title and tags.
 * 
 * - enrichThreadContent - A function that analyzes the body of a thread and suggests a title and tags.
 * - EnrichThreadContentInput - The input type for the enrichThreadContent function.
 * - EnrichThreadContentOutput - The return type for the enrichThreadContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEventDetailsTool } from '../tools/event-finder';

const EnrichThreadContentInputSchema = z.object({
  body: z.string().describe('The main content of the user\'s post.'),
  relatedEventId: z.string().optional().describe('An optional ID of an event this thread is related to.'),
});
export type EnrichThreadContentInput = z.infer<typeof EnrichThreadContentInputSchema>;


const EnrichThreadContentOutputSchema = z.object({
  title: z.string().describe('A short, engaging title for the discussion thread, under 8 words.'),
  tags: z.array(z.string()).describe('A list of 3-5 relevant, single-word or two-word tags for the thread content.'),
});
export type EnrichThreadContentOutput = z.infer<typeof EnrichThreadContentOutputSchema>;

const threadEnrichmentPrompt = ai.definePrompt({
    name: 'threadEnrichmentPrompt',
    input: { schema: EnrichThreadContentInputSchema },
    output: { schema: EnrichThreadContentOutputSchema },
    tools: [getEventDetailsTool],
    prompt: `You are an AI assistant for a community forum. Your task is to help users by suggesting a concise, engaging title and relevant tags for their post.

    Analyze the following post content:
    ---
    {{{body}}}
    ---
    
    {{#if relatedEventId}}
    This thread is related to a specific event. Use the 'getEventDetails' tool to get information about the event with ID: {{{relatedEventId}}}. 
    Incorporate details from the event (like its title, category, or pricing) to make your suggestions more relevant.
    {{/if}}

    Based on all available content, generate:
    1. A 'title' that is short (ideally under 8 words) and captures the main topic.
    2. A list of 3-5 'tags' that are relevant to the content. Tags can be one or two words.
    
    Return the response as a JSON object that matches the specified output schema.`,
});

const enrichThreadFlow = ai.defineFlow(
  {
    name: 'enrichThreadFlow',
    inputSchema: EnrichThreadContentInputSchema,
    outputSchema: EnrichThreadContentOutputSchema,
  },
  async (input) => {
    const { output } = await threadEnrichmentPrompt(input);
    return output!;
  }
);

export async function enrichThreadContent(input: EnrichThreadContentInput): Promise<EnrichThreadContentOutput> {
  return enrichThreadFlow(input);
}
