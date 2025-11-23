'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, limit, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';

const findEventsSchema = z.object({
    queryText: z.string().optional().describe('A general search query to match against event titles or descriptions.'),
    category: z.string().optional().describe('The category of the event (e.g., Music, Arts, Networking).'),
    city: z.string().optional().describe('The city where the event is located.'),
    count: z.number().int().min(1).max(10).default(5).describe('The maximum number of events to return.'),
  });

const EventSchema = z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      city: z.string(),
      coverImageUrl: z.string().optional(),
});

export const findEventsTool = ai.defineTool(
    {
      name: 'findEvents',
      description: 'Finds events from the database based on various criteria like interests, category, or location.',
      inputSchema: findEventsSchema,
      outputSchema: z.array(EventSchema),
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
      
      // If a text query is provided, fetch more results to be filtered by the LLM. Otherwise, just limit.
      constraints.push(limit(input.queryText ? 50 : input.count));
      
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
              coverImageUrl: data.coverImageUrl,
          }
      });

      if (input.queryText) {
          const filterPrompt = ai.definePrompt({
              name: 'eventFilterPrompt',
              input: { schema: z.object({ query: z.string(), events: z.array(EventSchema) }) },
              output: { schema: z.array(EventSchema) },
              prompt: `You are an intelligent filter. From the provided list of events, return only the ones that match the user's query: "{{query}}".
              
              Return the events that are most relevant to the query based on their title and description.
              
              Available Events:
              ---
              {{{json events}}}
              ---
              
              Return a JSON array of the matching event objects. If no events match, return an empty array.
              `,
          });
          
          const filteredEvents = await filterPrompt({ query: input.queryText, events });
          return filteredEvents.output ? filteredEvents.output.slice(0, input.count) : [];
      }
      
      console.log(`[findEvents tool] found ${events.length} events.`);
      return events;
    }
  );


export async function findEvents(input: z.infer<typeof findEventsSchema>) {
    return findEventsTool(input);
}
