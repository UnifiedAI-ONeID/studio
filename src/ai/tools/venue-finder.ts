'use server';

import { z } from 'zod';
import { collection, query, where, getDocs, limit, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Venue } from '@/lib/types';
import { generateText } from '../gemini';


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

export const findVenuesTool = {
      name: 'findVenues',
      description: 'Finds venues (places) from the database based on criteria like category or name.',
      inputSchema: findVenuesSchema,
      outputSchema: z.array(VenueSchema),
      run: async (input: z.infer<typeof findVenuesSchema>) => {
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

        // If a keyword is provided, use an LLM to perform a semantic filter on the results.
        if (input.keyword) {
             const prompt = `You are an intelligent filter. From the provided list of venues, return only the ones that match the user's keyword search: "${input.keyword}".
              
              Return the venues that are most relevant to the query based on their name, categories, and description.
              
              Available Venues:
              ---
              ${JSON.stringify(venues)}
              ---
              
              Return a JSON array of the matching venue objects. If no venues match, return an empty array.
              `;
          
            try {
                const jsonResponse = await generateText({ prompt });
                // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
                const cleanedJson = jsonResponse.replace(/```json\n?|\n?```/g, '');
                const filteredVenues = z.array(VenueSchema).parse(JSON.parse(cleanedJson));
                return filteredVenues ? filteredVenues.slice(0, input.count) : [];
            } catch (e) {
                console.error("Failed to parse AI response for venue filtering:", e);
                // Fallback to basic client-side filtering if AI fails
                return venues.filter(venue => 
                    venue.name.toLowerCase().includes(input.keyword!.toLowerCase()) || 
                    (venue.description && venue.description.toLowerCase().includes(input.keyword!.toLowerCase()))
                ).slice(0, input.count);
            }
        }
        
        console.log(`[findVenues tool] found ${venues.length} venues.`);
        return venues;
    }
};
