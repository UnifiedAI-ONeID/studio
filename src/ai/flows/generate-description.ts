
'use server';
/**
 * @fileOverview An AI flow to generate a description for an event or venue.
 * 
 * - generateDescription - A function that analyzes a title and category to create a description.
 * - GenerateDescriptionInput - The input type for the function.
 * - GenerateDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDescriptionInputSchema = z.object({
  title: z.string().describe('The title or name of the event or place.'),
  category: z.string().describe('The primary category (e.g., "Music", "Cafe", "Tech Talk").'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('A one-paragraph, engaging description for the item.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async ({ title, category }) => {
    const prompt = ai.definePrompt({
        name: 'descriptionGeneratorPrompt',
        output: { schema: GenerateDescriptionOutputSchema },
        prompt: `You are an expert copywriter for a community events and places directory. Your task is to write a compelling, one-paragraph description.

        You will be given a title and a category. Use them to generate an engaging description that would make someone interested in attending the event or visiting the place.
        
        Keep it to a single paragraph and make it sound appealing and informative.

        Title: "${title}"
        Category: "${category}"
        
        Return the response as a JSON object with a 'description' field.`,
    });
    
    const { output } = await prompt({});
    return output!;
  }
);

export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

    