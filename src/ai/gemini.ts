'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Make sure to set the GOOGLE_API_KEY environment variable.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

type GenerateTextOptions = {
    prompt: string;
    systemInstruction?: string;
};

/**
 * A server-only helper to call the Google Gemini API.
 * @param options - The options for the generation request.
 * @returns The generated text.
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  const { prompt, systemInstruction } = options;
  
  if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in the environment.');
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: systemInstruction,
  });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch(error) {
    console.error("Error generating text with Gemini:", error);
    // In a real app, you'd want more robust error handling.
    // For now, we'll re-throw the error.
    throw error;
  }
}
