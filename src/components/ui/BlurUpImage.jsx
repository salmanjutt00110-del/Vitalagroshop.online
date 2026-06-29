import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function BlurUpImage({ src, alt, className, style, loading = 'lazy', ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let active = true;
    let timer = null;

    if (typeof window !== 'undefined' && src) {
      const img = new Image();
      img.src = src;
      if (img.complete) {
        setIsLoaded(true);
        setShowSpinner(false);
      } else {
        setIsLoaded(false);
        // Only show spinner if the image takes longer than 400ms to load
        timer = setTimeout(() => {
          if (active) setShowSpinner(true);
        }, 400);

        img.onload = () => {
          if (active) {
            setIsLoaded(true);
            setShowSpinner(false);
            if (timer) clearTimeout(timer);
          }
        };
        img.onerror = () => {
          if (active) {
            setIsLoaded(true);
            setShowSpinner(false);
            if (timer) clearTimeout(timer);
          }
        };
      }
    }

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Premium subtle blur-up placeholder */}
      {!isLoaded && showSpinner && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm animate-pulse rounded-2xl flex items-center justify-center z-10">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        </div>
      )}
      
      {src && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          className={cn(
            "transition-all duration-500 ease-out",
            isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-95",
            className
          )}
          style={style}
          {...props}
        />
      )}
    </div>
  );
}
