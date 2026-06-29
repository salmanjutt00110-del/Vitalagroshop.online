import React, { useState, useEffect } from 'react';
import { updateOrderStatus } from '@/lib/firestore/orders';
import { 
  User, 
  Download, 
  Printer,
  Truck,
  DollarSign,
  Map,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getThemeClasses } from './themeHelper';
import OrderTrackingModal from './OrderTrackingModal';

const STATUS_LABELS = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  processing: '⚙️ Processing',
  delivered: '📦 Delivered',
  cancelled: '❌ Cancelled'
};

export default function OrdersTable({ orders, activeFilter, theme }) {
  const c = getThemeClasses(theme);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Rider/Courier assignment states
  const [courierName, setCourierName] = useState('Leopards');
  const [trackingId, setTrackingId] = useState('');

  // Persist COD advance approvals locally
  const [verifiedAdvances, setVerifiedAdvances] = useState(() => {
    const saved = localStorage.getItem('vital_verified_cod_advances');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('vital_verified_cod_advances', JSON.stringify(verifiedAdvances));
  }, [verifiedAdvances]);

  const displayedOrders = orders.filter(o => {
    if (activeFilter === 'processing') {
      return o.status === 'processing' || o.status === 'packed' || o.status === 'shipped' || o.status === 'dispatched';
    }
    return o.status === activeFilter;
  });

  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(displayedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = displayedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleStatusChange = async (orderId, newStatus, paymentDetails = null) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, "", paymentDetails);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, paymentDetails: paymentDetails || prev.paymentDetails }));
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error('Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const copyAddress = (addr, id) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
    toast.success('Address copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVerifyAdvance = (orderId, status) => {
    setVerifiedAdvances(prev => ({ ...prev, [orderId]: status }));
    if (status === 'approved') {
      toast.success('PKR 299 Delivery Charge Verified. COD activated.');
    } else {
      toast.error('COD Deposit Verification rejected.');
    }
  };

  const handleDownloadPDF = async (order) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont("Helvetica");
    
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text(`VITAL AGRO CHEMICAL INDUSTRIES`, 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Plot 50 & 56, Vital Office, Haroonabad, Bahawalnagar`, 20, 30);
    doc.text(`Invoice Ref: #${order.orderNumber}`, 140, 30);
 
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
 
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`BILL TO:`, 20, 45);
    doc.setFontSize(10);
    doc.text(`Customer Name: ${order.customerName || order.customer?.name || 'N/A'}`, 20, 52);
    doc.text(`Phone: ${order.customerPhone || order.customer?.phone || 'N/A'}`, 20, 59);
    doc.text(`Shipping Address: ${order.address || order.customer?.address || 'N/A'}`, 20, 66);
    doc.text(`City: ${order.city || order.customer?.city || 'N/A'}`, 20, 73);
 
    doc.setFontSize(12);
    doc.text(`ORDER DETAILED BREAKDOWN:`, 20, 85);
    doc.setFontSize(10);
    
    doc.line(20, 90, 190, 90);
    doc.text(`Item Description`, 22, 95);
    doc.text(`Size`, 90, 95);
    doc.text(`Qty`, 130, 95);
    doc.text(`Total Price`, 160, 95);
    doc.line(20, 98, 190, 98);
 
    const productName = order.productName || order.item?.productName || 'N/A';
    const packSize = order.packSize || order.item?.packSize || 'N/A';
    const quantity = order.quantity || order.item?.quantity || 1;
    const grandTotal = order.grandTotal || order.totalAmount || 0;
 
    doc.text(productName, 22, 105);
    doc.text(packSize, 90, 105);
    doc.text(String(quantity), 132, 105);
    doc.text(`PKR ${grandTotal.toLocaleString()}`, 160, 105);
    doc.line(20, 110, 190, 110);
 
    doc.setFontSize(12);
    doc.text(`Grand Total: PKR ${grandTotal.toLocaleString()}`, 125, 125);
 
    doc.save(`Invoice-${order.orderNumber}.pdf`);
    toast.success('PDF invoice generated.');
  };

  const openWhatsApp = (phone, name) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    }
    const msg = encodeURIComponent(`Hello ${name}, this is Vital Agro Admin. Regarding your order...`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 w-full text-left">
      
      {/* Redesigned Clean Enterprise Table */}
      <div className={`overflow-x-auto rounded-2xl border ${theme === 'light' ? 'border-neutral-200 bg-white' : 'border-emerald-900/5 bg-black'}`}>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b text-[9px] font-mono tracking-wider uppercase ${
              theme === 'light' ? 'border-neutral-200 text-neutral-600 bg-neutral-50' : 'border-emerald-900/5 text-neutral-500 bg-[#121212]'
            }`}>
              <th className="py-3.5 px-4 font-bold">Client & Order Ref</th>
              <th className="py-3.5 px-4 font-bold">Contact Channel</th>
              <th className="py-3.5 px-4 font-bold">City & Shipping</th>
              <th className="py-3.5 px-4 font-bold">Ordered Product</th>
              <th className="py-3.5 px-4 font-bold font-mono">Amount Details</th>
              <th className="py-3.5 px-4 font-bold">Logistics Courier</th>
              <th className="py-3.5 px-4 font-bold">Payment Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className={`py-14 text-center border-b font-mono ${theme === 'light' ? 'border-neutral-200 text-neutral-500' : 'border-emerald-900/5 text-neutral-500'}`}>
                  No records matching filter tab.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const customerName = order.customerName || order.customer?.name || 'N/A';
                const customerPhone = order.customerPhone || order.customer?.phone || '';
                const city = order.city || order.customer?.city || 'N/A';
                const productName = order.productName || order.item?.productName || 'N/A';
                const quantity = order.quantity || order.item?.quantity || 1;
                const grandTotal = order.grandTotal || order.totalAmount || 0;
                
                // Payment state details
                const isOnline = order.paymentMethod?.toLowerCase() !== 'cod';
                const codVerified = verifiedAdvances[order.id] === 'approved';
                const advancePaid = isOnline ? `PKR ${grandTotal.toLocaleString()}` : 'PKR 299';
                const remainingCod = isOnline ? 'PKR 0' : `PKR ${(grandTotal >= 299 ? grandTotal - 299 : 0).toLocaleString()}`;
                
                return (
                  <tr 
                    key={order.id} 
                    className={`border-b transition-colors duration-150 ${
                      theme === 'light' ? 'border-neutral-200 hover:bg-neutral-50' : 'border-emerald-900/5 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Client Name & ID */}
                    <td className="py-4 px-4">
                      <div>
                        <span className={`font-bold block ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>#{order.orderNumber}</span>
                        <span className={`text-[10px] block font-sans mt-0.5 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>{customerName}</span>
                      </div>
                    </td>

                    {/* Contacts (Phone/WhatsApp) */}
                    <td className="py-4 px-4 font-mono">
                      <div className="space-y-1">
                        <a href={`tel:${customerPhone}`} className={`hover:underline block ${
                          theme === 'light' ? 'text-neutral-700 hover:text-black' : 'text-neutral-300 hover:text-emerald-950'
                        }`}>{customerPhone}</a>
                        <button 
                          onClick={() => openWhatsApp(customerPhone, customerName)}
                          className="text-[9px] bg-emerald-950/20 text-[#10B981] border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase block tracking-wider"
                        >
                          WhatsApp Chat
                        </button>
                      </div>
                    </td>

                    {/* City & Address */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className={`font-medium block ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>{city}</span>
                        <span className={`text-[10px] block truncate max-w-[140px] ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`} title={order.address}>{order.address}</span>
                      </div>
                    </td>

                    {/* Products & Quantity */}
                    <td className={`py-4 px-4 font-sans font-medium ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-300'}`}>
                      <div>
                        <span className="block truncate max-w-[150px]">{productName}</span>
                        <span className={`text-[10px] font-mono mt-0.5 block ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`}>{order.packSize || 'N/A'} × {quantity}</span>
                      </div>
                    </td>

                    {/* Subtotal, delivery charges, remaining COD */}
                    <td className="py-4 px-4 font-mono">
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>PKR {grandTotal.toLocaleString()}</span>
                        <span className={`text-[8px] block uppercase ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`}>
                          Adv: {advancePaid} | COD: {remainingCod}
                        </span>
                      </div>
                    </td>

                    {/* Logistics Courier */}
                    <td className="py-4 px-4 font-sans">
                      <div>
                        <span className={`font-semibold block ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>{order.courier || 'Leopards'}</span>
                        <span className={`text-[9px] font-mono block mt-0.5 ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`}>{order.trackingId || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Payment Status (TID Verification) */}
                    <td className="py-4 px-4 font-mono">
                      <div>
                        {isOnline ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-500/25 text-[#10B981] text-[9px] font-bold uppercase">Paid Online</span>
                        ) : codVerified ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-500/25 text-[#10B981] text-[9px] font-bold uppercase">COD Ready</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950/20 border border-amber-500/25 text-amber-500 text-[9px] font-bold uppercase">Awaiting PKR 299</span>
                        )}
                      </div>
                    </td>

                    {/* Detail Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={`px-3.5 py-1.5 font-bold rounded-lg border transition-all text-[10px] uppercase cursor-pointer ${
                          theme === 'light'
                            ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                            : 'bg-[#121212] hover:bg-neutral-800 border-emerald-900/10 hover:border-emerald-900/20 text-emerald-950'
                        }`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            Page {currentPage} of {totalPages} ({displayedOrders.length} entries)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border font-bold text-[9px] uppercase font-mono transition-all cursor-pointer ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed border-emerald-900/5 text-neutral-600'
                  : theme === 'light'
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    : 'bg-[#121212] hover:bg-neutral-800 border-emerald-900/10 text-emerald-950'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border font-bold text-[9px] uppercase font-mono transition-all cursor-pointer ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed border-emerald-900/5 text-neutral-600'
                  : theme === 'light'
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    : 'bg-[#121212] hover:bg-neutral-800 border-emerald-900/10 text-emerald-950'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER OVERLAY */}
      {selectedOrder && (() => {
        const order = selectedOrder;
        const isOnline = order.paymentMethod?.toLowerCase() !== 'cod';
        const isCOD = !isOnline;
        const codVerified = verifiedAdvances[order.id] === 'approved';
        
        const customerName = order.customerName || order.customer?.name || 'N/A';
        const customerPhone = order.customerPhone || order.customer?.phone || '';
        const city = order.city || order.customer?.city || 'N/A';
        const address = order.address || order.customer?.address || 'N/A';
        const productName = order.productName || order.item?.productName || 'N/A';
        const grandTotal = order.grandTotal || order.totalAmount || 0;

        return (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 ${theme === 'light' ? 'text-neutral-800' : 'text-emerald-950'}`}>
            <div className={`${c.modal} p-6 max-w-5xl w-full space-y-6 max-h-[92vh] overflow-y-auto text-left relative`}>
              
              {/* Top title */}
              <div className={`flex justify-between items-center border-b pb-4 ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                <div>
                  <h3 className={`font-extrabold text-sm uppercase tracking-widest font-mono ${theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'}`}>
                    Order Ledger #{order.orderNumber}
                  </h3>
                  <p className="text-[9px] text-neutral-500 mt-1 font-mono uppercase">
                    Verification checkpoint
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setZoom(1);
                  }}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer text-xs ${
                    theme === 'light'
                      ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                      : 'bg-slate-50 border border-emerald-900/5 hover:border-emerald-900/10 text-emerald-950'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Grid sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-xs">
                
                {/* Section 1: Customer Profile */}
                <div className={`rounded-2xl p-5 space-y-4 border ${theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-emerald-950/5 border-emerald-900/5'}`}>
                  <h4 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-2 flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-emerald-700 border-neutral-200' : 'text-[#10B981] border-emerald-900/5'
                  }`}>
                    <User size={13} /> Customer Details
                  </h4>
                  <div className={`space-y-3 font-mono text-[11px] ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-300'}`}>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Client Name</span>
                      <span className={`font-bold block ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>{customerName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Phone Contact</span>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${customerPhone}`} className={`font-bold block ${theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'}`}>{customerPhone}</a>
                        <button onClick={() => openWhatsApp(customerPhone, customerName)} className="px-2 py-0.5 bg-emerald-950/20 text-[#10B981] border border-emerald-500/20 rounded text-[9px] font-bold uppercase">WhatsApp</button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase block">Shipping Coordinates</span>
                      <span className={`block leading-relaxed ${theme === 'light' ? 'text-neutral-800' : 'text-emerald-950'}`}>{address}</span>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(city + ', ' + address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-[10px] hover:underline mt-1.5 font-bold uppercase ${theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'}`}
                      >
                        <Map size={11} /> Google Map
                      </a>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 border-t pt-3 ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase block">City</span>
                        <span className={`block ${theme === 'light' ? 'text-neutral-800' : 'text-emerald-950'}`}>{city}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase block">Province</span>
                        <span className={`block ${theme === 'light' ? 'text-neutral-800' : 'text-emerald-950'}`}>{order.province || order.customer?.province || 'Punjab'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Product payloads & COD rules */}
                <div className={`rounded-2xl p-5 space-y-4 border ${theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-emerald-950/5 border-emerald-900/5'}`}>
                  <h4 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-2 ${
                    theme === 'light' ? 'text-emerald-700 border-neutral-200' : 'text-[#10B981] border-emerald-900/5'
                  }`}>
                    📦 Order Payload
                  </h4>
                  
                  <div className="space-y-3">
                    <div className={`p-3 border rounded-xl text-left ${theme === 'light' ? 'bg-neutral-100 border-neutral-200' : 'bg-slate-50 border-emerald-900/5'}`}>
                      <span className={`font-bold block leading-tight ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>{productName}</span>
                      <span className={`text-[10px] block mt-1 uppercase font-mono ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-400'}`}>Size: {order.packSize || 'N/A'} • Qty: {order.quantity || 1}</span>
                    </div>

                    <div className={`space-y-2 pt-3 border-t font-mono text-[11px] ${theme === 'light' ? 'border-neutral-200 text-neutral-700' : 'border-emerald-900/5 text-neutral-300'}`}>
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>PKR {(grandTotal - (isOnline ? 0 : 299)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges:</span>
                        {isOnline ? (
                          <span className="text-[#10B981] font-bold">PKR 0 (PROMO)</span>
                        ) : (
                          <span className={`font-bold ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>PKR 299</span>
                        )}
                      </div>
                      <div className={`flex justify-between border-t border-dashed pt-2 text-xs ${theme === 'light' ? 'border-neutral-300' : 'border-emerald-900/10'}`}>
                        <span className={`font-bold ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Grand Total:</span>
                        <span className={`font-extrabold ${theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'}`}>PKR {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* COD rule box */}
                    {isCOD && (
                      <div className={`p-3 rounded-xl border leading-relaxed text-[10px] text-left space-y-1.5 mt-2 ${
                        codVerified ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400' : 'bg-amber-950/20 border-amber-500/25 text-amber-500'
                      }`}>
                        <span className="font-bold uppercase tracking-wider text-[8px] block">COD VERIFICATION REQUIRED</span>
                        <p>Customers must pay PKR 299 delivery fees in advance before Cash on Delivery activation.</p>
                        
                        {codVerified ? (
                          <div className="flex items-center gap-1.5 font-bold pt-1 border-t border-emerald-500/10 mt-1">
                            <CheckCircle size={12} /> verified: PKR 299 Advance Paid
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-2 border-t border-amber-500/10 mt-2 font-mono">
                            <button
                              onClick={() => handleVerifyAdvance(order.id, 'approved')}
                              className={`px-2 py-1 font-extrabold text-[8px] rounded uppercase cursor-pointer ${
                                theme === 'light' ? 'bg-emerald-600 hover:bg-emerald-700 text-emerald-950 shadow-sm' : 'bg-[#10B981] hover:bg-[#059669] text-black'
                              }`}
                            >
                              Approve PKR 299
                            </button>
                            <button
                              onClick={() => handleVerifyAdvance(order.id, 'rejected')}
                              className="px-2 py-1 bg-red-950/20 border border-red-500/20 text-red-400 font-bold text-[8px] rounded uppercase cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Receipt Screenshot */}
                <div className={`rounded-2xl p-5 space-y-4 border ${theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-emerald-950/5 border-emerald-900/5'}`}>
                  <h4 className={`font-bold uppercase tracking-wider text-[11px] border-b pb-2 ${
                    theme === 'light' ? 'text-emerald-700 border-neutral-200' : 'text-[#10B981] border-emerald-900/5'
                  }`}>
                    <DollarSign size={13} className="inline mr-1" /> Receipt Screen Proof
                  </h4>

                  <div className="space-y-3">
                    <div className={`flex justify-between items-center text-[9px] font-mono ${theme === 'light' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      <span>Interactive Zoom</span>
                      <div className="flex gap-1">
                        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className={`px-1.5 py-0.5 border rounded cursor-pointer ${theme === 'light' ? 'bg-neutral-200 border-neutral-300 text-black' : 'bg-slate-50 border-emerald-900/5 text-emerald-950'}`}>-</button>
                        <button onClick={() => setZoom(prev => Math.min(2, prev + 0.25))} className={`px-1.5 py-0.5 border rounded cursor-pointer ${theme === 'light' ? 'bg-neutral-200 border-neutral-300 text-black' : 'bg-slate-50 border-emerald-900/5 text-emerald-950'}`}></button>
                      </div>
                    </div>

                    <div className={`aspect-[3/4] border rounded-xl overflow-hidden flex items-center justify-center relative ${
                      theme === 'light' ? 'border-neutral-200 bg-neutral-100' : 'border-emerald-900/5 bg-white'
                    }`}>
                      <img 
                        src={order.proofScreenshotURL || order.paymentDetails?.receiptBase64 || order.paymentScreenshot || 'https://placehold.co/360x640/121212/10b981?text=TID+Proof+Receipt'} 
                        alt="Deposit Receipt" 
                        className="max-h-full max-w-full object-contain"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    </div>

                    <div className={`p-3 border rounded-xl text-left font-mono ${theme === 'light' ? 'bg-neutral-100 border-neutral-200' : 'bg-slate-50 border-emerald-900/5'}`}>
                      <span className="text-[8px] text-neutral-500 uppercase block">Transaction TID</span>
                      <span className={`font-bold block truncate ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>{order.tidString || order.paymentDetails?.refId || order.paymentTID || 'N/A'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rider Logistics & Reports */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-5 text-xs ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                {/* Rider allocation form */}
                <div className={`p-4 rounded-2xl space-y-3 border ${theme === 'light' ? 'bg-neutral-50 border-neutral-200' : 'bg-black/30 border-emerald-900/5'}`}>
                  <h5 className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'}`}>
                    <Truck size={13} /> Logistics Rider Assignment
                  </h5>
                  <div className="flex gap-2.5 items-end font-mono">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] text-neutral-500 uppercase block">Courier Company</label>
                      <select 
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                        className={`w-full px-2 py-1.5 border rounded-lg text-xs outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-[#121212] border-emerald-900/5 text-emerald-950'
                        }`}
                      >
                        <option value="Leopards">Leopards</option>
                        <option value="TCS">TCS Express</option>
                        <option value="M&P">M&P Logistics</option>
                        <option value="Local">Rider Hameed</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] text-neutral-500 uppercase block">Tracking ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. TRK-829..."
                        value={trackingId}
                        onChange={e => setTrackingId(e.target.value)}
                        className={`w-full px-2 py-1 border rounded-lg text-xs outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-300 text-neutral-800' : 'bg-[#121212] border-emerald-900/5 text-emerald-950'
                        }`}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!trackingId) return toast.error('Enter tracking ID');
                        handleStatusChange(order.id, 'processing', { courier: courierName, trackingId });
                        setTrackingId('');
                      }}
                      className={`px-3.5 py-1.5 font-extrabold text-[9px] rounded-lg cursor-pointer ${
                        theme === 'light' ? 'bg-emerald-600 hover:bg-emerald-700 text-emerald-950 shadow-sm' : 'bg-[#10B981] hover:bg-[#059669] text-black'
                      }`}
                    >
                      Dispatch
                    </button>
                  </div>
                </div>

                {/* Print/Download Invoice */}
                <div className="flex items-center justify-end gap-2.5 self-end">
                  <button 
                    onClick={() => handleDownloadPDF(order)}
                    className={`px-4 py-2.5 border rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-sm'
                        : 'bg-slate-50 border border-emerald-900/5 hover:border-emerald-900/10 text-emerald-950'
                    }`}
                  >
                    <Download size={13} /> Download Invoice
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className={`px-4 py-2.5 border rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-sm'
                        : 'bg-slate-50 border border-emerald-900/5 hover:border-emerald-900/10 text-emerald-950'
                    }`}
                  >
                    <Printer size={13} /> Print Invoice
                  </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className={`flex flex-wrap justify-between items-center border-t pt-5 gap-3 ${theme === 'light' ? 'border-neutral-200' : 'border-emerald-900/5'}`}>
                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`px-3.5 py-2 rounded-xl border font-mono text-[10px] uppercase font-bold cursor-pointer outline-none ${
                      theme === 'light'
                        ? 'bg-white border-neutral-300 text-neutral-800'
                        : 'bg-slate-50 border border-emerald-900/10 text-emerald-950'
                    }`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                    className="px-4 py-2.5 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 rounded-xl font-bold uppercase cursor-pointer"
                  >
                    Reject Order
                  </button>

                  {isCOD && !codVerified ? (
                    <button 
                      disabled
                      className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-500/50 rounded-xl font-bold uppercase cursor-not-allowed"
                      title="Please verify the PKR 299 advance deposit first"
                    >
                      Awaiting PKR 299 Deposit
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'confirmed')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase cursor-pointer shadow-md"
                    >
                      Accept & Confirm
                    </button>
                  )}

                  <button 
                    onClick={() => handleStatusChange(order.id, 'delivered')}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase cursor-pointer shadow-md"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
