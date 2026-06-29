import React, { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function CountUp({
  from = 0,
  to,
  suffix = '',
}) {
  const [displayValue, setDisplayValue] = useState(from);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const motionVal = useMotionValue(from);

  // Eased spring physics configuration for clean deceleration
  const springVal = useSpring(motionVal, {
    stiffness: 35,
    damping: 12,
  });

  useEffect(() => {
    if (inView) {
      motionVal.set(to);
    }
  }, [inView, to, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springVal]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
