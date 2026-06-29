import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile,  setMobile]  = useState(false);
  const [isTablet,  setTablet]  = useState(false);
  const [width,     setWidth]   = useState(0);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setWidth(w);
      setMobile(w < 640);
      setTablet(w >= 640 && w < 1024);
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isMobile, isTablet, isDesktop: width >= 1024, width };
};
export default useMobile;
