import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle, 
  XCircle, 
  Clock,
  Save,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getThemeClasses } from './themeHelper';

export default function CODVerificationModal({ receiptUrl, order, onClose, onVerify, theme }) {
  const c = getThemeClasses(theme);
  const [zoom, setZoom] = useState(1);
  const [adminNotes, setAdminNotes] = useState(order?.paymentDetails?.adminNotes || '');
  const [status, setStatus] = useState(order?.paymentDetails?.verificationStatus || 'pending');
  const [isDragging, setIsDragging] = useState(false);

  if (!receiptUrl && !order) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleSave = () => {
    toast.success(`Verification status updated to ${status.toUpperCase()}`);
    if (onVerify) {
      onVerify(order.id, status, adminNotes);
    }
    setTimeout(() => onClose(), 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`${c.modal} w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden border border-[#10B981]/20`}
        >
          {/* Left Side: Image Viewer */}
          <div className="flex-1 bg-black/50 relative overflow-hidden flex flex-col border-r border-white/5">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button onClick={handleZoomIn} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all text-white shadow-lg border border-white/10">
                <ZoomIn size={20} />
              </button>
              <button onClick={handleZoomOut} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all text-white shadow-lg border border-white/10">
                <ZoomOut size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing">
              <motion.img 
                drag
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                src={receiptUrl || order?.proofScreenshotURL || order?.paymentDetails?.receiptBase64 || 'https://placehold.co/1080x1920/121212/10b981?text=NO+RECEIPT+UPLOADED'}
                alt="Receipt Verification"
                className="max-w-full max-h-full object-contain pointer-events-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side: Verification Controls */}
          <div className="w-full md:w-[400px] flex flex-col bg-black/60 relative z-20">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">
                  Verify Payment
                </h2>
                <p className="text-neutral-400 text-xs mt-1 font-mono">
                  Order #{order?.orderNumber}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Controls body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-8" style={{ WebkitOverflowScrolling: "touch" }}>
              
              {/* Status Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Verification Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setStatus('approved')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${status === 'approved' ? 'bg-[#10B981]/20 border-[#10B981] text-[#32D74B]' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'}`}
                  >
                    <CheckCircle size={20} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Approve</span>
                  </button>
                  
                  <button 
                    onClick={() => setStatus('rejected')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${status === 'rejected' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'}`}
                  >
                    <XCircle size={20} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reject</span>
                  </button>
                  
                  <button 
                    onClick={() => setStatus('pending')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'}`}
                  >
                    <Clock size={20} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                  </button>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} />
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter rejection reason or verification notes here..."
                  className={c.input + " w-full h-32 p-4 resize-none rounded-2xl"}
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/40">
              <button 
                onClick={handleSave}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#8AD65A] text-black font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Verification
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
