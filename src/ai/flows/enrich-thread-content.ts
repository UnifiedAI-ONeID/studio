'use server';

/**
 * @fileOverview An AI flow to enrich user-generated thread content with a suggested title and tags.
 * 
 * - enrichThreadContent - A function that analyzes the body of a thread and suggests a title and tags.
 * - EnrichThreadContentOutput - The return type for the enrichThreadContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// No input schema needed as we'll pass the string directly.

const EnrichThreadContentOutputSchema = z.object({
  title: z.string().describe('A short, engaging title for the discussion thread, under 8 words.'),
  tags: z.array(z.string()).describe('A list of 3-5 relevant, single-word or two-word tags for the thread content.'),
});
export type EnrichThreadContentOutput = z.infer<typeof EnrichThreadContentOutputSchema>;

const enrichThreadFlow = ai.defineFlow(
  {
    name: 'enrichThreadFlow',
    inputSchema: z.string(),
    outputSchema: EnrichThreadContentOutputSchema,
  },
  async (body) => {
    const prompt = ai.definePrompt({
        name: 'threadEnrichmentPrompt',
        output: { schema: EnrichThreadContentOutputSchema },
        prompt: `You are an AI assistant for a community forum. Your task is to help users by suggesting a concise, engaging title and relevant tags for their post.

        Analyze the following post content:
        ---
        {{{body}}}
        ---
        
        Based on the content, generate:
        1. A 'title' that is short (ideally under 8 words) and captures the main topic.
        2. A list of 3-5 'tags' that are relevant to the content. Tags can be one or two words.
        
        Return the response as a JSON object that matches the specified output schema.`,
    });
    
    const { output } = await prompt({ body });
    return output!;
  }
);

export async function enrichThreadContent(body: string): Promise<EnrichThreadContentOutput> {
  return enrichThreadFlow(body);
}
