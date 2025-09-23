import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';

const regions = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Australia',
  'Antarctica'
];

const RegionSelection = ({ onClose }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, updateUser } = useAuth();
  
  // Get user ID from currentUser or from localStorage as fallback
  const getUserId = () => {
    if (currentUser?.uid) return currentUser.uid;
    
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('scantyx_user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('User from localStorage:', user);
          return user.uid || user.id; // Try both uid and id
        }
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    
    return null;
  };
  
  const userId = getUserId();
  console.log('Current user ID:', userId, 'Current user:', currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRegion) {
      setError('Please select a region');
      return;
    }
    
    if (!userId) {
      setError('You must be logged in to update your region');
      console.error('No user ID found');
      return;
    }
    
    try {
      console.log('Starting region update...');
      setIsSubmitting(true);
      
      // Update the user's region in the database
      console.log('Updating region for user:', userId);
      const success = await updateUserProfile(userId, { 
        region: selectedRegion,
        updatedAt: new Date().toISOString()
      });
      
      if (success) {
        console.log('Successfully updated region in database');
        // Update the user in the auth context
        console.log('Updating auth context...');
        updateUser({ region: selectedRegion });
        
        // Close the modal after a short delay to show success state
        setTimeout(() => {
          console.log('Closing region selection modal');
          onClose();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', {
        error: error.message,
        stack: error.stack,
        userId,
        selectedRegion
      });
      setError(error.message || 'Failed to update region. Please try again.');
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Prevent click events from bubbling up to parent elements
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close when clicking outside
    >
      <motion.div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={handleModalClick} // Prevent click from closing when clicking inside
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Our Platform!</h2>
          <p className="text-gray-600 mb-6">Please select your region to see relevant events and content.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {regions.map((region) => (
                <div key={region} className="flex items-center">
                  <input
                    id={`region-${region}`}
                    name="region"
                    type="radio"
                    checked={selectedRegion === region}
                    onChange={() => setSelectedRegion(region)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`region-${region}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {region}
                  </label>
                </div>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={!selectedRegion || isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegionSelection;
