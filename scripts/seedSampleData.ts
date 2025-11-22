/**
 * This script seeds sample Timeout-style data (events, venues, threads) for Taipei,
 * marked with isSampleData: true.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Use application default credentials if running in a Google Cloud environment
  // or use a service account key file for local development.
  // Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment.
  admin.initializeApp();
}

const db = admin.firestore();
const now = admin.firestore.Timestamp.now();

// --- Helper Functions ---

const getFutureDate = (days: number, hours: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return admin.firestore.Timestamp.fromDate(date);
};

const deleteCollectionByQuery = async (query: admin.firestore.Query, batchSize: number) => {
    const snapshot = await query.limit(batchSize).get();
    
    if (snapshot.size === 0) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    process.stdout.write('.');

    // Recurse on the same query to get the next batch.
    await deleteCollectionByQuery(query, batchSize);
}

const clearExistingSampleData = async () => {
    console.log("Clearing existing sample data...");
    const collections = ['users', 'events', 'venues', 'commonsThreads', 'commonsReplies', 'landingConfig'];
    
    for (const collectionName of collections) {
        const query = db.collection(collectionName).where('isSampleData', '==', true);
        await deleteCollectionByQuery(query, 50);
        console.log(`\nCleared sample data from ${collectionName}`);
    }
}

// --- Sample Data Definitions ---

const sampleUsers = [
  { id: 'seed_user_host_1', displayName: 'Taipei Tech Meetups', photoURL: `https://i.pravatar.cc/150?u=host1`, homeCity: 'Taipei', interests: ['Technology', 'Networking', 'AI'] },
  { id: 'seed_user_host_2', displayName: 'Community Yoga Taipei', photoURL: `https://i.pravatar.cc/150?u=host2`, homeCity: 'Taipei', interests: ['Wellness', 'Yoga', 'Mindfulness'] },
  { id: 'seed_user_host_3', displayName: 'Indie Live Taipei', photoURL: `https://i.pravatar.cc/150?u=host3`, homeCity: 'Taipei', interests: ['Music', 'Live Bands', 'Nightlife'] },
  { id: 'seed_user_alex', displayName: 'Alex Lin', photoURL: `https://i.pravatar.cc/150?u=user1`, homeCity: 'Taipei', interests: ['Music', 'Food', 'Hiking'] },
  { id: 'seed_user_mei', displayName: 'Mei Chen', photoURL: `https://i.pravatar.cc/150?u=user2`, homeCity: 'Taipei', interests: ['Art', 'Design', 'Cafes'] },
  { id: 'seed_user_liam', displayName: 'Liam Smith', photoURL: `https://i.pravatar.cc/150?u=user3`, homeCity: 'Taipei', interests: ['Photography', 'Travel'] },
];

const sampleVenues = [
    { id: 'seed_venue_1', name: 'Midnight Alley Jazz Bar', description: 'An intimate live jazz bar with local bands every weekend.', categories: ['Bar', 'Live music'], address: '123 Fuxing S Rd, Da\'an District', city: 'Taipei', neighborhood: 'Da\'an', homepageTagline: 'Intimate live jazz bar with local bands every weekend.', priceLevel: 3, coverImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, createdBy: 'seed_user_alex', stats: { ratingAverage: 4.5, ratingCount: 88, eventCount: 12 } },
    { id: 'seed_venue_2', name: 'Daybreak Coffee Lab', description: 'A bright, modern café with plenty of plugs and quiet corners perfect for deep work sessions.', categories: ['Cafe'], address: '456 Zhongshan N Rd, Zhongshan District', city: 'Taipei', neighborhood: 'Zhongshan', homepageTagline: 'Bright café with plenty of plugs and quiet corners for deep work.', priceLevel: 2, coverImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, createdBy: 'seed_user_mei', stats: { ratingAverage: 4.8, ratingCount: 150, eventCount: 2 } },
    { id: 'seed_venue_3', name: 'Cornerstone Community Hub', description: 'A vibrant space for creators, innovators, and neighbors to connect and collaborate.', categories: ['Coworking', 'Community'], address: '789 Xinyi Rd, Xinyi District', city: 'Taipei', neighborhood: 'Xinyi', homepageTagline: 'A space for creators, innovators, and neighbors to connect.', priceLevel: 2, coverImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, createdBy: 'seed_user_host_1', stats: { ratingAverage: 4.6, ratingCount: 45, eventCount: 25 } },
    { id: 'seed_venue_4', name: 'Lightbox Art Space', description: 'A contemporary gallery showcasing cutting-edge digital and interactive art from local and international artists.', categories: ['Art Gallery'], address: '101 Songde Rd, Xinyi District', city: 'Taipei', neighborhood: 'Xinyi', homepageTagline: 'Showcasing contemporary digital and interactive art.', priceLevel: 1, coverImageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, createdBy: 'seed_user_mei', stats: { ratingAverage: 4.9, ratingCount: 60, eventCount: 8 } },
    { id: 'seed_venue_5', name: 'The Wall Live House', description: 'The legendary underground music venue that has been a cornerstone of Taipei\'s indie music scene for decades.', categories: ['Live music'], address: 'B1, No. 200, Section 4, Roosevelt Rd, Wenshan District', city: 'Taipei', neighborhood: 'Wenshan', homepageTagline: 'Taipei\'s legendary underground music venue.', priceLevel: 2, coverImageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, createdBy: 'seed_user_host_3', stats: { ratingAverage: 4.7, ratingCount: 250, eventCount: 30 } },
];

const sampleEvents = [
    { id: 'seed_event_1', title: 'Rooftop Jazz Night at Zhongshan', description: "Enjoy a magical evening under the stars with live jazz music from some of Taipei's finest musicians. A perfect way to unwind.", category: 'Music', startTime: getFutureDate(3, 20), city: 'Taipei', neighborhood: 'Zhongshan', hostId: 'seed_user_host_3', priceType: 'paid', minPrice: 600, coverImageUrl: 'https://images.unsplash.com/photo-1619532938034-0a373b577b22?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, priorityScore: 100, stats: { interestedCount: 45, rsvpCount: 22 } },
    { id: 'seed_event_2', title: 'Art Walk: Hidden Galleries of Da\'an', description: "Discover the vibrant art scene of the Da'an district with a guided tour of its most interesting and lesser-known galleries.", category: 'Arts', startTime: getFutureDate(4, 14), city: 'Taipei', neighborhood: 'Da\'an', hostId: 'seed_user_mei', priceType: 'free', coverImageUrl: 'https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, priorityScore: 95, stats: { interestedCount: 78, rsvpCount: 41 } },
    { id: 'seed_event_3', title: 'Startup Founder Breakfast Meetup', description: "Connect with fellow entrepreneurs, share ideas, and enjoy a delicious breakfast. A great opportunity to network and learn.", category: 'Networking', startTime: getFutureDate(9, 8), city: 'Taipei', neighborhood: 'Xinyi', hostId: 'seed_user_host_1', priceType: 'paid', minPrice: 250, location: { venueId: 'seed_venue_3' }, coverImageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', stats: { interestedCount: 120, rsvpCount: 60 } },
    { id: 'seed_event_4', title: 'Sunday Yoga by the Riverside', description: "Join us for a relaxing and rejuvenating morning yoga session by the riverside. All levels are welcome.", category: 'Wellness', startTime: getFutureDate(5, 9), city: 'Taipei', neighborhood: 'Songshan', hostId: 'seed_user_host_2', priceType: 'donation', coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, priorityScore: 80, stats: { interestedCount: 95, rsvpCount: 55 } },
    { id: 'seed_event_5', title: 'Indie Band Showcase at The Wall', description: "Experience the best of Taiwan's indie music scene with a lineup of three up-and-coming bands at the legendary The Wall.", category: 'Music', startTime: getFutureDate(11, 20), city: 'Taipei', location: { venueId: 'seed_venue_5', neighborhood: 'Wenshan' }, hostId: 'seed_user_host_3', priceType: 'paid', minPrice: 400, coverImageUrl: 'https://images.unsplash.com/photo-1496337589254-7e23d04de0f0?q=80&w=2070&auto=format&fit=crop&ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isFeaturedOnLanding: true, priorityScore: 90, stats: { interestedCount: 150, rsvpCount: 80 } },
    { id: 'seed_event_6', title: 'Taipei Dumpling Making Class', description: "Learn the art of making delicious Taiwanese dumplings from scratch in this fun and interactive cooking class.", category: 'Food & Drink', startTime: getFutureDate(12, 18), city: 'Taipei', neighborhood: 'Wanhua', hostId: 'seed_user_alex', priceType: 'paid', minPrice: 1200, coverImageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop&ixlib.rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', stats: { interestedCount: 60, rsvpCount: 30 } },
];

const sampleThreads = [
    { id: 'seed_thread_1', title: 'Best places for live music this weekend?', topic: 'Events', city: 'Taipei', body: 'My friends are visiting and I want to show them the best of Taipei\'s live music scene. Any recommendations for this Friday or Saturday? Open to anything from jazz to indie rock.', authorId: 'seed_user_alex', stats: { replyCount: 3, viewCount: 150 } },
    { id: 'seed_thread_2', title: 'Solo-friendly spots to grab a drink in Xinyi', topic: 'Neighborhoods', city: 'Taipei', body: 'Looking for a bar in Xinyi where it\'s comfortable to just sit with a book and have a nice cocktail. Not too loud, not a total dive. Any ideas?', authorId: 'seed_user_mei', stats: { replyCount: 5, viewCount: 220 }, relatedVenueId: 'seed_venue_1' },
    { id: 'seed_thread_3', title: 'Looking for a co-working space near an MRT line', topic: 'Tips', city: 'Taipei', body: 'Remote worker here. My apartment is getting too cramped. I need a co-working space with reliable internet that\'s a short walk from any MRT station. Any favorites?', authorId: 'seed_user_liam', stats: { replyCount: 2, viewCount: 95 }, relatedVenueId: 'seed_venue_3' },
];

const sampleReplies = [
    { threadId: 'seed_thread_1', body: 'You should definitely check out The Wall in Wenshan. They always have great indie bands playing.', authorId: 'seed_user_host_3' },
    { threadId: 'seed_thread_1', body: 'Midnight Alley Jazz Bar is my go-to for a chill vibe. The cocktails are amazing too.', authorId: 'seed_user_mei' },
    { threadId: 'seed_thread_2', body: 'Have you tried the bar at the top of the W Hotel? It\'s pricey but the view is incredible and it\'s great for people-watching solo.', authorId: 'seed_user_alex' },
];

// --- Seeding Logic ---

const seed = async () => {
    await clearExistingSampleData();
    
    const batch = db.batch();

    // Seed Users
    console.log("Seeding users...");
    sampleUsers.forEach(user => {
        const ref = db.collection('users').doc(user.id);
        batch.set(ref, {
            ...user,
            createdAt: now,
            updatedAt: now,
            isSampleData: true,
        });
    });
    console.log(`  - Staged ${sampleUsers.length} users.`);

    // Seed Venues
    console.log("Seeding venues...");
    sampleVenues.forEach(venue => {
        const ref = db.collection('venues').doc(venue.id);
        batch.set(ref, {
            ...venue,
            createdAt: now,
            updatedAt: now,
            stats: venue.stats || { ratingAverage: 0, ratingCount: 0, eventCount: 0 },
            isSampleData: true,
        });
    });
    console.log(`  - Staged ${sampleVenues.length} venues.`);

    // Seed Events
    console.log("Seeding events...");
    sampleEvents.forEach(event => {
        const ref = db.collection('events').doc(event.id);
        batch.set(ref, {
            ...event,
            description: event.description || 'Placeholder event description.',
            timezone: 'Asia/Taipei',
            status: 'published',
            visibility: 'public',
            createdAt: now,
            updatedAt: now,
            isSampleData: true,
        });
    });
    console.log(`  - Staged ${sampleEvents.length} events.`);

    // Seed Threads
    console.log("Seeding threads...");
    sampleThreads.forEach(thread => {
        const ref = db.collection('commonsThreads').doc(thread.id);
        batch.set(ref, {
            ...thread,
            createdAt: now,
            updatedAt: now,
            lastActivityAt: now,
            isSampleData: true,
        });
    });
    console.log(`  - Staged ${sampleThreads.length} threads.`);

    // Seed Replies
    console.log("Seeding replies...");
    sampleReplies.forEach((reply, index) => {
        const ref = db.collection('commonsReplies').doc(`seed_reply_${index + 1}`);
        batch.set(ref, {
            ...reply,
            createdAt: now,
            updatedAt: now,
            isSampleData: true,
        });
    });
    console.log(`  - Staged ${sampleReplies.length} replies.`);

    // Seed Landing Config
    console.log("Seeding landing config...");
    const landingConfigRef = db.collection('landingConfig').doc('global');
    batch.set(landingConfigRef, {
        defaultCity: 'Taipei',
        featuredEventIds: sampleEvents.filter(e => e.isFeaturedOnLanding).map(e => e.id),
        featuredVenueIds: sampleVenues.filter(v => v.isFeaturedOnLanding).map(v => v.id),
        highlightedTopics: ['Events', 'Neighborhoods', 'Tips'],
        isSampleData: true,
    });
    console.log("  - Staged landingConfig document.");

    // Commit batch
    console.log("\nCommitting all staged data to Firestore...");
    await batch.commit();

    console.log("\nDone seeding sample data!");
    console.log("What's next? Run `npm run dev` to see the seeded data in your app.");
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
