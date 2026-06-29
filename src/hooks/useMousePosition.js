import { useState, useEffect } from 'react';

export default function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const normalizedX = (x / window.innerWidth) - 0.5;
      const normalizedY = (y / window.innerHeight) - 0.5;
      setMousePosition({ x, y, normalizedX, normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}
