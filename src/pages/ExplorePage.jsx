import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sliders } from 'lucide-react';
import BlockchainEvents from '../components/events/BlockchainEvents';
import EventCard from '../components/events/EventCard';
import { useEvents } from '../contexts/EventsContext';

const categories = [
  'All',
  'Music',
  'Sports',
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Other'
];

const ExplorePage = () => {
  const { events, loading } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
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
        
        {/* Blockchain Events */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-holographic-white">Blockchain Events</h2>
          <p className="text-gray-400 mb-6">Events stored on the blockchain for maximum transparency and security</p>
          <BlockchainEvents />
        </div>
        
        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-tech-blue h-5 w-5" />
            <input
              type="text"
              placeholder="Search events by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 py-3 bg-space-black/50 border border-holographic-white/10 text-holographic-white placeholder-holographic-white/40 focus:ring-2 focus:ring-tech-blue focus:border-transparent rounded-lg transition-all duration-200"
              aria-label="Search events"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Sliders className="text-tech-blue h-5 w-5 flex-shrink-0" />
            <div className="flex space-x-2">
              {categories.map(category => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-deep-purple to-tech-blue text-holographic-white shadow-lg shadow-deep-purple/30'
                      : 'bg-space-black/50 border border-holographic-white/10 text-holographic-white/80 hover:bg-space-black/70 hover:border-holographic-white/30'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-tech-blue/20 border-t-tech-blue rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-deep-purple to-tech-blue rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-holographic-white/70">Loading events...</p>
            </div>
          </motion.div>
        ) : filteredEvents.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block p-6 mb-6 bg-space-black/50 rounded-2xl border border-holographic-white/10">
              <svg className="w-16 h-16 text-tech-blue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-2xl font-bold text-holographic-white mb-2">No events found</h3>
              <p className="text-holographic-white/70 max-w-md mx-auto">
                We couldn't find any events matching your search. Try adjusting your filters or check back later for new events.
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-6 py-2 bg-tech-blue/10 text-tech-blue rounded-full hover:bg-tech-blue/20 transition-colors text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;