import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// 3D Ticket Model Component
function Ticket3DModel({ isHovered, imageUrl }) {
  const { scene } = useGLTF('/models/nft-ticket.glb');
  
  // Animation on hover
  const { rotation } = useSpring({
    rotation: isHovered ? [0, Math.PI * 0.5, 0] : [0, 0, 0],
    config: { mass: 5, tension: 500, friction: 80 }
  });

  // Add rotation animation
  useFrame(({ clock }) => {
    if (!isHovered) {
      scene.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <primitive 
      object={scene} 
      scale={0.8}
      rotation={[0, 0, 0]}
      position={[0, 0, 0]}
    />
  );
}

// Main NFT Ticket Preview Component
export default function NFTCard({ 
  imageUrl, 
  title = 'VIP Access Pass', 
  owner = '0x1234...abcd',
  price = '0.1 ETH',
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Glow effect on hover
  const glowVariants = {
    initial: { 
      boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)' 
    },
    hover: { 
      boxShadow: [
        '0 0 20px rgba(99, 102, 241, 0.3)',
        '0 0 40px rgba(99, 102, 241, 0.5)',
        '0 0 20px rgba(99, 102, 241, 0.3)'
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: inView ? 1 : 0, 
        y: inView ? 0 : 20 
      }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-0.5 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-2xl"
        variants={glowVariants}
        initial="initial"
        whileHover="hover"
      />
      
      <div className="relative z-10 h-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="h-64 w-full rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            
            <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
              <Ticket3DModel isHovered={isHovered} imageUrl={imageUrl} />
            </Float>
            
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate={!isHovered}
              autoRotateSpeed={2}
            />
            <Environment preset="city" />
          </Canvas>
        </div>
        
        <div className="mt-4">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Owner: {owner}</span>
            <span className="font-medium text-indigo-400">{price}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Add GLTF model preload
useGLTF.preload('/models/nft-ticket.glb');
