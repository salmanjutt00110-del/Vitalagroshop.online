export const WHATSAPP_NUMBER = '923011837160';

export const DELIVERY_CHARGES = {
  'Punjab':    260,
  'Sindh':     320,
  'KPK':       350,
  'Balochistan': 380,
  'Islamabad': 280,
  'AJK':       350,
  'GB':        400,
};

export const getDeliveryCharge = (province) => {
  return DELIVERY_CHARGES[province] || 280;
};

/**
 * Formats order details into a clean WhatsApp text layout.
 * 
 * @param {object} order - Order details containing customer and product variables.
 * @returns {string} Encoded WhatsApp message URI content.
 */
export const formatWhatsAppMessage = (order) => {
  const subtotal = order.pricePerUnit * order.quantity;
  const deliveryCharge = order.deliveryCharge || getDeliveryCharge(order.province);
  const grandTotal = subtotal + deliveryCharge;
  const note = order.specialInstructions || order.notes || '';

  const message = `🌾 *New Order — Vital Agro*

📦 *Product:* ${order.productName} (${order.packSize})
🔢 *Qty:* ${order.quantity}
💰 *Subtotal:* PKR ${subtotal.toLocaleString()}
🚚 *Delivery:* PKR ${deliveryCharge}
💳 *Grand Total:* PKR ${grandTotal.toLocaleString()}

👤 *Customer:*
Name: ${order.customerName}
Phone: ${order.phone}
City: ${order.city}, ${order.province}
Address: ${order.address}
${note ? `📝 Note: ${note}` : ''}

✅ *Payment:* ${order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
`;

  return encodeURIComponent(message);
};

/**
 * Generates the redirect URL pointing to the business WhatsApp.
 * 
 * @param {object} order 
 * @returns {string} WhatsApp Redirect URL string.
 */
export const buildWhatsAppURL = (order) => {
  const message = formatWhatsAppMessage(order);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

