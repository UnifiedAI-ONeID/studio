
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, limit, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/src/lib/firebase';
import type { Venue } from '@/lib/types';

export const findVenues = ai.defineTool(
    {
      name: 'findVenues',
      description: 'Finds venues (places) from the database based on criteria like category or name.',
      inputSchema: z.object({
        keyword: z.string().optional().describe('A keyword to search for in the venue name or description.'),
        category: z.string().optional().describe('The category of the venue (e.g., "Live music", "Cafe").'),
        city: z.string().optional().describe('The city where the venue is located.'),
        count: z.number().int().min(1).max(10).default(5).describe('The maximum number of venues to return.'),
      }),
      outputSchema: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          categories: z.array(z.string()),
      })),
    },
    async (input) => {
        console.log(`[findVenues tool] called with input: ${JSON.stringify(input)}`);

        const venuesRef = collection(firestore, 'venues');
        const constraints: QueryConstraint[] = [
            where('status', '==', 'approved'),
            limit(input.count),
        ];

        if (input.category) {
            constraints.push(where('categories', 'array-contains', input.category));
        }
        if (input.city) {
            constraints.push(where('city', '==', input.city));
        }
         // A full-text search on 'keyword' is not supported natively.
         // This is a simplified search. For a real app, use a dedicated search service.
         if (!input.category && input.keyword) {
             constraints.push(where('categories', 'array-contains', input.keyword));
         }

        const q = query(venuesRef, ...constraints);
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const venues = snapshot.docs.map(doc => {
            const data = doc.data() as Venue;
            return {
                id: doc.id,
                name: data.name,
                description: data.description,
                categories: data.categories,
            };
        });
        
        console.log(`[findVenues tool] found ${venues.length} venues.`);
        return venues;
    }
);
