import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useMagneticEffect from '@/hooks/useMagneticEffect';
import { ArrowRight } from 'lucide-react';

export default function PremiumButton({
  children,
  onClick,
  href,
  target,
  rel,
  className = '',
  variant = 'primary', // 'primary', 'secondary', 'whatsapp', 'amber'
  isMagnetic = true,
  showArrow = true,
  disabled = false,
  ...props
}) {
  const { ref, x, y } = useMagneticEffect(0.2, 80);

  const buttonContent = (
    <motion.span
      className="flex items-center justify-center gap-2 select-none"
      style={isMagnetic ? { x, y } : {}}
    >
      {children}
      {showArrow && (
        <motion.span
          className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      )}
    </motion.span>
  );

  const variantClasses = {
    primary: "btn-premium-primary",
    secondary: "btn-premium-secondary",
    whatsapp: "btn-premium-whatsapp",
    amber: "btn-premium-amber",
  };

  const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
  const Component = isInternal ? Link : (href ? 'a' : 'button');
  const externalProps = isInternal ? { to: href } : (href ? { href, target, rel } : { onClick, disabled });

  return (
    <Component
      ref={isMagnetic ? ref : null}
      className={`${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...externalProps}
      {...props}
    >
      {buttonContent}
    </Component>
  );
}

