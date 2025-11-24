'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, limit, doc, getDoc, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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

const EventDetailsSchema = EventSchema.extend({
    startTime: z.string().describe("The start time of the event in ISO 8601 format."),
    priceType: z.string(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
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
              input: { schema: z.object({ queryText: z.string(), events: z.array(EventSchema) }) },
              output: { schema: z.array(EventSchema) },
              prompt: `You are an intelligent filter. From the provided list of events, return only the ones that match the user's query: "{{queryText}}".
              
              Return the events that are most relevant to the query based on their title and description.
              
              Available Events:
              ---
              {{{json events}}}
              ---
              
              Return a JSON array of the matching event objects. If no events match, return an empty array.
              `,
          });
          
          const { output } = await filterPrompt({ queryText: input.queryText, events });
          return output ? output.slice(0, input.count) : [];
      }
      
      console.log(`[findEvents tool] found ${events.length} events.`);
      return events;
    }
  );

export const getEventDetailsTool = ai.defineTool(
    {
        name: 'getEventDetails',
        description: 'Gets the full details for a single event by its ID.',
        inputSchema: z.object({ eventId: z.string().describe('The ID of the event to fetch.') }),
        outputSchema: EventDetailsSchema,
    },
    async ({ eventId }) => {
        console.log(`[getEventDetails tool] called for eventId: ${eventId}`);
        const eventRef = doc(firestore, 'events', eventId);
        const snapshot = await getDoc(eventRef);

        if (!snapshot.exists()) {
            throw new Error(`Event with ID ${eventId} not found.`);
        }

        const data = snapshot.data() as Event;

        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            category: data.category,
            city: data.city,
            coverImageUrl: data.coverImageUrl,
            startTime: (data.startTime as Timestamp).toDate().toISOString(),
            priceType: data.priceType,
            priceMin: data.priceMin,
            priceMax: data.priceMax,
        };
    }
);
