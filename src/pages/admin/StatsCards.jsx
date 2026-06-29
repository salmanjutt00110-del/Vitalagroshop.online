import React from 'react';
import { 
  Tractor, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  Users, 
  Layers, 
  AlertTriangle,
  XCircle,
  CreditCard,
  Truck,
  Star,
  Package,
  Mail,
  Ticket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getThemeClasses } from './themeHelper';

export default function StatsCards({ stats, theme }) {
  const c = getThemeClasses(theme);
  const cards = [
    { label: 'TOTAL ORDERS', value: stats.total, icon: Tractor, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'ALL RECORDS' },
    { label: 'PENDING REVIEW', value: stats.pending, icon: Clock, color: theme === 'light' ? '#b45309' : '#8AFF4A', desc: 'AWAITING APPROVAL', pulse: stats.pending > 0 },
    { label: 'CONFIRMED', value: stats.confirmed, icon: UserCheck, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'APPROVED ORDERS' },
    { label: 'PROCESSING', value: stats.processing, icon: Package, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'PACKED & DISPATCHED' },
    { label: 'DELIVERED', value: stats.delivered, icon: CheckCircle, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'COMPLETED SALES' },
    { label: 'CANCELLED', value: stats.cancelled, icon: XCircle, color: '#ef4444', desc: 'PURGED TRANSACTIONS' },
    { label: 'COD ORDERS', value: stats.cod, icon: Truck, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'CASH ON DELIVERY' },
    { label: 'ONLINE PAID', value: stats.online, icon: CreditCard, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'BANK TRANSFER' },
    { label: 'REVENUE TODAY', value: `PKR ${stats.revenueToday.toLocaleString()}`, icon: DollarSign, color: theme === 'light' ? '#059669' : '#8AFF4A', desc: 'DELIVERED TODAY' },
    { label: 'MONTHLY NET', value: `PKR ${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: theme === 'light' ? '#059669' : '#8AFF4A', desc: 'DELIVERED THIS MONTH' },
    { label: 'CUSTOMERS', value: stats.totalCustomers, icon: Users, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'REGISTERED BUYERS' },
    { label: 'DEALERS', value: stats.totalDealers, icon: Star, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'FRANCHISE STORES' },
    { label: 'TOTAL PRODUCTS', value: stats.totalProducts, icon: Layers, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'DISTRIBUTED FORMULAS' },
    { label: 'LOW STOCK ALERT', value: stats.lowStock, icon: AlertTriangle, color: '#ef4444', desc: 'STOCK < 10 UNITS', pulse: stats.lowStock > 0 },
    { label: 'ACTIVE COUPONS', value: stats.totalCoupons, icon: Ticket, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'PROMO OFFERS' },
    { label: 'INBOX MESSAGES', value: stats.messages, icon: Mail, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'CUSTOMER INQUIRIES' },
    { label: 'CUSTOMER REVIEWS', value: stats.reviews, icon: Star, color: theme === 'light' ? '#059669' : '#32D74B', desc: 'PUBLISHED RATINGS' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPulse = card.pulse;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.015 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 border ${c.card} ${
              isPulse 
                ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/5' 
                : theme === 'website' 
                  ? 'border-[rgba(50,215,75,0.15)] hover:border-[#32D74B]/40 hover:shadow-[0_0_15px_rgba(50,215,75,0.1)]'
                  : 'hover:border-neutral-300 dark:hover:border-slate-600 hover:shadow-md'
            }`}
          >
            {/* Ambient inner card glow (only for website/dark theme) */}
            {theme !== 'light' && (
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#32D74B]/5 rounded-full blur-2xl pointer-events-none" />
            )}

            {/* Top row: Icon and desc */}
            <div className="flex justify-between items-start gap-2 mb-3 relative z-10">
              <div 
                className={`p-1.5 rounded-lg border flex items-center justify-center ${theme === 'light' ? 'bg-neutral-100 border-neutral-200' : 'bg-black/50'}`}
                style={theme !== 'light' ? { borderColor: `${card.color}25` } : {}}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <span className={`text-[7.5px] font-mono tracking-wider text-right uppercase select-none truncate block max-w-[85px] ${theme === 'light' ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {card.desc}
              </span>
            </div>

            {/* Value (Middle) */}
            <div className="text-left py-1 relative z-10">
              <p className={`font-mono font-black text-xl tracking-tight truncate ${theme === 'light' ? 'text-black' : 'text-white'}`} title={String(card.value)}>
                {card.value}
              </p>
            </div>

            {/* Label (Bottom) */}
            <p className={`text-[8.5px] font-black tracking-widest text-left mt-2 border-t pt-2 truncate uppercase select-none relative z-10 ${
              theme === 'light' ? 'text-emerald-700 border-neutral-200' : 'text-[#32D74B] border-[rgba(50,215,75,0.15)]'
            }`}>
              {card.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

