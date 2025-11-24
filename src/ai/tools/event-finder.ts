'use server';

import { z } from 'zod';
import { collection, query, where, getDocs, limit, doc, getDoc, QueryConstraint } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { generateText } from '../gemini';

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

export const findEventsTool = {
    name: 'findEvents',
    description: 'Finds events from the database based on various criteria like interests, category, or location.',
    inputSchema: findEventsSchema,
    outputSchema: z.array(EventSchema),
    run: async (input: z.infer<typeof findEventsSchema>) => {
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
      
      // If doing a text search, fetch a larger number of initial results to filter down.
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

      // If a queryText is provided, use an LLM to perform a semantic filter on the results.
      if (input.queryText) {
          const prompt = `You are an intelligent filter. From the provided list of events, return only the ones that match the user's query: "${input.queryText}".
              
              Return the events that are most relevant to the query based on their title and description.
              
              Available Events:
              ---
              ${JSON.stringify(events)}
              ---
              
              Return a JSON array of the matching event objects. If no events match, return an empty array.`;
          
          try {
            const jsonResponse = await generateText({ prompt });
            // Gemini may wrap the JSON in ```json ... ```, so we need to strip that
            const cleanedJson = jsonResponse.replace(/```json\n?|\n?```/g, '');
            const filteredEvents = z.array(EventSchema).parse(JSON.parse(cleanedJson));
            return filteredEvents ? filteredEvents.slice(0, input.count) : [];
          } catch(e) {
            console.error("Failed to parse AI response for event filtering:", e);
            // Fallback to basic client-side filtering if AI fails
            return events.filter(event => 
                event.title.toLowerCase().includes(input.queryText!.toLowerCase()) || 
                event.description.toLowerCase().includes(input.queryText!.toLowerCase())
            ).slice(0, input.count);
          }
      }
      
      console.log(`[findEvents tool] found ${events.length} events.`);
      return events;
    }
  };

export const getEventDetailsTool = {
    name: 'getEventDetails',
    description: 'Gets the full details for a single event by its ID.',
    inputSchema: z.object({ eventId: z.string().describe('The ID of the event to fetch.') }),
    outputSchema: EventDetailsSchema,
    run: async ({ eventId }: { eventId: string }) => {
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
};
