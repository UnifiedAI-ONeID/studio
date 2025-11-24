'use server';

/**
 * @fileOverview A flow to provide personalized directory entry recommendations.
 *
 * - getPersonalizedDirectoryRecommendations - A function that returns directory entry recommendations.
 * - PersonalizedDirectoryRecommendationsInput - The input type for the getPersonalizedDirectoryRecommendations function.
 * - PersonalizedDirectoryRecommendationsOutput - The return type for the getPersonalizedDirectoryRecommendations function.
 */

import {z} from 'zod';
import { generateText } from '../gemini';
import { findVenuesTool } from '../tools/venue-finder';

const PersonalizedDirectoryRecommendationsInputSchema = z.object({
  userProfile: z.object({
    interests: z.array(z.string()).optional().describe('User interests and hobbies.'),
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


export async function getPersonalizedDirectoryRecommendations(input: PersonalizedDirectoryRecommendationsInput): Promise<PersonalizedDirectoryRecommendationsOutput> {
    const { userProfile, count } = input;
    const interests = userProfile.interests?.join(', ');

    const availableVenues = await findVenuesTool.run({ city: userProfile.homeCity, count: 20 });

    if (!availableVenues || availableVenues.length === 0) {
      return { recommendations: [] };
    }

    const systemInstruction = `You are a helpful assistant that recommends places to users based on their interests.
    Analyze the user's profile and the list of available venues.
    Your main goal is to select ${count} venues that best match the user's interests.
    For each recommendation, you MUST provide a short, compelling reason (the "reason" field) explaining why it's a good match for the user.
    If the user has no specified interests, select a variety of popular or interesting venues.
    The output must be a valid JSON object matching this schema: ${JSON.stringify(PersonalizedDirectoryRecommendationsOutputSchema.shape)}.
    If no venues are a good fit, you can return an empty recommendations array.`;

    const prompt = `User profile:
- Interests: ${interests || 'Not specified'}
- Home City: ${userProfile.homeCity || 'Not specified'}

Available Venues (JSON format):
---
${JSON.stringify(availableVenues, null, 2)}
---

Return only the JSON object of recommendations.`;

    try {
        const json = await generateText({ systemInstruction, prompt });
        // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
        const cleanedJson = json.replace(/```json\n?|\n?```/g, '');
        const parsed = JSON.parse(cleanedJson);
        return PersonalizedDirectoryRecommendationsOutputSchema.parse(parsed);
    } catch (error) {
        console.error('Error getting personalized directory recommendations:', error);
        return { recommendations: [] };
    }
}
