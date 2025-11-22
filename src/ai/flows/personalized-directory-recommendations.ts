'use server';

/**
 * @fileOverview A flow to provide personalized directory entry recommendations.
 *
 * - getPersonalizedDirectoryRecommendations - A function that returns directory entry recommendations.
 * - PersonalizedDirectoryRecommendationsInput - The input type for the getPersonalizedDirectoryRecommendations function.
 * - PersonalizedDirectoryRecommendationsOutput - The return type for the getPersonalizedDirectoryRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  interests: z.array(z.string()).describe('User interests and hobbies.'),
  skills: z.array(z.string()).describe('User skills and expertise.'),
  locationPreferences: z.array(z.string()).describe('Preferred locations for activities.'),
});

const PersonalizedDirectoryRecommendationsInputSchema = z.object({
  userProfile: UserProfileSchema.describe('The user profile information.'),
  userLocation: z.string().describe('The current location of the user (e.g., city, state).'),
  currentTime: z.string().describe('The current time (e.g., 2024-01-01T10:00:00Z).'),
  numberOfRecommendations: z.number().int().min(1).max(10).default(3).describe('The number of directory entry recommendations to return.'),
});
export type PersonalizedDirectoryRecommendationsInput = z.infer<
  typeof PersonalizedDirectoryRecommendationsInputSchema
>;

const DirectoryEntrySchema = z.object({
  name: z.string().describe('The name of the directory entry.'),
  description: z.string().describe('A short description of the directory entry.'),
  category: z.string().describe('The category of the directory entry (e.g., Networking, Sports, Professional Groups).'),
  location: z.string().describe('The location of the directory entry.'),
  availability: z.string().describe('The availability of the directory entry (e.g., specific hours, days of the week).'),
  suitabilityScore: z.number().describe('The calculated suitability score based on user profile, location and time.'),
});

const PersonalizedDirectoryRecommendationsOutputSchema = z.array(
  DirectoryEntrySchema
);
export type PersonalizedDirectoryRecommendationsOutput = z.infer<
  typeof PersonalizedDirectoryRecommendationsOutputSchema
>;

export async function getPersonalizedDirectoryRecommendations(
  input: PersonalizedDirectoryRecommendationsInput
): Promise<PersonalizedDirectoryRecommendationsOutput> {
  return personalizedDirectoryRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedDirectoryRecommendationsPrompt',
  input: {
    schema: PersonalizedDirectoryRecommendationsInputSchema,
  },
  output: {
    schema: PersonalizedDirectoryRecommendationsOutputSchema,
  },
  prompt: `You are an AI assistant that recommends directory entries to users based on their profile, location, and the current time. Your goal is to provide a list of directory entries that are most relevant to the user.

  User Profile:
  Interests: {{userProfile.interests}}
  Skills: {{userProfile.skills}}
  Location Preferences: {{userProfile.locationPreferences}}

  User Location: {{userLocation}}
  Current Time: {{currentTime}}
  Number of Recommendations: {{numberOfRecommendations}}

  Consider the user's interests, skills, and location preferences when recommending directory entries. Also, take into account the user's current location and the current time to recommend entries that are nearby and currently available.

  Return a JSON array of directory entries. Each entry should include the name, description, category, location, and availability. Include a suitabilityScore for each entry.
  `,
});

const personalizedDirectoryRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedDirectoryRecommendationsFlow',
    inputSchema: PersonalizedDirectoryRecommendationsInputSchema,
    outputSchema: PersonalizedDirectoryRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
