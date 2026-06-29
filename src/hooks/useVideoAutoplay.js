import { useEffect } from 'react';

/**
 * Hook to automatically play a background video element,
 * with fallbacks for browser autoplay restrictions.
 * 
 * @param {React.RefObject<HTMLVideoElement>} videoRef 
 */
export default function useVideoAutoplay(videoRef) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Helper to attempt playback
    const attemptPlay = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    // Try playing immediately
    video.play().catch((err) => {
      console.warn("[Vital Agro] Autoplay blocked by browser. Setting up interaction listeners.", err);
      
      // Fallback: Play on first scroll or click anywhere
      const forcePlay = () => {
        attemptPlay();
        window.removeEventListener('click', forcePlay);
        window.removeEventListener('scroll', forcePlay, { passive: true });
        window.removeEventListener('touchstart', forcePlay);
      };

      window.addEventListener('click', forcePlay);
      window.addEventListener('scroll', forcePlay, { passive: true });
      window.addEventListener('touchstart', forcePlay);
    });

    // Pause when tab is inactive, play when active to save CPU/GPU cycles
    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [videoRef]);
}
