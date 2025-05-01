import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import EventCard from '../components/events/EventCard';

const ExplorePage = () => {
  const { events, loading } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Extract unique categories from events
  const categories = ['All', ...new Set(events.map(event => event.category))];
  
  useEffect(() => {
    let results = [...events];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      results = results.filter(event => event.category === selectedCategory);
    }
    
    setFilteredEvents(results);
  }, [events, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-holographic-white mb-4">Explore Events</h1>
          <p className="tagline">No Scams, Just Scans</p>
        </motion.div>
        
        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-tech-blue h-5 w-5" />
            <input
              type="text"
              placeholder="Search events by name, description or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 py-3"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="text-tech-blue h-5 w-5 flex-shrink-0" />
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-deep-purple text-holographic-white'
                      : 'bg-space-black border border-deep-purple text-holographic-white hover:bg-deep-purple/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-purple"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-holographic-white mb-2">No events found</h3>
            <p className="text-holographic-white/70">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;