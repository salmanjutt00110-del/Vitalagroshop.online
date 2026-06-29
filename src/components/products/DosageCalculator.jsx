import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const UNITS = [
  { label: 'Acres', value: 'acre', toMarla: 160 },
  { label: 'Marlas', value: 'marla', toMarla: 1 },
  { label: 'Kanals', value: 'kanal', toMarla: 20 },
  { label: 'Hectares', value: 'hectare', toMarla: 395.37 },
];

// Parse dosage string like "250ml/acre" or "1L per kanal" into ml per marla
function parseDosageToMlPerMarla(dosageStr) {
  if (!dosageStr) return null;
  const s = dosageStr.toLowerCase();

  // extract numeric value
  const numMatch = s.match(/[\d.]+/);
  if (!numMatch) return null;
  let amount = parseFloat(numMatch[0]);

  // unit of chemical
  let mlAmount = amount;
  if (s.includes('liter') || s.includes('litre') || (s.includes('l') && !s.includes('ml'))) {
    mlAmount = amount * 1000;
  } else if (s.includes('g') && !s.includes('kg')) {
    mlAmount = amount; // treat grams as ml for calculation
  } else if (s.includes('kg')) {
    mlAmount = amount * 1000;
  }

  // per field unit
  let perMarla = 1;
  if (s.includes('acre')) perMarla = 160;
  else if (s.includes('kanal')) perMarla = 20;
  else if (s.includes('hectare')) perMarla = 395.37;
  else if (s.includes('marla')) perMarla = 1;
  else perMarla = 160; // default assume per acre

  return mlAmount / perMarla;
}

function formatAmount(ml) {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  return `${Math.round(ml)} ml`;
}

export default function DosageCalculator({ dosage }) {
  const [open, setOpen] = useState(false);
  const [fieldSize, setFieldSize] = useState('');
  const [unit, setUnit] = useState('acre');

  const mlPerMarla = parseDosageToMlPerMarla(dosage);
  const selectedUnit = UNITS.find(u => u.value === unit);

  let result = null;
  if (mlPerMarla && fieldSize && parseFloat(fieldSize) > 0) {
    const marlas = parseFloat(fieldSize) * selectedUnit.toMarla;
    const totalMl = mlPerMarla * marlas;
    result = totalMl;
  }

  return (
    <div className="rounded-2xl border border-[#76C945]/30 overflow-hidden bg-gradient-to-br from-[#76C945]/5 to-[#0A2E1F]/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#76C945]/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#76C945]/15 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#76C945]" />
          </div>
          <div className="text-left">
            <p className="font-bold text-foreground text-sm">Dosage Calculator</p>
            <p className="text-xs text-muted-foreground">Estimate chemical needed for your field</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-[#76C945]/20">
              {!dosage ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Dosage information not available for this product.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    Based on recommended dosage: <span className="font-bold text-[#76C945]">{dosage}</span>
                  </p>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Field Size</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter size..."
                        value={fieldSize}
                        onChange={(e) => setFieldSize(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {UNITS.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <AnimatePresence>
                    {result !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-r from-[#0A2E1F] to-[#0A3A26] rounded-xl p-5 text-center"
                      >
                        <p className="text-white/60 text-xs mb-1">Estimated Amount Needed</p>
                        <p className="text-3xl font-extrabold text-[#76C945]">{formatAmount(result)}</p>
                        <p className="text-white/50 text-xs mt-1">
                          for {fieldSize} {selectedUnit.label.toLowerCase()}
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-left">
                          <div>
                            <p className="text-white/40 text-xs">In Liters</p>
                            <p className="text-white text-sm font-bold">{(result / 1000).toFixed(3)} L</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">In Milliliters</p>
                            <p className="text-white text-sm font-bold">{Math.round(result)} ml</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    * This is an estimate. Always consult with an agronomist for precise recommendations.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}