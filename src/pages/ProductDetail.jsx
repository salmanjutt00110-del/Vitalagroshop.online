import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Send,
  CheckCircle2, AlertTriangle, HelpCircle, Shield, Award, Cpu,
  Flame, HardHat, FileText, Info, Leaf, Check, Sparkles, Zap, Clock, ShieldCheck, Gauge, Layers, Activity, Maximize, Users, ArrowLeft, Truck, Building, Upload, X, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { PRODUCTS_DATA, getProductImage } from '@/data/productsData';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/CartContext';
import useVideoAutoplay from '@/hooks/useVideoAutoplay';
import SEOHead from '@/lib/seo/SEOHead';
import useProductPricing from '@/hooks/useProductPricing';
import apiClient from '@/lib/apiClient';
import { createOrder } from '@/lib/firestore/orders';
import { isServerOnline } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import BlurUpImage from '@/components/ui/BlurUpImage';
import { useApp } from '@/contexts/AppContext';

// Import local assets via standard React pipeline
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import tagLogo from '@/assets/tag logo.webp';
import vitalGroup from '@/assets/vital group.webp';

const CATEGORY_LABELS = {
  en: {
    insecticide: 'Insecticide',
    herbicide: 'Herbicide',
    fungicide: 'Fungicide',
    plant_nutrition: 'Plant Nutrition',
    'plant-nutrition': 'Plant Nutrition',
    'seed-treatment': 'Seed Treatment',
    growth_promoter: 'Growth Promoter',
    special_product: 'Special Product',
  },
  ur: {
    insecticide: 'کیڑے مار دوا',
    herbicide: 'جڑی بوٹی مار دوا',
    fungicide: 'فنگس مار دوا',
    plant_nutrition: 'پودوں کی غذائیت',
    'plant-nutrition': 'پودوں کی غذائیت',
    'seed-treatment': 'بیج کی صفائی',
    growth_promoter: 'نمو بڑھانے والا',
    special_product: 'خاص مصنوع',
  }
};

const FEATURE_ICONS = [
  <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />,
  <Clock className="w-5 h-5 text-emerald-400" />,
  <Sparkles className="w-5 h-5 text-emerald-400" />,
  <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  <Cpu className="w-5 h-5 text-emerald-400" />,
  <Gauge className="w-5 h-5 text-emerald-400" />,
  <Layers className="w-5 h-5 text-emerald-400" />,
  <Activity className="w-5 h-5 text-emerald-400" />,
  <Maximize className="w-5 h-5 text-emerald-400" />,
  <Award className="w-5 h-5 text-emerald-400" />,
];

const SAFETY_ICONS = [
  <HardHat className="w-4 h-4" />,
  <Shield className="w-4 h-4" />,
  <Flame className="w-4 h-4" />,
  <Info className="w-4 h-4" />,
  <AlertTriangle className="w-4 h-4" />
];

// Interactive 3D Tilt Wrapper
function TiltCard({ children, className, ...props }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Maximum tilt angles in degrees
    const tiltX = (y / (rect.height / 2)) * -12;
    const tiltY = (x / (rect.width / 2)) * 12;
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} transition-all duration-200`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    url: "https://web.facebook.com/profile.php?id=61574977847218",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    )
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/vitalagro7/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    )
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/vital-agro-chemical-industries/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@vitalagrofficial?si=tp7s7r_BZWeFdVVu",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@vitalagrochemicals",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.99 1.13 2.37 1.93 3.86 2.23.01 1.29.01 2.58.01 3.87-.97-.05-1.92-.35-2.78-.83-.87-.5-1.59-1.22-2.13-2.07v6.6c0 1.25-.26 2.5-.78 3.65-.63 1.28-1.63 2.36-2.88 3.08-1.46.79-3.15 1.09-4.78.84-1.74-.29-3.34-1.21-4.48-2.61-1.31-1.67-1.92-3.83-1.69-5.96.25-2.04 1.34-3.9 3.03-5.06 1.38-.91 3.03-1.34 4.67-1.2 0 1.33.01 2.65.01 3.98-.82-.09-1.66.1-2.36.56-.72.5-.1.21 1.25 1.77.34 1.52.88 2.38 2.05 2.19 1.48-.19 2.5-1.49 2.5-2.99v-13.6z" />
      </svg>
    )
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const { catalogLoaded } = useApp();

  const [catalogVersion, setCatalogVersion] = useState(0);
  useEffect(() => {
    const handleHydrate = () => setCatalogVersion(v => v + 1);
    window.addEventListener('vital_catalog_hydrated', handleHydrate);
    return () => window.removeEventListener('vital_catalog_hydrated', handleHydrate);
  }, []);

  const allProducts = useMemo(() => {
    return Object.values(PRODUCTS_DATA).filter(p => p.id);
  }, [catalogVersion]);

  const product = useMemo(() => {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const found = allProducts.find(
      p => p?.slug?.toLowerCase() === cleanId || p?.id?.toLowerCase() === cleanId
    );
    if (!found) return null;

    // Product Safe Validation
    const nameVal = typeof found.name === 'object' ? (found.name.en || found.name.ur) : found.name;
    if (!nameVal || !nameVal.trim()) return null;
    if (!found.category || !found.category.trim()) return null;
    const hasPrice = found.price !== undefined || (found.sizes && found.sizes.some(s => s.price !== undefined));
    if (!hasPrice) return null;
    const img = getProductImage(found);
    if (!img) return null;

    return found;
  }, [id, allProducts]);


  const currentIndex = useMemo(() => {
    if (!product || !allProducts) return -1;
    return allProducts.findIndex(p => p.id === product.id);
  }, [product, allProducts]);

  const prevProduct = useMemo(() => {
    if (currentIndex <= 0) return allProducts[allProducts.length - 1];
    return allProducts[currentIndex - 1];
  }, [currentIndex, allProducts]);

  const nextProduct = useMemo(() => {
    if (currentIndex === -1 || currentIndex === allProducts.length - 1) return allProducts[0];
    return allProducts[currentIndex + 1];
  }, [currentIndex, allProducts]);

  const [activeTab, setActiveTab] = useState(0); // Product image gallery index
  const [isZoomed, setIsZoomed] = useState(false); // Fullscreen zoom state
  const [openFaq, setOpenFaq] = useState(null); // FAQ accordion state

  // Interactive Lens Coordinates
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);

  // Pricing Hook
  const {
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    unitPrice,
    originalPrice,
    sku,
    weight,
    stockStatus,
    sizesList
  } = useProductPricing(product);

  const selectedSizeIdx = useMemo(() => {
    if (!sizesList) return -1;
    return sizesList.findIndex(
      s => (typeof s === 'object' ? s.size : s) === selectedSize
    );
  }, [sizesList, selectedSize]);

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSpecsOpen, setIsMobileSpecsOpen] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sticky bottom navigation bar on mobile
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const videoRef = useRef(null);
  useVideoAutoplay(videoRef);

  // Reviews integration
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    if (!product) return;
    if (!isServerOnline()) {
      setReviews([
        { id: 1, user_name: "Haji Muhammad Yousaf", rating: 5, text: "Bohut hi behtareen dava hai. Cotton pe spray kia, 2 din me result agya.", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: 2, user_name: "Kamran Khan Jutt", rating: 5, text: "Excellent packing and original formula. Fast delivery from Faisalabad.", created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
        { id: 3, user_name: "Rana Tanveer", rating: 4, text: "Dosage standard rate pe bilkul perfect hai. Achi delivery quality.", created_at: new Date(Date.now() - 8 * 86400000).toISOString() }
      ]);
      setLoadingReviews(false);
      return;
    }
    try {
      const res = await apiClient.get('/reviews');
      const productReviews = res.data.filter(r => r.product_id === product.id);
      setReviews(productReviews);
    } catch (e) {
      console.warn("Failed to fetch reviews:", e);
      // Fallback local reviews
      setReviews([
        { id: 1, user_name: "Haji Muhammad Yousaf", rating: 5, text: "Bohut hi behtareen dava hai. Cotton pe spray kia, 2 din me result agya.", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: 2, user_name: "Kamran Khan Jutt", rating: 5, text: "Excellent packing and original formula. Fast delivery from Faisalabad.", created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
        { id: 3, user_name: "Rana Tanveer", rating: 4, text: "Dosage standard rate pe bilkul perfect hai. Achi delivery quality.", created_at: new Date(Date.now() - 8 * 86400000).toISOString() }
      ]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please enter your name and comment text."
      });
      return;
    }
    setSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        product_id: product.id,
        user_name: newReview.name,
        rating: Number(newReview.rating),
        text: newReview.text
      });
      toast({
        title: "Review Submitted",
        description: "Thank you for your valuable feedback."
      });
      setNewReview({ name: '', rating: 5, text: '' });
      fetchReviews();
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not submit review to database."
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Banks integration
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const fetchBanks = async () => {
    if (!isServerOnline()) {
      setBanks([
        { id: 1, bank_name: "JS Bank", account_title: "Vital Agro Chemical Industries (Pvt) Ltd", account_number: "0001092837465", iban: "PK82JSBL00000001092837465", instructions: "Please transfer PKR 299 delivery charges or full payment to JS Bank." },
        { id: 2, bank_name: "Habib Bank Limited (HBL)", account_title: "Vital Agro Chemical Industries (Pvt) Ltd", account_number: "2210887766554", iban: "PK53HABB00002210887766554", instructions: "Standard HBL transfer. Upload screenshot of payment reference." },
        { id: 3, bank_name: "Meezan Bank", account_title: "Vital Agro Chemical Industries", account_number: "03009988776", iban: "PK21MEZN000003009988776", instructions: "Shariah-compliant Meezan Bank transfer." }
      ]);
      setLoadingBanks(false);
      return;
    }
    try {
      const res = await apiClient.get('/banks');
      setBanks(res.data.filter(b => b.status === 'Active'));
    } catch (e) {
      console.warn("Failed to fetch banks list:", e);
      setBanks([
        { id: 1, bank_name: "JS Bank", account_title: "Vital Agro Chemical Industries (Pvt) Ltd", account_number: "0001092837465", iban: "PK82JSBL00000001092837465", instructions: "Please transfer PKR 299 delivery charges or full payment to JS Bank." },
        { id: 2, bank_name: "Habib Bank Limited (HBL)", account_title: "Vital Agro Chemical Industries (Pvt) Ltd", account_number: "2210887766554", iban: "PK53HABB00002210887766554", instructions: "Standard HBL transfer. Upload screenshot of payment reference." },
        { id: 3, bank_name: "Meezan Bank", account_title: "Vital Agro Chemical Industries", account_number: "03009988776", iban: "PK21MEZN000003009988776", instructions: "Shariah-compliant Meezan Bank transfer." }
      ]);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // Checkout Wizard System States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutType, setCheckoutType] = useState('prepaid'); // prepaid or cod
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Checkout Form Details
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    province: 'Punjab',
    city: '',
    address: '',
    postalCode: '',
    location: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);
  const [tid, setTid] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const res = await apiClient.get('/coupons');
      const coupon = res.data.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
      if (coupon) {
        setCouponDiscount(coupon.discount);
        setAppliedCoupon(coupon.code.toUpperCase());
        toast({
          title: "Coupon Applied",
          description: `Applied ${coupon.discount}% discount code successfully.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Coupon",
          description: "This coupon code is invalid or expired."
        });
      }
    } catch (e) {
      console.warn("Coupon check error, falling back locally:", e);
      const localCoupons = [
        { code: "VITAL10", discount: 10 },
        { code: "AZADI78", discount: 15 },
        { code: "KISAAN5", discount: 5 }
      ];
      const coupon = localCoupons.find(c => c.code === couponCode.trim().toUpperCase());
      if (coupon) {
        setCouponDiscount(coupon.discount);
        setAppliedCoupon(coupon.code);
        toast({
          title: "Coupon Applied",
          description: `Applied offline discount coupon of ${coupon.discount}%.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Coupon",
          description: "Coupon code not found."
        });
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async () => {
    if (checkoutType !== 'cod') {
      if (!selectedBank) {
        toast({ variant: "destructive", title: "Missing Bank Selection", description: "Please choose a bank to transfer your payment." });
        return;
      }
      if (!tid) {
        toast({ variant: "destructive", title: "Missing TID Reference", description: "Please enter the Transaction ID reference from your bank transfer slip." });
        return;
      }
      if (!screenshotFile) {
        toast({ variant: "destructive", title: "Missing Receipt Proof", description: "Please select and upload a payment receipt screenshot." });
        return;
      }
    }

    setSubmittingOrder(true);
    try {
      const formData = new FormData();
      formData.append("customerName", checkoutForm.name);
      formData.append("customerPhone", checkoutForm.phone);
      formData.append("customerCity", checkoutForm.city);
      formData.append("customerProvince", checkoutForm.province);
      formData.append("customerPostalCode", checkoutForm.postalCode);
      formData.append("customerAddress", checkoutForm.address);
      formData.append("customerInstructions", `WhatsApp: ${checkoutForm.whatsapp || ""}. Location: ${checkoutForm.location || ""}`);
      formData.append("paymentMethod", checkoutType === 'prepaid' ? 'Prepaid' : 'COD');
      
      const subtotal = unitPrice * quantity;
      const discountVal = (subtotal * couponDiscount) / 100;
      const deliveryFee = checkoutType === 'prepaid' ? 0 : 299;
      const grandTotal = subtotal - discountVal + deliveryFee;
      const advanceAmount = checkoutType === 'prepaid' ? grandTotal : 0;

      formData.append("grandTotal", grandTotal);
      formData.append("paymentTID", checkoutType === 'cod' ? 'COD-PENDING' : tid);
      formData.append("selectedBankIBAN", checkoutType === 'cod' ? 'COD' : (selectedBank?.iban || selectedBank?.account_number || 'N/A'));
      formData.append("advanceAmount", advanceAmount);
      formData.append("productId", product?.id || '');
      formData.append("productName", typeof product?.name === 'object' ? (product.name.en || product.name.ur || '') : (product?.name || ''));
      formData.append("packSize", selectedSize || '');
      formData.append("quantity", quantity);
      formData.append("price", unitPrice);
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      // Call API
      const orderId = await createOrder(formData);
      
      toast({
        title: "Order Submitted",
        description: "Your order details and payment proof are being reviewed."
      });

      // Clear state and close modal
      setIsCheckoutOpen(false);
      
      // Redirect
      navigate(`/order-success/${orderId}`);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Order Submission Failed",
        description: "Could not post order. Please verify connectivity."
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Image hover zoom calculation
  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setZoomPos({ x: pctX, y: pctY });
    setLensPos({ x, y });
  };

  const handleDownload = (type) => {
    toast({
      title: `${type} download started`,
      description: `Downloading ${product?.name?.[lang] || 'product'} ${type.toLowerCase()}.`,
    });
  };

  if (!product) {
    if (catalogLoaded) {
      return (
        <div className="min-h-screen pt-32 bg-[#020502] text-emerald-950 px-4 flex flex-col items-center justify-center text-center gap-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 animate-bounce" />
          <h1 className="text-2xl font-black">Information currently unavailable.</h1>
          <p className="text-neutral-600 text-sm max-w-md leading-relaxed font-semibold">
            {lang === 'en' 
              ? 'The requested product details could not be found. It may have been renamed or is temporarily offline.'
              : 'مصنوعات کی تفصیلات فی الحال دستیاب نہیں ہیں۔ ہو سکتا ہے یہ پروڈکٹ ہٹا دی گئی ہو یا عارضی طور پر آف لائن ہو۔'}
          </p>
          <Link to="/products" className="btn-premium-primary text-xs tracking-wider font-extrabold mt-4">
            {lang === 'en' ? 'Browse Our Catalog' : 'پروڈکٹس دیکھیں'}
          </Link>
        </div>
      );
    }
    return (
      <div className="min-h-screen pt-32 bg-[#020502] text-emerald-950 px-4">
        <div className="max-w-7xl mx-auto space-y-12 select-none">
          {/* Back button skeleton */}
          <Skeleton className="h-6 w-32 rounded-lg" />
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: gallery skeleton */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
              <Skeleton className="w-full max-w-[440px] aspect-square rounded-[32px]" />
              <div className="flex gap-3 justify-center">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-2xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-[440px]">
                <Skeleton className="h-12 rounded-full" />
                <Skeleton className="h-12 rounded-full" />
              </div>
            </div>

            {/* Right Column: details skeleton */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
              <Skeleton className="h-12 w-3/4 rounded-2xl mt-4" />
              <Skeleton className="h-6 w-1/3 rounded-lg mt-2" />
              <Skeleton className="h-32 w-full rounded-[28px] mt-6" />
              
              <div className="flex gap-4 p-4 rounded-2xl bg-white/60 border border-emerald-900/5 mt-6">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-60 rounded" />
                </div>
              </div>

              {/* Checkout cards skeleton */}
              <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-emerald-900/5">
                <div className="bg-white/60 border border-emerald-900/5 rounded-3xl p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
                <div className="bg-white/60 border border-emerald-900/5 rounded-3xl p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Related products slider items
  const related = Object.values(PRODUCTS_DATA)
    .filter(p => p?.id && p?.id !== product?.id && p?.category === product?.category)
    .slice(0, 4);

  // Gallery array
  const galleryImages = [
    { url: getProductImage(product), label: "Premium Showcase" },
    { url: product?.imageUrl || getProductImage(product), label: "Packaging Details" },
    { url: vitalGroup, label: "Vital Certified", isLogo: true },
    { url: tagLogo, label: "Tag Formula", isLogo: true }
  ];

  const activeImage = galleryImages[activeTab]?.url || getProductImage(product);

  // Calculate pricing elements locally for summaries
  const subtotalVal = unitPrice * quantity;
  const couponDiscountVal = (subtotalVal * couponDiscount) / 100;
  
  // Expiry / Warnings default text
  const storageInfo = product.specs?.storage?.[lang] || "Store in cool, dry and dark ventilated spaces. Protect from direct freezing temperatures.";
  const warningInfo = "Agrochemical toxic formulation. Keep completely away from food supplies, grains, cattle feed, and water bodies. Harmful if swallowed or inhaled.";
  const expiryInfo = "36 Months from Date of Formulation (Batch details printed on lid)";

  return (
    <div className="relative min-h-screen bg-[#020502] text-emerald-950 overflow-hidden pt-20 pb-16 select-none font-sans">
      {/* Clean Linear Grid System Background */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '45px 45px',
          backgroundPosition: 'center center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020502]/85 via-[#020502]/60 to-[#020502]/95 pointer-events-none" />
      
      <SEOHead
        title={`${product?.name?.[lang] || product?.name?.en || "Product"} — V3 Premium Agrotech Detail System`}
        description={product?.shortDesc?.[lang] || "V3 details showcase connected to Flask SQL registry."}
      />
      
      {/* Visual Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#76C945]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#76C945]/10 blur-[130px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Main Details layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT SIDE: Premium Card, Zoom Lens and Thumbnails */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
            
            {isMobile && (
              <div className="text-center space-y-3 mb-2 w-full animate-gsap">
                <div className="flex justify-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                    Brand: Vital Agro
                  </span>
                  {product.activeIngredient && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                      {product.activeIngredient}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-none text-emerald-950 font-heading">
                  {product.name?.[lang] || product.name?.en}
                </h1>
                {product.formulation && (
                  <div className="inline-block text-xs font-bold text-emerald-400/90 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 rounded-full">
                    Formulation: {product.formulation}
                  </div>
                )}
              </div>
            )}

            <TiltCard className="relative bg-white/80 border border-emerald-900/10 backdrop-blur-2xl rounded-[32px] p-6 w-full max-w-[440px] aspect-square flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden cursor-crosshair group">
              <div 
                className="relative w-full h-full flex items-center justify-center"
                onMouseMove={handleImageMouseMove}
                onMouseEnter={() => setShowLens(true)}
                onMouseLeave={() => setShowLens(false)}
                onClick={() => setIsZoomed(true)}
              >
                {galleryImages[activeTab]?.isLogo ? (
                  <div className="p-8 bg-white/60 rounded-2xl border border-emerald-900/10 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center w-full h-full">
                    <img
                      src={galleryImages[activeTab]?.url}
                      alt="Logo View"
                      className="max-h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                    />
                    <span className="text-neutral-600 font-bold text-xs uppercase tracking-widest">
                      {galleryImages[activeTab]?.label}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Glowing 3D Glass Pedestal/Platform under the product bottle */}
                    <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[75%] h-[40px] pointer-events-none z-0">
                      {/* Back-glow orb */}
                      <div className="absolute inset-x-0 -top-12 h-32 bg-emerald-500/10 rounded-full blur-[20px] shadow-[0_0_50px_rgba(16,185,129,0.2)]" />
                      {/* Pedestal Top Surface */}
                      <div className="absolute inset-x-0 top-0 h-[16px] rounded-full border border-emerald-400/40 shadow-[inset_0_0_20px_rgba(52,211,153,0.6),0_4px_10px_rgba(0,0,0,0.5)]" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3) 0%, rgba(5,20,10,0.9) 80%)' }} />
                      {/* Pedestal Vertical Body */}
                      <div className="absolute inset-x-0 top-[8px] bottom-0 bg-gradient-to-b from-[#09220d]/90 to-black/80 border-x border-emerald-400/20" />
                      {/* Pedestal Base Ring Glow */}
                      <div className="absolute inset-x-0 bottom-0 h-[12px] rounded-full bg-emerald-500/40 blur-[4px]" />
                      {/* Soft Ambient Shadow under Pedestal */}
                      <div className="absolute inset-x-0 -bottom-2 h-[20px] rounded-full bg-black/60 blur-[6px]" />
                      {/* Dynamic Neon Laser Halo under bottle */}
                      <div className="absolute -top-[10px] left-1/4 right-1/4 h-[8px] rounded-full bg-[#76C945]/30 blur-[4px] border border-[#76C945]/50 animate-pulse" />
                    </div>
                    
                    <BlurUpImage
                      src={activeImage}
                      alt={product.name.en}
                      className="max-h-[250px] w-auto object-contain z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] relative -top-[12px] select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Animated Lens zoom tracking circle */}
                {showLens && !isMobile && !galleryImages[activeTab]?.isLogo && (
                  <div
                    className="absolute pointer-events-none rounded-full border border-[#76C945]/50 shadow-[0_0_20px_rgba(118,201,69,0.5)] bg-[#020502]/40"
                    style={{
                      width: '150px',
                      height: '150px',
                      left: `${lensPos.x - 75}px`,
                      top: `${lensPos.y - 75}px`,
                      backgroundImage: `url(${activeImage})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '250%',
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0 0 25px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.5)'
                    }}
                  />
                )}
              </div>

              {/* Magnify Hint */}
              <div className="absolute bottom-4 right-4 bg-emerald-950/10 p-2.5 rounded-full border border-emerald-900/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-[#76C945]/10 border border-[#76C945]/30 text-emerald-600 text-xs font-black rounded-full uppercase tracking-wider backdrop-blur-md">
                  {CATEGORY_LABELS[lang]?.[product.category] || "Agrotech Formula"}
                </span>
              </div>
            </TiltCard>

            {/* Gallery Thumbnails list */}
            <div className="flex gap-3 justify-center">
              {galleryImages.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(i)}
                  className={`w-16 h-16 rounded-2xl border transition-all overflow-hidden p-1 flex items-center justify-center bg-white/70 backdrop-blur-sm ${
                    activeTab === i ? 'border-emerald-500 bg-white/60 shadow-md shadow-emerald-500/20' : 'border-emerald-900/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Thumbnail"
                    className="max-h-full max-w-full object-contain"
                  />
                </motion.button>
              ))}
            </div>

            {/* Label and PDF Download triggers */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-[440px]">
              <button
                onClick={() => handleDownload('Technical Sheet')}
                className="btn-premium-secondary text-[10px] sm:text-xs tracking-wider gap-2 h-12 min-h-[48px] flex items-center justify-center"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Technical Sheet</span>
              </button>
              <button
                onClick={() => handleDownload('Brochure')}
                className="btn-premium-secondary text-[10px] sm:text-xs tracking-wider gap-2 h-12 min-h-[48px] flex items-center justify-center"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>PDF Brochure</span>
              </button>
            </div>

            {isMobile && (
              <div className="w-full max-w-[440px] pt-4">
                <button
                  onClick={() => setIsMobileSpecsOpen(prev => !prev)}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-97"
                >
                  <span>{isMobileSpecsOpen ? (lang === 'en' ? 'Hide Detailed Specs ▴' : 'تفصیلات بند کریں ▴') : (lang === 'en' ? 'Show Detailed Specs ▾' : 'تفصیلات دیکھیں ▾')}</span>
                </button>
              </div>
            )}

          </div>

          {/* RIGHT SIDE: Product details information display */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Title Block */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Brand: Vital Agro
                </span>
                {product.activeIngredient && (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                    {product.activeIngredient}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-emerald-400">
                {product.name?.[lang] || product.name?.en}
              </h1>
              {product.formulation && (
                <div className="inline-block text-xs font-bold text-emerald-400/90 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 rounded-full">
                  Formulation: {product.formulation}
                </div>
              )}
            </div>

            {/* Dynamic Sizing selector & Pricing display */}
            <div className="space-y-6 w-full animate-gsap">
              <div className="bg-white/80 border border-emerald-900/10 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl relative">
                
                {/* Size Pill Buttons */}
                {sizesList?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs text-neutral-500 block font-black uppercase tracking-wider">
                      {lang === 'en' ? 'Select Pack Size' : 'پیکنگ سائز منتخب کریں'}
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {sizesList.map((sz, idx) => {
                        const szName = typeof sz === 'object' ? sz.size : sz;
                        const active = selectedSize === szName;
                        return (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedSize(szName)}
                            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all duration-300 ${
                              active
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/10'
                                : 'bg-white/60 text-neutral-600 border-emerald-900/5 hover:bg-white/80 hover:border-emerald-900/10'
                            }`}
                          >
                            {szName}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dynamic PricesDisplay */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-t border-emerald-900/5 pt-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-[9px] font-black text-emerald-400 font-mono tracking-widest uppercase">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      Real DB Rates Matrix Connected
                    </div>
                    
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-950">
                        {unitPrice === 0 ? "On Request" : `PKR ${unitPrice || 0}`}
                      </span>
                      {originalPrice > 0 && originalPrice > unitPrice && unitPrice !== 0 && (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-neutral-400 text-sm">
                            PKR {originalPrice}
                          </span>
                          <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-black rounded-md uppercase">
                            Save {Math.round((1 - (unitPrice || 0) / originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Delivery, SKU, availability status indicators */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 font-semibold">
                      <span>SKU: <span className="text-neutral-600 font-bold">{sku}</span></span>
                      {weight && <span>Weight: <span className="text-neutral-600 font-bold">{weight}</span></span>}
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus === 'In Stock' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400 animate-pulse'}`} />
                        <span className={stockStatus === 'In Stock' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {stockStatus === 'In Stock' ? 'In Stock' : 'Low Stock'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Quantity Adjuster */}
                  <div className="flex items-center gap-3 bg-white/60 rounded-2xl border border-emerald-900/10 px-3 py-2 h-max w-max">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white/80 flex items-center justify-center font-bold text-emerald-950 text-base transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black text-emerald-950 font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white/80 flex items-center justify-center font-bold text-emerald-950 text-base transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="flex gap-4 p-4 rounded-2xl bg-white/70 border border-emerald-900/5 text-xs text-neutral-500">
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-neutral-600 font-extrabold block">Shipped via TCS Express Service</span>
                    <span>Estimated Delivery Time: 2 - 3 Business Days.</span>
                  </div>
                </div>

              </div>

              {/* CONTINUE TO CHECKOUT BUTTON */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const sizeOption = product.sizes?.find(
                      s => (typeof s === 'object' ? s.size : s) === selectedSize
                    );
                    if (sizeOption) {
                      addToCart(product, sizeOption, quantity);
                      setIsCartOpen(false);
                    }
                    navigate('/checkout');
                  }}
                  className="w-full h-14 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-emerald-950 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-[0_8px_30px_rgba(34,197,94,0.30)]"
                >
                  <span>{lang === 'en' ? 'Continue to Checkout →' : 'خریداری کے لیے آگے بڑھیں ←'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 2. DESCRIPTION, TECHNICAL DETAILS, CROPS, DOSAGE TABLES */}
        {(!isMobile || isMobileSpecsOpen) && (
          <>
            <div className="grid lg:grid-cols-3 gap-12 pt-10 border-t border-emerald-900/5 items-start">
          
          {/* Main info text block */}
          <div className="lg:col-span-2 space-y-12">
            
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl text-left">
              <h2 className="text-2xl font-black text-emerald-950 mb-5 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                Product Description
              </h2>
              <p className="text-neutral-600 text-base leading-relaxed whitespace-pre-line">
                {(product.description?.[lang] || product.description?.en) || (lang === 'en' ? 'No information available' : 'کوئی معلومات دستیاب نہیں ہے')}
              </p>
            </section>

            {/* Features lists grid */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl text-left">
              <h2 className="text-2xl font-black text-emerald-950 mb-6 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Key Features
              </h2>
              {product.features?.[lang] && product.features[lang].length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.features[lang].map((feat, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-white/70 border border-emerald-900/5 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        {FEATURE_ICONS[idx % FEATURE_ICONS.length]}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">{feat}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-xs font-sans italic">{lang === 'en' ? 'No information available' : 'کوئی معلومات دستیاب نہیں ہے'}</p>
              )}
            </section>

            {/* Benefits checks */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl text-left">
              <h2 className="text-2xl font-black text-emerald-950 mb-6 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Key Benefits
              </h2>
              {product.benefits?.[lang] && product.benefits[lang].length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {product.benefits[lang].map((ben, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/70 border border-emerald-900/5 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-700">{ben}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-xs font-sans italic">{lang === 'en' ? 'No information available' : 'کوئی معلومات دستیاب نہیں ہے'}</p>
              )}
            </section>

            {/* Crops info pills */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl text-left">
              <h2 className="text-2xl font-black text-emerald-950 mb-6 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Target Crops
              </h2>
              {product.crops && product.crops.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {product.crops.map((crop, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2.5 px-4.5 py-2.5 bg-white/70 border border-emerald-900/5 rounded-full text-sm font-semibold cursor-default"
                    >
                      <span className="text-lg">{crop.icon || "🌱"}</span>
                      <span>{crop.name?.[lang] || crop.name?.en}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-xs font-sans italic">{lang === 'en' ? 'No information available' : 'کوئی معلومات دستیاب نہیں ہے'}</p>
              )}
            </section>

            {/* Dosages specification table */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] overflow-hidden text-left">
              <h2 className="text-2xl font-black text-emerald-950 mb-6 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Recommended Dosage & Timing
              </h2>
              {product.dosageTable && product.dosageTable.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="bg-emerald-950/80 text-emerald-950 text-xs border-b border-emerald-900/10">
                        <th className="p-4 font-bold">{lang === 'en' ? 'Crop' : 'فصل'}</th>
                        <th className="p-4 font-bold">{lang === 'en' ? 'Dosage' : 'خوراک'}</th>
                        <th className="p-4 font-bold">{lang === 'en' ? 'Water' : 'پانی'}</th>
                        <th className="p-4 font-bold">{lang === 'en' ? 'Timing' : 'وقت'}</th>
                        <th className="p-4 font-bold">{lang === 'en' ? 'Frequency' : 'تعداد'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-neutral-600 bg-white/60">
                      {product.dosageTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/70 transition-colors">
                          <td className="p-4 font-extrabold text-emerald-950">{row.crop?.[lang] || row.crop?.en}</td>
                          <td className="p-4 font-bold text-emerald-400">{row.dosage?.[lang] || row.dosage?.en}</td>
                          <td className="p-4 text-amber-400 font-medium">{row.water?.[lang] || row.water?.en}</td>
                          <td className="p-4">{row.timing?.[lang] || row.timing?.en}</td>
                          <td className="p-4 text-emerald-400 font-bold">{row.frequency?.[lang] || row.frequency?.en}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs font-sans italic">{lang === 'en' ? 'No information available' : 'کوئی معلومات دستیاب نہیں ہے'}</p>
              )}
            </section>


            {/* TECHNICAL DETAILS SPECIFICATIONS */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl">
              <h2 className="text-2xl font-black text-emerald-950 mb-6 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Technical Specifications
              </h2>
              <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Brand:</span>
                  <span className="text-neutral-700 font-black">Vital Agro</span>
                </div>
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Active Ingredient:</span>
                  <span className="text-neutral-700 font-black text-right max-w-[200px] truncate">
                    {product.activeIngredient || product.genericName?.en || "Organic Booster"}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Product Code:</span>
                  <span className="text-neutral-700 font-black">{sku}</span>
                </div>
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Manufacturing Company:</span>
                  <span className="text-neutral-700 font-black text-right">Vital Agro Chemical Industries</span>
                </div>
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Expiry details:</span>
                  <span className="text-neutral-700 font-black text-right">{expiryInfo}</span>
                </div>
                <div className="flex justify-between p-4 bg-white/70 border border-emerald-900/5 rounded-xl">
                  <span className="text-neutral-500 font-bold">Product Category:</span>
                  <span className="text-neutral-700 font-black text-right capitalize">
                    {CATEGORY_LABELS[lang]?.[product.category] || product.category}
                  </span>
                </div>
              </div>
            </section>

            {/* Safety details alert warning cards */}
            <section className="bg-rose-950/10 border border-rose-500/25 p-8 rounded-[28px] space-y-5 text-left">
              <h2 className="text-2xl font-black text-rose-400 pb-3 border-b border-rose-500/10 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Safety Information
              </h2>
              {product.safety?.[lang] && product.safety[lang].length > 0 ? (
                <div className="grid gap-3.5 text-xs text-rose-300">
                  {product.safety[lang].map((rule, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="mt-0.5 shrink-0 p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/25">
                        {SAFETY_ICONS[idx % SAFETY_ICONS.length]}
                      </div>
                      <p className="font-semibold leading-relaxed">{rule}</p>
                    </div>
                  ))}
                  <div className="flex gap-3 items-start border-t border-rose-500/10 pt-4 mt-2">
                    <div className="mt-0.5 shrink-0 p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/25">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block text-neutral-700 uppercase tracking-widest text-[9px]">Storage Guideline</span>
                      <p className="leading-relaxed text-neutral-600 font-semibold">{storageInfo}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start border-t border-rose-500/10 pt-4">
                    <div className="mt-0.5 shrink-0 p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/25">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block text-neutral-700 uppercase tracking-widest text-[9px]">Warning Instruction</span>
                      <p className="leading-relaxed text-neutral-600 font-semibold">{warningInfo}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-rose-300/60 text-xs font-sans italic">{lang === 'en' ? 'No safety hazards or special guidelines available' : 'کوئی حفاظتی ہدایات دستیاب نہیں ہیں'}</p>
              )}
            </section>


            {/* DYNAMIC DATABASE CUSTOMER REVIEWS */}
            <section className="bg-white/60 border border-emerald-900/5 p-8 rounded-[28px] backdrop-blur-2xl space-y-8">
              <h2 className="text-2xl font-black text-emerald-950 pb-3 border-b border-emerald-900/5 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Customer Reviews
              </h2>
              
              {/* Write Review Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 p-5 rounded-2xl bg-white/70 border border-emerald-900/5">
                <h3 className="text-sm font-black text-neutral-700 uppercase tracking-wider">Submit Your Product Feedback</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salmaan Jutt"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/10 bg-white/60 text-sm focus:ring-1 focus:ring-emerald-500 text-emerald-950 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Rating (1 to 5 Stars)</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/10 bg-white/60 text-sm focus:ring-1 focus:ring-emerald-500 text-emerald-950"
                    >
                      <option value="5" className="bg-[#020502]">5 Stars (Excellent)</option>
                      <option value="4" className="bg-[#020502]">4 Stars (Good)</option>
                      <option value="3" className="bg-[#020502]">3 Stars (Average)</option>
                      <option value="2" className="bg-[#020502]">2 Stars (Poor)</option>
                      <option value="1" className="bg-[#020502]">1 Star (Terrible)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Your Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe crop results and effectiveness..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/10 bg-white/60 text-sm focus:ring-1 focus:ring-emerald-500 text-emerald-950 placeholder-white/20"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#020502] text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                  <Send className="w-3 h-3" />
                </motion.button>
              </form>

              {/* Reviews lists */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <p className="text-xs text-neutral-500 italic">Syncing product reviews database ledger...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No customer reviews posted yet. Be the first to share your experience!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-white/70 border border-emerald-900/5 space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-neutral-700">{rev.user_name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, starIdx) => (
                            <span key={starIdx} className="text-xs font-bold">
                              {starIdx < rev.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-semibold">
                        {rev.text}
                      </p>
                      <span className="block text-[9px] text-neutral-400 font-bold">
                        {new Date(rev.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* RIGHT SIDE FAQ ACCORDION BAR */}
          <div className="space-y-6">
            
            <section className="bg-white/60 border border-emerald-900/5 p-6 rounded-[28px] space-y-4">
              <h2 className="text-lg font-black text-emerald-950 pb-2 border-b border-emerald-900/5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {([
                  { q: "How should I store this product?", a: storageInfo },
                  { q: "What is the shelf life?", a: expiryInfo },
                  { q: "Is it compatible with other sprays?", a: "Yes, it is generally compatible with most standard chemical compounds. Always do a small jar check first." }
                ]).map((faq, idx) => {
                  const open = openFaq === idx;
                  return (
                    <div key={idx} className="border border-emerald-900/5 rounded-xl bg-white/60 overflow-hidden transition-all">
                      <button
                        onClick={() => setOpenFaq(open ? null : idx)}
                        className="w-full flex justify-between items-center p-4 text-left text-xs font-black text-emerald-950 hover:bg-white/60 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <span className="text-emerald-400 font-extrabold">{open ? '−' : '+'}</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="p-4 pt-0 text-[11px] text-neutral-600 leading-relaxed whitespace-pre-line border-t border-emerald-900/5 bg-[#020502]/50 font-medium">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Certified Branding block */}
            <div className="bg-[#020d04] border border-emerald-500/20 p-6 rounded-[28px] text-center space-y-5 shadow-xl">
              <img
                src={vitalAgroLogo}
                alt="Logo"
                className="max-h-12 mx-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              />
              <div>
                <span className="text-xs font-black text-emerald-400 block tracking-wider uppercase">
                  Vital Agro Chemicals
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5 leading-tight font-bold">
                  Bayer, Syngenta & BASF Grade Formulations
                </span>
              </div>

              {/* Social Media Links V3 */}
              <div className="border-t border-emerald-500/10 pt-4 space-y-2">
                <span className="text-[9px] text-neutral-500 block font-bold uppercase tracking-wider">Connect With Us</span>
                <div className="flex justify-center gap-3 text-neutral-600">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/70 border border-emerald-900/5 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 3. RELATED PRODUCTS SLIDER */}
        {related.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-emerald-900/5">
            <h2 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Related Crop Protection Solutions
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
              {related.map((p) => {
                const pNameUr = p.name?.ur || '';
                const pNameEn = p.name?.en || p.name || '';
                const firstSize = p.sizes?.[0];
                const pPrice = firstSize ? (firstSize.price === 0 ? 0 : Math.round(firstSize.price)) : Math.round(p.price || 999);
                const pDesc = p.shortDesc?.[lang] || p.shortDesc?.en || p.tagline || "";

                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    className="group block min-w-[240px] sm:min-w-[280px] p-5 premium-glass-card rounded-2xl"
                  >
                    {/* Image Showcase */}
                    <div className="relative aspect-[4/3] w-full flex items-center justify-center p-4 bg-white/60 rounded-xl mb-4 overflow-hidden border border-emerald-900/5">
                      {/* Glow orb */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_60%)] pointer-events-none" />
                      
                      {/* Float img */}
                      <div className="relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={getProductImage(p)}
                          alt={pNameEn}
                          className="max-h-28 w-auto max-w-full object-contain"
                          style={{
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))'
                          }}
                          loading="lazy"
                        />
                      </div>

                      {/* Reflection */}
                      <div
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[55%] h-8 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          transform: 'rotateX(180deg) translateY(-4px) scaleY(0.6)',
                          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)',
                          filter: 'blur(1px)'
                        }}
                      >
                        <img src={getProductImage(p)} alt="" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* Content details */}
                    <div className="space-y-3 mt-3 text-center">
                      {/* 1. Urdu Name */}
                      {pNameUr && (lang === 'ur' || lang === 'pb') && (
                        <h3 className="text-emerald-400 font-extrabold text-base sm:text-lg leading-normal min-h-[1.5rem]" style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }} dir="rtl">
                          {pNameUr}
                        </h3>
                      )}
                      
                      {/* 2. English Name */}
                      <h4 className="font-bold text-xs sm:text-sm text-emerald-950 group-hover:text-emerald-400 transition-colors truncate">
                        {pNameEn}
                      </h4>

                      {/* 3. Ingredient badge */}
                      <div className="flex justify-center">
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-300/80 bg-emerald-950/50 border border-emerald-500/15 px-2 py-0.5 rounded-md tracking-wider inline-block truncate max-w-full">
                          {p.activeIngredient || 'BIOTECH FORMULA'}
                        </span>
                      </div>

                      {/* 4. Short Description */}
                      <p className="text-[10px] text-neutral-500 leading-normal line-clamp-2 h-[28px] overflow-hidden px-1">
                        {pDesc}
                      </p>

                      {/* 5. Price */}
                      <div className="pt-2 border-t border-emerald-900/5 font-mono">
                        <span className="text-emerald-400 font-bold text-xs sm:text-sm">
                          {pPrice === 0 ? 'On Request' : `₨ ${pPrice.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
          </>
        )}

        {isMobile && isMobileSpecsOpen && (
          <div className="w-full pt-4">
            <button
              onClick={() => {
                setIsMobileSpecsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full h-14 bg-white/60 hover:bg-white/80 text-neutral-700 border border-emerald-900/10 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>{lang === 'en' ? 'Hide Specifications ▴' : 'معلومات بند کریں ▴'}</span>
            </button>
          </div>
        )}

        {/* PREVIOUS / NEXT SEQUENTIAL NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 border border-emerald-900/5 rounded-[24px] p-5 sm:p-6 backdrop-blur-xl mt-12 select-none">
          {prevProduct && (
            <Link
              to={`/products/${prevProduct.slug || prevProduct.id}`}
              className="flex items-center gap-3 group text-left w-full sm:w-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-white/60 border border-emerald-900/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex items-center justify-center text-emerald-950 group-hover:text-emerald-400 transition-all shrink-0">
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-widest">Previous Product</span>
                <span className="text-xs font-black text-emerald-950 group-hover:text-emerald-400 transition-colors line-clamp-1 max-w-[150px]">
                  {typeof prevProduct.name === 'object' ? prevProduct.name.en : prevProduct.name}
                </span>
              </div>
            </Link>
          )}

          <Link
            to="/products"
            className="px-5 py-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-emerald-900/10 text-xs font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-all text-center"
          >
            Back to Catalog
          </Link>

          {nextProduct && (
            <Link
              to={`/products/${nextProduct.slug || nextProduct.id}`}
              className="flex items-center gap-3 group text-right w-full sm:w-auto justify-end sm:justify-start"
            >
              <div className="order-2 sm:order-1">
                <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-widest">Next Product</span>
                <span className="text-xs font-black text-emerald-950 group-hover:text-emerald-400 transition-colors line-clamp-1 max-w-[150px]">
                  {typeof nextProduct.name === 'object' ? nextProduct.name.en : nextProduct.name}
                </span>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 rounded-xl bg-white/60 border border-emerald-900/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex items-center justify-center text-emerald-950 group-hover:text-emerald-400 transition-all shrink-0">
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )}
        </div>

      </div>

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {createPortal(
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomed(false)}
              className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage}
                  alt="Zoomed Product View"
                  className="max-w-full max-h-[75vh] object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                />
                <span className="text-neutral-700 font-black text-sm text-center bg-white/80 px-4 py-2 rounded-full border border-emerald-900/20">
                  {product.name?.[lang] || product.name?.en}
                </span>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="absolute top-4 right-4 text-emerald-950 hover:text-emerald-400 font-black text-xl bg-white/80 rounded-full w-8 h-8 flex items-center justify-center border border-emerald-900/20"
                >
                  ×
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}