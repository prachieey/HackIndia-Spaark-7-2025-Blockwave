import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aarav K.',
    role: 'Event Organizer',
    avatar: 'AK',
    content: '\"The most secure ticketing experience I\'ve ever had. No more worries about fake tickets!\"',
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
    content: '\"Loved how easy it was to resell my ticket when my plans changed. Got a great price too!\"',
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
    content: '\"The QR code verification at the event was super fast. No more long queues!\"',
    rating: 5,
    date: '3 days ago',
    colorFrom: 'from-flame-red',
    colorTo: 'to-amber-500',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-deep-purple/20 to-transparent rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tl from-tech-blue/20 to-transparent rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium text-tech-blue bg-tech-blue/10 rounded-full mb-3">TESTIMONIALS</span>
          <h2 className="text-4xl md:text-5xl font-bold text-holographic-white mb-4">Trusted by Thousands</h2>
          <p className="max-w-2xl mx-auto text-holographic-white/70">Join our community of satisfied users who've experienced seamless event ticketing</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              className="relative bg-space-black/50 backdrop-blur-sm rounded-2xl p-8 border border-holographic-white/5 hover:border-tech-blue/30 transition-all duration-300 group"
              whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(56, 182, 255, 0.1)' }}
            >
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
              
              <div className="flex items-center text-amber-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
                <span className="ml-2 text-sm text-holographic-white/60">{testimonial.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
