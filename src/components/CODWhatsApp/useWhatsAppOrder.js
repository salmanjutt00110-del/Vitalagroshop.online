import { useState } from 'react';
import { createOrder } from '@/lib/firestore/orders';
import { buildWhatsAppURL, getDeliveryCharge } from './orderMessage';

/**
 * Custom React hook to orchestrate bottom-sheet order form state,
 * input validations, quantity calculation, database creation, and WhatsApp dispatch URLs.
 * 
 * @param {object} product - Full product details object.
 * @param {string} [defaultSize] - Initial pack size parameter.
 * @param {number} [defaultQuantity] - Initial quantity parameter.
 */
export const useWhatsAppOrder = (product, defaultSize = null, defaultQuantity = 1) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Helper to extract the first available size name
  const getInitialSize = () => {
    if (defaultSize) return defaultSize;
    if (!product || !product.sizes || product.sizes.length === 0) {
      return product?.packaging || '100ML';
    }
    const first = product.sizes[0];
    return typeof first === 'object' ? first.size : first;
  };

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    province: '',
    postalCode: '',
    specialInstructions: '',
    quantity: defaultQuantity || 1,
    selectedSize: getInitialSize(),
    paymentMethod: 'COD',
    paymentRefId: '',
    paymentAmount: 0,
    paymentTimestamp: '',
    receiptBase64: '',
    paymentSender: '',
    paymentReceiver: '',
    paymentReceiverWallet: '',
    paymentConfidence: 1.0,
    paymentDuplicate: false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.customerName.trim())    e.customerName = 'Name is required';
    if (!form.phone.trim())           e.phone = 'Phone is required';
    if (form.phone && !/^0\d{10}$/.test(form.phone.replace(/[-\s]/g, '')))
                                      e.phone = 'Enter valid Pakistani number (0XXXXXXXXXX)';
    if (!form.city.trim())            e.city = 'City is required';
    if (!form.address.trim())         e.address = 'Address is required';
    if (!form.province.trim())        e.province = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Resolves the correct price number matching the selected packing size
  const getPriceForSize = (selectedSizeName) => {
    if (!product) return 999;
    
    if (product.sizes && product.sizes.length > 0) {
      const match = product.sizes.find(s => {
        const sizeVal = typeof s === 'object' ? s.size : s;
        return sizeVal === selectedSizeName;
      });
      if (match && typeof match === 'object') {
        return match.price || match.rate || 999;
      }
    }
    
    if (product.pricing && product.pricing.length > 0) {
      const match = product.pricing.find(p => p.size === selectedSizeName);
      if (match) {
        return Number(match.rate) || 999;
      }
    }

    return product.price || 999;
  };

  const submitOrder = async () => {
    const price = getPriceForSize(form.selectedSize);
    const prodName = typeof product.name === 'object' ? (product.name.en || product.name) : product.name;
    const imageSrc = product.pngUrl || product.imageUrl || product.image || "";
    const deliveryCharge = getDeliveryCharge(form.province);
    const totalAmount = price * form.quantity + deliveryCharge;

    const orderPayload = {
      item: {
        productId:    product.id || product.slug,
        productName:  prodName,
        category:     product.category,
        packSize:     form.selectedSize,
        quantity:     form.quantity,
        pricePerUnit: price,
        totalPrice:   price * form.quantity,
        productImage: imageSrc,
      },
      customer: {
        name:       form.customerName,
        phone:      form.phone,
        email:      form.email || '',
        city:       form.city,
        address:    form.address,
        province:   form.province,
        postalCode: form.postalCode,
      },
      specialInstructions: form.specialInstructions,
      totalAmount:   totalAmount,
      deliveryCharge: deliveryCharge,
      paymentMethod: form.paymentMethod || 'COD',
      paymentDetails: form.paymentMethod !== 'COD' ? {
        refId: form.paymentRefId || '',
        amountPaid: Number(form.paymentAmount) || 0,
        timestamp: form.paymentTimestamp || '',
        receiptBase64: form.receiptBase64 || '',
        status: form.paymentMethod === 'Stripe' ? 'approved' : 'pending_approval',
        senderName: form.paymentSender || '',
        receiverName: form.paymentReceiver || '',
        receiverWallet: form.paymentReceiverWallet || '',
        confidenceScore: form.paymentConfidence || 1.0,
        duplicateDetected: form.paymentDuplicate || false,
      } : null,
      source:        'website_checkout',
      whatsappSent:  true,
    };

    let createdId = null;
    try {
      createdId = await createOrder(orderPayload);
      setOrderId(createdId);
    } catch (err) {
      console.error('Order Firestore save failed:', err);
    }

    const url = buildWhatsAppURL({
      ...form,
      productName:  prodName,
      packSize:     form.selectedSize,
      pricePerUnit: price,
      deliveryCharge: deliveryCharge,
    });
    window.open(url, '_blank');
    return createdId;
  };

  const resetForm = () => {
    setIsOpen(false);
    setForm(prev => ({
      ...prev,
      customerName: '',
      phone: '',
      city: '',
      address: '',
      province: '',
      postalCode: '',
      specialInstructions: '',
      quantity: 1,
      paymentMethod: 'COD',
      paymentRefId: '',
      paymentAmount: 0,
      paymentTimestamp: '',
      receiptBase64: '',
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await submitOrder();
      resetForm();
    } catch (err) {
      console.error('Legacy submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen, setIsOpen, form, setForm,
    errors, isSubmitting, setIsSubmitting, orderId, handleSubmit,
    validate, submitOrder, resetForm,
  };
};
