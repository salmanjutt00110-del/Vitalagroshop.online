import { useState, useMemo } from 'react';
import { getDeliveryFee } from '@/lib/payment/config';

/**
 * A reusable hook to calculate product pricing, subtotal, grand total, and delivery fees based on selected size, quantity, and payment method.
 *
 * @param {Object} product - The product object from PRODUCTS_DATA.
 * @param {string} initialSize - The default selected size.
 * @param {number} initialQty - The default quantity.
 * @param {string} paymentMethod - The default payment method.
 */
export default function useProductPricing(product, initialSize = '', initialQty = 1, paymentMethod = 'cod') {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [quantity, setQuantity] = useState(initialQty);

  // Extract sizes array safely from product structure
  const sizesList = useMemo(() => {
    if (!product) return [];
    return product.sizes || [];
  }, [product]);

  // Determine active size name with fallback to default packaging or first size item
  const activeSizeName = useMemo(() => {
    if (selectedSize) return selectedSize;
    if (sizesList.length > 0) {
      return typeof sizesList[0] === 'object' ? sizesList[0].size : sizesList[0];
    }
    return product?.packaging || '100 ML';
  }, [selectedSize, sizesList, product]);

  const pricingDetails = useMemo(() => {
    if (!product) {
      return {
        unitPrice: 0,
        originalPrice: 0,
        subtotal: 0,
        savings: 0,
        deliveryFee: 0,
        grandTotal: 0,
        selectedSizeObj: null,
        sku: '',
        weight: '',
        stockStatus: 'Out of Stock'
      };
    }

    // Find selected size object in sizes list (case-insensitive & whitespace-tolerant match)
    let sizeObj = null;
    if (sizesList.length > 0) {
      sizeObj = sizesList.find(
        s => (typeof s === 'object' ? s.size : s).toLowerCase().replace(/\s+/g, '') === activeSizeName.toLowerCase().replace(/\s+/g, '')
      );
    }

    let unitPrice = product.price || 999;
    let originalPrice = 0;
    let sku = product.productCode || '';
    let weight = 'N/A';
    let stockStatus = 'In Stock';

    if (sizeObj && typeof sizeObj === 'object') {
      unitPrice = sizeObj.price;
      originalPrice = sizeObj.oldPrice || 0;
      sku = sizeObj.sku || product.productCode;
      weight = sizeObj.weight || 'N/A';
      stockStatus = sizeObj.stockStatus || 'In Stock';
    } else {
      // Look in product.pricing as a secondary fallback
      const pricingList = product.pricing || [];
      const fallbackObj = pricingList.find(
        p => p.size.toLowerCase().replace(/\s+/g, '') === activeSizeName.toLowerCase().replace(/\s+/g, '')
      );
      if (fallbackObj) {
        unitPrice = Number(fallbackObj.rate) || unitPrice;
        sku = product.productCode || '';
      }
    }

    const subtotal = unitPrice * quantity;
    const deliveryFee = getDeliveryFee(paymentMethod);
    const grandTotal = subtotal + deliveryFee;
    const savings = originalPrice > unitPrice ? (originalPrice - unitPrice) * quantity : 0;

    return {
      unitPrice,
      originalPrice,
      subtotal,
      savings,
      deliveryFee,
      grandTotal,
      selectedSizeObj: sizeObj,
      sku,
      weight,
      stockStatus
    };
  }, [product, activeSizeName, sizesList, quantity, paymentMethod]);

  return {
    selectedSize: activeSizeName,
    setSelectedSize,
    quantity,
    setQuantity,
    paymentMode: paymentMethod,
    setPaymentMode: () => {},
    ...pricingDetails,
    sizesList
  };
}
