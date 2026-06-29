/**
 * Optimizes the single page application experience by dynamically prefetching
 * high-priority internal route bundles once the browser enters an idle state.
 */
export const prefetchPages = () => {
  if (typeof window === 'undefined') return;

  const prefetchActions = [
    () => import('@/pages/Products'),
    () => import('@/pages/ProductDetail'),
    () => import('@/pages/Checkout'),
    () => import('@/pages/About')
  ];

  const triggerPrefetch = () => {
    prefetchActions.forEach(importFunc => {
      try {
        // Execute the dynamic import function, priming the browser cache
        importFunc();
      } catch (err) {
        console.warn('Asynchronous page prefetch skipped:', err);
      }
    });
  };

  // Schedule prefetching on idle loops, avoiding main thread blocking during page paint
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => triggerPrefetch());
  } else {
    setTimeout(triggerPrefetch, 2000); // Fallback for browsers lacking requestIdleCallback
  }
};
