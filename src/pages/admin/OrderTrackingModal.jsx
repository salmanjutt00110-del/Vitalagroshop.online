import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getThemeClasses } from './themeHelper';

const STAGES = [
  { id: 'pending', label: 'Order Placed', icon: Package },
  { id: 'processing', label: 'Processing', icon: Clock },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: MapPin }
];

export default function OrderTrackingModal({ order, onClose, onUpdateStatus, theme, courierName, setCourierName, trackingId, setTrackingId }) {
  const c = getThemeClasses(theme);
  
  if (!order) return null;

  // Derive current stage index
  let currentStageIdx = 0;
  if (order.status === 'processing' || order.status === 'packed' || order.status === 'confirmed') currentStageIdx = 1;
  else if (order.status === 'shipped' || order.status === 'dispatched') currentStageIdx = 2;
  else if (order.status === 'delivered') currentStageIdx = 3;
  else if (order.status === 'cancelled') currentStageIdx = -1;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Tracking ID Copied!");
  };

  const handleDispatch = () => {
    if (!courierName || !trackingId) {
      toast.error("Please enter Courier Name and Tracking ID before dispatching.");
      return;
    }
    // Update order with tracking info
    const trackingInfo = {
      courier: courierName,
      trackingId: trackingId,
      dispatchedAt: new Date().toISOString()
    };
    onUpdateStatus(order.id, 'dispatched', trackingInfo);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`${c.modal} w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]`}
        >
          {/* Header */}
          <div className="p-6 border-b border-emerald-900/5 bg-white/60 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-emerald-950 uppercase tracking-wider flex items-center gap-3">
                Order Tracking
                <span className={c.badge}>#{order.orderNumber}</span>
              </h2>
              <p className="text-neutral-400 text-sm mt-1 font-mono">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-full transition-colors text-neutral-400 hover:text-emerald-950">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-8" style={{ WebkitOverflowScrolling: "touch" }}>
            
            {/* Timeline */}
            <div className="relative py-8 px-4">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-white/60 -translate-y-1/2 rounded-full overflow-hidden">
                {currentStageIdx >= 0 && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#18C964] shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  />
                )}
              </div>

              {/* Stages */}
              <div className="relative flex justify-between">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const Icon = stage.icon;
                  const isCancelled = currentStageIdx === -1;

                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-3 w-32 relative z-10">
                      <motion.div 
                        initial={false}
                        animate={{ 
                          backgroundColor: isCancelled ? '#EF4444' : (isCompleted ? '#10B981' : '#1A1A1A'),
                          borderColor: isCancelled ? '#EF4444' : (isCompleted ? '#10B981' : 'rgba(255,255,255,0.1)'),
                          scale: isCurrent ? 1.2 : 1
                        }}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-500 shadow-xl ${isCompleted ? 'text-black' : 'text-neutral-500'}`}
                      >
                        <Icon size={20} className={isCurrent && !isCancelled ? 'animate-pulse' : ''} />
                      </motion.div>
                      <div className="text-center">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-950' : 'text-neutral-500'}`}>
                          {stage.label}
                        </p>
                        {isCompleted && (
                          <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {idx === 0 ? new Date(order.createdAt).toLocaleTimeString() : 'Verified'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Assignment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Details */}
              <div className={c.card}>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Customer Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-emerald-900/5 pb-2">
                    <span className="text-neutral-500">Name</span>
                    <span className="font-bold text-emerald-950">{order.customerDetails?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-900/5 pb-2">
                    <span className="text-neutral-500">Phone</span>
                    <span className="font-bold text-emerald-950">{order.customerDetails?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-900/5 pb-2">
                    <span className="text-neutral-500">Address</span>
                    <span className="font-bold text-emerald-950 text-right max-w-[200px] truncate">{order.customerDetails?.address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-neutral-500">Payment</span>
                    <span className="font-bold text-emerald-400 uppercase">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Logistics & Tracking */}
              <div className={c.card}>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Logistics & Tracking</h3>
                
                {order.trackingInfo ? (
                  <div className="space-y-4">
                    <div className="bg-white/60 p-4 rounded-xl border border-emerald-900/10 space-y-2">
                      <div className="flex justify-between items-center text-xs text-neutral-400 uppercase">
                        <span>Courier Partner</span>
                        <span className="font-bold text-emerald-950">{order.trackingInfo.courier}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#10B981] tracking-widest font-mono">
                          {order.trackingInfo.trackingId}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(order.trackingInfo.trackingId)}
                          className="text-[#10B981] hover:text-emerald-600 p-2 bg-white/60 hover:bg-white/80 rounded-lg transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                      <Clock size={14} />
                      Dispatched at {new Date(order.trackingInfo.dispatchedAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">Courier Service</label>
                      <select
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        className={c.input + " w-full py-2.5 px-3 appearance-none"}
                      >
                        <option value="Leopards">Leopards Courier</option>
                        <option value="TCS">TCS</option>
                        <option value="CallCourier">CallCourier</option>
                        <option value="M&P">M&P</option>
                        <option value="PostEx">PostEx</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter Tracking CN..."
                        className={c.input + " w-full py-2.5 px-3 font-mono"}
                      />
                    </div>
                    
                    <button
                      onClick={handleDispatch}
                      disabled={!trackingId || currentStageIdx >= 2}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${!trackingId || currentStageIdx >= 2 ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#10B981] to-[#18C964] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02]'}`}
                    >
                      {currentStageIdx >= 2 ? 'Already Dispatched' : 'Confirm Dispatch'}
                    </button>
                  </div>
                )}
              </div>
              
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
