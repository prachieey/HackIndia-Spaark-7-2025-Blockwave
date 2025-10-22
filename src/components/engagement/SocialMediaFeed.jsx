import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Youtube, MessageSquare, Heart, Share2 } from 'lucide-react';

// Mock data - replace with actual API calls to your social media
const socialPosts = [
  {
    id: 1,
    platform: 'twitter',
    username: '@BlockchainEvents',
    content: 'Just announced: Our biggest blockchain conference of the year is coming in December! Early bird tickets now available. #Blockchain2025',
    time: '2h ago',
    likes: 124,
    comments: 28,
    shares: 42,
    image: 'https://images.unsplash.com/photo-1511578314323-379afb476865?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 2,
    platform: 'instagram',
    username: '@BlockchainEvents',
    content: 'Behind the scenes at our last event! The energy was electric ⚡️',
    time: '5h ago',
    likes: 342,
    comments: 41,
    shares: 18,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 3,
    platform: 'linkedin',
    username: 'Blockchain Events Network',
    content: 'We\'re excited to announce our partnership with leading blockchain companies to bring you the most comprehensive event series of 2025!',
    time: '1d ago',
    likes: 89,
    comments: 12,
    shares: 24,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  }
];

const platformIcons = {
  twitter: <Twitter size={16} className="text-blue-400" />,
  instagram: <Instagram size={16} className="text-pink-500" />,
  linkedin: <Linkedin size={16} className="text-blue-600" />,
  youtube: <Youtube size={16} className="text-red-500" />
};

const SocialMediaFeed = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Community Feed</h3>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Twitter size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Instagram size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Linkedin size={20} />
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {socialPosts.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
          >
            {/* Post Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white">
                  {post.platform === 'twitter' && <Twitter size={18} />}
                  {post.platform === 'instagram' && <Instagram size={18} />}
                  {post.platform === 'linkedin' && <Linkedin size={18} />}
                  {post.platform === 'youtube' && <Youtube size={18} />}
                </div>
                <div>
                  <div className="font-medium text-white">{post.username}</div>
                  <div className="text-xs text-gray-400">{post.time}</div>
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-200 mb-3">{post.content}</p>
              {post.image && (
                <div className="rounded-lg overflow-hidden mb-3">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Post Actions */}
              <div className="flex items-center justify-between text-gray-400 text-sm pt-2">
                <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                  <Heart size={16} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <MessageSquare size={16} />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                  <Share2 size={16} />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-2 mx-auto">
          View all social updates
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SocialMediaFeed;
