import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { CartProvider } from '@/lib/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';

import AppLayout from './components/layout/AppLayout';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { PageLoader } from '@/components/PageLoader';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { useAuthState } from '@/lib/api';
import { auth } from '@/lib/api';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/layout/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { useApp } from '@/contexts/AppContext';
import { TopProgressBar } from '@/components/ui/TopProgressBar';
import { PRODUCTS_DATA } from '@/data/productsData';
import ProductDetailsModal from '@/components/products/ProductDetailsModal';

// Route-based Code Splitting using React.lazy
const PremiumGlassShowcase = React.lazy(() => import('@/components/home/PremiumGlassShowcase'));

const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const WhyUs = React.lazy(() => import('./pages/WhyUs'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const AdminDashboard = React.lazy(() => import('./pages/admin'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));

const OrderTimeline = React.lazy(() => import('./pages/OrderTimeline'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout'));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder'));

import apiClient from '@/lib/apiClient';

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#080f08]">
    <div className="w-10 h-10 rounded-full border-4 border-[#76C945] border-t-transparent animate-spin" />
  </div>
);

const AdminGuard = ({ children }) => {
  let isActive = false;
  try {
    isActive = localStorage.getItem('vitalAdmin_Active') === 'true';
  } catch (e) {
    console.warn("Storage check failed inside AdminGuard:", e);
  }
  if (!isActive) {
    return <Navigate to="/vital-admin" replace />;
  }
  return children;
};

// Welcome screen fallback & recovery boundary
class WelcomeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("WelcomeScreen cinematic preloader crashed, recovery fallback showroom mounted:", error, errorInfo);
    try {
      sessionStorage.setItem('vital_global_hydrated', 'true');
      sessionStorage.setItem('vitalAgro_loaded', 'true');
      sessionStorage.setItem('vital_agro_loaded', 'true');
      sessionStorage.setItem('vital_platform_loaded', 'true');
    } catch (e) {
      console.warn("sessionStorage hydration marker set failed in WelcomeErrorBoundary:", e);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#031109] text-white relative overflow-hidden flex flex-col justify-between">
          <React.Suspense fallback={<PageLoader />}>
            <PremiumGlassShowcase />
          </React.Suspense>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100]">
              <button
                onClick={() => {
                  if (this.props.onBypass) {
                    this.props.onBypass();
                  }
                }}
                className="px-8 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#76C945] rounded-2xl text-sm font-black uppercase tracking-widest border border-[#76C945]/30 backdrop-blur-md transition-all shadow-xl hover:shadow-[#76C945]/10 hover:scale-103 active:scale-97 cursor-pointer"
              >
                Enter Platform
              </button>
            </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { AnimatePresence } from 'framer-motion';

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
      <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
      <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
      <Route path="/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
      <Route path="/vital-admin" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
      <Route path="/dashboard/admin-panel" element={<ErrorBoundary><AdminGuard><AdminDashboard /></AdminGuard></ErrorBoundary>} />
      <Route path="/admin" element={<Navigate to="/dashboard/admin-panel" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/products" element={<ErrorBoundary><Products /></ErrorBoundary>} />
        <Route path="/products/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
        <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
        <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
        <Route path="/why-us" element={<ErrorBoundary><WhyUs /></ErrorBoundary>} />
        <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
        <Route path="/dealer" element={<Navigate to="/contact?type=dealer" replace />} />

        <Route path="/track/:id" element={<ErrorBoundary><OrderTimeline /></ErrorBoundary>} />
        <Route path="/order-success/:id" element={<ErrorBoundary><OrderSuccess /></ErrorBoundary>} />
        <Route path="/track-order" element={<ErrorBoundary><TrackOrder /></ErrorBoundary>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
function App() {
  const { stage, setStage, isInitialLoadComplete, setCatalogLoaded, activeDetailsProduct, setActiveDetailsProduct } = useApp();
  const [isTokenValidating, setIsTokenValidating] = useState(false);

  // Constraint 3: Home Route Session Caching checks sessionStorage to render instantly
  React.useEffect(() => {
    try {
      const loaded = sessionStorage.getItem('vitalAgro_loaded') === 'true' || 
                     sessionStorage.getItem('vital_agro_loaded') === 'true' || 
                     sessionStorage.getItem('vital_platform_loaded') === 'true' ||
                     sessionStorage.getItem('vital_global_hydrated') === 'true';
      if (loaded && stage !== 'ready') {
        setStage('ready');
      }
    } catch (e) {
      console.warn("Storage check failed inside App session cached logic:", e);
    }
  }, [stage, setStage]);

  // Safe Query Parameter Parsing (?t=...)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t') || urlParams.get('token') || urlParams.get('access_token');
      if (token) {
        setIsTokenValidating(true);
        
        // Delete tokens immediately from URL to ensure clean parameter-free path
        urlParams.delete('t');
        urlParams.delete('token');
        urlParams.delete('access_token');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, newUrl);

        // Turn off validation loader after a brief layout settle delay
        const timer = setTimeout(() => {
          setIsTokenValidating(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Safe query parameters verification check failed:", e);
      setIsTokenValidating(false);
    }
  }, []);

  // Dynamic products hydration from Flask API
  React.useEffect(() => {
    apiClient.get('/products')
      .then(res => res.data)
      .then(data => {
        if (Array.isArray(data)) {
          const isValidImagePath = (p) => {
            if (!p || typeof p !== 'string') return false;
            const trimmed = p.trim();
            return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:');
          };

          data.forEach(dbProd => {
            const existing = PRODUCTS_DATA[dbProd.id];
            
            // Build sizes array from dynamicPricingMatrix JSON
            const pricingMatrix = dbProd.dynamicPricingMatrix || {};
            const sizesList = Object.entries(pricingMatrix).map(([size, price]) => ({
              size: size.toUpperCase(),
              price: Number(price),
              oldPrice: Number(price),
              stockStatus: dbProd.stockInventory > 0 ? "In Stock" : "Out of Stock",
              sku: `VA-${dbProd.id.toUpperCase()}-${size.toUpperCase()}`,
              weight: size.toLowerCase().includes('l') ? `${parseFloat(size)}kg` : `${parseFloat(size)/1000}kg`
            }));

            const defaultPrice = sizesList.length > 0 ? sizesList[0].price : dbProd.price;

            if (existing) {
              existing.name.en = dbProd.productName;
              existing.category = dbProd.productCategory;
              if (dbProd.productDescription) {
                existing.description = { en: dbProd.productDescription, ur: existing.description?.ur || dbProd.productDescription };
              }
              if (dbProd.baseImageURL && isValidImagePath(dbProd.baseImageURL)) {
                existing.imageUrl = dbProd.baseImageURL.trim();
                existing.pngUrl = dbProd.baseImageURL.trim();
              }
              if (sizesList.length > 0) {
                existing.sizes = sizesList;
                existing.price = defaultPrice;
              }
              existing.stockInventory = dbProd.stockInventory;
              existing.stockStatus = dbProd.stockInventory > 0 ? "In Stock" : "Out of Stock";
            } else {
              // Synthesize a new product inside local reference
              const finalImg = (dbProd.baseImageURL && isValidImagePath(dbProd.baseImageURL)) 
                ? dbProd.baseImageURL.trim() 
                : `/products/${dbProd.id}.png`;

              PRODUCTS_DATA[dbProd.id] = {
                id: dbProd.id,
                slug: dbProd.id,
                name: { en: dbProd.productName, ur: dbProd.productName },
                genericName: { en: "Biotech Formula", ur: "بائیوٹیک فارمولا" },
                category: dbProd.productCategory,
                imageUrl: finalImg,
                pngUrl: finalImg,
                rating: 4.9,
                sizes: sizesList,
                price: defaultPrice,
                description: { en: dbProd.productDescription, ur: dbProd.productDescription },
                features: { en: ["Premium Dynamic Biotech Synthesis"], ur: ["پریمیئم بائیوٹیک مکس"] }
              };
            }
          });
          // Notify components that the catalog has updated
          window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
        }
        setCatalogLoaded(true);
      })
      .catch(err => {
        console.error("Dynamic catalog synchronization failed:", err);
        setCatalogLoaded(true);
      });
  }, []);

  // Show fail-safe loading screen while token is being verified
  if (isTokenValidating) {
    return <PageLoader />;
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <CartProvider>
            <LanguageProvider>
              
              {/* 1. WELCOME SCREEN (first visit only) */}
              <AnimatePresence mode="wait">
                {!isInitialLoadComplete && stage === 'welcome' && (
                  <WelcomeErrorBoundary onBypass={() => setStage('ready')}>
                    <WelcomeScreen
                      onComplete={() => {
                        setStage('ready');
                      }}
                    />
                  </WelcomeErrorBoundary>
                )}
              </AnimatePresence>

              {/* 3. MAIN APP */}
              {(isInitialLoadComplete || stage === 'ready') && (
                <Router>
                  <SmoothScroll>
                    <TopProgressBar />
                    <ScrollToTop />
                    <React.Suspense fallback={<PageLoader />}>
                      <AuthenticatedApp />
                    </React.Suspense>
                    <CartDrawer />

                    {/* 2. GLOBAL PRODUCT DETAILS PANEL OVERLAY */}
                    <React.Suspense fallback={null}>
                      <AnimatePresence>
                        {activeDetailsProduct && (
                          <ProductDetailsModal
                            product={activeDetailsProduct}
                            onClose={() => setActiveDetailsProduct(null)}
                          />
                        )}
                      </AnimatePresence>
                    </React.Suspense>
                  </SmoothScroll>
                </Router>
              )}

              <Toaster />
            </LanguageProvider>
          </CartProvider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;