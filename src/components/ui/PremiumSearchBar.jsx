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
        id: 'fatty-80sl',
        slug: 'fatty-80sl',
        name: { en: 'FATTY - 80%SL', ur: 'فیٹی' },
        category: 'fungicide',
        sizes: [{ price: 1650 }],
        shortDesc: {
          en: 'Organic potassium salt of fatty acids targeting soft-bodied insects and powdery mildew.',
          ur: 'نامیاتی پوٹاشیم نمک جو چوسنے والے کیڑوں کے خلاف بہترین مدافعت فراہم کرتا ہے۔'
        }
      },
      {
        id: 'aaqaab-10ec',
        slug: 'aaqaab-10ec',
        name: { en: 'AAQAAB - 10%EC', ur: 'عقاب' },
        category: 'insecticide',
        sizes: [{ price: 980 }],
        shortDesc: {
          en: 'Broad-spectrum insecticide for control of chewing and sucking pests in cotton and vegetables.',
          ur: 'کپاس اور سبزیوں میں چوسنے والے اور چبانے والے کیڑوں کا خاتمہ۔'
        }
      },
      {
        id: 'super-4g',
        slug: 'super-4g',
        name: { en: 'SUPER 4G', ur: 'سپر فور جی' },
        category: 'plant-nutrition',
        sizes: [{ price: 2400 }],
        shortDesc: {
          en: 'High-purity liquid micronutrient fertilizer with seaweed extract and growth enzymes.',
          ur: 'پودوں کی بھرپور بڑھوتری اور پیداوار بڑھانے کے لیے خاص مائیکرو نیوٹرینٹس۔'
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
          initial={isExpandable ? { width: 44, opacity: 0 } : { width: '100%', opacity: 1 }}
          animate={
            isExpanded 
              ? { width: '100%', opacity: 1 } 
              : { width: 44, opacity: 1 }
          }
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center rounded-full overflow-hidden border bg-white/70 backdrop-blur-xl transition-all duration-300 ${
            isFocused 
              ? 'border-[#0E7A43] shadow-[0_0_22px_rgba(14,122,67,0.22)]' 
              : 'border-[#0E7A43]/15 shadow-sm hover:border-[#0E7A43]/35'
          } ${isExpanded ? 'h-12 pl-4 pr-12' : 'h-11 w-11 justify-center cursor-pointer'}`}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
        >
          {/* Search Icon */}
          <Search 
            className={`w-5 h-5 text-[#0E7A43] shrink-0 transition-transform ${
              isFocused ? 'scale-110' : ''
            }`} 
          />

          {/* Text Input */}
          {isExpanded && (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={animatedPlaceholder}
              className="w-full h-full bg-transparent border-none outline-none focus:ring-0 pl-3 pr-8 text-xs sm:text-sm text-[#0a331c] placeholder-emerald-900/40"
            />
          )}

          {/* Actions panel inside search bar */}
          {isExpanded && (
            <div className="absolute right-3 flex items-center gap-1.5 z-10">
              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-neutral-400 hover:text-[#0E7A43] hover:bg-neutral-100/50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice search button */}
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-1.5 rounded-full border transition-all ${
                  isListening 
                    ? 'bg-[#0E7A43] border-[#0E7A43] text-white animate-pulse' 
                    : 'bg-white border-[#0E7A43]/10 text-[#0E7A43] hover:bg-[#EAFBF3]'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </form>

      {/* Floating Dropdown Results Panel */}
      <AnimatePresence>
        {isExpanded && isFocused && (query || isFocused) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 rounded-[24px] border border-[#0E7A43]/12 p-3 shadow-2xl z-[999] overflow-hidden max-h-[460px] flex flex-col bg-white/95 backdrop-blur-2xl"
            style={{
              boxShadow: '0 20px 40px rgba(14, 122, 67, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* Header info */}
            <div className="text-[10px] font-extrabold text-[#0E7A43] tracking-widest uppercase px-3 py-1.5 border-b border-[#0E7A43]/5 flex items-center justify-between">
              <span>{query ? t.search?.results || 'Search Results' : t.search?.popular || 'Popular Searches'}</span>
              {query && (
                <span className="font-mono text-neutral-400 bg-neutral-100/60 px-2 py-0.5 rounded text-[9px] font-bold">
                  {results.length} found
                </span>
              )}
            </div>

            {/* Results Scrollable area */}
            <div className="overflow-y-auto flex-1 mt-2 pr-1 space-y-1 scrollbar-thin">
              {query ? (
                results.length > 0 ? (
                  results.map((product) => {
                    const price = product.sizes?.[0]?.price || 0;
                    const name = typeof product.name === 'object' ? (product.name[lang] || product.name.en) : product.name;
                    const desc = typeof product.shortDesc === 'object' ? (product.shortDesc[lang] || product.shortDesc.en) : product.shortDesc;
                    const catLabel = t.categories?.[product.category] || product.category;
                    const imgUrl = getProductImage(product);

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleResultClick(product)}
                        className="w-full flex items-center gap-3.5 p-2 text-left rounded-2xl hover:bg-[#EAFBF3]/70 group transition-all duration-300 hover:translate-x-1 hover:scale-[1.01] border border-transparent hover:border-emerald-500/10 cursor-pointer"
                      >
                        {/* Thumbnail image */}
                        <div className="w-12 h-12 rounded-xl border border-[#0E7A43]/8 overflow-hidden bg-white/60 p-0.5 shrink-0 flex items-center justify-center">
                          <img 
                            src={imgUrl} 
                            alt={name} 
                            className="w-full h-full object-contain group-hover:rotate-[3deg] transition-transform duration-300"
                          />
                        </div>

                        {/* Text info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#0a331c] group-hover:text-[#0E7A43] transition-colors truncate">
                              {name}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0E7A43] bg-[#EAFBF3] px-2 py-0.5 rounded border border-[#0E7A43]/5">
                              {catLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                            {desc}
                          </p>
                        </div>

                        {/* Price tag */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#0E7A43] font-mono">
                            {price === 0 ? 'Request' : `PKR ${price.toLocaleString()}`}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#0E7A43]/40 inline ml-1 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  // Empty State: Suggestions
                  <div className="py-6 px-4 text-center">
                    <Sparkles className="w-7 h-7 text-[#0E7A43]/40 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-[#0a331c]">
                      {lang === 'en' ? 'No products found.' : 'کوئی مصنوعات نہیں ملیں۔'}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 mb-5">
                      {lang === 'en' ? 'Try searching for other keywords. Here are some suggestions:' : 'کچھ اور تلاش کرنے کی کوشش کریں۔ یہاں کچھ تجاویز ہیں:'}
                    </p>

                    {/* Suggested products grid */}
                    <div className="space-y-1.5 text-left max-w-md mx-auto">
                      {suggestedProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleResultClick(p)}
                          className="w-full flex items-center gap-3 p-2 bg-[#EAFBF3]/20 hover:bg-[#EAFBF3]/60 rounded-xl transition-colors cursor-pointer text-left border border-emerald-500/5 hover:border-emerald-500/10"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/80 p-0.5 border border-emerald-500/5 flex items-center justify-center shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-emerald-950 truncate">{p.name}</p>
                            <p className="text-[9px] text-neutral-400 line-clamp-1">{p.shortDesc}</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 font-mono">
                            PKR {p.sizes[0].price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                // Initial/Default state: Popular products
                suggestedProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleResultClick(product)}
                    className="w-full flex items-center gap-3.5 p-2 text-left rounded-2xl hover:bg-[#EAFBF3]/70 group transition-all duration-300 hover:translate-x-1 border border-transparent hover:border-emerald-500/10 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl border border-[#0E7A43]/8 overflow-hidden bg-white/60 p-0.5 shrink-0 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#0a331c] group-hover:text-[#0E7A43] transition-colors truncate">
                          {product.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0E7A43] bg-[#EAFBF3] px-2 py-0.5 rounded border border-[#0E7A43]/5">
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
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
