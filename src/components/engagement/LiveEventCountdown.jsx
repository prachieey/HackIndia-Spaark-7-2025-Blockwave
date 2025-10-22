import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

const LiveEventCountdown = () => {
  // Set the target date (next Friday at 6 PM)
  const getNextFriday = () => {
    const now = new Date();
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7; // Next Friday
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(18, 0, 0, 0); // 6 PM
    return nextFriday;
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    eventDate: getNextFriday().toISOString()
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const targetDate = new Date(timeLeft.eventDate);
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(prev => ({
          ...prev,
          days,
          hours,
          minutes,
          seconds
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft.eventDate]);

  const CountdownBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-gray-300 mt-2">{label}</span>
    </div>
  );

  return (
    <div className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.03]" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-purple-300 mb-4">
          <Clock size={20} />
          <span className="text-sm font-medium">NEXT EVENT STARTS IN</span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-6">Blockchain Conference 2025</h3>
        
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
          <CountdownBox value={timeLeft.days} label="Days" />
          <CountdownBox value={timeLeft.hours} label="Hours" />
          <CountdownBox value={timeLeft.minutes} label="Minutes" />
          <CountdownBox value={timeLeft.seconds} label="Seconds" />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar size={16} />
          <span>Friday, {new Date(timeLeft.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 6:00 PM</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
        >
          Get Tickets Now
        </motion.button>
      </div>
    </div>
  );
};

export default LiveEventCountdown;
