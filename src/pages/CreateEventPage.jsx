import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, CreditCard, Image, ArrowLeft, Check } from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    availableTickets: '',
    category: '',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg' // Default image
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Create event
      const eventData = {
        ...formData,
        date: dateTime.toISOString(),
        organizer: user.name,
      };
      
      await createEvent(eventData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        availableTickets: '',
        category: '',
        image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
      });
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/explore');
      }, 3000);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-tech-blue hover:text-deep-purple transition-colors mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-holographic-white mb-4">Host an Event</h1>
          <p className="tagline mb-8">No Scams, Just Scans</p>
          
          {success ? (
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-validation-green bg-opacity-20 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-validation-green" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-holographic-white mb-2">
                Event Created Successfully!
              </h2>
              <p className="text-holographic-white/70 mb-6">
                Your event has been added to our platform. Redirecting you to the events page...
              </p>
              <Link to="/explore" className="btn btn-primary">
                View All Events
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-holographic-white mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="e.g., Tech Conference 2025"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-holographic-white mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input w-full"
                  placeholder="Describe your event..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-holographic-white mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" /> Date*
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-holographic-white mb-1">
                    <Clock className="h-4 w-4 inline mr-1" /> Time*
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-holographic-white mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" /> Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="e.g., Convention Center, Mumbai"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-holographic-white mb-1">
                    <CreditCard className="h-4 w-4 inline mr-1" /> Ticket Price (₹)*
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input w-full"
                    placeholder="e.g., 999"
                  />
                </div>
                
                <div>
                  <label htmlFor="availableTickets" className="block text-sm font-medium text-holographic-white mb-1">
                    <Users className="h-4 w-4 inline mr-1" /> Available Tickets*
                  </label>
                  <input
                    type="number"
                    id="availableTickets"
                    name="availableTickets"
                    value={formData.availableTickets}
                    onChange={handleChange}
                    required
                    min="1"
                    className="input w-full"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-holographic-white mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input w-full"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-holographic-white mb-1">
                  <Image className="h-4 w-4 inline mr-1" /> Event Image*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((img, index) => (
                    <div 
                      key={index}
                      onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                      className={`relative cursor-pointer rounded-lg overflow-hidden h-24 ${
                        formData.image === img ? 'ring-2 ring-deep-purple' : ''
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Sample ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {formData.image === img && (
                        <div className="absolute top-1 right-1 bg-deep-purple rounded-full p-1">
                          <Check className="h-3 w-3 text-holographic-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateEventPage;