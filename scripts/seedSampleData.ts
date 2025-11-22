// scripts/seedSampleData.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp(); // uses local credentials or GOOGLE_APPLICATION_CREDENTIALS
}

const db = admin.firestore();

async function seed() {
  const now = admin.firestore.Timestamp.now();

  // Example: seed a venue
  const venueRef = db.collection("venues").doc("seed_venue_midnight_alley");
  await venueRef.set({
    name: "Midnight Alley Jazz Bar",
    categories: ["Live music", "Bar"],
    address: "Lane 123, Zhongshan District",
    city: "Taipei",
    neighborhood: "Zhongshan",
    priceLevel: 3,
    homepageTagline: "Intimate live jazz bar with local bands every weekend.",
    stats: {
      ratingAverage: 4.7,
      ratingCount: 32,
      eventCount: 0,
    },
    createdBy: "seed_host_indie_live_taipei",
    createdAt: now,
    updatedAt: now,
    isSampleData: true,
  });

  // Example: seed an event that references that venue
  const eventRef = db.collection("events").doc("seed_event_rooftop_jazz_night");
  await eventRef.set({
    title: "Rooftop Jazz Night",
    subtitle: "Local quartet live till late",
    description: "A chill evening of live jazz...",
    category: "Music",
    city: "Taipei",
    timezone: "Asia/Taipei",
    location: {
      venueId: venueRef.id,
      address: "Lane 123, Zhongshan District",
      neighborhood: "Zhongshan",
    },
    hostId: "seed_host_indie_live_taipei",
    startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    endTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)),
    priceType: "paid",
    minPrice: 350,
    maxPrice: 600,
    status: "published",
    visibility: "public",
    stats: {
      interestedCount: 14,
      goingCount: 6,
    },
    isFeaturedOnLanding: true,
    homepageSection: "hero",
    priorityScore: 10,
    createdAt: now,
    updatedAt: now,
    isSampleData: true,
  });

  console.log("Seed: 1 venue + 1 event created");
}

seed()
  .then(() => {
    console.log("Seeding finished.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
