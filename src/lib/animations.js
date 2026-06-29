// Easing Curves (Luxury Feel)
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1];
export const SPRING_GENTLE = { type: "spring", stiffness: 60, damping: 20 };
export const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30 };

// Duration Scale
export const DUR = { fast: 0.3, base: 0.6, slow: 0.9, crawl: 1.4 };

// Stagger Children (Global)
export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};
