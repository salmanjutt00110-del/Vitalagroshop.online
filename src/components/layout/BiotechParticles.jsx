import React, { useEffect, useRef, useState } from 'react';

export default function BiotechParticles() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles array
    const particles = [];
    const particleCount = Math.min(30, Math.floor((window.innerWidth * window.innerHeight) / 45000));

    // DNA helical structure generator
    class HelixNode {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 200;
        this.speed = 0.4 + Math.random() * 0.5;
        this.amplitude = 15 + Math.random() * 10;
        this.frequency = 0.01 + Math.random() * 0.01;
        this.phase = Math.random() * Math.PI * 2;
        this.size = 2 + Math.random() * 2;
        this.alpha = 0.15 + Math.random() * 0.35;
        this.color = '#10B981';
      }

      update() {
        this.y -= this.speed;
        this.phase += this.frequency;
        
        // Wrap around top
        if (this.y < -50) {
          this.y = canvas.height + 50;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw double helix dots
        const xOffset1 = Math.sin(this.phase) * this.amplitude;
        const xOffset2 = Math.sin(this.phase + Math.PI) * this.amplitude;
        
        const node1X = this.x + xOffset1;
        const node2X = this.x + xOffset2;
        
        // Connection bar
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(node1X, this.y);
        ctx.lineTo(node2X, this.y);
        ctx.stroke();

        // Node 1
        ctx.beginPath();
        ctx.arc(node1X, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#10B981';
        ctx.fill();

        // Node 2
        ctx.beginPath();
        ctx.arc(node2X, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#8AD65A';
        ctx.fill();

        ctx.restore();
      }
    }

    // Standard floating spores & connecting molecules
    class SporeNode {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -0.15 - Math.random() * 0.3;
        this.radius = 1 + Math.random() * 3;
        this.alpha = 0.1 + Math.random() * 0.4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#10B981';
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize list
    for (let i = 0; i < particleCount; i++) {
      if (i % 3 === 0) {
        particles.push(new HelixNode());
      } else {
        particles.push(new SporeNode());
      }
    }

    // Connect node molecules close to each other
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          if (p1 instanceof SporeNode && p2 instanceof SporeNode) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 110) {
              ctx.save();
              ctx.globalAlpha = (1 - dist / 110) * 0.12;
              ctx.beginPath();
              ctx.strokeStyle = '#10B981';
              ctx.lineWidth = 0.5;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
