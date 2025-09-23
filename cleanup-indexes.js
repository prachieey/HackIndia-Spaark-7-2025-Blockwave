import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Database connection configuration
const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/scantyx-dev';

async function cleanupIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Get the users collection
    const usersCollection = db.collection('users');
    
    // List all indexes
    const indexes = await usersCollection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: !!idx.unique
    })));

    // Find and drop the duplicate walletAddress index
    const walletAddressIndexes = indexes.filter(
      idx => Object.keys(idx.key).includes('walletAddress')
    );

    if (walletAddressIndexes.length > 1) {
      console.log('Found multiple walletAddress indexes, cleaning up...');
      // Keep the unique index, drop the non-unique one
      const nonUniqueIndex = walletAddressIndexes.find(idx => !idx.unique);
      if (nonUniqueIndex) {
        console.log(`Dropping index: ${nonUniqueIndex.name}`);
        await usersCollection.dropIndex(nonUniqueIndex.name);
        console.log('Index dropped successfully');
      }
    }

    console.log('Index cleanup completed');
  } catch (error) {
    console.error('Error during index cleanup:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

cleanupIndexes();
