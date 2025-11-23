
// scripts/clearSampleData.ts
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or the default service account when run in a Firebase environment.
    admin.initializeApp();
  } catch (e) {
    console.error("Firebase Admin SDK initialization failed. Ensure your environment is configured with the correct credentials.", e);
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * Deletes all documents in a collection that match a query.
 * @param query The query to match documents against.
 * @param batchSize The number of documents to delete in each batch.
 */
const deleteCollectionByQuery = async (query: admin.firestore.Query, batchSize: number) => {
    const snapshot = await query.limit(batchSize).get();
    
    if (snapshot.size === 0) {
        return; // All matching documents have been deleted.
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    
    process.stdout.write('.'); // Progress indicator

    // Recurse on the same query to get the next batch.
    await deleteCollectionByQuery(query, batchSize);
}

/**
 * Clears all documents from specified collections that have the `isSampleData: true` flag.
 */
const clearAllSampleData = async () => {
    console.log("Starting to clear all sample data from Firestore...");
    
    // Add any collections that might contain sample data here
    const collectionsWithSampleData = [
        'users', 
        'events', 
        'venues', 
        'threads', 
        'eventInteractions',
        'follows',
        'reports'
    ];
    
    for (const collectionName of collectionsWithSampleData) {
        console.log(`\nChecking collection: ${collectionName}`);
        try {
            // Firestore security rules may prevent collectionGroup queries.
            // A direct query on the collection is more reliable if rules are strict.
            const queryToExecute = db.collection(collectionName).where('isSampleData', '==', true);
            await deleteCollectionByQuery(queryToExecute, 50); // Using a batch size of 50
            console.log(`\nSuccessfully cleared sample data from ${collectionName}.`);
        } catch (error) {
            console.error(`\nFailed to clear data from ${collectionName}. This might be due to security rules or the collection not existing.`);
        }
    }

    // Special handling for subcollections like 'comments'
    console.log(`\nChecking comments in threads marked as sample data...`);
    const threadsWithSampleData = await db.collection('threads').where('isSampleData', '==', true).get();
    for (const threadDoc of threadsWithSampleData.docs) {
        const commentsQuery = threadDoc.ref.collection('comments');
        await deleteCollectionByQuery(commentsQuery, 50);
    }
     console.log(`\nSuccessfully cleared sample comments subcollections.`);

    console.log("\n\nSample data cleanup complete.");
};

// Run the script
clearAllSampleData().catch((err) => {
  console.error("\nAn unexpected error occurred during cleanup:", err);
  process.exit(1);
});
