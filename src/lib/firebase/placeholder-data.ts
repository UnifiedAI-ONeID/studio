
import type { Event, Venue, CommonsThread } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const now = new Date();
const getFutureDate = (days: number, hours: number = 0) => {
    const date = new Date();
    date.setDate(now.getDate() + days);
    date.setHours(hours, 0, 0, 0);
    return date;
}

export const placeholderVenues: (Omit<Venue, 'id' | 'createdAt' | 'updatedAt' > & { id: string })[] = [
  {
    id: 'the-fillmore',
    name: 'The Fillmore',
    categories: ['Live music', 'Venue'],
    description: 'A legendary music venue in San Francisco, known for its historic past and intimate concert experiences. The Fillmore has hosted some of the greatest names in music history.',
    homepageTagline: 'Historic venue, legendary nights.',
    address: '1805 Geary Blvd, San Francisco, CA 94115',
    city: 'San Francisco',
    neighborhood: 'Fillmore District',
    lat: 37.7842,
    lng: -122.4331,
    priceLevel: 3,
    coverImageUrl: 'https://images.unsplash.com/photo-1559819234-8be7cac3aich?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFeaturedOnLanding: true,
    stats: {
        eventCount: 25,
        ratingAverage: 4.8,
        ratingCount: 1200
    },
    createdBy: 'system',
    status: 'approved',
  },
  {
    id: 'zeitgeist',
    name: 'Zeitgeist',
    categories: ['Bar', 'Restaurant'],
    description: 'A classic SF beer garden with a huge selection of craft beers, a punk rock vibe, and a spacious outdoor patio. Famous for its bloody marys and burgers.',
    homepageTagline: 'Sunny patio, craft beer, punk rock.',
    address: '199 Valencia St, San Francisco, CA 94103',
    city: 'San Francisco',
    neighborhood: 'Mission District',
    lat: 37.7699,
    lng: -122.4221,
    priceLevel: 2,
    coverImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFeaturedOnLanding: true,
     stats: {
        eventCount: 5,
        ratingAverage: 4.5,
        ratingCount: 850
    },
    createdBy: 'system',
    status: 'approved',
  },
  {
    id: 'four-barrel-coffee',
    name: 'Four Barrel Coffee',
    categories: ['Cafe'],
    description: 'A bustling, hip coffee shop in the Mission that roasts its own beans and serves artisanal espresso drinks. No wifi, just great coffee and conversation.',
    homepageTagline: 'Artisanal roasts, vibrant space.',
    address: '375 Valencia St, San Francisco, CA 94103',
    city: 'San Francisco',
    neighborhood: 'Mission District',
    lat: 37.7676,
    lng: -122.4221,
    priceLevel: 2,
    coverImageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFeaturedOnLanding: true,
    stats: {
        eventCount: 2,
        ratingAverage: 4.7,
        ratingCount: 950
    },
    createdBy: 'system',
    status: 'approved',
  },
  {
    id: 'de-young-museum',
    name: 'de Young Museum',
    categories: ['Art Gallery', 'Museum'],
    description: 'Fine arts museum in Golden Gate Park, showcasing American art, international contemporary art, textiles, and costumes, with a stunning observation tower.',
    homepageTagline: 'Art, architecture, and Golden Gate Park.',
    address: '50 Hagiwara Tea Garden Dr, San Francisco, CA 94118',
    city: 'San Francisco',
    neighborhood: 'Golden Gate Park',
    lat: 37.7715,
    lng: -122.4687,
    priceLevel: 3,
    coverImageUrl: 'https://images.unsplash.com/photo-1588697137992-0f9c6c72d5e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFeaturedOnLanding: false,
    stats: {
        eventCount: 15,
        ratingAverage: 4.6,
        ratingCount: 2100
    },
    createdBy: 'system',
    status: 'approved',
  },
];

export const placeholderEvents: (Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'startTime' | 'endTime'> & { id: string, startTime: Date, endTime?: Date })[] = [
  {
    id: 'indie-fest-2024',
    title: 'IndieFest 2024 at The Fillmore',
    description: 'An evening celebrating the best up-and-coming indie rock bands from the Bay Area and beyond. Full lineup to be announced.',
    category: 'Music',
    tags: ['indie', 'live music', 'rock'],
    startTime: getFutureDate(10, 20), // 10 days from now at 8 PM
    endTime: getFutureDate(10, 23),
    timezone: 'PST',
    city: 'San Francisco',
    location: {
        venueId: 'the-fillmore',
        neighborhood: 'Fillmore District',
        address: '1805 Geary Blvd, San Francisco, CA 94115',
    },
    hostId: 'system-user',
    hostType: 'organization',
    coverImageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    priceType: 'paid',
    priceMin: 45,
    status: 'published',
    visibility: 'public',
    isFeaturedOnLanding: true,
    priorityScore: 100,
    stats: { interestedCount: 102, rsvpCount: 65 },
  },
  {
    id: 'sf-tech-mixer-ai',
    title: 'SF Tech Mixer: The Future of AI',
    description: 'Join industry leaders, developers, and investors for a night of networking and discussion on the latest trends in Artificial Intelligence.',
    category: 'Networking',
    tags: ['tech', 'ai', 'networking', 'startups'],
    startTime: getFutureDate(5, 18), // 5 days from now at 6 PM
    endTime: getFutureDate(5, 21),
    timezone: 'PST',
    city: 'San Francisco',
    location: {
        venueId: 'zeitgeist', 
        neighborhood: 'Mission District',
        address: '199 Valencia St, San Francisco, CA 94103'
    },
    hostId: 'system-user',
    hostType: 'organization',
    coverImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    priceType: 'free',
    status: 'published',
    visibility: 'public',
    isFeaturedOnLanding: true,
    priorityScore: 90,
    stats: { interestedCount: 250, rsvpCount: 120 },
  },
  {
    id: 'weekend-art-show',
    title: 'Weekend Art Showcase: Local Artists',
    description: 'Discover the vibrant local art scene. Paintings, sculptures, and mixed media from talented San Francisco artists will be on display and for sale.',
    category: 'Arts',
    tags: ['art', 'gallery', 'local artists', 'culture'],
    startTime: getFutureDate(3, 11), // This coming Saturday at 11 AM
    endTime: getFutureDate(3, 17),
    timezone: 'PST',
    city: 'San Francisco',
    location: {
        venueId: 'de-young-museum',
        neighborhood: 'Golden Gate Park',
    },
    hostId: 'system-user',
    hostType: 'organization',
    coverImageUrl: 'https://images.unsplash.com/photo-1531981284873-ce55ca41a3a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    priceType: 'donation',
    status: 'published',
    visibility: 'public',
    isFeaturedOnLanding: true,
    priorityScore: 80,
    stats: { interestedCount: 88, rsvpCount: 42 },
  },
  {
    id: 'farmers-market-ferry',
    title: 'Ferry Plaza Farmers Market',
    description: 'A vibrant farmers market with fresh produce, artisan foods, and beautiful views of the bay. A true taste of Northern California.',
    category: 'Food & Drink',
    tags: ['farmers market', 'local food', 'outdoors'],
    startTime: getFutureDate(3, 9), // This coming Saturday at 9 AM
    endTime: getFutureDate(3, 14),
    timezone: 'PST',
    city: 'San Francisco',
    location: {
        neighborhood: 'Embarcadero',
        address: '1 Ferry Building, San Francisco, CA 94111',
    },
    hostId: 'system-user',
    hostType: 'organization',
    coverImageUrl: 'https://images.unsplash.com/photo-1587624564943-5f1428615455?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    priceType: 'free',
    status: 'published',
    visibility: 'public',
    isFeaturedOnLanding: false,
    priorityScore: 70,
    stats: { interestedCount: 300, rsvpCount: 150 },
  },
];


export const placeholderThreads: (Omit<CommonsThread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'> & { id: string })[] = [
    {
        id: 'best-burrito-in-mission',
        title: 'Settle the debate: What is the BEST burrito in the Mission?',
        body: "I'm on a quest to find the ultimate burrito in the Mission and I need your help. I've tried La Taqueria (no rice, controversial!), El Farolito (the long lines!), and Pancho Villa. They're all amazing, but which one is truly the king? Cast your vote and defend your choice!",
        topic: 'neighborhoods',
        city: 'San Francisco',
        tags: ['food', 'mission', 'burrito', 'debate'],
        authorId: 'system-user-1',
        stats: {
            replyCount: 28,
            viewCount: 1042,
            likeCount: 42,
        },
    },
    {
        id: 'sutro-baths-hike',
        title: 'Hidden photo spots at Sutro Baths?',
        body: "Planning a sunset hike at Sutro Baths this weekend. I've been a few times but feel like I'm missing some of the more hidden, dramatic photo opportunities. Any photographers out there have tips on where to go beyond the main ruins?",
        topic: 'general',
        city: 'San Francisco',
        tags: ['hiking', 'photography', 'outdoors', 'sunset'],
        relatedVenueId: 'de-young-museum',
        authorId: 'system-user-2',
        stats: {
            replyCount: 12,
            viewCount: 512,
            likeCount: 31,
        },
    },
    {
        id: 'looking-for-dnd-group',
        title: 'D&D Group Looking for 1-2 More Players (Noe Valley)',
        body: "Our regular Dungeons & Dragons group is looking for one or two new players to join a new campaign. We play every other Tuesday evening in Noe Valley. We're a friendly, inclusive group, new players welcome! We focus more on roleplaying than rules-lawyering. Send me a message if you're interested!",
        topic: 'clubs',
        city: 'San Francisco',
        tags: ['dnd', 'gaming', 'tabletop', 'rpg'],
        authorId: 'system-user-3',
        stats: {
            replyCount: 5,
            viewCount: 230,
            likeCount: 15,
        },
    }
];

export const seedDatabase = async (db: any) => {
  const batch = db.batch();
  const now = Timestamp.now();

  const venueCollection = collection(db, 'venues');
  
  // Check if already seeded
  const q = query(venueCollection, where('createdBy', '==', 'system'), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
      const message = "Database has already been seeded. Aborting.";
      console.log(message);
      return { success: true, message: message };
  }

  const venueIdMap = new Map<string, string>();
  for (const venue of placeholderVenues) {
    const { id: oldId, ...venueData } = venue;
    const docRef = doc(venueCollection); 
    batch.set(docRef, {
        ...venueData,
        createdAt: now,
        updatedAt: now,
    });
    venueIdMap.set(oldId, docRef.id);
  }
  
  const eventCollection = collection(db, 'events');
  placeholderEvents.forEach(event => {
    const { id, startTime, endTime, location, ...eventData } = event;
    const newVenueId = location.venueId ? venueIdMap.get(location.venueId) : undefined;
    
    const docRef = doc(eventCollection); 
    batch.set(docRef, {
        ...eventData,
        location: { ...location, venueId: newVenueId },
        startTime: Timestamp.fromDate(startTime),
        endTime: endTime ? Timestamp.fromDate(endTime) : undefined,
        createdAt: now,
        updatedAt: now,
    });
  });
  
  const threadCollection = collection(db, 'commonsThreads');
  placeholderThreads.forEach(thread => {
      const { id, ...threadData } = thread;
      const docRef = doc(threadCollection);
      batch.set(docRef, {
          ...threadData,
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
      });
  });

  try {
    await batch.commit();
    const message = 'Database seeded successfully!';
    console.log(message);
    return { success: true, message: message };
  } catch (error) {
    const message = `Error seeding database: ${error}`;
    console.error(message);
    return { success: false, message: message };
  }
};
