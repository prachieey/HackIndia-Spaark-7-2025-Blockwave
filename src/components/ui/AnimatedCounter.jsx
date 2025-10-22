import React from 'react';
import { useSpring, animated } from '@react-spring/web';

const AnimatedCounter = ({ value, label, className = '' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }
  });

  return (
    <div className={`text-center ${className}`}>
      <animated.div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        {number.to(n => n.toFixed(0))}
      </animated.div>
      <div className="text-gray-400 mt-2 text-sm md:text-base">{label}</div>
    </div>
  );
};

export default AnimatedCounter;
