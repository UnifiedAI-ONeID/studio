
'use server';
/**
 * @fileOverview An AI flow to generate a description for an event or venue.
 * 
 * - generateDescription - A function that analyzes a title and category to create a description.
 * - GenerateDescriptionInput -The input type for the function.
 * - GenerateDescriptionOutput - The return type for the function.
 */

import { z } from 'zod';
import { generateText } from '../gemini';

const GenerateDescriptionInputSchema = z.object({
  title: z.string().describe('The title or name of the event or place.'),
  category: z.string().describe('The primary category (e.g., "Music", "Cafe", "Tech Talk").'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('A one-paragraph, engaging description for the item.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;


export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  const { title, category } = input;

  const systemInstruction = `You are an expert copywriter who specializes in writing short, engaging descriptions for local events and places.
    Your output must be a valid JSON object that follows this schema: ${JSON.stringify(GenerateDescriptionOutputSchema.shape)}.
    The description should be a single paragraph, friendly, and enticing.`;
    
  const prompt = `Generate a description for a ${category} called "${title}".`;
  
  const json = await generateText({
    systemInstruction,
    prompt,
  });

  try {
    // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
    const cleanedJson = json.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(cleanedJson);
    return GenerateDescriptionOutputSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response for generateDescription:", error);
    // Return a safe default if parsing fails
    return {
      description: '',
    };
  }
}
