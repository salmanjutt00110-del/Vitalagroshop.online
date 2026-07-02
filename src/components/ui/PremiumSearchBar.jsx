import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { searchCatalog } from '@/utils/searchHelper';
import { getProductImage } from '@/data/productsData';

// Typing placeholder hook
const useTypingPlaceholder = (strings, speed = 80, delay = 1800) => {
  const [placeholder, setPlaceholder] = useState('');
  const [stringIdx, setStringIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!strings || strings.length === 0) return;
    const currentString = strings[stringIdx];
    
    let timer;
    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholder(currentString.substring(0, charIdx - 1));
        setCharIdx(prev => prev - 1);
      }, speed / 1.8);
    } else {
      timer = setTimeout(() => {
        setPlaceholder(currentString.substring(0, charIdx + 1));
        setCharIdx(prev => prev + 1);
      }, speed);
    }

    if (!isDeleting && charIdx === currentString.length) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setStringIdx(prev => (prev + 1) % strings.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, stringIdx, strings, speed, delay]);

  return placeholder;
};

// Reusable Search Bar Component
export default function PremiumSearchBar({
  mode = 'inline', // 'inline' or 'global'
  isExpandable = true,
  onSearchChange = null,
  onSearchSubmit = null,
  initialValue = '',
  onCloseOverlay = null,
}) {
  const { lang, t } = useLanguage();
  const { setActiveDetailsProduct } = useApp();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Sync initialValue changes
  useEffect(() => {
    setQuery(initialValue);
    setDebouncedQuery(initialValue);
    if (initialValue) {
      setIsExpanded(true);
    }
  }, [initialValue]);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      if (onSearchChange) {
        onSearchChange(query);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, onSearchChange]);

  // Auto-focus when expanding
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
        if (isExpandable && !query) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isExpandable, query]);

  // Placeholder strings
  const placeholdersEn = useMemo(() => [
    'Search by name: Fatty...',
    'Search by crop: Cotton...',
    'Search by category: Insecticides...',
    'Search by Active Ingredient: Sulphur...',
    'Search by disease: Leaf Blast...',
    'Search by product code...'
  ], []);

  const placeholdersUr = useMemo(() => [
    'مصنوعات تلاش کریں جیسے فیٹی...',
    'فصل کا نام لکھیں جیسے کپاس...',
    'کیڑے مار ادویات تلاش کریں...',
    'بیماری کا نام لکھیں...',
    'پروڈکٹ کوڈ سے تلاش کریں...'
  ], []);

  const placeholders = lang === 'en' ? placeholdersEn : placeholdersUr;
  const animatedPlaceholder = useTypingPlaceholder(placeholders);

  // Execute search
  const results = useMemo(() => {
    return searchCatalog(debouncedQuery, lang);
  }, [debouncedQuery, lang]);

  // 3 Popular Flagship Products for Empty / Suggested State
  const suggestedProducts = useMemo(() => {
    return [
      {
        id: 'easy-grow-gold',
        slug: 'easy-grow-gold',
        name: { en: 'EAZY GROW GOLD - 12%WP', ur: 'ایزی گرو گولڈ' },
        category: 'seed-treatment',
        sizes: [{ price: 365 }],
        shortDesc: {
          en: 'Premium seed treatment compound combining DIFENOCONAZL + VALIDAMYCIN.',
          ur: 'بیج کی صفائی اور صحت مند بڑھوتری کے لیے بہترین فارمولا۔'
        }
      },
      {
        id: 'conference-gold-fs',
        slug: 'conference-gold-fs',
        name: { en: 'CONFERENCE GOLD - 35%FS', ur: 'کانفرنس گولڈ' },
        category: 'seed-treatment',
        sizes: [{ price: 950 }],
        shortDesc: {
          en: 'Advanced seed protection insecticide for sucking pest control.',
          ur: 'چوسنے والے کیڑوں کے خلاف بیج کا بہترین حفاظتی فارمولا۔'
        }
      },
      {
        id: 'aaqab',
        slug: 'aaqab',
        name: { en: 'AAQAAB - 10%EC', ur: 'عقاب' },
        category: 'insecticide',
        sizes: [{ price: 980 }],
        shortDesc: {
          en: 'Broad-spectrum insecticide for chewing and sucking pests.',
          ur: 'کپاس اور سبزیوں میں نقصان دہ کیڑوں کا مکمل خاتمہ۔'
        }
      }
    ].map(p => ({
      ...p,
      name: p.name[lang] || p.name.en,
      shortDesc: p.shortDesc[lang] || p.shortDesc.en,
      categoryLabel: t.categories?.[p.category] || p.category,
      image: getProductImage(p)
    }));
  }, [lang, t]);

  // Voice Search Trigger
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'en' ? 'Voice search is not supported in this browser.' : 'آپ کے براؤزر میں وائس سرچ دستیاب نہیں ہے۔');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : 'ur-PK';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuery(speechToText);
      setIsExpanded(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    recognition.start();
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (product) => {
    navigate(`/products/${product.slug || product.id}`);
    setIsFocused(false);
    if (isExpandable && !query) {
      setIsExpanded(false);
    }
    if (onCloseOverlay) {
      onCloseOverlay();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative select-none ${mode === 'global' ? 'w-full' : 'max-w-2xl w-full'}`}
    >
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Expanded Search Bar Container */}
        <motion.div
          initial={isExpandable ? { width: 52, opacity: 0 } : { width: '100%', opacity: 1 }}
          animate={
            isExpanded 
              ? { width: '100%', opacity: 1 } 
              : { width: 52, opacity: 1 }
          }
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`flex items-center rounded-full overflow-hidden border backdrop-blur-2xl transition-all duration-300 ${
            isFocused 
              ? 'border-[#10B981] bg-white/60 dark:bg-[#060b07]/45 shadow-[0_0_30px_rgba(16,185,129,0.25),0_10px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.25)]' 
              : 'border-white/20 dark:border-emerald-500/10 bg-white/40 dark:bg-[#060b07]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_24px_rgba(0,0,0,0.04)] hover:border-[#10B981]/40'
          } ${isExpanded ? 'h-13 pl-4 pr-14' : 'h-13 w-13 justify-center cursor-pointer'}`}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
        >
          {/* Animated Search Icon */}
          <motion.div
            animate={isFocused ? { scale: 1.15, rotate: -10 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Search className="w-5 h-5 text-[#0E7A43] shrink-0" />
          </motion.div>

          {/* Text Input */}
          {isExpanded && (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuery('');
                  setIsFocused(false);
                  if (isExpandable) {
                    setIsExpanded(false);
                  }
                  if (onCloseOverlay) {
                    onCloseOverlay();
                  }
                }
              }}
              placeholder={animatedPlaceholder}
              className="w-full h-full bg-transparent border-none outline-none focus:ring-0 pl-3 pr-8 text-sm sm:text-base text-[#0a331c] placeholder-emerald-900/35 font-medium"
            />
          )}

          {/* Actions panel inside search bar */}
          {isExpanded && (
            <div className="absolute right-3 flex items-center gap-2 z-10">
              {/* Clear button with animation */}
              <AnimatePresence>
                {query && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleClear}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#0E7A43] transition-all duration-200 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Voice search button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={startVoiceSearch}
                className={`p-2 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                  isListening 
                    ? 'bg-[#0E7A43] border-[#0E7A43] text-white shadow-[0_0_20px_rgba(14,122,67,0.5)] animate-pulse' 
                    : 'bg-white border-[#0E7A43]/15 text-[#0E7A43] hover:bg-[#EAFBF3] hover:border-[#0E7A43]/30 hover:shadow-md'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </form>

      {/* Floating Dropdown Results Panel */}
      <AnimatePresence>
        {isExpanded && isFocused && (query || isFocused) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-3 rounded-[24px] border p-3 z-[999] overflow-hidden max-h-[460px] flex flex-col bg-white/70 dark:bg-[#060b07]/75 backdrop-blur-3xl"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.25), 0 0 50px rgba(16, 185, 129, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header info */}
            <div className="text-[10px] font-extrabold text-[#0E7A43] tracking-widest uppercase px-3 py-2 border-b border-[#0E7A43]/8 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {query ? t.search?.results || 'Search Results' : t.search?.popular || 'Popular Searches'}
              </span>
              {query && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono text-neutral-400 bg-neutral-100/60 px-2 py-0.5 rounded-full text-[9px] font-bold"
                >
                  {results.length} found
                </motion.span>
              )}
            </div>

            {/* Results Scrollable area */}
            <div className="overflow-y-auto flex-1 mt-2 pr-1 space-y-1 scrollbar-thin">
              {query ? (
                results.length > 0 ? (
                  results.map((product, idx) => {
                    const price = product.sizes?.[0]?.price || 0;
                    const name = typeof product.name === 'object' ? (product.name[lang] || product.name.en) : product.name;
                    const desc = typeof product.shortDesc === 'object' ? (product.shortDesc[lang] || product.shortDesc.en) : product.shortDesc;
                    const catLabel = t.categories?.[product.category] || product.category;
                    const imgUrl = getProductImage(product);

                    return (
                      <motion.button
                        key={product.id}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.25 }}
                        onClick={() => handleResultClick(product)}
                        className="w-full flex items-center gap-3.5 p-2.5 text-left rounded-2xl hover:bg-[#EAFBF3]/70 group transition-all duration-300 hover:translate-x-1 hover:scale-[1.01] border border-transparent hover:border-emerald-500/10 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl border border-[#0E7A43]/8 overflow-hidden bg-white/60 p-0.5 shrink-0 flex items-center justify-center">
                          <img 
                            src={imgUrl} 
                            alt={name} 
                            className="w-full h-full object-contain group-hover:rotate-[3deg] group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#0a331c] group-hover:text-[#0E7A43] transition-colors truncate">
                              {name}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0E7A43] bg-[#EAFBF3] px-2 py-0.5 rounded-full border border-[#0E7A43]/5">
                              {catLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                            {desc}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#0E7A43] font-mono">
                            {price === 0 ? 'Request' : `PKR ${price.toLocaleString()}`}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#0E7A43]/40 inline ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 px-4 text-center"
                  >
                    <Sparkles className="w-7 h-7 text-[#0E7A43]/40 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-[#0a331c]">
                      {lang === 'en' ? 'No products found.' : 'کوئی مصنوعات نہیں ملیں۔'}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 mb-5">
                      {lang === 'en' ? 'Try searching for other keywords. Here are some suggestions:' : 'کچھ اور تلاش کرنے کی کوشش کریں۔ یہاں کچھ تجاویز ہیں:'}
                    </p>

                    <div className="space-y-1.5 text-left max-w-md mx-auto">
                      {suggestedProducts.map((p, idx) => (
                        <motion.button
                          key={p.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          onClick={() => handleResultClick(p)}
                          className="w-full flex items-center gap-3 p-2.5 bg-[#EAFBF3]/20 hover:bg-[#EAFBF3]/60 rounded-xl transition-all cursor-pointer text-left border border-emerald-500/5 hover:border-emerald-500/15 hover:shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/80 p-0.5 border border-emerald-500/5 flex items-center justify-center shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-emerald-950 truncate">{p.name}</p>
                            <p className="text-[9px] text-neutral-400 line-clamp-1">{p.shortDesc}</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 font-mono">
                            PKR {p.sizes[0].price.toLocaleString()}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )
              ) : (
                suggestedProducts.map((product, idx) => (
                  <motion.button
                    key={product.id}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.25 }}
                    onClick={() => handleResultClick(product)}
                    className="w-full flex items-center gap-3.5 p-2.5 text-left rounded-2xl hover:bg-[#EAFBF3]/70 group transition-all duration-300 hover:translate-x-1 border border-transparent hover:border-emerald-500/10 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl border border-[#0E7A43]/8 overflow-hidden bg-white/60 p-0.5 shrink-0 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#0a331c] group-hover:text-[#0E7A43] transition-colors truncate">
                          {product.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0E7A43] bg-[#EAFBF3] px-2 py-0.5 rounded-full border border-[#0E7A43]/5">
                          {product.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                        {product.shortDesc}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#0E7A43] font-mono">
                        PKR {product.sizes[0].price.toLocaleString()}
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
