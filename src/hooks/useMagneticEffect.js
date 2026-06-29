import { useEffect, useRef } from 'react';
import { useSpring } from 'framer-motion';

export default function useMagneticEffect(strength = 0.3, radius = 80) {
  const ref = useRef(null);

  const x = useSpring(0, { stiffness: 120, damping: 15 });
  const y = useSpring(0, { stiffness: 120, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      const distance = Math.hypot(distanceX, distanceY);

      if (distance < radius) {
        x.set(distanceX * strength);
        y.set(distanceY * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const element = ref.current;
    if (element) {
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (element) {
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [strength, radius, x, y]);

  return { ref, x, y };
}
