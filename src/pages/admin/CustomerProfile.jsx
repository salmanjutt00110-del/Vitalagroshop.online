import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Mail, ShieldAlert, Star, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerProfile({ orders }) {
  // Extract unique customers from orders list dynamically
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Storage for VIP/Blocked status and Customer Notes to persist client-side
  const [customerMeta, setCustomerMeta] = useState(() => {
    const saved = localStorage.getItem('vital_customer_meta');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('vital_customer_meta', JSON.stringify(customerMeta));
  }, [customerMeta]);

  // Aggregate customer directory records from orders list
  const customerMap = {};
  orders.forEach(o => {
    const name = o.customerName || o.customer?.name || 'N/A';
    const phone = o.customerPhone || o.customer?.phone || 'N/A';
    const email = o.customerEmail || o.customer?.email || 'N/A';
    const address = o.address || o.customer?.address || 'N/A';
    const city = o.city || o.customer?.city || 'N/A';
    
    // Unique key is phone or email
    const key = phone !== 'N/A' ? phone : email;
    if (key === 'N/A') return;

    if (!customerMap[key]) {
      customerMap[key] = {
        id: key,
        name,
        phone,
        email,
        address,
        city,
        totalSpend: 0,
        ordersList: [],
        lastOrderDate: null,
      };
    }

    const orderTotal = o.grandTotal || o.totalAmount || 0;
    customerMap[key].totalSpend += orderTotal;
    customerMap[key].ordersList.push(o);

    // Track last order date
    let orderDate = null;
    if (o.createdAt) {
      if (typeof o.createdAt.toDate === 'function') {
        orderDate = o.createdAt.toDate();
      } else if (o.createdAt.seconds) {
        orderDate = new Date(o.createdAt.seconds * 1000);
      } else {
        orderDate = new Date(o.createdAt);
      }
    }
    if (orderDate) {
      if (!customerMap[key].lastOrderDate || orderDate > customerMap[key].lastOrderDate) {
        customerMap[key].lastOrderDate = orderDate;
      }
    }
  });

  const customerList = Object.values(customerMap);

  const handleToggleVIP = (cId) => {
    setCustomerMeta(prev => {
      const current = prev[cId] || {};
      const updated = {
        ...prev,
        [cId]: { ...current, isVIP: !current.isVIP }
      };
      toast.success(updated[cId].isVIP ? 'Customer marked as VIP' : 'VIP status removed');
      return updated;
    });
  };

  const handleToggleBlock = (cId) => {
    setCustomerMeta(prev => {
      const current = prev[cId] || {};
      const updated = {
        ...prev,
        [cId]: { ...current, isBlocked: !current.isBlocked }
      };
      toast.success(updated[cId].isBlocked ? 'Customer BLOCKED from system' : 'Customer unblocked');
      return updated;
    });
  };

  const handleSaveNotes = (cId, notesText) => {
    setCustomerMeta(prev => {
      const current = prev[cId] || {};
      return {
        ...prev,
        [cId]: { ...current, notes: notesText }
      };
    });
    toast.success('Customer notes saved.');
  };

  const openWhatsApp = (phone, name) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.slice(1);
    }
    const msg = encodeURIComponent(`Hello ${name}, this is Vital Agro Admin. Regarding your account...`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // View specific customer detail sheet
  if (selectedCustomerId) {
    const customer = customerMap[selectedCustomerId];
    if (!customer) {
      setSelectedCustomerId(null);
      return null;
    }

    const meta = customerMeta[customer.id] || { isVIP: false, isBlocked: false, notes: '' };
    const avatarInitials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Favorite products lookup
    const favProducts = {};
    customer.ordersList.forEach(o => {
      const prod = o.productName || o.item?.productName || 'N/A';
      favProducts[prod] = (favProducts[prod] || 0) + 1;
    });
    const favoriteProduct = Object.entries(favProducts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return (
      <div className="space-y-6 text-emerald-950 text-left font-sans">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedCustomerId(null)}
            className="p-2 bg-slate-50 hover:bg-neutral-800 border border-emerald-900/5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase text-[#10B981] font-mono">Customer Ledger Details</h2>
            <p className="text-neutral-400 text-[10px] uppercase font-mono mt-0.5">Detailed purchase summary and administrative records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Customer Avatar, Contact, Toggles */}
          <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl font-black mb-3 font-mono">
                {avatarInitials}
              </div>
              <h3 className="text-emerald-950 font-extrabold text-base leading-tight flex items-center gap-2">
                {customer.name}
                {meta.isVIP && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
              </h3>
              <p className="text-neutral-400 text-xs mt-1 font-mono uppercase">{customer.city}</p>
            </div>

            <div className="space-y-3.5 border-t border-emerald-900/5 pt-4 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <div className="flex items-center gap-2">
                  <a href={`tel:${customer.phone}`} className="text-neutral-200 hover:underline">{customer.phone}</a>
                  <button 
                    onClick={() => openWhatsApp(customer.phone, customer.name)}
                    className="text-[9px] bg-emerald-950/20 text-[#10B981] border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                  >
                    WA Chat
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-neutral-200 truncate block max-w-[200px]" title={customer.email}>{customer.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="text-neutral-200 break-words leading-tight block">{customer.address}</span>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(customer.city + ', ' + customer.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] text-[#10B981] hover:underline font-bold uppercase"
                  >
                    <ExternalLink size={10} /> Google Maps Location
                  </a>
                </div>
              </div>
            </div>

            {/* VIP / Block switches */}
            <div className="border-t border-emerald-900/5 pt-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" /> VIP Status
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={meta.isVIP} 
                    onChange={() => handleToggleVIP(customer.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-neutral-850 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Blocked Account
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={meta.isBlocked} 
                    onChange={() => handleToggleBlock(customer.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-neutral-850 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: Stats and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats matrix grid */}
            <div className="grid grid-cols-3 gap-4 font-mono text-center">
              <div className="p-4 bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-xl space-y-1">
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Total Spent</span>
                <span className="text-sm font-bold text-emerald-400 block">PKR {customer.totalSpend.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-xl space-y-1">
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Total Orders</span>
                <span className="text-sm font-bold text-emerald-950 block">{customer.ordersList.length}</span>
              </div>
              <div className="p-4 bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-xl space-y-1">
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Favorite Product</span>
                <span className="text-[9px] font-bold text-emerald-950 block truncate uppercase" title={favoriteProduct}>{favoriteProduct}</span>
              </div>
            </div>

            {/* Note text field */}
            <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-3">
              <h4 className="text-emerald-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Administrative Notes
              </h4>
              <textarea 
                rows="3"
                defaultValue={meta.notes}
                placeholder="Write custom customer observations, address instructions, or order logs..."
                id={`customer-notes-${customer.id}`}
                className="w-full bg-emerald-950/5 border border-[#10b981]/15 rounded-xl p-3 text-xs outline-none focus:border-emerald-500/40 resize-none text-emerald-950 font-mono"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const txt = document.getElementById(`customer-notes-${customer.id}`).value;
                    handleSaveNotes(customer.id, txt);
                  }}
                  className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-[10px] rounded-lg uppercase cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Purchase logs */}
            <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-4">
              <h4 className="text-emerald-950 font-bold text-xs uppercase tracking-wider">Purchase History Registry</h4>
              <div className="overflow-y-auto max-h-[220px] space-y-3">
                {customer.ordersList.map(o => (
                  <div key={o.id} className="p-3 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl flex justify-between items-center text-xs font-mono">
                    <div className="text-left space-y-1">
                      <span className="text-emerald-950 font-bold block">Order #{o.orderNumber}</span>
                      <span className="text-neutral-400 text-[9px] block">
                        {o.productName || o.item?.productName || 'N/A'} ({o.packSize || o.item?.packSize || 'N/A'})
                      </span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-emerald-400 font-bold block">PKR {(o.grandTotal || o.totalAmount || 0).toLocaleString()}</span>
                      <span className="text-[8px] bg-emerald-950/10 border border-[#10b981]/15 px-2 py-0.5 rounded uppercase font-bold text-neutral-300">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-emerald-950 text-left font-sans">
      <div>
        <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Customer Directory</h2>
        <p className="text-neutral-500 text-xs mt-1">Directory registry tracking unique clients and lifetime spend metrics</p>
      </div>

      <div className="bg-emerald-950/5 border border-[#10b981]/15 rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-emerald-900/5 text-[9px] font-mono text-neutral-500 tracking-wider uppercase bg-[#121212]">
              <th className="py-3.5 px-4 font-bold">Customer Name</th>
              <th className="py-3.5 px-4 font-bold">Contact Phone</th>
              <th className="py-3.5 px-4 font-bold">City</th>
              <th className="py-3.5 px-4 font-bold">Total Orders</th>
              <th className="py-3.5 px-4 font-bold">Lifetime Spend</th>
              <th className="py-3.5 px-4 font-bold">Status Tags</th>
              <th className="py-3.5 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {customerList.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-14 text-center border-b border-emerald-900/5 text-neutral-500 font-mono">
                  No customers found.
                </td>
              </tr>
            ) : (
              customerList.map(c => {
                const meta = customerMeta[c.id] || { isVIP: false, isBlocked: false };
                return (
                  <tr key={c.id} className="border-b border-emerald-900/5 hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-bold text-emerald-950 flex items-center gap-1.5">
                      {c.name}
                      {meta.isVIP && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      <div className="flex items-center gap-2">
                        <span>{c.phone}</span>
                        <button 
                          onClick={() => openWhatsApp(c.phone, c.name)}
                          className="text-[8px] bg-emerald-950/20 text-[#10B981] border border-emerald-500/25 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider"
                        >
                          Chat
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">{c.city}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">{c.ordersList.length}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">PKR {c.totalSpend.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex gap-1.5">
                        {meta.isVIP && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">VIP</span>}
                        {meta.isBlocked && <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">BLOCKED</span>}
                        {!meta.isVIP && !meta.isBlocked && <span className="text-neutral-500 text-[8px] uppercase">Standard</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="px-3 py-1.5 bg-[#121212] hover:bg-neutral-850 text-emerald-950 font-bold rounded-lg border border-emerald-900/10 hover:border-emerald-900/20 transition-all text-[10px] uppercase cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

