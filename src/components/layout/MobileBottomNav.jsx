import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  { label: 'Home',     path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Track',    path: '/track-order' },
  { label: 'Contact',  path: '/contact' },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden safe-bottom"
      style={{
        background: 'rgba(5,16,5,0.97)',
        backdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.path ||
            (tab.path !== '/' && pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex-1 flex flex-col items-center py-2.5 relative min-h-[56px] justify-center"
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-bg"
                  className="absolute inset-x-2 top-1 bottom-1 rounded-2xl bg-[rgba(45,106,45,0.2)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Active top line */}
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-line"
                  className="absolute top-0 inset-x-6 h-[2px] rounded-full bg-[#5cb85c]"
                  style={{ boxShadow: '0 0 8px rgba(92,184,92,0.8)' }}
                />
              )}

              {/* Label — TEXT ONLY, CLEAN */}
              <span
                className={`relative z-10 text-xs font-semibold transition-all duration-300 ${
                  isActive ? 'text-[#5cb85c]' : 'text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
