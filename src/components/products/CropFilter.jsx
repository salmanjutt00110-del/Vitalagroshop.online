import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X } from 'lucide-react';

const CROPS = [
  { name: 'Wheat', emoji: '🌾', keywords: ['wheat', 'gandum'] },
  { name: 'Rice', emoji: '🌾', keywords: ['rice', 'paddy', 'chawal'] },
  { name: 'Cotton', emoji: '🪴', keywords: ['cotton', 'kapas'] },
  { name: 'Sugarcane', emoji: '🎋', keywords: ['sugarcane', 'ganna'] },
  { name: 'Maize', emoji: '🌽', keywords: ['maize', 'corn', 'makkai'] },
  { name: 'Tomato', emoji: '🍅', keywords: ['tomato', 'tamaatar'] },
  { name: 'Potato', emoji: '🥔', keywords: ['potato', 'aloo'] },
  { name: 'Onion', emoji: '🧅', keywords: ['onion', 'pyaz'] },
  { name: 'Chili', emoji: '🌶️', keywords: ['chili', 'mirch', 'pepper'] },
  { name: 'Mango', emoji: '🥭', keywords: ['mango', 'aam'] },
  { name: 'Citrus', emoji: '🍊', keywords: ['citrus', 'orange', 'lemon', 'kinnow'] },
  { name: 'Vegetables', emoji: '🥦', keywords: ['vegetable', 'sabzi'] },
];

export default function CropFilter({ onCropSelect, activeCrop }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8">
      <div
        className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
          activeCrop ? 'border-[#76C945]/50 bg-[#76C945]/5' : 'border-border bg-card'
        }`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 cursor-pointer select-none transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#76C945]/15 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#76C945]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">Filter by Crop Type</p>
              {activeCrop ? (
                <p className="text-xs text-[#76C945]">Showing products for: <span className="font-bold">{activeCrop.name}</span></p>
              ) : (
                <p className="text-xs text-muted-foreground">Select your crop to see recommended products</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCrop && (
              <button
                onClick={(e) => { e.stopPropagation(); onCropSelect(null); }}
                className="p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">Select your crop to filter matching products:</p>
                <div className="flex flex-wrap gap-2">
                  {CROPS.map((crop, i) => (
                    <motion.button
                      key={crop.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { onCropSelect(crop); setIsOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        activeCrop?.name === crop.name
                          ? 'bg-[#0A2E1F] text-white border-[#0A2E1F]'
                          : 'bg-muted/50 text-foreground border-border hover:border-[#76C945]/50 hover:bg-[#76C945]/5'
                      }`}
                    >
                      <span>{crop.emoji}</span>
                      {crop.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { CROPS };