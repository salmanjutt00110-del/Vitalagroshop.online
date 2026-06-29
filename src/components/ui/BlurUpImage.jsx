import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function BlurUpImage({ src, alt, className, style, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    setIsLoaded(false);
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      // If error occurs, fall back to src anyway
      setImgSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Premium blur-up placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md animate-pulse rounded-2xl flex items-center justify-center z-10">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500/25 border-t-emerald-400 animate-spin" />
        </div>
      )}
      
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            "transition-all duration-700 ease-out",
            isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-xl scale-95",
            className
          )}
          style={style}
          {...props}
        />
      )}
    </div>
  );
}
