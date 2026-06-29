import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, CheckCircle, AlertTriangle, MessageSquare, X } from 'lucide-react';

export default function NotificationCenter({ orders, lowStockCount, messages, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on live data
  useEffect(() => {
    let notifs = [];
    
    // New pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0) {
      notifs.push({
        id: 'new_orders',
        type: 'order',
        title: 'New Orders Pending',
        message: `You have ${pendingOrders.length} orders awaiting review.`,
        time: 'Just now',
        icon: Package,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10'
      });
    }

    // Low stock
    if (lowStockCount > 0) {
      notifs.push({
        id: 'low_stock',
        type: 'alert',
        title: 'Low Stock Alert',
        message: `${lowStockCount} products are running critically low on inventory.`,
        time: 'Active',
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-400/10'
      });
    }

    // Unread messages
    if (messages > 0) {
      notifs.push({
        id: 'new_messages',
        type: 'message',
        title: 'New Customer Inquiries',
        message: `You have ${messages} unread contact messages.`,
        time: 'Recent',
        icon: MessageSquare,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10'
      });
    }

    setNotifications(notifs);
    
    // Play sound if new unread appears
    if (notifs.length > unreadCount) {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.3;
            audio.play();
        } catch(e) { }
    }
    
    setUnreadCount(notifs.length);
  }, [orders, lowStockCount, messages]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-neutral-400 hover:text-white border border-white/5"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-wiggle" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden transform-gpu"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[9px] text-[#10B981] hover:text-[#8AD65A] uppercase tracking-wider font-bold">
                    Mark Read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto p-2" style={{ WebkitOverflowScrolling: "touch" }}>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500 flex flex-col items-center">
                    <CheckCircle size={24} className="mb-2 text-neutral-600" />
                    <p className="text-xs uppercase tracking-widest">All caught up</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-white/5 rounded-2xl transition-colors flex gap-3 cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.bg} ${n.color}`}>
                        <n.icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">{n.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-neutral-600 mt-1 block uppercase tracking-wider">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
