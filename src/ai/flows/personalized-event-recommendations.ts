'use server';

/**
 * @fileOverview Provides personalized event recommendations based on user profile, location, and time.
 *
 * - getPersonalizedEventRecommendations - A function that returns personalized event recommendations.
 * - PersonalizedEventRecommendationsInput - The input type for the getPersonalizedEventRecommendations function.
 * - PersonalizedEventRecommendationsOutput - The return type for the getPersonalizedEventRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedEventRecommendationsInputSchema = z.object({
  userProfile: z.object({
    interests: z.array(z.string()).describe('List of user interests'),
    age: z.number().optional().describe('User age'),
    location: z.string().optional().describe('User location'),
  }).describe('User profile information'),
  userLocation: z.string().describe('User location derived from IP address'),
  currentTime: z.string().describe('Current time in ISO format'),
});
export type PersonalizedEventRecommendationsInput = z.infer<typeof PersonalizedEventRecommendationsInputSchema>;

const PersonalizedEventRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.object({
    eventName: z.string().describe('Name of the event'),
    eventDescription: z.string().describe('Description of the event'),
    eventTime: z.string().describe('Time of the event'),
    eventLocation: z.string().describe('Location of the event'),
    relevanceScore: z.number().describe('A score indicating how relevant the event is to the user'),
  })).describe('A list of personalized event recommendations'),
});
export type PersonalizedEventRecommendationsOutput = z.infer<typeof PersonalizedEventRecommendationsOutputSchema>;

export async function getPersonalizedEventRecommendations(
    input: PersonalizedEventRecommendationsInput
): Promise<PersonalizedEventRecommendationsOutput> {
  return personalizedEventRecommendationsFlow(input);
}

const eventRecommendationPrompt = ai.definePrompt({
  name: 'eventRecommendationPrompt',
  input: {schema: PersonalizedEventRecommendationsInputSchema},
  output: {schema: PersonalizedEventRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized event recommendations to users.

  Based on the user's profile information, location, and the current time, suggest events that are relevant and timely.

  User Profile:
  Interests: {{userProfile.interests}}
  Age: {{userProfile.age}}
  Location: {{userProfile.location}}

  User Location (derived from IP):
  {{userLocation}}

  Current Time:
  {{currentTime}}

  Provide a list of event recommendations with the event name, description, time, location, and a relevance score (0-1) indicating how well the event matches the user's interests and context.  The relevance score should be based on your knowledge of the user's interests and location relative to the event's location.

  Format your output as a JSON object matching the schema PersonalizedEventRecommendationsOutputSchema.
  `,
});

const personalizedEventRecommendationsFlow = ai.defineFlow(
    {
      name: 'personalizedEventRecommendationsFlow',
      inputSchema: PersonalizedEventRecommendationsInputSchema,
      outputSchema: PersonalizedEventRecommendationsOutputSchema,
    },
    async input => {
      const {output} = await eventRecommendationPrompt(input);
      return output!;
    }
);
