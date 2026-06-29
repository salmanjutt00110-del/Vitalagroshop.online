import React, { useEffect, useRef } from 'react';

/**
 * HeroParticles renders a lightweight, GPU-accelerated canvas background
 * featuring floating particle dust that drifts gently over the screen.
 */
export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 15 : 50;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -Math.random() * 0.2 - 0.05, // slow upward drift
        opacity: Math.random() * 0.4 + 0.1,
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulseDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Draw particle with brand green color and animated opacity
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(118, 201, 69, ${p.opacity})`;
        ctx.fill();

        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;

        // Gentle opacity pulsing
        p.opacity += p.pulseSpeed * p.pulseDir;
        if (p.opacity > 0.6) {
          p.pulseDir = -1;
        } else if (p.opacity < 0.1) {
          p.pulseDir = 1;
        }

        // Screen boundary checking & wrap-around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    let isVisible = true;
    let isRunning = false;

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animate();
      }
    };

    const stopLoop = () => {
      if (isRunning) {
        cancelAnimationFrame(animationFrameId);
        isRunning = false;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
      style={{ mixBlendMode: 'screen', opacity: 0.8 }}
    />
  );
}
