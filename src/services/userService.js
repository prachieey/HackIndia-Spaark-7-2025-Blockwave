import { db } from '../config/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

export const updateUserProfile = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log('Updating user profile:', { userId, data });
    const userRef = doc(db, 'users', userId);
    
    // Create a batch write for atomic operations
    const batch = writeBatch(db);
    
    // First, try to get the document to check if it exists
    const docSnap = await getDoc(userRef);
    
    const userData = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(!docSnap.exists() && {
        // Only set these fields for new documents
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        // Add any other default fields for new users
        role: 'user',
        isActive: true
      })
    };
    
    // Add the operation to the batch
    batch.set(userRef, userData, { merge: true });
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Update operation timed out')), 15000) // Increased timeout to 15s
    );
    
    // Execute the batch
    await Promise.race([
      batch.commit(),
      timeoutPromise
    ]);
    
    console.log('Successfully updated user profile');
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', {
      error,
      message: error.message,
      stack: error.stack,
      userId,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Check for specific Firestore errors
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update this profile');
    } else if (error.code === 'not-found') {
      throw new Error('User document not found');
    } else if (error.message.includes('timed out')) {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};
