
'use server';

import { z } from 'zod';

const GeocodingResultSchema = z.object({
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
});

// This tool is defined but not yet used. It will be used in a future step
// to automatically get coordinates for an event address.
export const getCoordinatesForAddress = {
    name: 'getCoordinatesForAddress',
    description: 'Converts a physical address into geographic coordinates (latitude and longitude).',
    inputSchema: z.object({
      address: z.string().describe('The full street address to geocode.'),
    }),
    outputSchema: GeocodingResultSchema,
    run: async ({ address }: { address: string }) => {
        console.log(`[getCoordinatesForAddress tool] called for address: ${address}`);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
        throw new Error('Google Maps API key is not configured.');
        }
        
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        
        try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
            lat: location.lat,
            lng: location.lng,
            };
        } else {
            throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'No results found.'}`);
        }
        } catch (error) {
        console.error('Error calling Geocoding API:', error);
        throw error;
        }
    }
};
