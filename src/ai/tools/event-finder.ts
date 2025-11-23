
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, limit, orderBy, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';

export const findEvents = ai.defineTool(
    {
      name: 'findEvents',
      description: 'Finds events from the database based on various criteria like interests, category, or location.',
      inputSchema: z.object({
        queryText: z.string().optional().describe('A general search query to match against event titles or descriptions.'),
        category: z.string().optional().describe('The category of the event (e.g., Music, Arts, Networking).'),
        city: z.string().optional().describe('The city where the event is located.'),
        count: z.number().int().min(1).max(10).default(5).describe('The maximum number of events to return.'),
      }),
      outputSchema: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          category: z.string(),
          city: z.string(),
      })),
    },
    async (input) => {
      console.log(`[findEvents tool] called with input: ${JSON.stringify(input)}`);
      
      const eventsRef = collection(firestore, 'events');
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
      ];

      if (input.category) {
        constraints.push(where('category', '==', input.category));
      }
      if (input.city) {
        constraints.push(where('city', '==', input.city));
      }

      // If there's a queryText but no category, we will do a client-side filter
      // as Firestore doesn't support case-insensitive or partial text search efficiently.
      // For a production app, a dedicated search service like Algolia is recommended.
      if (!input.queryText) {
          constraints.push(limit(input.count));
      }
      
      const q = query(eventsRef, ...constraints);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }
      
      let events = snapshot.docs.map(doc => {
          const data = doc.data() as Event;
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              category: data.category,
              city: data.city,
          }
      });

      if (input.queryText) {
        const lowercasedQuery = input.queryText.toLowerCase();
        events = events.filter(event => 
            event.title.toLowerCase().includes(lowercasedQuery) ||
            event.description.toLowerCase().includes(lowercasedQuery)
        ).slice(0, input.count);
      }
      
      console.log(`[findEvents tool] found ${events.length} events.`);
      return events;
    }
  );
