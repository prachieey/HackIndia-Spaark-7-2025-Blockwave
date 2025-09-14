import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    id: 1,
    name: 'Aarav K.',
    role: 'Event Organizer',
    avatar: 'AK',
    content: '"The most secure ticketing experience I\'ve ever had. No more worries about fake tickets! The blockchain integration gives me peace of mind for every event."',
    rating: 5,
    date: '2 days ago',
    colorFrom: 'from-deep-purple',
    colorTo: 'to-tech-blue',
  },
  {
    id: 2,
    name: 'Priya S.',
    role: 'Frequent Event Goer',
    avatar: 'PS',
    content: '"Loved how easy it was to resell my ticket when my plans changed. The process was seamless and I got a great price too! The platform is incredibly user-friendly."',
    rating: 5,
    date: '1 week ago',
    colorFrom: 'from-tech-blue',
    colorTo: 'to-cyan-400',
  },
  {
    id: 3,
    name: 'Rahul K.',
    role: 'Tech Enthusiast',
    avatar: 'RK',
    content: '"The QR code verification at the event was super fast. No more long queues! The future of event ticketing is here, and it\'s amazing to see it in action."',
    rating: 5,
    date: '3 days ago',
    colorFrom: 'from-flame-red',
    colorTo: 'to-amber-500',
  },
  {
    id: 4,
    name: 'Neha M.',
    role: 'Event Manager',
    avatar: 'NM',
    content: '"The analytics dashboard for event organizers is a game-changer. Real-time insights into ticket sales and attendee data has made event planning so much easier."',
    rating: 5,
    date: '5 days ago',
    colorFrom: 'from-green-500',
    colorTo: 'to-emerald-400',
  },
  {
    id: 5,
    name: 'Vikram P.',
    role: 'Music Festival Attendee',
    avatar: 'VP',
    content: '"I was skeptical about blockchain ticketing at first, but the experience was flawless. The ticket transfer process was instant and secure. Will definitely use again!"',
    rating: 5,
    date: '1 week ago',
    colorFrom: 'from-purple-500',
    colorTo: 'to-pink-500',
  },
  {
    id: 6,
    name: 'Ananya R.',
    role: 'Concert Lover',
    avatar: 'AR',
    content: '"The mobile app is incredibly intuitive. I can buy, sell, and manage all my tickets in one place. The customer support team is also very responsive!"',
    rating: 5,
    date: '2 weeks ago',
    colorFrom: 'from-rose-500',
    colorTo: 'to-pink-500',
  },
];

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen bg-space-darker text-holographic-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-holographic-white/70 hover:text-holographic-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium text-tech-blue bg-tech-blue/10 rounded-full mb-3">TESTIMONIALS</span>
          <h1 className="text-4xl md:text-5xl font-bold text-holographic-white mb-4">What Our Community Says</h1>
          <p className="max-w-2xl mx-auto text-holographic-white/70">Hear from our users about their experiences with our platform</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              className="relative bg-space-black/50 backdrop-blur-sm rounded-2xl p-8 border border-holographic-white/5 hover:border-tech-blue/30 transition-all duration-300 group"
              whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(56, 182, 255, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: testimonial.id * 0.1 }}
            >
              <div className={`absolute top-0 right-0 p-4 text-holographic-white/10 group-hover:text-${testimonial.colorFrom.split('-')[1]}/40 transition-colors`}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M14.017 21.712L.217 25.896l4.338 13.096 9.618-7.44-9.618-7.443 9.463-8.222L24.226 0 14.017 21.712zM38.166 5.94l-9.463 8.18 9.618 7.443-9.618 7.44 4.339 13.097 13.8-4.186-4.338-13.097 9.463-8.18L38.166 5.94z"></path>
                </svg>
              </div>
              
              <div className="flex items-start mb-6">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${testimonial.colorFrom} ${testimonial.colorTo} p-0.5`}>
                    <div className="w-full h-full bg-space-black rounded-[14px] flex items-center justify-center text-2xl font-bold text-holographic-white">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${testimonial.colorFrom} ${testimonial.colorTo} flex items-center justify-center`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                </div>
                <div className="ml-4 pt-1">
                  <h4 className="text-holographic-white font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-holographic-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-holographic-white/80 text-lg italic mb-6">{testimonial.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-holographic-white/60">{testimonial.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-holographic-white mb-4">Ready to experience it yourself?</h3>
          <p className="text-holographic-white/70 mb-8 max-w-2xl mx-auto">Join thousands of satisfied users and discover the future of event ticketing.</p>
          <Link 
            to="/explore" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-deep-purple to-tech-blue text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
