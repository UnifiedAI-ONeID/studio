'use server';

/**
 * @fileOverview Provides personalized event recommendations based on user profile, location, and time.
 *
 * - getPersonalizedEventRecommendations - A function that returns personalized event recommendations.
 * - PersonalizedEventRecommendationsInput - The input type for the getPersonalizedEventRecommendations function PersonalizedEventRecommendationsInput.
 * - PersonalizedEventRecommendationsOutput - The return type for the getPersonalizedEventRecommendations function.
 */

import {z} from 'zod';
import { generateText } from '../gemini';
import { findEventsTool } from '../tools/event-finder';

const PersonalizedEventRecommendationsInputSchema = z.object({
  userProfile: z.object({
    interests: z.array(z.string()).optional().describe('List of user interests'),
    homeCity: z.string().optional().describe('User\'s home city'),
  }).describe('User profile information'),
  count: z.number().int().min(1).max(8).default(4).describe('The number of recommendations to return'),
});
export type PersonalizedEventRecommendationsInput = z.infer<typeof PersonalizedEventRecommendationsInputSchema>;

const PersonalizedEventRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.object({
    eventId: z.string().describe('The ID of the recommended event.'),
    eventName: z.string().describe('Name of the event'),
    eventDescription: z.string().describe('Description of the event'),
    coverImageUrl: z.string().optional().describe('The cover image URL for the event.'),
    reason: z.string().describe('A short, compelling reason why this event is recommended for the user.'),
  })).describe('A list of personalized event recommendations'),
});
export type PersonalizedEventRecommendationsOutput = z.infer<typeof PersonalizedEventRecommendationsOutputSchema>;


export async function getPersonalizedEventRecommendations(input: PersonalizedEventRecommendationsInput): Promise<PersonalizedEventRecommendationsOutput> {
    const { userProfile, count } = input;
    const interests = userProfile.interests?.join(', ');

    const availableEvents = await findEventsTool.run({ city: userProfile.homeCity, count: 25 });
    if (!availableEvents || availableEvents.length === 0) {
      return { recommendations: [] };
    }
    
    const systemInstruction = `You are a helpful assistant that recommends events to users based on their interests.
    Analyze the user's profile and the list of available events.
    Your main goal is to select ${count} events that best match the user's interests.
    For each recommendation, you MUST provide a short, compelling reason (the "reason" field) explaining why it's a good match for the user.
    If the user has no specified interests, select a variety of popular or interesting upcoming events.
    The output must be a valid JSON object matching this schema: ${JSON.stringify(PersonalizedEventRecommendationsOutputSchema.shape)}.
    If no events are a good fit, you can return an empty recommendations array.`;

    const prompt = `User profile:
- Interests: ${interests || 'Not specified'}
- Home City: ${userProfile.homeCity || 'Not specified'}

Available Events (JSON format):
---
${JSON.stringify(availableEvents, null, 2)}
---

Return only the JSON object of recommendations.`;

    try {
        const json = await generateText({ systemInstruction, prompt });
        // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
        const cleanedJson = json.replace(/```json\n?|\n?```/g, '');
        const parsed = JSON.parse(cleanedJson);

        // This is a bit of a hack to map the fields correctly, since the AI might hallucinate field names.
        // A more robust solution would be to use a stricter output schema and prompt.
        const mappedRecs = parsed.recommendations?.map((rec: any) => ({
            eventId: rec.eventId,
            eventName: rec.eventName || rec.title,
            eventDescription: rec.eventDescription || rec.description,
            coverImageUrl: rec.coverImageUrl,
            reason: rec.reason,
        }));

        const finalOutput = { recommendations: mappedRecs || [] };

        return PersonalizedEventRecommendationsOutputSchema.parse(finalOutput);

    } catch (error) {
        console.error('Error getting personalized event recommendations:', error);
        return { recommendations: [] };
    }
}
