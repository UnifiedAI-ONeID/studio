'use server';

/**
 * @fileOverview A flow to provide personalized directory entry recommendations.
 *
 * - getPersonalizedDirectoryRecommendations - A function that returns directory entry recommendations.
 * - PersonalizedDirectoryRecommendationsInput - The input type for the getPersonalizedDirectoryRecommendations function.
 * - PersonalizedDirectoryRecommendationsOutput - The return type for the getPersonalizedDirectoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { findVenuesTool } from '../tools/venue-finder';

const PersonalizedDirectoryRecommendationsInputSchema = z.object({
  userProfile: z.object({
    interests: z.array(z.string()).describe('User interests and hobbies.'),
    homeCity: z.string().optional().describe('User\'s home city'),
  }).describe('The user profile information.'),
  count: z.number().int().min(1).max(8).default(3).describe('The number of recommendations to return'),
});
export type PersonalizedDirectoryRecommendationsInput = z.infer<
  typeof PersonalizedDirectoryRecommendationsInputSchema
>;

const PersonalizedDirectoryRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.object({
      venueId: z.string().describe('The ID of the recommended venue.'),
      name: z.string().describe('The name of the venue.'),
      description: z.string().describe('A short description of the venue.'),
      coverImageUrl: z.string().optional().describe('The cover image URL for the venue.'),
      reason: z.string().describe('A short, compelling reason why this venue is recommended for the user.'),
  })).describe('A list of personalized venue recommendations'),
});

export type PersonalizedDirectoryRecommendationsOutput = z.infer<
  typeof PersonalizedDirectoryRecommendationsOutputSchema
>;

const personalizedDirectoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedDirectoryRecommendationsFlow',
    inputSchema: PersonalizedDirectoryRecommendationsInputSchema,
    outputSchema: PersonalizedDirectoryRecommendationsOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
      name: 'personalizedDirectoryRecommendationsPrompt',
      input: {
        schema: PersonalizedDirectoryRecommendationsInputSchema,
      },
      output: {
        schema: PersonalizedDirectoryRecommendationsOutputSchema,
      },
      tools: [findVenuesTool],
      prompt: `You are an AI assistant that recommends places (venues) to users based on their profile.
      Your goal is to provide a list of venues that are most relevant to the user's interests.
    
      User Profile:
      - Interests: {{userProfile.interests}}
      - Location: {{userProfile.homeCity}}
      
      Number of recommendations requested: {{count}}
    
      1. Use the 'findVenues' tool to search for venues. You can use a user's interests as the 'keyword' parameter to find relevant venues. You must also pass the user's 'homeCity' to the tool.
      2. For each recommendation, provide the venue's ID, name, description, coverImageUrl, and a short, compelling reason why the user would like this place, linking it to their interests.
      3. Return exactly the number of recommendations requested.
    
      Return a JSON object that matches the specified output schema.
      `,
    });
    const {output} = await prompt(input);
    return output!;
  }
);

export async function getPersonalizedDirectoryRecommendations(input: PersonalizedDirectoryRecommendationsInput): Promise<PersonalizedDirectoryRecommendationsOutput> {
    return personalizedDirectoryRecommendationsFlow(input);
}
