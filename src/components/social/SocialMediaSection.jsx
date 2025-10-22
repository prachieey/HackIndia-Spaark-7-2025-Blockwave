import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reels = [
  {
    id: 1,
    src: '/videos/reel1.mp4',
    caption: 'Scantyx Event Highlights #Scantyx',
    likes: 520,
    comments: 72,
  },
  {
    id: 2,
    src: '/videos/reel2.mp4',
    caption: 'Behind the Scenes at our latest event',
    likes: 431,
    comments: 58,
  },
  {
    id: 3,
    src: '/videos/reel3.mp4',
    caption: 'Event Experience you don’t want to miss!',
    likes: 612,
    comments: 89,
  },
];

const ReelCard = React.forwardRef(({ reel, isActive, isMuted, onMuteToggle, onNext }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Forward ref for external control
  React.useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => onNext?.();

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isActive, isMuted, onNext]);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-2xl bg-black shadow-2xl">
      <video
        ref={videoRef}
        src={reel.src}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
        preload="auto"
      />

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
        <p className="font-medium text-sm mb-2">{reel.caption}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> {reel.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {reel.comments}
            </span>
          </div>
          <button
            onClick={onMuteToggle}
            className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Play indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer">
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 5v10l7-5-7-5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});

const SocialMediaSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Latest Reels</h2>

        <div className="relative max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.4 }}
            >
              <ReelCard
                ref={(el) => (videoRefs.current[currentIndex] = el)}
                reel={reels[currentIndex]}
                isActive={true}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted((m) => !m)}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {reels.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
