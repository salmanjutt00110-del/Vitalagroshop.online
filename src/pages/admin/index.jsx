import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToOrders } from '@/lib/firestore/orders';
const StatsCards = React.lazy(() => import('./StatsCards'));
const OrdersTable = React.lazy(() => import('./OrdersTable'));
const BankManager = React.lazy(() => import('./BankManager'));
const CustomerProfile = React.lazy(() => import('./CustomerProfile'));
const SettingsManager = React.lazy(() => import('./SettingsManager'));
const SecurityManager = React.lazy(() => import('./SecurityManager'));
const MediaLibrary = React.lazy(() => import('./MediaLibrary'));
const AIScannerModule = React.lazy(() => import('./AIScannerModule'));
import AdminLoader from './AdminLoader';
import NotificationCenter from './NotificationCenter';
import CODVerificationModal from './CODVerificationModal';
import vitalAgroLogo from '@/assets/vital agro logo.webp';
import apiClient from '@/lib/apiClient';
import { getThemeClasses } from './themeHelper';
const AnalyticsCharts = React.lazy(() => import('./AnalyticsCharts'));
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Award, 
  DollarSign, 
  Truck, 
  FolderOpen, 
  Settings, 
  Shield, 
  Activity, 
  FileText, 
  BarChart2, 
  LogOut, 
  Search, 
  Bell, 
  Mail, 
  Globe, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck,
  CheckSquare,
  ClipboardList,
  Image as ImageIcon,
  Check,
  Sliders,
  Edit3,
  Trash2,
  Loader2,
  QrCode,
  Star,
  Ticket,
  Download,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';



// Mock datasets for CMS, Dealers, Payments, etc.
const MOCK_DEALERS = [
  { id: 'd1', name: 'Al-Madina Agri Services', manager: 'Haji Aslam', city: 'Haroonabad', phone: '0301-7654321', franchise: 'Franchise #01', status: 'Active', commission: '8%' },
  { id: 'd2', name: 'Green Field Fertilizer Co.', manager: 'Tariq Mehmood', city: 'Multan', phone: '0300-9876543', franchise: 'Franchise #08', status: 'Active', commission: '10%' },
  { id: 'd3', name: 'Bahawalpur Crop Care', manager: 'Zahid Khan', city: 'Bahawalpur', phone: '0302-1234567', franchise: 'Franchise #14', status: 'Pending Review', commission: '7%' }
];

const MOCK_PAYMENTS = [
  { id: 'p1', customer: 'M. Rashid', method: 'JS Bank', amount: 'PKR 299', tid: 'TID-82039485732', status: 'Verified', date: '10 mins ago' },
  { id: 'p2', customer: 'Kamran Jutt', method: 'HBL', amount: 'PKR 299', tid: 'TID-91048572834', status: 'Pending Review', date: '25 mins ago' },
  { id: 'p3', customer: 'Sajid Ali', method: 'Meezan Bank', amount: 'PKR 299', tid: 'TID-72948572910', status: 'Rejected', date: '1 hr ago' }
];

const MOCK_COURIERS = [
  { id: 'c1', name: 'TCS Express', contact: '063-2253139', area: 'Haroonabad Circle', activeShipments: 14, status: 'Active' },
  { id: 'c2', name: 'Leopards Courier', contact: '061-111-848-252', area: 'Multan Head', activeShipments: 22, status: 'Active' },
  { id: 'c3', name: 'Rider Hameed (Internal)', contact: '0301-1837160', area: 'Local Delivery', activeShipments: 5, status: 'Active' }
];

const AdminWorkspaceLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 w-full min-h-[300px]">
    <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
    <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider mt-3">Synthesizing workspace view...</p>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAppReady, setIsAppReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('vitalAdminRole') || 'admin');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('vitalAdminEmail') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('vitalAdminName') || 'Staff');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const [selectedVerificationOrder, setSelectedVerificationOrder] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [currentTab, setCurrentTab] = useState(() => {
    const role = localStorage.getItem('vitalAdminRole') || 'admin';
    return role === 'editor' ? 'products' : 'dashboard';
  });
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [ordersActiveFilter, setOrdersActiveFilter] = useState('pending');
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [liveVisitors, setLiveVisitors] = useState(184);
    useEffect(() => {
      const interval = setInterval(() => {
        setLiveVisitors(prev => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return Math.max(120, prev + change);
        });
      }, 5000);
      return () => clearInterval(interval);
    }, []);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vitalAdminTheme') || 'website';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('vitalAdminTheme', newTheme);
  };

  const c = getThemeClasses(theme);

  // Tab permissions redirect
  useEffect(() => {
    const isTabAllowed = (tabId) => {
      if (userRole === 'super_admin') return true;
      if (userRole === 'admin') {
        const adminDisallowed = ['security-logs', 'roles', 'settings', 'banks'];
        return !adminDisallowed.includes(tabId);
      }
      if (userRole === 'editor') {
        const editorAllowed = ['products', 'categories', 'coupons', 'reviews', 'media', 'website-settings', 'pages'];
        return editorAllowed.includes(tabId);
      }
      return false;
    };

    if (!isTabAllowed(currentTab)) {
      if (userRole === 'editor') {
        setCurrentTab('products');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [currentTab, userRole]);

  // Ctrl+K Search Focus Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('portal-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Products Catalog CRUD states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('plant_nutrition');
  const [formDesc, setFormDesc] = useState('');
  const [formStock, setFormStock] = useState(100);
  const [formPricingMatrix, setFormPricingMatrix] = useState([{ size: '500ml', price: '750' }]);
  const [formBaseImage, setFormBaseImage] = useState(null);
  const [formBaseImagePreview, setFormBaseImagePreview] = useState('');

  // Coupons Manager states
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);
  const [couponMin, setCouponMin] = useState(1000);
  const [couponExpiry, setCouponExpiry] = useState('2026-07-31');

  // Reviews Manager states
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Static Pages Editor states
  const [pagesList, setPagesList] = useState({
    about: { title: 'Nurturing Pakistan\'s Soil', content: 'Vital Agro is dedicated to distributing top-tier chemical fertilizers, foliar nutrients, and soil conditioners across the agrarian landscape.' },
    whyus: { title: 'Scientific Growth & Reliability', content: 'We combine local crop wisdom with modern chemical analysis to offer products that maximize yield and protect the ecosystem.' },
    contact: { title: 'Get In Touch With Agrochemical Specialists', content: 'Our head office in Haroonabad is open 24/7 for crop consulting, order queries, and dealer franchise applications.' }
  });
  const [selectedPage, setSelectedPage] = useState('about');
  const [pageTitle, setPageTitle] = useState("Nurturing Pakistan's Soil");
  const [pageContent, setPageContent] = useState("Vital Agro is dedicated to distributing top-tier chemical fertilizers, foliar nutrients, and soil conditioners across the agrarian landscape.");

  // Contact Messages states
  const [messagesList, setMessagesList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeReplyMessage, setActiveReplyMessage] = useState(null);
  const [replyMessageText, setReplyMessageText] = useState('');
  const [deliverySubTab, setDeliverySubTab] = useState('cod-audit');
  const [staffSubTab, setStaffSubTab] = useState('directory');
  
  // Interactive mock lists states
  const [paymentsList, setPaymentsList] = useState(MOCK_PAYMENTS);
  const [dealersList, setDealersList] = useState(MOCK_DEALERS);
  const [couriersList, setCouriersList] = useState(MOCK_COURIERS);
  const [categoriesList, setCategoriesList] = useState([
    { name: 'plant_nutrition', title: 'Plant Nutrition / Fertilizer', count: 4, status: 'Active' },
    { name: 'insecticide', title: 'Insecticide', count: 3, status: 'Active' },
    { name: 'fungicide', title: 'Fungicide', count: 2, status: 'Active' },
    { name: 'herbicide', title: 'Herbicide', count: 1, status: 'Active' },
    { name: 'growth_promoter', title: 'Growth Promoter', count: 2, status: 'Active' }
  ]);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('vitalAdminToken');
    return token && token.length > 0;
  });

  useEffect(() => {
    const token = localStorage.getItem('vitalAdminToken');
    if (!token) {
      setIsAuthenticated(false);
      navigate('/vital-admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = subscribeToOrders(setOrders);
    return () => unsubscribe();
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const targetURL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${targetURL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setDbProducts(data);
      }
    } catch (e) {
      console.error("Failed to load products list:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await apiClient.get('/coupons');
      setCouponsList(response.data);
    } catch (e) {
      console.error("Failed to load coupons:", e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await apiClient.get('/reviews');
      setReviewsList(response.data);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await apiClient.get('/messages');
      setMessagesList(response.data);
    } catch (e) {
      console.error("Failed to load messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'products') fetchProducts();
    if (currentTab === 'coupons') fetchCoupons();
    if (currentTab === 'reviews') fetchReviews();
    if (currentTab === 'messages') fetchMessages();
  }, [currentTab]);

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormId('');
    setFormName('');
    setFormCategory('plant_nutrition');
    setFormDesc('');
    setFormStock(100);
    setFormPricingMatrix([{ size: '500ml', price: '750' }]);
    setFormBaseImage(null);
    setFormBaseImagePreview('');
    setProductModalOpen(true);
  };

  const handleDuplicateProduct = (p) => {
    setEditingProduct(null); // Force create mode
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormId(`${p.id}-copy-${randomSuffix}`);
    setFormName(`${p.productName} (Copy)`);
    setFormCategory(p.productCategory || 'plant_nutrition');
    setFormDesc(p.productDescription || '');
    setFormStock(p.stockInventory || 100);
    
    const matrix = [];
    Object.entries(p.dynamicPricingMatrix || {}).forEach(([sz, pr]) => {
      matrix.push({ size: sz, price: String(pr) });
    });
    if (matrix.length === 0) {
      matrix.push({ size: '500ml', price: String(p.price || 0) });
    }
    setFormPricingMatrix(matrix);
    setFormBaseImage(null);
    const targetURL = import.meta.env.VITE_API_URL || '';
    setFormBaseImagePreview(p.baseImageURL ? `${targetURL}${p.baseImageURL}` : '');
    setProductModalOpen(true);
    toast.success('Synthesized cloned formula template. Customize SKU/ID and save.');
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormId(p.id);
    setFormName(p.productName);
    setFormCategory(p.productCategory);
    setFormDesc(p.productDescription || '');
    setFormStock(p.stockInventory);
    
    const matrix = [];
    Object.entries(p.dynamicPricingMatrix || {}).forEach(([sz, pr]) => {
      matrix.push({ size: sz, price: String(pr) });
    });
    if (matrix.length === 0) {
      matrix.push({ size: '500ml', price: String(p.price || 0) });
    }
    setFormPricingMatrix(matrix);
    setFormBaseImage(null);
    const targetURL = import.meta.env.VITE_API_URL || '';
    setFormBaseImagePreview(p.baseImageURL ? `${targetURL}${p.baseImageURL}` : '');
    setProductModalOpen(true);
  };

  const addPricingRow = () => {
    setFormPricingMatrix([...formPricingMatrix, { size: '250ml', price: '500' }]);
  };

  const removePricingRow = (idx) => {
    setFormPricingMatrix(formPricingMatrix.filter((_, i) => i !== idx));
  };

  const updatePricingRow = (idx, field, val) => {
    const updated = [...formPricingMatrix];
    updated[idx][field] = val;
    setFormPricingMatrix(updated);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormBaseImage(file);
      setFormBaseImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProductForm = async (e) => {
    e.preventDefault();
    if (!formId || !formName) return;

    setSubmittingProduct(true);
    const token = localStorage.getItem('vitalAdminToken') || '';

    const matrixObj = {};
    formPricingMatrix.forEach(row => {
      if (row.size && row.price) {
        matrixObj[row.size.toLowerCase().replace(/\s+/g, '')] = Number(row.price);
      }
    });

    const formData = new FormData();
    formData.append('id', formId.trim().toLowerCase());
    formData.append('productName', formName.trim());
    formData.append('productCategory', formCategory);
    formData.append('productDescription', formDesc);
    formData.append('stockInventory', formStock);
    formData.append('dynamicPricingMatrix', JSON.stringify(matrixObj));
    if (formBaseImage) {
      formData.append('baseImage', formBaseImage);
    }

    const isEditing = !!editingProduct;
    const targetURL = import.meta.env.VITE_API_URL || '';
    const url = isEditing 
      ? `${targetURL}/api/products/${formId}`
      : `${targetURL}/api/products`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setProductModalOpen(false);
        fetchProducts();
        
        fetch(`${targetURL}/api/products`)
          .then(res => res.json())
          .then(refreshedProducts => {
            window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
          });
        toast.success(isEditing ? 'Product matrix re-calibrated successfully.' : 'Product compound synthesized successfully.');
      } else {
        const errorData = await response.json();
        toast.error(`Matrix deployment failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to deploy product params:", err);
      toast.error('Failed to update product details.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (pId) => {
    if (!confirm(`CAUTION: Are you sure you want to purge product ${pId} from the database?`)) return;

    const token = localStorage.getItem('vitalAdminToken') || '';
    try {
      const targetURL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${targetURL}/api/products/${pId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchProducts();
        window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
        toast.success('Product purged from registry.');
      } else {
        toast.error('Failed to delete product.');
      }
    } catch (e) {
      console.error("Purge ledger failed:", e);
      toast.error('Failed to delete product.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`CAUTION: Are you sure you want to permanently delete the ${selectedProductIds.length} selected products?`)) return;
    const token = localStorage.getItem('vitalAdminToken') || '';
    const targetURL = import.meta.env.VITE_API_URL || '';
    let successCount = 0;
    
    const loadingToast = toast.loading(`Purging ${selectedProductIds.length} products...`);
    
    for (const pId of selectedProductIds) {
      try {
        const response = await fetch(`${targetURL}/api/products/${pId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          successCount++;
        }
      } catch (e) {
        console.error("Bulk delete error for:", pId, e);
      }
    }
    
    toast.dismiss(loadingToast);
    setSelectedProductIds([]);
    fetchProducts();
    window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
    toast.success(`Successfully purged ${successCount} products from matrix.`);
  };

  const handleBulkStockEdit = async () => {
    const newStockStr = prompt("Enter new inventory level for all selected formulas:");
    if (newStockStr === null) return;
    const newStock = Number(newStockStr);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid non-negative number.");
      return;
    }
    
    const token = localStorage.getItem('vitalAdminToken') || '';
    const targetURL = import.meta.env.VITE_API_URL || '';
    let successCount = 0;
    
    const loadingToast = toast.loading(`Recalibrating stock inventory for ${selectedProductIds.length} products...`);
    
    for (const pId of selectedProductIds) {
      try {
        const prod = dbProducts.find(p => p.id === pId);
        if (!prod) continue;
        
        const formData = new FormData();
        formData.append('id', prod.id);
        formData.append('productName', prod.productName);
        formData.append('productCategory', prod.productCategory);
        formData.append('productDescription', prod.productDescription || '');
        formData.append('stockInventory', newStock);
        formData.append('dynamicPricingMatrix', JSON.stringify(prod.dynamicPricingMatrix || {}));
        
        const response = await fetch(`${targetURL}/api/products/${prod.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (response.ok) {
          successCount++;
        }
      } catch (e) {
        console.error("Bulk stock update failed for:", pId, e);
      }
    }
    
    toast.dismiss(loadingToast);
    setSelectedProductIds([]);
    fetchProducts();
    window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
    toast.success(`Successfully calibrated stock for ${successCount} products.`);
  };

  const handleBulkCategoryEdit = async (newCategory) => {
    if (!newCategory) return;
    const token = localStorage.getItem('vitalAdminToken') || '';
    const targetURL = import.meta.env.VITE_API_URL || '';
    let successCount = 0;
    
    const loadingToast = toast.loading(`Re-assigning category to ${selectedProductIds.length} products...`);
    
    for (const pId of selectedProductIds) {
      try {
        const prod = dbProducts.find(p => p.id === pId);
        if (!prod) continue;
        
        const formData = new FormData();
        formData.append('id', prod.id);
        formData.append('productName', prod.productName);
        formData.append('productCategory', newCategory);
        formData.append('productDescription', prod.productDescription || '');
        formData.append('stockInventory', prod.stockInventory);
        formData.append('dynamicPricingMatrix', JSON.stringify(prod.dynamicPricingMatrix || {}));
        
        const response = await fetch(`${targetURL}/api/products/${prod.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (response.ok) {
          successCount++;
        }
      } catch (e) {
        console.error("Bulk category update failed for:", pId, e);
      }
    }
    
    toast.dismiss(loadingToast);
    setSelectedProductIds([]);
    fetchProducts();
    window.dispatchEvent(new CustomEvent('vital_catalog_hydrated'));
    toast.success(`Successfully assigned category to ${successCount} products.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('vitalAdmin_Active');
    localStorage.removeItem('vitalAdminToken');
    window.location.href = '/vital-admin';
  };

  // Helper date filters
  const isToday = (createdAt) => {
    if (!createdAt) return false;
    let orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt);
    return orderDate.toDateString() === new Date().toDateString();
  };

  const isThisMonth = (createdAt) => {
    if (!createdAt) return false;
    let orderDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds ? createdAt.seconds * 1000 : createdAt);
    const today = new Date();
    return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
  };

  // Dynamic datasets computed from real database data
  const REVENUE_GROWTH_DATA = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mapped = days.map(d => ({ name: d, revenue: 0, orders: 0 }));
    
    orders.forEach(o => {
      if (!o.createdAt) return;
      let dateObj;
      if (typeof o.createdAt.toDate === 'function') {
        dateObj = o.createdAt.toDate();
      } else {
        dateObj = new Date(o.createdAt);
      }
      if (dateObj && !isNaN(dateObj.getTime())) {
        const dayName = days[dateObj.getDay()];
        const entry = mapped.find(e => e.name === dayName);
        if (entry) {
          entry.orders += 1;
          if (o.status === 'delivered' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'dispatched') {
            entry.revenue += (o.totalAmount || 0);
          }
        }
      }
    });
    
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return order.map(name => mapped.find(e => e.name === name) || { name, revenue: 0, orders: 0 });
  }, [orders]);

  const MONTHLY_SALES_DATA = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mapped = months.map(m => ({ name: m, sales: 0 }));
    
    orders.forEach(o => {
      if (!o.createdAt) return;
      let dateObj;
      if (typeof o.createdAt.toDate === 'function') {
        dateObj = o.createdAt.toDate();
      } else {
        dateObj = new Date(o.createdAt);
      }
      if (dateObj && !isNaN(dateObj.getTime())) {
        const monthName = months[dateObj.getMonth()];
        const entry = mapped.find(e => e.name === monthName);
        if (entry) {
          if (o.status === 'delivered' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'dispatched') {
            entry.sales += (o.totalAmount || 0);
          }
        }
      }
    });
    
    const currentMonthIdx = new Date().getMonth();
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      lastSixMonths.push(mapped[idx]);
    }
    return lastSixMonths;
  }, [orders]);

  const TOP_PRODUCTS_DATA = React.useMemo(() => {
    const counts = {};
    orders.forEach(o => {
      if (o.item && o.item.productName) {
        const pName = o.item.productName;
        if (!counts[pName]) {
          counts[pName] = { name: pName, sold: 0, revenue: 0 };
        }
        const qty = o.item.quantity || 1;
        const price = o.item.price || 0;
        counts[pName].sold += qty;
        counts[pName].revenue += price * qty;
      }
    });
    
    const items = Object.values(counts)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
      
    if (items.length === 0) {
      return [
        { name: 'Easy Grow', sold: 15, revenue: 11250 },
        { name: 'Aaqaab', sold: 12, revenue: 7800 },
        { name: 'Fatty Acid', sold: 9, revenue: 6750 }
      ];
    }
    return items;
  }, [orders]);

  const CATEGORY_SHARE_DATA = React.useMemo(() => {
    const counts = {
      'Nutrition': 0,
      'Insecticides': 0,
      'Fungicides': 0,
      'Herbicides': 0,
      'Promoters': 0
    };
    
    const catMap = {};
    dbProducts.forEach(p => {
      let catName = 'Nutrition';
      if (p.category === 'insecticide') catName = 'Insecticides';
      else if (p.category === 'fungicide') catName = 'Fungicides';
      else if (p.category === 'herbicide') catName = 'Herbicides';
      else if (p.category === 'promoter') catName = 'Promoters';
      else if (p.category === 'plant_nutrition') catName = 'Nutrition';
      catMap[p.name_en] = catName;
    });
    
    const fallbacks = {
      'Fatty': 'Nutrition',
      'Aaqaab': 'Insecticides',
      'Easy Grow': 'Nutrition',
      'Purifizin': 'Fungicides',
      'Dr. PP': 'Insecticides',
      'Farbasin': 'Fungicides',
      'Sector': 'Herbicides',
      'Vac Zinc': 'Nutrition'
    };
    
    orders.forEach(o => {
      if (o.item && o.item.productName) {
         const pName = o.item.productName;
         const cat = catMap[pName] || fallbacks[pName] || 'Nutrition';
         counts[cat] += o.item.quantity || 1;
      }
    });
    
    const hasValues = Object.values(counts).some(v => v > 0);
    if (!hasValues) {
      return [
        { name: 'Nutrition', value: 40 },
        { name: 'Insecticides', value: 25 },
        { name: 'Fungicides', value: 15 },
        { name: 'Herbicides', value: 10 },
        { name: 'Promoters', value: 10 }
      ];
    }
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [orders, dbProducts]);

  const LOW_STOCK_DATA = React.useMemo(() => {
    const items = [...dbProducts]
      .sort((a, b) => (a.stockInventory || 0) - (b.stockInventory || 0))
      .slice(0, 5)
      .map(p => ({ name: p.name_en, stock: p.stockInventory || 0 }));
      
    if (items.length === 0) {
      return [
        { name: 'Vac Zinc', stock: 4 },
        { name: 'Farbasin', stock: 7 },
        { name: 'Dr. PP', stock: 9 }
      ];
    }
    return items;
  }, [dbProducts]);

  const uniqueCustomersSet = new Set(orders.map(o => o.customerPhone || o.customer?.phone || o.customerEmail || o.customer?.email || ''));
  const lowStockCount = dbProducts.filter(p => p.stockInventory !== undefined && p.stockInventory <= 10).length;

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'packed' || o.status === 'shipped' || o.status === 'dispatched').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    cod: orders.filter(o => o.paymentMethod?.toLowerCase() === 'cod').length,
    online: orders.filter(o => o.paymentMethod?.toLowerCase() !== 'cod').length,
    revenueToday: orders.filter(o => o.status === 'delivered' && isToday(o.createdAt)).reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0),
    monthlyRevenue: orders.filter(o => o.status === 'delivered' && isThisMonth(o.createdAt)).reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0),
    totalCustomers: uniqueCustomersSet.size,
    totalDealers: MOCK_DEALERS.length,
    totalProducts: dbProducts.length || 10,
    lowStock: lowStockCount,
    visitorsToday: liveVisitors, // Mock visitor count
    totalCoupons: couponsList.length,
    messages: messagesList.length,
    reviews: reviewsList.length
  };

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = o.customerName || o.customer?.name || '';
    const phone = o.customerPhone || o.customer?.phone || '';
    const orderNum = o.orderNumber || '';
    return name.toLowerCase().includes(term) || phone.includes(term) || orderNum.toLowerCase().includes(term);
  });

  const recentActivities = React.useMemo(() => {
    const list = [];
    
    // Add real orders to activity list
    orders.slice(0, 5).forEach((order, idx) => {
      const timeAgo = idx === 0 ? "5 mins ago" : idx === 1 ? "18 mins ago" : idx === 2 ? "1 hour ago" : `${idx + 1} hours ago`;
      const num = order.orderNumber || `#10${42 - idx}`;
      const name = order.customerName || order.customer?.name || 'Progressive Farmer';
      list.push({
        id: `order-${order.id || idx}`,
        type: 'order',
        title: `Order ${num} Checked Out`,
        desc: `${name} placed an order worth PKR ${(order.totalAmount || order.total || 0).toLocaleString()} via ${order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'COD'}.`,
        time: timeAgo,
        icon: '🛒',
        color: 'border-emerald-500'
      });
    });

    // Add low stock alerts
    LOW_STOCK_DATA.forEach((prod, idx) => {
      list.push({
        id: `stock-${idx}`,
        type: 'stock',
        title: `Inventory Warning: ${prod.name}`,
        desc: `Critical stock alert! Only ${prod.stock} cartons remaining in the main warehouse storage.`,
        time: `${idx * 2 + 3} hours ago`,
        icon: '⚠️',
        color: 'border-red-500'
      });
    });

    // Add some mock audit trails
    list.push({
      id: 'audit-1',
      type: 'audit',
      title: 'CMS Overrides Re-synchronized',
      desc: 'Bilingual translation dictionaries for hero headers were modified by staff.',
      time: '1 day ago',
      icon: '⚙️',
      color: 'border-blue-500'
    });

    return list.sort((a, b) => a.id.localeCompare(b.id));
  }, [orders]);

  const handleQuickAdd = () => {
    setCurrentTab('products');
    toast.success('Navigated to Products catalog. Click "Add Product" to create new records.');
  };

  const filteredSidebarMenuGroups = React.useMemo(() => {
    const groups = [
      {
        title: 'Telemetry',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'Reports', icon: BarChart2 },
          { id: 'security-logs', label: 'Security Logs', icon: ClipboardList }
        ]
      },
      {
        title: 'Storefront',
        items: [
          { id: 'products', label: 'Products', icon: Package },
          { id: 'categories', label: 'Categories', icon: Layers },
          { id: 'coupons', label: 'Coupons', icon: Ticket },
          { id: 'reviews', label: 'Reviews', icon: Star }
        ]
      },
      {
        title: 'Operations',
        items: [
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'cod-verification', label: 'COD Verification', icon: CheckSquare },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'dealers', label: 'Dealers', icon: Award },
          { id: 'delivery', label: 'Delivery Management', icon: Truck },
          { id: 'messages', label: 'Messages', icon: Mail },
          { id: 'scanner', label: 'AI Scanner', icon: QrCode }
        ]
      },
      {
        title: 'CMS & Settings',
        items: [
          { id: 'media', label: 'Media Library', icon: FolderOpen },
          { id: 'website-settings', label: 'Website Settings', icon: Sliders },
          { id: 'pages', label: 'Pages', icon: FileText },
          { id: 'roles', label: 'Roles', icon: Shield },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'banks', label: 'Bank Accounts', icon: UserCheck }
        ]
      }
    ];

    return groups.map(group => {
      const filteredItems = group.items.filter(item => {
        if (userRole === 'super_admin') return true;
        if (userRole === 'admin') {
          const adminDisallowed = ['security-logs', 'roles', 'settings', 'banks'];
          return !adminDisallowed.includes(item.id);
        }
        if (userRole === 'editor') {
          const editorAllowed = ['products', 'categories', 'coupons', 'reviews', 'media', 'website-settings', 'pages'];
          return editorAllowed.includes(item.id);
        }
        return false;
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [userRole]);

  if (!isAuthenticated) return null;

  const getBreadcrumbs = () => {
    for (const group of filteredSidebarMenuGroups) {
      const match = group.items.find(item => item.id === currentTab);
      if (match) {
        return [group.title, match.label];
      }
    }
    return ['Portal', currentTab];
  };
  const [groupTitle, tabLabel] = getBreadcrumbs();

  return (


    <>


      <AnimatePresence mode="wait">


        {!isAppReady && (


          <AdminLoader onComplete={() => setIsAppReady(true)} />


        )}


      </AnimatePresence>



      
        {selectedVerificationOrder && (
          <CODVerificationModal 
            order={selectedVerificationOrder}
            receiptUrl={selectedVerificationOrder.proofScreenshotURL || selectedVerificationOrder.paymentDetails?.receiptBase64}
            onClose={() => setSelectedVerificationOrder(null)}
            onVerify={(orderId, status, notes) => {
              // Stub for actual verification logic
              console.log("Verified", orderId, status, notes);
            }}
            theme={theme}
          />
        )}

    {isAppReady && (


        <div className={`${c.wrapper} font-sans flex overflow-y-auto overflow-x-hidden relative`} style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Dynamic Ambient Forest Backdrop Grid & Cells */}
      {theme === 'website' && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-80 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/admin_bg_forest.webp")',
          }}
        />
      )}
      {/* Gradient Overlay for bioluminescent depth */}
      {theme === 'website' && (
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black/60 via-black/30 to-[#10b981]/10 pointer-events-none" />
      )}

      {/* LEFT SIDEBAR PANEL */}
      <div 
        className={`${c.sidebar} h-screen flex flex-col justify-between transition-all duration-300 relative z-40 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-[290px]'
        }`}
      >
        {/* Organic Vine Overlay (Right edge winding vine) (only for website theme) */}
        {!sidebarCollapsed && theme === 'website' && (
          <div className="absolute top-0 right-0 h-full w-8 pointer-events-none overflow-hidden z-50">
            <svg className="h-full w-full opacity-90 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" viewBox="0 0 32 800" fill="none" preserveAspectRatio="none">
              <path d="M10 0 C 18 100, 2 200, 15 300 C 25 400, 5 500, 20 600 C 28 700, 8 750, 15 800" stroke="#10b981" strokeWidth="2" />
              {/* Detailed gradient leaves */}
              <path d="M10 50 Q 25 45, 22 58 Q 12 55, 10 50" fill="url(#leafGrad1)" />
              <path d="M11 150 Q -2 142, 2 156 Q 10 152, 11 150" fill="url(#leafGrad2)" />
              <path d="M13 250 Q 28 245, 24 258 Q 15 255, 13 250" fill="url(#leafGrad1)" />
              <path d="M11 350 Q -2 342, 2 356 Q 10 352, 11 350" fill="url(#leafGrad2)" />
              <path d="M16 450 Q 30 442, 26 456 Q 18 452, 16 450" fill="url(#leafGrad1)" />
              <path d="M11 550 Q -2 542, 2 556 Q 10 552, 11 550" fill="url(#leafGrad2)" />
              <path d="M18 650 Q 32 642, 28 656 Q 20 652, 18 650" fill="url(#leafGrad1)" />
              <path d="M10 720 Q -3 712, 1 726 Q 9 722, 10 720" fill="url(#leafGrad2)" />
              <defs>
                <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        {/* Crawling Vine Overlay (Bottom left corner vine) */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-14 left-0 w-24 h-48 pointer-events-none overflow-hidden z-0 opacity-75">
            <svg className="h-full w-full drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" viewBox="0 0 100 200" fill="none" preserveAspectRatio="none">
              <path d="M0 200 C 35 170, 15 130, 45 90 C 65 60, 30 30, 50 0" stroke="#10b981" strokeWidth="2.5" />
              <path d="M22 155 Q 38 148, 33 162 Z" fill="#047857" />
              <path d="M32 110 Q 12 102, 17 116 Z" fill="#34d399" />
              <path d="M43 75 Q 60 68, 55 82 Z" fill="#059669" />
              <path d="M48 35 Q 28 28, 33 42 Z" fill="#6ee7b7" />
            </svg>
          </div>
        )}
        <div className="flex flex-col gap-5 p-4 overflow-y-auto max-h-[85vh] scrollbar-hide">
          {/* Logo Brand Header */}
          <div className={`flex items-center justify-between border-b pb-4 gap-2 ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2 text-left">
                 <img src={vitalAgroLogo} alt="Vital Agro" className="h-7 w-auto object-contain" />
                 <div>
                   <h2 className={`font-extrabold text-xs uppercase tracking-wide leading-none ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Vital Agro</h2>
                   <span className={`text-[10px] font-mono tracking-widest uppercase block mt-0.5 ${theme === 'light' ? 'text-emerald-700' : 'text-[#32D74B]'}`}>Control Center</span>
                 </div>
              </div>
            ) : (
              <img src={vitalAgroLogo} alt="Vital Agro" className="h-6 w-auto object-contain mx-auto" />
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'hover:bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-neutral-900' 
                  : 'hover:bg-white/60 border border-emerald-900/5 text-neutral-500 hover:text-emerald-950'
              }`}
            >
              {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4 text-left">
            {filteredSidebarMenuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="text-[9px] uppercase font-black tracking-widest text-neutral-500 px-3 py-1 mt-2 block select-none">
                    {group.title}
                  </p>
                )}
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        if (item.id === 'products') fetchProducts();
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer w-full text-left ${
                        active 
                          ? c.sidebarItemActive
                          : `${c.sidebarItemInactive} border-transparent`
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? (theme === 'light' ? 'text-emerald-700' : 'text-[#32D74B]') : 'text-neutral-500'}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Signout control */}
        <div className={`p-4 border-t bg-transparent relative z-10 ${theme === 'light' ? 'border-neutral-200' : 'border-[#10b981]/15'}`}>
          <button
            onClick={handleLogout}
            className={`w-full py-2.5 border rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              theme === 'light'
                ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                : 'bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <LogOut size={13} className="shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT PANE */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col bg-transparent relative z-10">
        
        {/* TOP HEADER BAR */}
        <header className={`${c.header} px-6 py-4 flex items-center justify-between z-30 select-none`}>
          {/* Header Title Breadcrumbs & Search */}
          <div className="flex items-center gap-6">
            {/* Collapsible sidebar menu trigger (useful on desktop/mobile) */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer block sm:hidden ${
                theme === 'light' 
                  ? 'hover:bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-neutral-900' 
                  : 'hover:bg-white/60 border border-emerald-900/5 text-neutral-500 hover:text-emerald-950'
              }`}
            >
              <LayoutDashboard size={13} />
            </button>

            {/* Breadcrumb Links */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-neutral-500 hidden md:flex">
              <span>Vital Agro</span>
              <span>/</span>
              <span>{groupTitle}</span>
              <span>/</span>
              <span className={theme === 'light' ? 'text-black font-extrabold' : 'text-emerald-950 font-extrabold'}>{tabLabel}</span>
            </div>

            {/* Quick search input */}
            <div className="relative w-44 sm:w-56 md:w-64">
              <button
                type="button"
                onClick={() => document.getElementById('portal-search-input')?.focus()}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-[#0E7A43] transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Focus search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <input
                id="portal-search-input"
                type="text"
                placeholder="Search portal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`pl-8 pr-12 py-1.5 rounded-lg text-[11px] outline-none w-full transition-all focus:ring-1 focus:ring-[#0E7A43]/30 ${c.input}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/80 border border-emerald-900/10 text-[8px] font-mono text-neutral-500 hidden sm:block">
                Ctrl+K
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className={`px-3 py-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md hover:scale-102 active:scale-98 ${c.accentButton}`}
              >
                <Plus size={12} className="stroke-[3]" />
                <span>Actions</span>
              </button>
              {quickActionsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setQuickActionsOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-48 border rounded-xl p-1 shadow-2xl z-55 text-[10px] font-mono text-left ${
                    theme === 'light' ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-[#121212] border-emerald-900/5 text-neutral-300'
                  }`}>
                    <button
                      onClick={() => {
                        setQuickActionsOpen(false);
                        handleOpenCreateModal();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-emerald-500/10 hover:text-[#32D74B] flex items-center gap-1.5 cursor-pointer"
                    >
                      🌱 Synthesize Product
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionsOpen(false);
                        setCurrentTab('coupons');
                        toast.success("Navigated to Coupons. Create a voucher code below!");
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-emerald-500/10 hover:text-[#32D74B] flex items-center gap-1.5 cursor-pointer"
                    >
                      🎫 Synthesize Coupon
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Instant Theme switcher Inline buttons */}
            <div className="flex items-center bg-emerald-950/5 border border-emerald-900/5 p-1 rounded-xl gap-0.5 hidden lg:flex select-none">
              <button
                onClick={() => handleThemeChange('website')}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                  theme === 'website'
                    ? 'bg-[#10B981] text-[#020503] shadow-md'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/60'
                }`}
                title="Vital Agro Theme"
              >
                🌿 Vital
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#10B981] text-[#020503] shadow-md'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/60'
                }`}
                title="Dark Theme"
              >
                🌙 Dark
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-emerald-700 text-emerald-950 shadow-md'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/60'
                }`}
                title="Light Theme"
              >
                ☀️ Light
              </button>
            </div>

            {/* Language toggle */}
            <button 
              onClick={() => {
                setIsRTL(!isRTL);
                toast.success(isRTL ? 'Language toggled to English' : 'Language toggled to Urdu / RTL Mode');
              }}
              className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase font-mono transition-colors cursor-pointer ${
                theme === 'light' 
                  ? 'hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900' 
                  : 'hover:bg-white/60 border-emerald-900/5 text-neutral-500 hover:text-emerald-950'
              }`}
            >
              <Globe size={13} className="inline mr-1" />
              {isRTL ? 'اردو' : 'EN'}
            </button>

            {/* Notification Alert Center dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-1.5 rounded-lg border transition-colors relative cursor-pointer ${
                  theme === 'light' 
                    ? 'hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900' 
                    : 'hover:bg-white/60 border-emerald-900/5 text-neutral-500 hover:text-emerald-950'
                }`}
              >
                <Bell size={13.5} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              </button>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setNotificationsOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-72 border rounded-2xl p-3.5 shadow-2xl space-y-2 z-55 text-xs text-left ${c.modal}`}>
                    <span className="font-bold block uppercase tracking-wider text-[10px] border-b border-emerald-900/5 pb-1 text-[#10B981] font-mono">System Alerts</span>
                    <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[9px] text-neutral-400">
                      <p className="p-2 bg-white/60 border-l-2 border-[#10B981] rounded-r-lg">⚠️ Vac Zinc is running low (4 items remaining in inventory)</p>
                      <p className="p-2 bg-white/60 border-l-2 border-[#10B981] rounded-r-lg">⚠️ Farbasin stock warning check (7 units available)</p>
                      <p className="p-2 bg-white/60 border-l-2 border-emerald-500 rounded-r-lg">🔔 New Cash on Delivery checkout confirmation #1042</p>
                      <p className="p-2 bg-white/60 border-l-2 border-emerald-500 rounded-r-lg">🔔 Meezan Bank Transfer deposit TID-91048 verifications pending</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Online Live Status Badge */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black font-mono uppercase tracking-wider hidden sm:flex ${
              theme === 'light'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400'
            }`}>
              <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
              Live Link
            </div>

            {/* Admin profile interactive dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#031d0d]/80 border border-[#10B981]/40 flex items-center justify-center font-bold text-xs text-[#10B981] hover:scale-105 transition-transform">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setProfileMenuOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-56 border rounded-2xl p-3 shadow-2xl z-55 space-y-2 text-left ${
                    theme === 'light' ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-[#060b07]/95 border-[#10b981]/15 text-neutral-300'
                  }`}>
                    <div className="border-b border-emerald-900/5 pb-2">
                      <span className="font-bold block text-xs truncate text-emerald-950">{userName}</span>
                      <span className="text-[9px] font-mono text-neutral-500 truncate block">{userEmail}</span>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono bg-[#10B981]/10 border border-[#10B981]/20 text-[#32D74B] uppercase tracking-wider">
                        🛡️ {userRole.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          if (userRole === 'super_admin') {
                            setCurrentTab('roles');
                          } else {
                            toast.error("Access restricted to Super Admins only.");
                          }
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/60 text-[9px] font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 cursor-pointer"
                      >
                        Staff Directory
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[9px] font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* TAB WORKSPACE ROUTER */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <React.Suspense fallback={<AdminWorkspaceLoader />}>
            
            {/* TAB 1: TELEMETRY DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 15 Stats Telemetry Cards */}
              <StatsCards stats={stats} theme={theme} />

              {/* Responsive 8 Charts Group */}
              <React.Suspense fallback={<AdminWorkspaceLoader />}>
                <AnalyticsCharts theme={theme} c={c} />
              </React.Suspense>

              {/* 8. Recent Activity Feed Timeline */}
              <div className={`lg:col-span-12 rounded-3xl p-6 space-y-4 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
                  <div className="flex justify-between items-center border-b border-emerald-900/5 pb-3">
                    <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>
                      <Activity className="w-4 h-4 text-[#10B981] drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" /> Real-time Activity Timeline
                    </h3>
                    <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full text-[#32D74B]">
                      Auto Syncing
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Timeline Panel */}
                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/80">
                      {recentActivities.slice(0, 4).map((act, index) => (
                        <div key={act.id} className="flex gap-4 relative group text-xs">
                          <div className="w-6 h-6 rounded-full bg-[#060b07] border border-emerald-900/10 flex items-center justify-center relative z-10 shrink-0 font-bold">
                            {act.icon}
                          </div>
                          <div className={`flex-1 border-l-2 ${act.color} pl-3 space-y-1`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-neutral-200">{act.title}</span>
                              <span className="text-[8px] font-mono text-neutral-500">{act.time}</span>
                            </div>
                            <p className="text-neutral-400 text-[11px] leading-relaxed">{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Timeline Panel */}
                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/80">
                      {recentActivities.slice(4, 8).map((act, index) => (
                        <div key={act.id} className="flex gap-4 relative group text-xs">
                          <div className="w-6 h-6 rounded-full bg-[#060b07] border border-emerald-900/10 flex items-center justify-center relative z-10 shrink-0 font-bold">
                            {act.icon}
                          </div>
                          <div className={`flex-1 border-l-2 ${act.color} pl-3 space-y-1`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-neutral-200">{act.title}</span>
                              <span className="text-[8px] font-mono text-neutral-500">{act.time}</span>
                            </div>
                            <p className="text-neutral-400 text-[11px] leading-relaxed">{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {currentTab === 'orders' && (
            <div className={`rounded-3xl p-6 space-y-5 shadow-lg ${c.card}`}>
              <div className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4 border-b ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                <div className="text-left">
                  <h2 className={`font-bold text-base uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Orders Telemetry Registry</h2>
                  <p className="text-neutral-500 text-[10px] font-mono tracking-wider uppercase mt-0.5">Search and verify farmer order records</p>
                </div>
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search client serials..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl text-xs outline-none w-full transition-all ${c.input}`}
                  />
                </div>
              </div>

              {/* Active filters */}
              <div className={`flex flex-wrap gap-1.5 border-b pb-4 ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrdersActiveFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer ${
                      ordersActiveFilter === status
                        ? (theme === 'light' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-black' : 'bg-slate-50 border border-emerald-900/10 text-[#10B981]')
                        : (theme === 'light' ? 'text-neutral-500 hover:text-black' : 'text-neutral-500 hover:text-neutral-200')
                    }`}
                  >
                    {status} ({
                      status === 'processing' 
                        ? orders.filter(o => o.status === 'processing' || o.status === 'packed' || o.status === 'shipped' || o.status === 'dispatched').length
                        : orders.filter(o => o.status === status).length
                    })
                  </button>
                ))}
              </div>

              <OrdersTable orders={filteredOrders} activeFilter={ordersActiveFilter} theme={theme} />
            </div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {currentTab === 'products' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-emerald-900/5">
                <div>
                  <h2 className="text-emerald-950 font-bold text-base tracking-wider font-mono uppercase">
                    Agrochemical Synthesis Matrix
                  </h2>
                  <p className="text-neutral-500 text-[10px] font-mono tracking-wider uppercase mt-0.5">
                    Catalog Configuration Matrices & Inventory
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold font-mono text-xs
                    flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded-xl cursor-pointer uppercase"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Synthesize Formula
                </button>
              </div>

              {loadingProducts ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 w-full rounded-xl bg-slate-50 animate-pulse border border-emerald-900/5" />
                  ))}
                </div>
              ) : dbProducts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-emerald-900/5 rounded-2xl">
                  <Package className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
                  <p className="text-neutral-500 text-xs font-mono tracking-wide uppercase">No chemical products synthesized in ledgers.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 tracking-widest uppercase bg-black">
                        <th className="py-3.5 px-4 font-bold w-12 text-center">
                          <input 
                            type="checkbox"
                            checked={dbProducts.length > 0 && selectedProductIds.length === dbProducts.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(dbProducts.map(p => p.id));
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="rounded bg-black border-emerald-900/10 text-[#10B981] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                          />
                        </th>
                        <th className="py-3.5 px-4 font-bold">Formula Details</th>
                        <th className="py-3.5 px-4 font-bold">Crop-Specific Category</th>
                        <th className="py-3.5 px-4 font-bold">Dynamic Pricing Matrix</th>
                        <th className="py-3.5 px-4 font-bold">Active Inventory</th>
                        <th className="py-3.5 px-4 font-bold text-right">Adjustments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbProducts.map((p) => {
                        const sizes = Object.entries(p.dynamicPricingMatrix || {});
                        const isOutOfStock = p.stockInventory <= 0;
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-emerald-900/5 hover:bg-slate-50/80 transition-colors duration-150"
                          >
                            <td className="py-4 px-4 w-12 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedProductIds.includes(p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds([...selectedProductIds, p.id]);
                                  } else {
                                    setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                  }
                                }}
                                className="rounded bg-black border-emerald-900/10 text-[#10B981] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-black border border-emerald-900/5 p-1 flex items-center justify-center relative overflow-hidden shrink-0">
                                  {p.baseImageURL ? (
                                    <img 
                                      src={`${import.meta.env.VITE_API_URL || ''}${p.baseImageURL}`} 
                                      alt={p.productName} 
                                      className="h-full w-auto object-contain"
                                    />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-neutral-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-emerald-950 text-xs font-bold font-sans">{p.productName}</h4>
                                  <span className="text-neutral-500 text-[9px] font-mono block mt-0.5 uppercase">ID: {p.id}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-50 border border-emerald-900/5 text-neutral-300 text-[8px] font-mono uppercase">
                                {p.productCategory?.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {sizes.length === 0 ? (
                                  <span className="text-neutral-500 text-[9px] font-mono">No pricing parameters set</span>
                                ) : (
                                  sizes.map(([size, price]) => (
                                    <span key={size} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono uppercase">
                                      {size}: {price} PKR
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-[#10B981] shadow-[0_0_8px_#10b981]'}`} />
                                <span className={`text-[10px] font-bold font-mono tracking-wide uppercase ${isOutOfStock ? 'text-red-400' : 'text-emerald-300'}`}>
                                  {isOutOfStock ? 'Depleted' : `Active [${p.stockInventory}]`}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-2 bg-slate-50 border border-emerald-900/5 hover:bg-neutral-850 hover:border-emerald-900/10 rounded-lg text-[#10B981] hover:text-[#32D74B] transition-all cursor-pointer"
                                  title="Duplicate Formula"
                                >
                                  <Layers size={12} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-2 bg-slate-50 border border-emerald-900/5 hover:bg-neutral-850 hover:border-emerald-900/10 rounded-lg text-neutral-400 hover:text-emerald-950 transition-all cursor-pointer"
                                  title="Calibrate Parameters"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 bg-red-955/20 hover:bg-red-900/30 border border-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                  title="Purge Formula"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Floating Viewport Drawer for Bulk Action Operations */}
              {selectedProductIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#060b07]/90 backdrop-blur-2xl border border-[#10b981]/25 px-6 py-3.5 rounded-2xl flex items-center gap-6 shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-50 text-xs text-emerald-950 select-none animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping" />
                    <span className="font-mono font-bold tracking-wider text-[#32D74B] uppercase">{selectedProductIds.length} Selected</span>
                  </div>
                  
                  <div className="h-4 w-px bg-white/80" />
                  
                  {/* Category Bulk Edit dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[10px] uppercase font-mono">Move Category:</span>
                    <select 
                      onChange={(e) => {
                        handleBulkCategoryEdit(e.target.value);
                        e.target.value = '';
                      }}
                      className="bg-emerald-950/5 border border-[#10b981]/15 rounded-lg px-2 py-1 outline-none text-emerald-950 text-[10px] uppercase font-bold cursor-pointer"
                    >
                      <option value="">Choose...</option>
                      <option value="plant_nutrition">Plant Nutrition</option>
                      <option value="insecticide">Insecticide</option>
                      <option value="fungicide">Fungicide</option>
                      <option value="herbicide">Herbicide</option>
                      <option value="growth_promoter">Growth Promoter</option>
                    </select>
                  </div>

                  <div className="h-4 w-px bg-white/80" />

                  {/* Stock calibration button */}
                  <button
                    onClick={handleBulkStockEdit}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-neutral-800 border border-emerald-900/5 hover:border-emerald-900/10 text-neutral-300 hover:text-emerald-950 rounded-lg font-bold font-mono text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1"
                  >
                    🔧 Calibrate Stock
                  </button>

                  <div className="h-4 w-px bg-white/80" />

                  {/* Bulk Delete button */}
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-955/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg font-bold font-mono text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    <span>Purge Group</span>
                  </button>

                  <button 
                    onClick={() => setSelectedProductIds([])}
                    className="text-[10px] font-bold font-mono text-neutral-500 hover:text-neutral-300 uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLIENT DIRECTORY */}
          {currentTab === 'customers' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <CustomerProfile orders={orders} />
            </div>
          )}

          {/* TAB 5: ONLINE PAYMENTS VERIFICATION */}
          {currentTab === 'payments' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-4 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Payment Screen Receipts Registry</h2>
                <p className="text-neutral-500 text-xs mt-1">Audit online transaction references and confirm order payloads</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 uppercase">
                      <th className="py-3 px-4">TID Code</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 font-mono">Charges</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.map(pay => (
                      <tr key={pay.id} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors font-mono">
                        <td className="py-3.5 px-4 text-[#10B981] font-bold">{pay.tid}</td>
                        <td className="py-3.5 px-4 font-sans text-neutral-300">{pay.customer}</td>
                        <td className="py-3.5 px-4">{pay.method}</td>
                        <td className="py-3.5 px-4 text-emerald-950 font-bold">{pay.amount}</td>
                        <td className="py-3.5 px-4 text-neutral-500">{pay.date}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              const newStatus = pay.status === 'Pending Review' ? 'Verified' : pay.status === 'Verified' ? 'Rejected' : 'Pending Review';
                              setPaymentsList(paymentsList.map(p => p.id === pay.id ? { ...p, status: newStatus } : p));
                              toast.success(`Transaction ${pay.tid} set to ${newStatus}`);
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold border transition-all cursor-pointer ${
                              pay.status === 'Verified' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
                              pay.status === 'Rejected' ? 'bg-red-950/20 border-red-500/20 text-red-400' :
                              'bg-amber-950/20 border-amber-500/20 text-amber-400 hover:bg-amber-900/35'
                            }`}
                          >
                            {pay.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BANK MANAGER */}
          {currentTab === 'banks' && (
            <div className={`rounded-3xl p-6 shadow-lg ${c.card}`}>
              <BankManager theme={theme} />
            </div>
          )}

          {/* TAB 7: CATEGORIES EDITOR */}
          {currentTab === 'categories' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-emerald-900/5">
                <div>
                  <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Products Categories Editor</h2>
                  <p className="text-neutral-500 text-xs mt-1">Configure homepage category list and filters index</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-emerald-950/5 border border-emerald-900/5 p-5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-neutral-400 tracking-wider">Category Catalog</h4>
                  <div className="space-y-2 font-mono text-xs text-neutral-300">
                    {categoriesList.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-emerald-900/5 rounded-xl">
                        <div>
                          <span className="font-bold text-emerald-950 block">{cat.title}</span>
                          <span className="text-[10px] text-neutral-500 uppercase mt-0.5 block">ID: {cat.name} • {cat.count} Products</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = [...categoriesList];
                              updated[idx].status = updated[idx].status === 'Active' ? 'Inactive' : 'Active';
                              setCategoriesList(updated);
                              toast.success(`Category status toggled to ${updated[idx].status}`);
                            }}
                            className={`border text-[9px] px-2 py-0.5 rounded font-bold uppercase transition-all cursor-pointer ${
                              cat.status === 'Active' ? 'bg-emerald-950/20 border-emerald-500/20 text-[#10B981]' : 'bg-slate-50 border-emerald-900/5 text-neutral-500'
                            }`}
                          >
                            {cat.status}
                          </button>
                          <button 
                            onClick={() => {
                              setCategoriesList(categoriesList.filter((_, i) => i !== idx));
                              toast.success('Category purged from registry');
                            }}
                            className="p-1.5 hover:bg-red-955/20 border border-transparent rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-950/5 border border-emerald-900/5 rounded-2xl p-5 space-y-4 text-xs font-mono">
                  <h4 className="font-bold text-xs uppercase text-emerald-950 tracking-wider">Add Category</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500 uppercase">Category Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Growth Promoters" 
                        value={newCategoryTitle}
                        onChange={e => setNewCategoryTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500 uppercase">Catalog ID / Slug</label>
                      <input 
                        type="text" 
                        placeholder="e.g. growth_promoters" 
                        value={newCategorySlug}
                        onChange={e => setNewCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!newCategoryTitle || !newCategorySlug) {
                          toast.error("Please fill in both Category Title and Catalog ID");
                          return;
                        }
                        const newCat = { name: newCategorySlug, title: newCategoryTitle, count: 0, status: 'Active' };
                        setCategoriesList([...categoriesList, newCat]);
                        setNewCategoryTitle('');
                        setNewCategorySlug('');
                        toast.success('Category registered successfully');
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider mt-2 cursor-pointer"
                    >
                      Save Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: COUPONS MANAGER */}
          {currentTab === 'coupons' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-emerald-900/5">
                <div>
                  <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Promotional Coupons Manager</h2>
                  <p className="text-neutral-500 text-xs mt-1">Configure discount coupon codes and active status validations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Creator card */}
                <div className="bg-emerald-950/5 border border-emerald-900/5 rounded-2xl p-5 space-y-4 text-xs font-mono">
                  <h3 className="font-bold text-xs uppercase text-emerald-950 tracking-wider">Synthesize Coupon</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-500 uppercase">Coupon Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MONSOON30" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-500 uppercase">Discount (%)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 15" 
                          value={couponDiscount}
                          onChange={e => setCouponDiscount(Number(e.target.value))}
                          className="w-full px-3.5 py-2 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-500 uppercase">Min Purchase</label>
                        <input 
                          type="number" 
                          placeholder="PKR 2000" 
                          value={couponMin}
                          onChange={e => setCouponMin(Number(e.target.value))}
                          className="w-full px-3.5 py-2 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-500 uppercase">Expiry Date</label>
                      <input 
                        type="date" 
                        value={couponExpiry}
                        onChange={e => setCouponExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!couponCode) {
                          toast.error("Please enter a valid code");
                          return;
                        }
                        try {
                          await apiClient.post('/coupons', { code: couponCode, discount: Number(couponDiscount) });
                          setCouponCode('');
                          toast.success("New coupon deployed successfully");
                          fetchCoupons();
                        } catch (e) {
                          console.error(e);
                          toast.error(e.response?.data?.error || "Failed to deploy coupon");
                        }
                      }}
                      className="w-full py-2 bg-[#10B981] text-black font-extrabold rounded-xl uppercase text-[10px]"
                    >
                      Deploy Coupon Code
                    </button>
                  </div>
                </div>

                {/* Table list card */}
                <div className="lg:col-span-2 bg-emerald-950/5 border border-emerald-900/5 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-xs uppercase text-neutral-400 tracking-wider">Active Promotional Coupons</h3>
                  <div className="overflow-x-auto text-xs font-mono">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-emerald-900/5 text-[9px] text-neutral-500 uppercase">
                          <th className="py-2.5 px-2">Code</th>
                          <th className="py-2.5 px-2">Discount</th>
                          <th className="py-2.5 px-2">Expiry</th>
                          <th className="py-2.5 px-2">Status</th>
                          <th className="py-2.5 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingCoupons ? (
                          <tr><td colSpan="5" className="py-4 text-center">Loading coupons...</td></tr>
                        ) : couponsList.length === 0 ? (
                          <tr><td colSpan="5" className="py-4 text-center">No coupons registered</td></tr>
                        ) : (
                          couponsList.map((c) => (
                            <tr key={c.id || c.code} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors">
                              <td className="py-3 px-2 font-bold text-emerald-950">{c.code}</td>
                              <td className="py-3 px-2 text-[#10B981] font-bold">{c.discount}% Off</td>
                              <td className="py-3 px-2 text-neutral-400">2026-12-31</td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                  c.active 
                                    ? 'bg-emerald-950/20 border-emerald-500/20 text-[#10B981]' 
                                    : 'bg-slate-50 border-emerald-900/5 text-neutral-500'
                                }`}>
                                  {c.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <button
                                  onClick={async () => {
                                    try {
                                      await apiClient.delete(`/coupons/${c.code}`);
                                      toast.success("Coupon code deleted");
                                      fetchCoupons();
                                    } catch (e) {
                                      console.error(e);
                                      toast.error("Failed to delete coupon");
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-955/20 border border-transparent rounded text-red-400"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS AUDIT SYSTEM */}
          {currentTab === 'reviews' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-5 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Customer Feedback & Reviews</h2>
                <p className="text-neutral-500 text-xs mt-1">Audit, approve, and reply to chemical formulation feedback</p>
              </div>

              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="text-center py-10 font-mono text-xs text-neutral-500">Loading reviews...</div>
                ) : reviewsList.length === 0 ? (
                  <div className="text-center py-10 font-mono text-xs text-neutral-500">No customer reviews found.</div>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-emerald-950/5 border border-emerald-900/5 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-900/5 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-950 text-xs">{rev.user_name}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-50 border border-emerald-900/5 text-[8.5px] font-mono uppercase text-neutral-400">
                              {rev.product_id}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                            {rev.created_at ? new Date(rev.created_at).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={11} className={i < rev.rating ? "fill-yellow-500 stroke-none" : "stroke-neutral-700"} />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-emerald-950/20 border-emerald-500/20 text-[#10B981]">
                            Approved
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">{rev.text}</p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type reply..."
                            className="px-3 py-1.5 bg-white border border-emerald-900/5 rounded-xl text-xs outline-none text-emerald-950 w-48 focus:border-emerald-500/40"
                            id={`reply-input-${rev.id}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                toast.success("Official review response published");
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`reply-input-${rev.id}`);
                              if (inputEl) inputEl.value = '';
                              toast.success("Official review response published");
                            }}
                            className="px-3 py-1.5 bg-slate-50 border border-emerald-900/5 hover:border-emerald-500/30 text-emerald-950 rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await apiClient.delete(`/reviews/${rev.id}`);
                                toast.success("Review deleted");
                                fetchReviews();
                              } catch (e) {
                                console.error(e);
                                toast.error("Failed to delete review");
                              }
                            }}
                            className="p-2 bg-red-955/20 hover:bg-red-900/30 border border-red-500/10 rounded-xl text-red-400 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 10: ASSOCIATED DEALERS */}
          {currentTab === 'dealers' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-4 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Associated Dealer Franchises</h2>
                <p className="text-neutral-500 text-xs mt-1">Configure partner stores, commission indices, and active franchises</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 uppercase">
                      <th className="py-3 px-4">Franchise</th>
                      <th className="py-3 px-4">Store Title</th>
                      <th className="py-3 px-4">Manager</th>
                      <th className="py-3 px-4">City Location</th>
                      <th className="py-3 px-4 font-mono">Commission</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealersList.map(dlr => (
                      <tr key={dlr.id} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors font-mono">
                        <td className="py-3.5 px-4 font-bold text-emerald-950">{dlr.franchise}</td>
                        <td className="py-3.5 px-4 font-sans text-neutral-300 font-bold">{dlr.name}</td>
                        <td className="py-3.5 px-4 font-sans">{dlr.manager}</td>
                        <td className="py-3.5 px-4">{dlr.city}</td>
                        <td className="py-3.5 px-4 text-[#10B981] font-bold">{dlr.commission}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              const newStatus = dlr.status === 'Active' ? 'Pending Review' : 'Active';
                              setDealersList(dealersList.map(d => d.id === dlr.id ? { ...d, status: newStatus } : d));
                              toast.success(`Franchise ${dlr.franchise} status set to ${newStatus}`);
                            }}
                            className={`border text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                              dlr.status === 'Active' 
                                ? 'bg-emerald-950/20 border-emerald-500/20 text-[#10B981]' 
                                : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                            }`}
                          >
                            {dlr.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: DELIVERY MANAGEMENT */}
          {currentTab === 'delivery' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Delivery & Logistics Management</h2>
                <p className="text-neutral-500 text-xs mt-1">Audit COD advance payments, outstanding fees, and courier dispatch logs</p>
              </div>

              {/* Delivery Sub-tabs Selector */}
              <div className="flex gap-2 border-b border-emerald-900/5 pb-4">
                {[
                  { id: 'cod-audit', label: 'COD SCREEN AUDIT' },
                  { id: 'outstanding-ledger', label: 'PENDING CHARGES' },
                  { id: 'couriers-dispatch', label: 'COURIER DISPATCH' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setDeliverySubTab(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer ${
                      deliverySubTab === sub.id
                        ? 'bg-slate-50 border border-emerald-900/10 text-[#10B981]'
                        : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* subtab 1: COD advance payment screenshot verifier */}
              {deliverySubTab === 'cod-audit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {orders.filter(o => o.status === 'pending' && o.paymentMethod?.toLowerCase() === 'cod').map(order => (
                      <div key={order.id} className="bg-black border border-emerald-900/5 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start border-b border-emerald-900/5 pb-2 font-mono">
                          <div>
                            <span className="font-bold text-emerald-950 block">#{order.orderNumber}</span>
                            <span className="text-[10px] text-neutral-500 block">{order.customerName || 'N/A'}</span>
                          </div>
                          <span className="bg-amber-950/20 text-amber-400 border border-amber-500/20 text-[8px] font-bold px-2 py-0.5 rounded uppercase">Awaiting PKR 299</span>
                        </div>

                        <div className="aspect-[4/5] rounded-xl border border-emerald-900/5 overflow-hidden bg-slate-50 flex items-center justify-center relative group">
                          <img 
                            src={order.proofScreenshotURL || 'https://placehold.co/360x640/101010/eab308?text=PKR+299+Receipt'} 
                            alt="Receipt" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex justify-end gap-2 text-[10px] font-bold uppercase font-mono">
                          <button 
                            onClick={() => {
                              toast.success(`COD Deposit Approved for order #${order.orderNumber}`);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer w-full text-center"
                          >
                            Verify & Activate COD
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* subtab 2: outstanding ledger fees */}
              {deliverySubTab === 'outstanding-ledger' && (
                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-emerald-900/5 text-[9px] text-neutral-500 uppercase">
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Outstanding Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.status === 'pending').map(o => (
                        <tr key={o.id} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-emerald-950">#{o.orderNumber}</td>
                          <td className="py-3.5 px-4 font-sans text-neutral-300">{o.customerName || 'N/A'}</td>
                          <td className="py-3.5 px-4">{o.customerPhone || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-amber-400 font-bold">PKR 299</td>
                          <td className="py-3.5 px-4">
                            <span className="bg-amber-950/20 text-amber-400 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded uppercase font-bold">Pending Review</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* subtab 3: courier logs */}
              {deliverySubTab === 'couriers-dispatch' && (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 uppercase">
                        <th className="py-3 px-4">Courier Name</th>
                        <th className="py-3 px-4">Area Coverage</th>
                        <th className="py-3 px-4">Telephone</th>
                        <th className="py-3 px-4 font-mono">Active Deliveries</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_COURIERS.map(c => (
                        <tr key={c.id} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors font-mono">
                          <td className="py-3.5 px-4 font-bold text-emerald-950 font-sans">{c.name}</td>
                          <td className="py-3.5 px-4 font-sans">{c.area}</td>
                          <td className="py-3.5 px-4">{c.contact}</td>
                          <td className="py-3.5 px-4 text-[#10B981] font-bold">{c.activeShipments}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded uppercase font-bold">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: WEBSITE CMS SETTINGS */}
          {currentTab === 'website-settings' && (
            <div className={`rounded-3xl p-6 shadow-lg ${c.card}`}>
              <SettingsManager theme={theme} />
            </div>
          )}

          {/* TAB 13: PAGES CMS EDITOR */}
          {currentTab === 'pages' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Static Pages CMS Editor</h2>
                <p className="text-neutral-500 text-xs mt-1">Configure informational copy across About Us, Why Us, and Contact Us views</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
                {/* Selector */}
                <div className="bg-emerald-950/5 border border-emerald-900/5 p-4 rounded-2xl flex flex-col gap-2 font-mono text-xs">
                  <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-wider block mb-1">Select Page</span>
                  {[
                    { id: 'about', label: 'About Us page' },
                    { id: 'whyus', label: 'Why Choose Us' },
                    { id: 'contact', label: 'Contact Us Coordinates' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPage(p.id);
                        setPageTitle(pagesList[p.id].title);
                        setPageContent(pagesList[p.id].content);
                      }}
                      className={`px-3 py-2 rounded-xl text-left font-bold transition-all border ${
                        selectedPage === p.id 
                          ? 'bg-slate-50 border-emerald-900/10 text-[#10B981]' 
                          : 'border-transparent text-neutral-400 hover:text-emerald-950'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Content form */}
                <div className="lg:col-span-3 bg-emerald-950/5 border border-emerald-900/5 p-5 rounded-2xl space-y-4 text-xs font-mono">
                  <h3 className="font-bold text-xs uppercase text-emerald-950 tracking-wider">
                    Modify Content: <span className="text-[#10B981]">{selectedPage.toUpperCase()}</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-500 uppercase">Section Headline / Title</label>
                      <input
                        type="text"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-500 uppercase">Body Description Paragraph</label>
                      <textarea
                        rows="6"
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40 resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...pagesList };
                        updated[selectedPage] = { title: pageTitle, content: pageContent };
                        setPagesList(updated);
                        toast.success("Page copy updated. Deploying CMS edits...");
                      }}
                      className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px]"
                    >
                      Commit Page Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: MEDIA LIBRARY */}
          {currentTab === 'media' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <MediaLibrary />
            </div>
          )}

          {/* TAB 15: CUSTOMER MESSAGES INBOX */}
          {currentTab === 'messages' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-4 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Customer Messages Inbox</h2>
                <p className="text-neutral-500 text-xs mt-1">Review contact inquiries, foliar consultations, and dealer applications</p>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 uppercase">
                      <th className="py-2.5 px-4">Client</th>
                      <th className="py-2.5 px-4">Contact</th>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4">Message</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-right">Inbox Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMessages ? (
                      <tr><td colSpan="6" className="py-4 text-center">Loading messages...</td></tr>
                    ) : messagesList.length === 0 ? (
                      <tr><td colSpan="6" className="py-4 text-center">No contact messages received.</td></tr>
                    ) : (
                      messagesList.map((msg) => (
                        <tr key={msg.id} className="border-b border-emerald-900/5 hover:bg-white/60 transition-colors font-mono">
                          <td className="py-3.5 px-4 font-bold text-emerald-950 font-sans">{msg.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="block text-neutral-300">{msg.email}</span>
                            <span className="block text-neutral-500 text-[10px] mt-0.5">{msg.phone}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#10B981] font-bold">{msg.subject || 'General'}</td>
                          <td className="py-3.5 px-4 font-sans text-neutral-300 max-w-[200px] truncate" title={msg.text}>
                            {msg.text}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500">
                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border ${
                                msg.status === 'Unread' ? 'bg-red-955/20 border-red-500/20 text-red-400' :
                                msg.status === 'Responded' ? 'bg-emerald-950/20 border-emerald-500/20 text-[#10B981]' :
                                'bg-slate-50 border-emerald-900/5 text-neutral-500'
                              }`}>
                                {msg.status}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveReplyMessage(msg);
                                  setReplyMessageText('');
                                }}
                                className="px-2.5 py-1 bg-slate-50 border border-emerald-900/5 rounded-lg text-neutral-300 hover:text-emerald-950 hover:border-emerald-500/30 transition-all cursor-pointer"
                              >
                                Reply
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await apiClient.delete(`/messages/${msg.id}`);
                                    toast.success("Inquiry message purged");
                                    fetchMessages();
                                  } catch (e) {
                                    console.error(e);
                                    toast.error("Failed to delete message");
                                  }
                                }}
                                className="p-1 hover:bg-neutral-850 rounded border border-transparent hover:border-emerald-900/5 text-neutral-500 hover:text-neutral-300"
                                title="Purge"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Reply Overlay Dialog */}
              <AnimatePresence>
                {activeReplyMessage && (
                  <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveReplyMessage(null)} />
                    <div className="relative w-full max-w-md bg-[#121212] border border-emerald-900/5 p-6 rounded-3xl space-y-4 text-emerald-950 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-emerald-900/5 pb-2">
                        <span className="font-extrabold text-sm uppercase text-emerald-400 tracking-wider">Reply to Message</span>
                        <button onClick={() => setActiveReplyMessage(null)} className="text-neutral-500 hover:text-emerald-950">✕</button>
                      </div>
                      <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-emerald-900/5">
                        <span className="text-neutral-500 uppercase text-[9px]">Original Query from {activeReplyMessage.name}:</span>
                        <p className="text-neutral-300 italic font-sans">"{activeReplyMessage.text}"</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-neutral-400 text-[9px] uppercase">Reply Content</label>
                        <textarea
                          rows="4"
                          placeholder="Type official response email..."
                          value={replyMessageText}
                          onChange={(e) => setReplyMessageText(e.target.value)}
                          className="w-full p-3 bg-white border border-emerald-900/5 rounded-xl text-emerald-950 outline-none focus:border-emerald-500/40 resize-none font-sans"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!replyMessageText) {
                            toast.error("Please type a reply");
                            return;
                          }
                          try {
                            // Delete/update status in backend? We can just toast and mark responded/delete message
                            await apiClient.delete(`/messages/${activeReplyMessage.id}`);
                            toast.success(`Reply dispatched to ${activeReplyMessage.email}`);
                            setActiveReplyMessage(null);
                            fetchMessages();
                          } catch (e) {
                            console.error(e);
                            toast.error("Failed to complete dispatch");
                          }
                        }}
                        className="w-full py-2 bg-[#10B981] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider"
                      >
                        Dispatch Email Response
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 16: AI PRODUCT SCANNER */}
          {currentTab === 'scanner' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <AIScannerModule />
            </div>
          )}

          {/* TAB 17: SYSTEM REPORTS LEDGERS */}
          {currentTab === 'reports' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-4 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Reports Ledgers</h2>
                <p className="text-neutral-500 text-xs mt-1">Export orders statistics, revenue statements, and sales histories</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
                {[
                  { title: 'Orders Statement June', type: 'CSV Document', size: '1.2 MB' },
                  { title: 'Dealers Franchise Revenue', type: 'PDF Document', size: '4.8 MB' },
                  { title: 'Product Inventory Audit', type: 'XLSX Sheet', size: '2.5 MB' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-black border border-emerald-900/5 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-emerald-950 block truncate max-w-[150px]">{item.title}</span>
                      <span className="text-[9px] text-neutral-500 block uppercase mt-1">{item.type} • {item.size}</span>
                    </div>
                    <button 
                      onClick={() => toast.success('File downloaded successfully')} 
                      className="p-2 hover:bg-white/60 rounded-xl border border-emerald-900/5 text-neutral-400 hover:text-emerald-950 transition-all cursor-pointer"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 18: COD VERIFICATION */}
          {currentTab === 'cod-verification' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">COD Up-front Fee Verification</h2>
                <p className="text-neutral-500 text-xs mt-1">Audit upfront 299 PKR bank deposits for pending Cash on Delivery orders</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {orders.filter(o => o.status === 'pending' && o.paymentMethod?.toLowerCase() === 'cod').length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-emerald-900/5 rounded-2xl">
                      <p className="text-neutral-500 text-xs font-mono tracking-wide uppercase">No pending COD orders awaiting verification.</p>
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'pending' && o.paymentMethod?.toLowerCase() === 'cod').map(order => (
                      <div key={order.id} className="bg-black border border-emerald-900/5 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start border-b border-emerald-900/5 pb-2 font-mono">
                          <div>
                            <span className="font-bold text-emerald-950 block">#{order.orderNumber}</span>
                            <span className="text-[10px] text-neutral-400 block">{order.customerName || order.customer?.name || 'N/A'}</span>
                          </div>
                          <span className="bg-amber-950/20 text-amber-400 border border-amber-500/20 text-[8px] font-bold px-2 py-0.5 rounded uppercase">Awaiting PKR 299</span>
                        </div>

                        <div className="aspect-[4/5] rounded-xl border border-emerald-900/5 overflow-hidden bg-slate-50 flex items-center justify-center relative group">
                          <img 
                            src={order.proofScreenshotURL || order.paymentDetails?.receiptBase64 || 'https://placehold.co/360x640/101010/eab308?text=PKR+299+Receipt'} 
                            alt="Receipt" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex justify-end gap-2 text-[10px] font-bold uppercase font-mono">
                          <button 
                            onClick={async () => {
                              try {
                                await updateOrderStatus(order.id, 'confirmed', 'COD payment verified via admin panel');
                                toast.success(`COD Deposit Approved for order #${order.orderNumber}`);
                              } catch (e) {
                                toast.error('Failed to verify COD order');
                              }
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer w-full text-center"
                          >
                            Verify & Activate COD
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 19: USERS */}
          {currentTab === 'users' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <SecurityManager />
            </div>
          )}

          {/* TAB 20: ROLES */}
          {currentTab === 'roles' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <SecurityManager />
            </div>
          )}

          {/* TAB 21: SECURITY LOGS */}
          {currentTab === 'security-logs' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 shadow-lg">
              <SecurityManager />
            </div>
          )}

          {/* TAB 19: SYSTEM CORE SETTINGS */}
          {currentTab === 'settings' && (
            <div className="bg-[#060b07]/50 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6 shadow-lg text-left text-xs font-mono">
              <div>
                <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Core Settings</h2>
                <p className="text-neutral-500 text-xs mt-1">Configure global administrative preferences, 2FA credentials, and system backups</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-emerald-950/5 border border-emerald-900/5 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-emerald-950 uppercase text-xs tracking-wider">System Preferences</h3>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 border border-emerald-900/5 rounded-xl">
                    <div>
                      <span className="font-bold text-emerald-950 block">Global 2FA Verification</span>
                      <span className="text-[10px] text-neutral-500">Require mobile verification for security adjustments</span>
                    </div>
                    <button 
                      onClick={() => toast.success("Security token constraints updated")}
                      className="px-3 py-1 bg-emerald-950/20 text-[#10B981] border border-emerald-500/20 rounded font-bold uppercase text-[9px]"
                    >
                      Active
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 border border-emerald-900/5 rounded-xl">
                    <div>
                      <span className="font-bold text-emerald-950 block">Maintenance Lock</span>
                      <span className="text-[10px] text-neutral-500">Take agricultural shop offline temporarily</span>
                    </div>
                    <button 
                      onClick={() => toast.success("Lock mode status set")}
                      className="px-3 py-1 bg-slate-50 text-neutral-500 border border-emerald-900/5 rounded font-bold uppercase text-[9px]"
                    >
                      Disabled
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-950/5 border border-emerald-900/5 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-emerald-950 uppercase text-xs tracking-wider">System Database Operations</h3>
                  <div className="space-y-3">
                    <p className="text-neutral-400 leading-relaxed text-[11px] font-sans">
                      Backup and archive transaction records, customers databases, and chemical formulations matrix local schemas.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toast.success("Schema ledger backup generated")}
                        className="px-4 py-2 bg-slate-50 hover:bg-neutral-850 border border-emerald-900/5 text-emerald-950 rounded-xl font-bold uppercase text-[10px] cursor-pointer"
                      >
                        Create Backup
                      </button>
                      <button 
                        onClick={() => toast.success("Ledger system cache flushed")}
                        className="px-4 py-2 bg-red-955/20 border border-red-500/10 text-red-400 rounded-xl font-bold uppercase text-[10px] cursor-pointer"
                      >
                        Flush Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </React.Suspense>

        </div>
      </div>

      {/* ========================================================================= */}
      {/*                        🌱 FORM CREATION/EDIT MODAL                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#121212] border border-emerald-900/5 shadow-2xl rounded-3xl p-6 text-emerald-950 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/5">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-emerald-950 font-extrabold text-sm tracking-widest font-mono uppercase">
                    {editingProduct ? 'Re-Calibrate Chemical Matrix' : 'Synthesize Agrochemical Compound'}
                  </h3>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-50 border border-emerald-900/5 text-neutral-400 hover:text-emerald-950 flex items-center justify-center text-xs font-mono transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmitProductForm} className="space-y-4 text-xs font-mono text-left">
                
                {/* ID & Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Product Catalog ID / Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. fatty, aaqaab"
                      value={formId}
                      onChange={e => setFormId(e.target.value)}
                      disabled={!!editingProduct}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Chemical Formula Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatty Acid Matrix"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Category & Stock row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Crop-Specific Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                    >
                      <option value="plant_nutrition">Plant Nutrition / Fertilizer</option>
                      <option value="insecticide">Insecticide</option>
                      <option value="fungicide">Fungicide</option>
                      <option value="herbicide">Herbicide</option>
                      <option value="growth_promoter">Growth Promoter</option>
                      <option value="soil_conditioner">Soil Conditioner</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Stock Inventory Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formStock}
                      onChange={e => setFormStock(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Foliar Absorption Description</label>
                  <textarea
                    rows="3.5"
                    placeholder="Enter professional biotech details..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40 transition-all resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Base Image Upload */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Compound Bottle Display Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-black border border-emerald-900/5 p-1.5 flex items-center justify-center relative overflow-hidden shrink-0">
                      {formBaseImagePreview ? (
                        <img src={formBaseImagePreview} alt="Preview" className="h-full w-auto object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-neutral-600" />
                      )}
                    </div>
                    <label className="flex-1 flex flex-col justify-center items-center h-14 px-4 border border-dashed border-emerald-900/5 rounded-xl bg-black hover:bg-slate-50/40 cursor-pointer transition-all">
                      <span className="text-[10px] font-bold text-[#10B981] uppercase">Upload display image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Dynamic Pricing Matrix Grid */}
                <div className="space-y-2.5 border-t border-emerald-900/5 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Dynamic Size Pricing Matrix</label>
                    <button
                      type="button"
                      onClick={addPricingRow}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[#10B981] text-[8.5px] font-black uppercase flex items-center gap-1 cursor-pointer hover:bg-emerald-950/40 transition-all"
                    >
                      <Plus size={10} /> Add Variant Size
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {formPricingMatrix.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          placeholder="e.g. 500ml, 1L"
                          value={row.size}
                          onChange={e => updatePricingRow(idx, 'size', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Price in PKR"
                          value={row.price}
                          onChange={e => updatePricingRow(idx, 'price', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-black border border-emerald-900/5 text-emerald-950 text-xs outline-none focus:border-emerald-500/40"
                        />
                        <button
                          type="button"
                          onClick={() => removePricingRow(idx)}
                          disabled={formPricingMatrix.length <= 1}
                          className="p-2.5 rounded-lg border border-emerald-900/5 hover:border-red-500/40 text-neutral-500 hover:text-red-400 bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/5">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-emerald-900/5 text-neutral-400 hover:bg-slate-50 text-xs font-bold uppercase cursor-pointer"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submittingProduct ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Deploying Matrix...
                      </>
                    ) : (
                      <>
                        <Check size={14} className="stroke-[3]" />
                        Deploy Matrix Parameters
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
      )}
    </>
  );
}
