import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
/**
 * useAutoRotate – sets up a GSAP timeline that automatically calls `goNext`
 * every `interval` milliseconds (default 7000 ms). The timeline pauses when
 * the user hovers over the container (or touches on mobile) and resumes when
 * the interaction ends.
 *
 * @param {Object} params
 * @param {function} params.goNext – function to move to the next product.
 * @param {function} params.goPrev – optional, used for manual navigation.
 * @param {number} params.interval – rotation interval in ms (default 7000).
 * @param {React.RefObject} params.containerRef – ref to the root element to
 *        attach hover/touch listeners for pause/resume behavior.
 */
export default function useAutoRotate({ goNext, goPrev, interval = 7000, containerRef }) {
  const timelineRef = useRef(null);

  useEffect(() => {
    // GSAP timeline: simple delayed call loop.
    const tl = gsap.timeline({ repeat: -1, repeatDelay: interval / 1000 });
    tl.to({}, { duration: interval / 1000, onComplete: goNext });
    timelineRef.current = tl;

    // Pause on hover / touch start, resume on leave / touch end.
    const el = containerRef?.current;
    if (el) {
      const pause = () => tl.pause();
      const resume = () => tl.resume();
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resume);
      // Touch support – pause while finger is down.
      el.addEventListener('touchstart', pause);
      el.addEventListener('touchend', resume);

      return () => {
        tl.kill();
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
        el.removeEventListener('touchstart', pause);
        el.removeEventListener('touchend', resume);
      };
    }
    return () => tl.kill();
  }, [goNext, interval, containerRef]);
}
