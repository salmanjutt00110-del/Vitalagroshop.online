import { jsPDF } from 'jspdf';

/**
 * Dynamically generates and downloads a clean, professional PDF invoice for an order.
 * 
 * @param {object} order - Firestore order details object.
 */
export function downloadInvoice(order) {
  if (!order) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color Palette
  const darkGreen = [10, 46, 31];
  const brightGreen = [92, 184, 92];
  const gold = [197, 160, 89];
  const darkGray = [80, 80, 80];

  // Header Banner Background
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, 210, 45, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('VITAL AGRO CHEMICAL INDUSTRIES', 15, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...brightGreen);
  doc.text('PREMIUM CROP PROTECTION & PLANT NUTRITION', 15, 24);

  doc.setFontSize(14);
  doc.setTextColor(...gold);
  doc.text('OFFICIAL BILL / INVOICE', 15, 36);

  // Invoice Meta (Top Right)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Invoice No: ${order.orderNumber || 'VA-TEMP'}`, 150, 18);
  const dateStr = order.createdAt?.toDate 
    ? new Date(order.createdAt.toDate()).toLocaleDateString()
    : new Date().toLocaleDateString();
  doc.text(`Date: ${dateStr}`, 150, 24);
  doc.text(`Payment: ${order.paymentMethod || 'COD'}`, 150, 30);

  // Customer Details Block
  doc.setTextColor(...darkGreen);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BILL TO:', 15, 58);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${order.customer?.name || 'Customer'}`, 15, 65);
  doc.text(`Phone: ${order.customer?.phone || '-'}`, 15, 71);
  doc.text(`City: ${order.customer?.city || '-'}`, 15, 77);
  doc.text(`Address: ${order.customer?.address || '-'}`, 15, 83);

  // Table Grid Headers
  doc.setFillColor(240, 244, 241);
  doc.rect(15, 95, 180, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text('ITEM DESCRIPTION', 18, 100);
  doc.text('PACK SIZE', 80, 100);
  doc.text('QTY', 120, 100);
  doc.text('RATE (PKR)', 140, 100);
  doc.text('TOTAL (PKR)', 170, 100);

  // Draw Line
  doc.setDrawColor(220, 225, 221);
  doc.line(15, 103, 195, 103);

  // Table Rows (Order Item)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(order.item?.productName || 'Agricultural Chemical Product', 18, 110);
  doc.text(order.item?.packSize || 'Standard Pack', 80, 110);
  doc.text(String(order.item?.quantity || 1), 120, 110);
  doc.text(Number(order.item?.pricePerUnit || order.totalAmount).toLocaleString(), 140, 110);
  doc.text(Number(order.totalAmount).toLocaleString(), 170, 110);

  // Bottom divider line
  doc.line(15, 115, 195, 115);

  // Total Summary
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...darkGreen);
  doc.text('Grand Total:', 140, 126);
  doc.text(`PKR ${Number(order.totalAmount).toLocaleString()}`, 170, 126);

  // Terms and conditions
  doc.setTextColor(...darkGray);
  doc.setFontSize(8);
  doc.text('TERMS & CONDITIONS:', 15, 150);
  doc.setFont('Helvetica', 'normal');
  doc.text('1. Cash on Delivery orders are verified and processed upon receipt.', 15, 155);
  doc.text('2. Formulations comply with international standard crop safety thresholds.', 15, 160);
  doc.text('3. For complaints or query returns, contact support within 24 hours.', 15, 165);

  // Footer Banner
  doc.setFillColor(248, 250, 248);
  doc.rect(15, 250, 180, 20, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFont('Helvetica', 'bold');
  doc.text('Thank you for choosing Vital Agro Chemical Industries!', 55, 260);
  doc.setFont('Helvetica', 'normal');
  doc.text('Helpline: +92-301-1837160 | Website: vital-agro.vercel.app', 58, 265);

  // Save the document matching order title
  doc.save(`Invoice-${order.orderNumber || 'VA-ORDER'}.pdf`);
}
