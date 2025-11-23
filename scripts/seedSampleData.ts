
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
    shortDescription: "Intimate live jazz bar with local bands every weekend.",
    longDescription:
      "A cozy basement venue in the heart of Zhongshan. Expect small-batch cocktails, local jazz bands, and late-night conversations.",
    type: "bar",
    capacity: 80,
    tags: ["live music", "jazz", "nightlife"],
    isFeaturedOnLanding: true,
    homepageOrder: 1,
    coverImageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "https://placehold.co/160x160?text=Midnight+Alley",
    websiteUrl: "https://example.com/midnight-alley",
    socials: {
      instagram: "https://instagram.com/midnightalley",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_rooftop_lab",
    name: "Rooftop Lab",
    city: "Taipei",
    neighborhood: "Xinyi",
    shortDescription:
      "Experimental rooftop space for salons, screenings, and pop-ups.",
    longDescription:
      "An open-air rooftop with modular seating and a small indoor lab. Great for founders’ meetups, screenings, and design sprints.",
    type: "rooftop",
    capacity: 120,
    tags: ["founders", "startups", "screenings"],
    isFeaturedOnLanding: true,
    homepageOrder: 2,
    coverImageUrl:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "https://placehold.co/160x160?text=Rooftop+Lab",
    websiteUrl: "https://example.com/rooftop-lab",
    socials: {
      instagram: "https://instagram.com/rooftoplab",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_impact_house",
    name: "Impact House",
    city: "Taipei",
    neighborhood: "Daan",
    shortDescription:
      "Daytime hub for climate, civic tech, and social impact projects.",
    longDescription:
      "A bright townhouse with meeting rooms, a prototyping lab, and a café-style ground floor. Home for climate and civic-tech operators.",
    type: "hub",
    capacity: 60,
    tags: ["climate", "civic tech", "co-working"],
    isFeaturedOnLanding: false,
    homepageOrder: 3,
    coverImageUrl:
      "https://images.unsplash.com/photo-1522204502588-1b53c5df83ef?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "https://placehold.co/160x160?text=Impact+House",
    websiteUrl: "https://example.com/impact-house",
    socials: {
      instagram: "https://instagram.com/impacthouse",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "venue_sea_view_hub",
    name: "Sea View Hub",
    city: "Kaohsiung",
    neighborhood: "Gushan",
    shortDescription: "Harbor-side space for retreats and design offsites.",
    longDescription:
      "A waterfront venue with a panoramic view of the harbor. Ideal for offsites, design sprints, and small retreats.",
    type: "hub",
    capacity: 40,
    tags: ["offsite", "retreat", "harbor"],
    isFeaturedOnLanding: true,
    homepageOrder: 4,
    coverImageUrl:
      "https://images.unsplash.com/photo-1470219954231-ff19a730a3a1?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "https://placehold.co/160x160?text=Sea+View+Hub",
    websiteUrl: "https://example.com/sea-view-hub",
    socials: {},
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * EVENTS
 * Used by: landing lists, city filters, calendar sections
 * Important fields for your indexes:
 * - city
 * - isFeaturedOnLanding
 * - status
 * - visibility
 * - priorityScore
 * - startTime
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
    shortDescription:
      "Brunch for founders and operators building in climate, civic tech, and education.",
    longDescription:
      "A lightly curated brunch where 8–12 founders and operators share what they’re building, what’s stuck, and where they could use help.",
    tags: ["founders", "climate", "edtech"],
    priceType: "ticketed",
    priceFrom: 450,
    maxAttendees: 30,
    coverImageUrl:
      "https://images.unsplash.com/photo-1459682687441-7761439a7090?auto=format&fit=crop&w=1200&q=80",
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
    shortDescription:
      "Live jazz, side project demos, and very lightweight pitches.",
    longDescription:
      "Bring your side project, ship something small, and end the night with live jazz sets and casual intros.",
    tags: ["live music", "side projects"],
    priceType: "free",
    priceFrom: 0,
    maxAttendees: 60,
    coverImageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
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
    shortDescription:
      "Short film program and discussion about livable, resilient cities.",
    longDescription:
      "A curated set of short films about urban resilience, followed by moderated discussion circles.",
    tags: ["cities", "resilience", "screening"],
    priceType: "ticketed",
    priceFrom: 350,
    maxAttendees: 80,
    coverImageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
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
    shortDescription:
      "One-day design sprint on coastal resilience and harbor systems.",
    longDescription:
      "Multi-disciplinary teams explore real challenges with mentors from climate, logistics, and public policy.",
    tags: ["climate", "sprint", "harbor"],
    priceType: "ticketed",
    priceFrom: 800,
    maxAttendees: 40,
    coverImageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event_operator_clinic",
    title: "Operator Clinic: Trust & Safety Patterns",
    venueId: "venue_impact_house",
    city: "Taipei",
    category: "ops",
    status: "published",
    visibility: "public",
    isFeaturedOnLanding: false,
    priorityScore: 70,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    ),
    shortDescription:
      "Clinic for PMs and operators building high-trust communities and products.",
    longDescription:
      "A small-circle clinic with case studies, debugging sessions, and pattern-sharing on building and maintaining user trust.",
    tags: ["ops", "trust", "community"],
    priceType: "free",
    priceFrom: 0,
    maxAttendees: 20,
    coverImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "event_internal_draft",
    title: "Internal Planning Session (Draft)",
    venueId: "venue_impact_house",
    city: "Taipei",
    category: "internal",
    status: "draft",
    visibility: "private",
    isFeaturedOnLanding: false,
    priorityScore: 10,
    startTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    ),
    endTime: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
    ),
    shortDescription: "Draft event to test permissions and rules.",
    longDescription:
      "This should not show up in public lists if your Firestore rules filter by status/visibility.",
    tags: ["internal", "test"],
    priceType: "free",
    priceFrom: 0,
    maxAttendees: 10,
    coverImageUrl:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
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
    category: "city-feed",
    city: "Taipei",
    kind: "open-question",
    authorId: "user_simon",
    authorDisplayName: "Simon (host)",
    pinnedOnLanding: true,
    venueId: null,
    eventId: null,
    bodyPreview:
      "Share last-minute events, open slots, and quiet corners for deep work this week.",
    stats: {
      replyCount: 3,
      followerCount: 12,
      lastReplyAt: now,
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "thread_climate_sprint_ideas",
    title: "Ideas for the Harbor Climate Sprint?",
    category: "climate",
    city: "Kaohsiung",
    kind: "idea-thread",
    authorId: "user_guest_1",
    authorDisplayName: "Avery",
    pinnedOnLanding: true,
    venueId: "venue_sea_view_hub",
    eventId: "event_climate_sprint",
    bodyPreview:
      "What are useful prompts, datasets, or field visits we should line up for the sprint?",
    stats: {
      replyCount: 2,
      followerCount: 7,
      lastReplyAt: now,
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "thread_venue_feedback_midnight_alley",
    title: "Feedback on Midnight Alley as a venue?",
    category: "venue-feedback",
    city: "Taipei",
    kind: "review-thread",
    authorId: "user_simon",
    authorDisplayName: "Simon (host)",
    pinnedOnLanding: false,
    venueId: "venue_midnight_alley",
    eventId: null,
    bodyPreview:
      "How have your events gone here? Anything we should tweak (lighting, seating, food)?",
    stats: {
      replyCount: 1,
      followerCount: 3,
      lastReplyAt: now,
    },
    createdAt: now,
    updatedAt: now,
  },
];

const threadReplies: {
  threadId: string;
  id: string;
  authorId: string;
  authorDisplayName: string;
  body: string;
  createdAt: admin.firestore.Timestamp;
}[] = [
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_1",
    authorId: "user_guest_1",
    authorDisplayName: "Avery",
    body:
      "There’s a small founders’ coffee happening at Impact House on Thursday 10–12. Also Rooftop Lab has a free slot Friday night.",
    createdAt: now,
  },
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_2",
    authorId: "user_guest_2",
    authorDisplayName: "Ken",
    body:
      "Looking for a quiet corner on Sunday afternoon to write. Any suggestions near Da’an?",
    createdAt: now,
  },
  {
    threadId: "thread_taipei_weekly",
    id: "reply_tw_3",
    authorId: "user_simon",
    authorDisplayName: "Simon (host)",
    body:
      "Impact House ground floor is usually quiet after 3pm on Sundays. Book in the directory and we’ll keep a table for you.",
    createdAt: now,
  },
  {
    threadId: "thread_climate_sprint_ideas",
    id: "reply_cs_1",
    authorId: "user_guest_3",
    authorDisplayName: "Mira",
    body:
      "It’d be great to get a short briefing from harbor operations before we jump into ideas.",
    createdAt: now,
  },
  {
    threadId: "thread_climate_sprint_ideas",
    id: "reply_cs_2",
    authorId: "user_simon",
    authorDisplayName: "Simon (host)",
    body:
      "Love this. We’re lining up a short morning walkthrough with the port team.",
    createdAt: now,
  },
  {
    threadId: "thread_venue_feedback_midnight_alley",
    id: "reply_va_1",
    authorId: "user_guest_4",
    authorDisplayName: "June",
    body:
      "Lighting is great, but the projector could be brighter for slides. Sound was excellent.",
    createdAt: now,
  },
];

async function seedVenues() {
  console.log("Seeding venues...");
  for (const venue of venues) {
    await db.collection("venues").doc(venue.id).set(venue, { merge: true });
    console.log(`  ✓ venue: ${venue.name}`);
  }
}

async function seedEvents() {
  console.log("Seeding events...");
  for (const event of events) {
    await db.collection("events").doc(event.id).set(event, { merge: true });
    console.log(`  ✓ event: ${event.title}`);
  }
}

async function seedThreads() {
  console.log("Seeding threads...");
  for (const thread of threads) {
    await db.collection("threads").doc(thread.id).set(thread, { merge: true });
    console.log(`  ✓ thread: ${thread.title}`);
  }

  console.log("Seeding thread replies...");
  for (const reply of threadReplies) {
    await db
      .collection("threads")
      .doc(reply.threadId)
      .collection("comments")
      .doc(reply.id)
      .set(reply, { merge: true });

    console.log(
      `  ↳ reply on ${reply.threadId} from ${reply.authorDisplayName}`
    );
  }
}

async function seedAll() {
  await seedVenues();
  await seedEvents();
  await seedThreads();
}

seedAll()
  .then(() => {
    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
