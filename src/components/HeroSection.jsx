import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Play, ArrowRight, ArrowDown } from 'lucide-react';

// Styled Components
const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const VideoBackground = () => (
  <video
    autoPlay
    loop
    muted
    playsInline
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -1,
      minWidth: '100%',
      minHeight: '100%',
      backgroundColor: '#000'
    }}
  >
    <source src="/videos/hero-video.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  color: white;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin: 20px 0;
  line-height: 1.2;
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: #e0e0e0;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const HeroDescription = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 800px;
  margin: 0 auto 30px;
  line-height: 1.6;
`;

const CtaButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
`;

const PrimaryButton = styled(motion.button)`
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  border: 2px solid white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ScrollIndicator = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
`;

const HeroSection = ({ onExploreEvents }) => {
  const videoRef = useRef(null);
  
  // Auto-play the video when component mounts
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.log('Autoplay was prevented, waiting for user interaction...');
        }
      }
    };
    
    playVideo();
    
    // Add a one-time click handler to start video if autoplay was prevented
    const handleClick = () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
      }
      document.removeEventListener('click', handleClick);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleVideoError = (e) => {
    console.error('Video error:', e);
  };

  return (
    <HeroContainer>
      <VideoBackground ref={videoRef} 
        preload="auto"
        webkit-playsinline="true"
        x5-playsinline="true"
      >
        <source 
          src="/videos/Website_Video_Creation_Request.mp4" 
          type="video/mp4"
        />
        <p>Your browser does not support the video tag.</p>
      </VideoBackground>
      <HeroOverlay>
        <HeroContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroSubtitle>EXPERIENCE THE BEST EVENTS</HeroSubtitle>
            <HeroTitle>Discover Amazing Events <br /> Near You</HeroTitle>
            <HeroDescription>
              Find and book tickets to the most exciting concerts, festivals, and shows.
              Never miss out on your favorite events again.
            </HeroDescription>
          </motion.div>
          <CtaButtons>
            <PrimaryButton
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Play button clicked');
                playVideo();
              }}
              aria-label="Watch introductory video"
            >
              <Play size={18} />
              {isVideoPlaying ? 'Watching...' : 'Watch Video'}
            </PrimaryButton>
            <SecondaryButton
              as={motion.button}
              whileHover={{ x: 5 }}
              onClick={onExploreEvents}
              aria-label="Explore available events"
            >
              Explore Events
              <ArrowRight size={18} />
            </SecondaryButton>
          </CtaButtons>
          <ScrollIndicator
            aria-label="Scroll down to view more content"
            onClick={onExploreEvents}
          >
            <span>Scroll Down</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown size={24} />
            </motion.div>
          </ScrollIndicator>
        </HeroContent>
      </HeroOverlay>
    </HeroContainer>
  );
};

export default HeroSection;
