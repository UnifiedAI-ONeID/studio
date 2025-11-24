'use server';

/**
 * @fileOverview An AI flow to enrich user-generated thread content with a suggested title and tags.
 * 
 * - enrichThreadContent - A function that analyzes the body of a thread and suggests a title and tags.
 * - EnrichThreadContentInput - The input type for the enrichThreadContent function.
 * - EnrichThreadContentOutput - The return type for the enrichThreadContent function.
 */

import { z } from 'zod';
import { generateText } from '../gemini';


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


export async function enrichThreadContent(input: EnrichThreadContentInput): Promise<EnrichThreadContentOutput> {
  const { body } = input;
  
  const systemInstruction = `You are an AI assistant for a community forum. Your task is to analyze a user's post and suggest a concise title and relevant tags to help categorize it.
    The output must be a valid JSON object matching this schema: ${JSON.stringify(EnrichThreadContentOutputSchema.shape)}.
    
    Guidelines:
    - The title should be engaging and less than 8 words.
    - The tags should be 3-5 single or two-word lowercase tags that capture the main topics.`;

  const prompt = `Analyze the following post content and generate a suggested title and tags.
    
    Post Content:
    ---
    ${body}
    ---
    
    Return only the JSON object.`;
    
  const json = await generateText({
    systemInstruction,
    prompt,
  });

  try {
    // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
    const cleanedJson = json.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(cleanedJson);
    return EnrichThreadContentOutputSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response for enrichThreadContent:", error);
    // Return a safe default if parsing fails
    return {
      title: '',
      tags: [],
    };
  }
}
