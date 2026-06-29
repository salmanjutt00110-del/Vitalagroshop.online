import { PAYMENT_METHODS } from './payment/config';

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '923011837160';

export const buildOrderMessage = (order) => {
  const payMethodId = (order.paymentMethod || '').toLowerCase();
  const payMethod = PAYMENT_METHODS.find(m => m.id.toLowerCase() === payMethodId);
  
  const pName = order.productName || order.item?.productName || 'N/A';
  const pSize = order.packSize || order.item?.packSize || 'N/A';
  const pQty = Number(order.quantity || order.item?.quantity || 1);
  const pPrice = Number(order.price || order.item?.price || order.pricePerUnit || 0);
  
  const deliveryCharge = order.deliveryCharge !== undefined 
    ? Number(order.deliveryCharge) 
    : (payMethodId === 'cod' ? 299 : 0);
    
  const pSubtotal = order.subtotal 
    ? Number(order.subtotal) 
    : (order.totalAmount ? Number(order.totalAmount) - deliveryCharge : pPrice * pQty);
    
  const pGrandTotal = order.grandTotal || order.totalAmount || (pSubtotal + deliveryCharge);
  
  const cName = order.customerName || order.customer?.name || 'N/A';
  const cPhone = order.customerPhone || order.customer?.phone || '';
  const cCity = order.customerCity || order.city || order.customer?.city || 'N/A';
  const cProv = order.customerProvince || order.province || order.customer?.province || '';
  const cAddr = order.customerAddress || order.address || order.customer?.address || 'N/A';

  const lines = [
    `🌾 *New Order — Vital Agro*`,
    `📋 Order #: ${order.orderNumber || 'Pending'}`,
    ``,
    `📦 *Product:* ${pName} (${pSize})`,
    `🔢 *Quantity:* ${pQty}`,
    ``,
    `💰 Subtotal: PKR ${pSubtotal?.toLocaleString()}`,
    `🚚 Delivery: ${deliveryCharge === 0 ? 'FREE 🎁' : `PKR ${deliveryCharge}`}`,
    `💳 *Grand Total: PKR ${pGrandTotal?.toLocaleString()}*`,
    ``,
    `💳 *Payment:* ${payMethod?.label || order.paymentMethod}`,
    payMethodId !== 'cod'
      ? `🔑 *Transaction ID (TID):* ${order.paymentTID || 'Pending'}\n📸 Please send payment screenshot to confirm order`
      : `✅ Cash on Delivery — Pay full amount at door`,
    ``,
    `👤 *Customer:*`,
    `Name: ${cName}`,
    `Phone: ${cPhone}`,
    `City: ${cCity}${cProv ? `, ${cProv}` : ''}`,
    `Address: ${cAddr}`,
    order.instructions ? `📝 Note: ${order.instructions}` : null,
    ``,
    `_via vital-agro.vercel.app_`,
  ].filter(val => val !== null && val !== undefined && val !== '').join('\n');

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
};
