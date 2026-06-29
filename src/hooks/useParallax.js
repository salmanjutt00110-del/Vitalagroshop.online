import { useEffect } from 'react';
import { useSpring } from 'framer-motion';

/**
 * Custom hook to calculate mouse-based parallax coordinate values.
 * Returns spring-animated x and y motion values that can be bound to motion components.
 * 
 * @param {number} strength - Factor to scale mouse displacement.
 * @returns {{ x: any, y: any }} Smoothly animated MotionValues.
 */
export default function useParallax(strength = 0.1) {
  const x = useSpring(0, { stiffness: 60, damping: 15 });
  const y = useSpring(0, { stiffness: 60, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const targetX = (e.clientX - window.innerWidth / 2) * strength;
      const targetY = (e.clientY - window.innerHeight / 2) * strength;
      x.set(targetX);
      y.set(targetY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, x, y]);

  return { x, y };
}
