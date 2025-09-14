import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = client.db('admin').admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
    
    // Test writing to a collection
    const db = client.db('scantyx-dev');
    const testCollection = db.collection('testConnection');
    const result = await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('Test document inserted with id:', result.insertedId);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error);
