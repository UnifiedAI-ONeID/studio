
// scripts/seedSampleData.ts
// Node-only script: DO NOT import this from your Next.js app.
// Run with:  npx ts-node scripts/seedSampleData.ts

import * as admin from "firebase-admin";

const PROJECT_ID = "studio-791034259-1f91e"; // your Firebase project ID

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const now = admin.firestore.Timestamp.now();

/**
 * VENUES
 * Used by: landing, directory, venue detail
 */
const venues = [
  {
    id: "venue_midnight_alley",
    name: "Midnight Alley Jazz Bar",
    city: "Taipei",
    neighborhood: "Zhongshan",
    homepageTagline: "Intimate live jazz bar with local bands every weekend.",
    description:
      "A cozy basement venue in the heart of Zhongshan. Expect small-batch cocktails, local jazz bands, and late-night conversations.",
    categories: ["bar", "live music"],
    capacity: 80,
    tags: ["live music", "jazz", "nightlife"],
    isFeaturedOnLanding: true,
    homepageOrder: 1,
    coverImageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    status: 'approved',
    createdBy: 'system',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_rooftop_lab",
    name: "Rooftop Lab",
    city: "Taipei",
    neighborhood: "Xinyi",
    homepageTagline:
      "Experimental rooftop space for salons, screenings, and pop-ups.",
    description:
      "An open-air rooftop with modular seating and a small indoor lab. Great for founders’ meetups, screenings, and design sprints.",
    categories: ["rooftop", "founders"],
    capacity: 120,
    tags: ["founders", "startups", "screenings"],
    isFeaturedOnLanding: true,
    homepageOrder: 2,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    status: 'approved',
    createdBy: 'system',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_impact_house",
    name: "Impact House",
    city: "Taipei",
    neighborhood: "Daan",
    homepageTagline:
      "Daytime hub for climate, civic tech, and social impact projects.",
    description:
      "A bright townhouse with meeting rooms, a prototyping lab, and a café-style ground floor. Home for climate and civic-tech operators.",
    categories: ["hub", "co-working"],
    capacity: 60,
    tags: ["climate", "civic tech", "co-working"],
    isFeaturedOnLanding: true,
    homepageOrder: 3,
    coverImageUrl:
      "https://images.unsplash.com/photo-1522204502588-1b53c5df83ef?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    status: 'approved',
    createdBy: 'system',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_sea_view_hub",
    name: "Sea View Hub",
    city: "Kaohsiung",
    neighborhood: "Gushan",
    homepageTagline: "Harbor-side space for retreats and design offsites.",
    description:
      "A waterfront venue with a panoramic view of the harbor. Ideal for offsites, design sprints, and small retreats.",
    categories: ["hub", "retreat"],
    capacity: 40,
    tags: ["offsite", "retreat", "harbor"],
    isFeaturedOnLanding: true,
    homepageOrder: 4,
    coverImageUrl:
      "https://images.unsplash.com/photo-1470219954231-ff19a730a3a1?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    status: 'approved',
    createdBy: 'system',
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * EVENTS
 * Used by: landing lists, city filters, calendar sections
 */
const events = [
  {
    id: "event_impact_brunch",
    title: "Impact Brunch & Founder Intros",
    venueId: "venue_midnight_alley",
    city: "Taipei",
    category: "founders",
    status: "published",
    visibility: "public",
    isFeaturedOnLanding: true,
    priorityScore: 100,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    ),
    description:
      "A lightly curated brunch where 8–12 founders and operators share what they’re building, what’s stuck, and where they could use help. Brunch for founders and operators building in climate, civic tech, and education.",
    tags: ["founders", "climate", "edtech"],
    priceType: "paid",
    priceMin: 450,
    stats: { interestedCount: 15, goingCount: 22, savedCount: 8, viewCount: 250 },
    maxAttendees: 30,
    coverImageUrl:
      "https://images.unsplash.com/photo-1459682687441-7761439a7090?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    hostId: 'system',
    createdBy: 'system',
    approvalStatus: 'approved',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event_night_jazz_lab",
    title: "Night Lab: Live Jazz & Side Projects",
    venueId: "venue_midnight_alley",
    city: "Taipei",
    category: "social",
    status: "published",
    visibility: "public",
    isFeaturedOnLanding: true,
    priorityScore: 90,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    ),
    description:
      "Bring your side project, ship something small, and end the night with live jazz sets and casual intros. Live jazz, side project demos, and very lightweight pitches.",
    tags: ["live music", "side projects"],
    priceType: "free",
    stats: { interestedCount: 45, goingCount: 30, savedCount: 12, viewCount: 450 },
    maxAttendees: 60,
    coverImageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    hostId: 'system',
    createdBy: 'system',
    approvalStatus: 'approved',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event_rooftop_screening",
    title: "Rooftop Screening: Future Cities",
    venueId: "venue_rooftop_lab",
    city: "Taipei",
    category: "screening",
    status: "published",
    visibility: "public",
    isFeaturedOnLanding: true,
    priorityScore: 95,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    ),
    description:
      "A curated set of short films about urban resilience, followed by moderated discussion circles. Short film program and discussion about livable, resilient cities.",
    tags: ["cities", "resilience", "screening"],
    priceType: "paid",
    priceMin: 350,
    stats: { interestedCount: 50, goingCount: 41, savedCount: 25, viewCount: 600 },
    maxAttendees: 80,
    coverImageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    hostId: 'system',
    createdBy: 'system',
    approvalStatus: 'approved',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event_climate_sprint",
    title: "Climate Sprint: Harbor Resilience",
    venueId: "venue_sea_view_hub",
    city: "Kaohsiung",
    category: "climate",
    status: "published",
    visibility: "public",
    isFeaturedOnLanding: true,
    priorityScore: 110,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)
    ),
    description:
      "Multi-disciplinary teams explore real challenges with mentors from climate, logistics, and public policy. One-day design sprint on coastal resilience and harbor systems.",
    tags: ["climate", "sprint", "harbor"],
    priceType: "paid",
    priceMin: 800,
    stats: { interestedCount: 18, goingCount: 12, savedCount: 9, viewCount: 320 },
    maxAttendees: 40,
    coverImageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    isSampleData: true,
    hostId: 'system',
    createdBy: 'system',
    approvalStatus: 'approved',
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * THREADS + REPLIES
 * Used by: Commons / forum, with stats.replyCount and createdAt indexes.
 */
const threads = [
  {
    id: "thread_taipei_weekly",
    title: "What’s on in Taipei this week?",
    topic: "general",
    city: "Taipei",
    authorId: "user_simon",
    authorInfo: {
        displayName: "Simon (host)",
        photoURL: 'https://i.pravatar.cc/150?u=simon',
    },
    body:
      "Share last-minute events, open slots, and quiet corners for deep work this week.",
    bodyPreview: "Share last-minute events, open slots, and quiet corners for deep work this week.",
    stats: {
      replyCount: 3,
      likeCount: 12,
      lastReplyAt: now,
      viewCount: 128,
    },
    isSampleData: true,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  },
  {
    id: "thread_climate_sprint_ideas",
    title: "Ideas for the Harbor Climate Sprint?",
    topic: "events",
    city: "Kaohsiung",
    authorId: "user_guest_1",
    authorInfo: {
        displayName: "Avery",
        photoURL: 'https://i.pravatar.cc/150?u=avery',
    },
    venueId: "venue_sea_view_hub",
    eventId: "event_climate_sprint",
    body:
      "I'm attending the Climate Sprint next month and wanted to brainstorm some ideas beforehand. What are useful prompts, datasets, or field visits we should line up for the sprint? Anyone else going?",
    bodyPreview:
      "What are useful prompts, datasets, or field visits we should line up for the sprint?",
    stats: {
      replyCount: 2,
      likeCount: 7,
      lastReplyAt: now,
      viewCount: 98,
    },
    isSampleData: true,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  },
];

const threadReplies: {
  threadId: string;
  id: string;
  authorId: string;
  authorInfo: { displayName: string; photoURL: string; };
  body: string;
  createdAt: admin.firestore.Timestamp;
  isSampleData: boolean;
}[] = [
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_1",
    authorId: "user_guest_1",
    authorInfo: {
        displayName: "Avery",
        photoURL: 'https://i.pravatar.cc/150?u=avery',
    },
    body:
      "There’s a small founders’ coffee happening at Impact House on Thursday 10–12. Also Rooftop Lab has a free slot Friday night.",
    isSampleData: true,
    createdAt: now,
  },
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_2",
    authorId: "user_guest_2",
    authorInfo: {
        displayName: "Ken",
        photoURL: 'https://i.pravatar.cc/150?u=ken',
    },
    body:
      "Looking for a quiet corner on Sunday afternoon to write. Any suggestions near Da’an?",
    isSampleData: true,
    createdAt: now,
  },
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_3",
    authorId: "user_simon",
    authorInfo: {
        displayName: "Simon (host)",
        photoURL: 'https://i.pravatar.cc/150?u=simon',
    },
    body:
      "Impact House ground floor is usually quiet after 3pm on Sundays. Book in the directory and we’ll keep a table for you.",
    isSampleData: true,
    createdAt: now,
  },
  {
    threadId: "thread_climate_sprint_ideas",
    id: "reply_cs_1",
    authorId: "user_guest_3",
    authorInfo: {
        displayName: "Mira",
        photoURL: 'https://i.pravatar.cc/150?u=mira',
    },
    body:
      "It’d be great to get a short briefing from harbor operations before we jump into ideas.",
    isSampleData: true,
    createdAt: now,
  },
  {
    threadId: "thread_climate_sprint_ideas",
    id: "reply_cs_2",
    authorId: "user_simon",
    authorInfo: {
        displayName: "Simon (host)",
        photoURL: 'https://i.pravatar.cc/150?u=simon',
    },
    body:
      "Love this. We’re lining up a short morning walkthrough with the port team.",
    isSampleData: true,
    createdAt: now,
  },
];

async function seedCollection(collectionName: string, data: any[], idField = 'id') {
  console.log(`\nSeeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  for (const item of data) {
    const docId = item[idField];
    await collectionRef.doc(docId).set(item, { merge: true });
    process.stdout.write('✓');
  }
  console.log(`\nSeeded ${data.length} documents in ${collectionName}.`);
}


async function seedAll() {
    const sampleDataCheck = await db.collection('venues').where('isSampleData', '==', true).limit(1).get();
    if (!sampleDataCheck.empty) {
        console.log("❌ Sample data already exists. Run `npm run clear-sample-data` first if you want to re-seed.");
        return;
    }
  
    console.log("Starting to seed database...");
    
    await seedCollection("venues", venues);
    await seedCollection("events", events);
    await seedCollection("threads", threads);

    console.log("\nSeeding thread comments...");
    for (const reply of threadReplies) {
        await db
        .collection("threads")
        .doc(reply.threadId)
        .collection("comments")
        .doc(reply.id)
        .set(reply, { merge: true });
        process.stdout.write('✓');
    }
    console.log(`\nSeeded ${threadReplies.length} documents in comments subcollections.`);

}

seedAll()
  .then(() => {
    console.log("\n✅ Seeding completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Seeding failed:", err);
    process.exit(1);
  });
