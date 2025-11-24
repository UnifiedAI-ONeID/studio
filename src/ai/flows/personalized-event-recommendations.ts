'use server';

/**
 * @fileOverview Provides personalized event recommendations based on user profile, location, and time.
 *
 * - getPersonalizedEventRecommendations - A function that returns personalized event recommendations.
 * - PersonalizedEventRecommendationsInput - The input type for the getPersonalizedEventRecommendations function PersonalizedEventRecommendationsInput.
 * - PersonalizedEventRecommendationsOutput - The return type for the getPersonalizedEventRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
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

const eventRecommendationPrompt = ai.definePrompt({
        name: 'eventRecommendationPrompt',
        input: {schema: PersonalizedEventRecommendationsInputSchema},
        output: {schema: PersonalizedEventRecommendationsOutputSchema},
        tools: [findEventsTool],
        prompt: `You are an expert at recommending relevant and interesting events to users.
        
        Your goal is to find events that align with the user's profile and location.
        
        User Profile:
        - Interests: {{#if userProfile.interests}}{{userProfile.interests}}{{else}}Not specified{{/if}}
        - Location: {{userProfile.homeCity}}
        
        Number of recommendations requested: {{count}}
        
        {{#if userProfile.interests}}
        1. Use the 'findEvents' tool to search for events. You can use one of the user's interests as the 'queryText' parameter to find relevant events. You must also pass the user's 'homeCity' to the tool.
        2. For each recommended event, you MUST provide a short, compelling reason why the user would be interested in it. Connect it directly to their stated interests.
        {{else}}
        1. The user has not specified any interests. Use the 'findEvents' tool to search for a variety of popular or upcoming events in the user's home city. You can leave the 'queryText' parameter empty.
        2. For each recommended event, provide a short, compelling reason why it's a great event to check out.
        {{/if}}

        3. Ensure you return the exact number of recommendations requested.
        4. Return the eventId, a short eventDescription, and coverImageUrl for each recommendation so the user can click on it and see an image.
        
        Format your output as a JSON object matching the schema.
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

export async function getPersonalizedEventRecommendations(input: PersonalizedEventRecommendationsInput): Promise<PersonalizedEventRecommendationsOutput> {
    return personalizedEventRecommendationsFlow(input);
}
