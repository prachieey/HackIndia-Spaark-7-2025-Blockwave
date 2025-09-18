import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateEventForm from '../components/events/CreateEventForm';
import { Check } from 'lucide-react';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [success, setSuccess] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }
  
  const handleSuccess = () => {
    setSuccess(true);
    // Navigate to events page after a short delay
    setTimeout(() => {
      navigate('/explore', { state: { showSuccessMessage: true } });
    }, 1500);
  };
  
  // Sample images for selection
  const sampleImages = [
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg'
  ];
  
  // Categories
  const categories = [
    'Technology',
    'Music',
    'Business',
    'Food',
    'Wellness',
    'Marketing',
    'Education',
    'Sports',
    'Art',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-space-black text-holographic-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-neon-blue hover:text-neon-pink transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-holographic-white mb-2">Create New Event</h1>
            <p className="text-gray-400">Create and manage your event on the blockchain</p>
          </div>
          
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Event created successfully on the blockchain! Redirecting...
            </div>
          )}
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-800/50">
          <CreateEventForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;