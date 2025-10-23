import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Sparkles } from '@react-three/drei';
import Tilt from 'react-parallax-tilt';

// 3D NFT Ticket Component
const NFTTicket = () => {
  try {
    const { scene } = useGLTF('/models/nft-ticket.glb');
    return (
      <group>
        <primitive object={scene} scale={1.2} position={[0, -0.5, 0]} />
        <Sparkles
          size={5}
          scale={[2, 2, 2]}
          position={[0, 0, 0]}
          speed={0.5}
          count={40}
          color="cyan"
        />
      </group>
    );
  } catch (error) {
    console.warn('3D model not found, using fallback UI');
    return (
      <mesh>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
    );
  }
};

// NFT Ticket Preview Component
export const NFTTicketPreview = ({ 
  className = '',
  title = 'Event Ticket',
  owner = 'Your Wallet',
  price = '0.0 ETH'
}) => {
  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.3}
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      scale={1.05}
      transitionSpeed={400}
      className={`w-full max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden border border-gray-700 ${className}`}
    >
      <div className="w-full h-96 bg-black/20 backdrop-blur-md rounded-3xl relative">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={<Html>Loading 3D ticket...</Html>}>
            <NFTTicket />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
        <div className="absolute bottom-4 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span>Owner: {owner}</span>
            <span className="font-semibold">{price}</span>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

// Export the component as default
export default NFTTicketPreview;
