import { config } from 'dotenv';
config();

// Import flows to be served by the dev server.
import '@/ai/flows/personalized-event-recommendations';
import '@/ai/flows/personalized-directory-recommendations';
