import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const location = useLocation();

  // 1. Initialize Lenis once on mount (Bypassed for native GPU-accelerated lag-free scrolling)
  useEffect(() => {
    // We rely on native browser GPU scroll compositing for butter-smooth 60FPS performance.
    // This prevents main-thread script execution from lagging the scrolling action.
    return;
  }, []);

  // 2. Handle routing updates (reset scroll position & bind new parallax elements)
  useEffect(() => {
    // Reset scroll positions on mount immediately
    window.scrollTo(0, 0);
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(0, { immediate: true });
    }

    // Setup GSAP context for element parallax tracking
    const ctx = gsap.context(() => {
      // Find all elements configured with a parallax speed modifier
      const parallaxElements = document.querySelectorAll('[data-speed]');
      
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0;
        
        // Dynamic scroll parallax translate trigger
        gsap.fromTo(el,
          { y: 0 },
          {
            y: speed * 150, // scroll offset travel distance scalar
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });
    });

    // Short timeout delay to recalculate offsets after pages dynamically hydrate
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
    };
  }, [location.pathname]);

  return <>{children}</>;
}
