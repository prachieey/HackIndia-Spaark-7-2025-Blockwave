import React, { useState, useEffect } from 'react';
import { Instagram, Loader2, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with actual API call in production
const mockInstagramPosts = [
  {
    id: '1',
    media_url: 'https://source.unsplash.com/random/800x800/?concert,1',
    permalink: 'https://instagram.com/p/abc123',
    caption: 'Scantyx Event Highlights #Scantyx',
    likes: 124,
    comments: 24
  },
  {
    id: '2',
    media_url: 'https://source.unsplash.com/random/800x800/?music,2',
    permalink: 'https://instagram.com/p/def456',
    caption: 'Behind the Scenes at our latest event',
    likes: 89,
    comments: 12
  },
  {
    id: '3',
    media_url: 'https://source.unsplash.com/random/800x800/?festival,3',
    permalink: 'https://instagram.com/p/ghi789',
    caption: 'Event Experience you don\'t want to miss!',
    likes: 156,
    comments: 32
  }
];

const InstagramEmbed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch this from your backend
    // which would then call the Instagram API with proper authentication
    const fetchInstagramPosts = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockInstagramPosts);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching Instagram posts:', err);
        setError('Failed to load Instagram posts. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest from Instagram
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Follow us{' '}
            <a
              href="https://instagram.com/scantyx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              @scantyx
            </a>{' '}
            for more updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={post.media_url}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x800?text=Image+Not+Available';
                  }}
                />
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 opacity-0 hover:opacity-100"
                >
                  <div className="bg-white rounded-full p-3">
                    <Instagram className="w-6 h-6 text-pink-500" />
                  </div>
                </a>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {post.caption}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </span>
                  </div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:underline text-sm"
                  >
                    View on Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramEmbed;
