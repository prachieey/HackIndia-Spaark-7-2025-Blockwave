import { MongoClient } from 'mongodb';

async function checkCollections() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db('scantyx-dev');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Check if events collection exists
    const eventsCollection = db.collection('events');
    const eventCount = await eventsCollection.countDocuments();
    console.log(`\nFound ${eventCount} documents in 'events' collection`);
    
    // Show a few events if they exist
    if (eventCount > 0) {
      console.log('\nSample events:');
      const sampleEvents = await eventsCollection.find().limit(2).toArray();
      console.log(JSON.stringify(sampleEvents, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await client.close();
  }
}

checkCollections().catch(console.error);
