import React, { Suspense, useState, useEffect } from 'react';
import { PRODUCTS_DATA } from '@/data/productsData';
import { useNavigate } from 'react-router-dom';

const ProductShowcase3D = React.lazy(() => import('../sections/ProductShowcase3D').then(m => ({ default: m.ProductShowcase3D })));
const ProductSwipe3D = React.lazy(() => import('../sections/ProductSwipe3D'));

export default function ProductsShowcase() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openCheckout = (product) => {
    const sizeParam = product.defaultSize ? `&size=${encodeURIComponent(product.defaultSize)}` : '';
    navigate(`/checkout?product=${product.slug || product.id}${sizeParam}`);
  };

  const rawProducts = Object.values(PRODUCTS_DATA).filter(p => p.id || p.slug);

  return (
    <Suspense fallback={
      <div className="h-[400px] flex items-center justify-center bg-[#02140c] text-white/40 text-xs tracking-widest font-black uppercase">
        Loading Showcase...
      </div>
    }>
      {isMobile ? (
        <ProductSwipe3D products={rawProducts} openCheckout={openCheckout} autoplay={true} />
      ) : (
        <ProductShowcase3D />
      )}
    </Suspense>
  );
}