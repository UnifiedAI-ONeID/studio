'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, limit, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Venue } from '@/lib/types';


const findVenuesSchema = z.object({
    keyword: z.string().optional().describe('A keyword to search for in the venue name or description.'),
    category: z.string().optional().describe('The category of the venue (e.g., "Live music", "Cafe").'),
    city: z.string().optional().describe('The city where the venue is located.'),
    count: z.number().int().min(1).max(10).default(5).describe('The maximum number of venues to return.'),
  });

const VenueSchema = z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      categories: z.array(z.string()),
      coverImageUrl: z.string().optional(),
});

export const findVenuesTool = ai.defineTool(
    {
      name: 'findVenues',
      description: 'Finds venues (places) from the database based on criteria like category or name.',
      inputSchema: findVenuesSchema,
      outputSchema: z.array(VenueSchema),
    },
    async (input) => {
        console.log(`[findVenues tool] called with input: ${JSON.stringify(input)}`);

        const venuesRef = collection(firestore, 'venues');
        const constraints: QueryConstraint[] = [
            where('status', '==', 'approved'),
        ];

        if (input.category) {
            constraints.push(where('categories', 'array-contains', input.category));
        }
        if (input.city) {
            constraints.push(where('city', '==', input.city));
        }

        // Fetch more if we are doing a text-based filter
        constraints.push(limit(input.keyword ? 50 : input.count));

        const q = query(venuesRef, ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        let venues = snapshot.docs.map(doc => {
            const data = doc.data() as Venue;
            return {
                id: doc.id,
                name: data.name,
                description: data.description,
                categories: data.categories,
                coverImageUrl: data.coverImageUrl,
            };
        });

        if (input.keyword) {
             const filterPrompt = ai.definePrompt({
              name: 'venueFilterPrompt',
              input: { schema: z.object({ keyword: z.string(), venues: z.array(VenueSchema) }) },
              output: { schema: z.array(VenueSchema) },
              prompt: `You are an intelligent filter. From the provided list of venues, return only the ones that match the user's query: "{{keyword}}".
              
              Return the venues that are most relevant to the query based on their name, categories, and description.
              
              Available Venues:
              ---
              {{{json venues}}}
              ---
              
              Return a JSON array of the matching venue objects. If no venues match, return an empty array.
              `,
          });
          
          const { output } = await filterPrompt({ keyword: input.keyword, venues });
          return output ? output.slice(0, input.count) : [];
        }
        
        console.log(`[findVenues tool] found ${venues.length} venues.`);
        return venues;
    }
);


export async function findVenues(input: z.infer<typeof findVenuesSchema>) {
    return findVenuesTool(input);
}
