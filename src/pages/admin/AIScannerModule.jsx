import React, { useState } from 'react';
import { Camera, QrCode, Search, AlertTriangle, ShieldCheck, MapPin, Download, Printer, RefreshCw, Barcode, History, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  { id: 'easy-grow', name: 'Easy Grow Premium', category: 'plant_nutrition', batch: 'EG-2026-042', mfg: '2026-02-15', exp: '2028-02-14', origin: 'original', dealer: 'Multan Agri Center (Franchise #08)' },
  { id: 'purifizin', name: 'Purifizin Formula', category: 'fungicide', batch: 'PZ-2026-109', mfg: '2026-03-10', exp: '2028-03-09', origin: 'original', dealer: 'Bahawalpur Green Partners (Franchise #14)' },
  { id: 'aaqaab', name: 'Aaqaab Biotech', category: 'growth_promoter', batch: 'AQ-2026-301', mfg: '2026-04-01', exp: '2029-04-01', origin: 'original', dealer: 'Haroonabad Seed Store (Franchise #01)' },
  { id: 'fake-item', name: 'Unknown Chemical (Counterfeit)', category: 'suspicious', batch: 'BOGUS-999', mfg: '2025-12-01', exp: '2026-12-01', origin: 'fake', dealer: 'Unregistered Vendor (Flagged)' }
];

const DEFAULT_HISTORY = [
  { id: 'h1', name: 'Easy Grow Premium', time: '10 mins ago', result: 'Original Verified', status: 'original', location: 'Haroonabad (30.12, 73.14)' },
  { id: 'h2', name: 'Purifizin Formula', time: '1 hr ago', result: 'Original Verified', status: 'original', location: 'Multan (30.18, 71.48)' },
  { id: 'h3', name: 'Unknown Chemical (Counterfeit)', time: '4 hrs ago', result: 'Counterfeit Flagged', status: 'fake', location: 'Khanewal (30.31, 71.93)' }
];

export default function AIScannerModule() {
  const [scanType, setScanType] = useState('qr'); // 'qr', 'barcode', 'camera'
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanHistory, setScanHistory] = useState(DEFAULT_HISTORY);

  const startScanSimulation = (selectedProduct = null) => {
    setIsScanning(true);
    setScanResult(null);
    
    setTimeout(() => {
      setIsScanning(false);
      const product = selectedProduct || MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      setScanResult(product);

      // Add to history
      const newHistory = {
        id: String(Date.now()),
        name: product.name,
        time: 'Just now',
        result: product.origin === 'original' ? 'Original Verified' : 'Counterfeit Flagged',
        status: product.origin,
        location: `GPS: (30.${Math.floor(Math.random()*90)+10}, 72.${Math.floor(Math.random()*90)+10})`
      };
      setScanHistory(prev => [newHistory, ...prev]);

      if (product.origin === 'original') {
        toast.success(`Authentic Product Verified: ${product.name}`);
      } else {
        toast.error('WARNING: Counterfeit product detected!');
      }
    }, 2000);
  };

  const handleSearchScan = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const match = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (match) {
      startScanSimulation(match);
    } else {
      toast.error('No matching product barcode found.');
    }
  };

  const handleDownloadReport = () => {
    toast.success('Scanner log report exported as PDF.');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-emerald-950 text-left font-sans">
      <div className="flex justify-between items-center border-b border-emerald-900/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">AI Product & Barcode Scanner</h2>
          <p className="text-neutral-400 text-xs mt-1">Verify batch authenticity, originality markings, and dealer franchises coordinates</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadReport} 
            className="px-3.5 py-2 bg-white/60 hover:bg-white/80 border border-emerald-900/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={12} /> Export CSV
          </button>
          <button 
            onClick={handlePrintReport} 
            className="px-3.5 py-2 bg-white/60 hover:bg-white/80 border border-emerald-900/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={12} /> Print Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Area: Viewfinder / Scanner Action */}
        <div className="lg:col-span-5 bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-emerald-900/5 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Telemetry Viewfinder</span>
            <div className="flex gap-1.5">
              {['qr', 'barcode', 'camera'].map(type => (
                <button
                  key={type}
                  onClick={() => setScanType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase font-mono tracking-wider cursor-pointer ${
                    scanType === type ? 'bg-emerald-600 border border-emerald-500 text-emerald-950' : 'text-neutral-400 hover:text-emerald-950'
                  }`}
                >
                  {type === 'qr' && <QrCode size={11} className="inline mr-1" />}
                  {type === 'barcode' && <Barcode size={11} className="inline mr-1" />}
                  {type === 'camera' && <Camera size={11} className="inline mr-1" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Viewfinder frame */}
          <div className="relative aspect-video rounded-2xl bg-white border border-emerald-900/10 overflow-hidden flex flex-col items-center justify-center">
            {isScanning ? (
              <div className="space-y-3 flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Running Vision AI Calibration...</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-20 h-20 border-2 border-dashed border-neutral-700 rounded-2xl flex items-center justify-center text-neutral-500 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 -mt-1.5 -ml-1.5" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 -mt-1.5 -mr-1.5" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 -mb-1.5 -ml-1.5" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 -mb-1.5 -mr-1.5" />
                  {scanType === 'qr' ? <QrCode className="w-10 h-10 text-neutral-600" /> : <Barcode className="w-10 h-10 text-neutral-600" />}
                </div>
                <button
                  onClick={() => startScanSimulation()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Trigger Simulator
                </button>
              </div>
            )}

            {/* Scanning Laser Line Effect */}
            {isScanning && (
              <div 
                className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_12px_#10B981] pointer-events-none"
                style={{
                  animation: 'scanEffect 1.5s ease-in-out infinite',
                  backgroundImage: 'linear-gradient(to right, transparent, #10B981, transparent)'
                }}
              />
            )}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scanEffect {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}} />
          </div>

          {/* Direct search fallback */}
          <form onSubmit={handleSearchScan} className="flex gap-2 text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Enter serial key or scan code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-emerald-900/5 focus:border-[#10B981]/50 text-emerald-950 rounded-xl outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-white/60 border border-emerald-900/10 hover:bg-white/80 rounded-xl font-bold uppercase cursor-pointer">
              Scan
            </button>
          </form>
        </div>

        {/* Right Area: Results & History logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scan Result Details */}
          <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 text-left">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-emerald-900/5 pb-3 flex items-center gap-2">
              <Award size={14} className="text-emerald-400" /> Scan Results Analysis
            </h3>

            {scanResult ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-950/5 border border-emerald-900/5 rounded-2xl">
                  <div className="text-left">
                    <span className="font-bold text-emerald-950 text-base block">{scanResult.name}</span>
                    <span className="text-[10px] text-neutral-500 block mt-1 uppercase font-mono">Batch: {scanResult.batch}</span>
                  </div>

                  {scanResult.origin === 'original' ? (
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                      <ShieldCheck size={14} /> Authentic
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider font-mono animate-pulse">
                      <AlertTriangle size={14} /> Counterfeit
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-[11px] leading-relaxed text-neutral-300">
                  <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-900/5 space-y-1">
                    <span className="text-[9px] text-neutral-400 uppercase block">Manufacturing Date</span>
                    <span className="font-bold block">{scanResult.mfg}</span>
                  </div>
                  <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-900/5 space-y-1">
                    <span className="text-[9px] text-neutral-400 uppercase block">Expiry Date</span>
                    <span className="font-bold block">{scanResult.exp}</span>
                  </div>
                  <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-900/5 space-y-1 col-span-2">
                    <span className="text-[9px] text-neutral-400 uppercase block">Verified Dealer Franchise</span>
                    <span className="font-bold block text-emerald-950">{scanResult.dealer}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center border border-dashed border-emerald-900/5 rounded-2xl mt-4">
                <Camera className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                <p className="text-neutral-500 text-xs font-mono uppercase">Scan a code to view diagnostic metrics</p>
              </div>
            )}
          </div>

          {/* Scan Logs History */}
          <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-3xl p-6 text-left">
            <h3 className="font-bold text-xs uppercase tracking-wider border-b border-emerald-900/5 pb-3 flex items-center gap-2">
              <History size={14} className="text-emerald-400" /> Active Scan Logs
            </h3>

            <div className="mt-4 space-y-3.5 max-h-[200px] overflow-y-auto font-mono text-xs">
              {scanHistory.map(item => (
                <div key={item.id} className="p-3 bg-emerald-950/5 border border-emerald-900/5 rounded-xl flex justify-between items-center">
                  <div className="text-left space-y-1">
                    <span className="font-bold text-emerald-950 block text-xs">{item.name}</span>
                    <span className="text-[9px] text-neutral-500 block flex items-center gap-1">
                      <MapPin size={9} /> {item.location}
                    </span>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                      item.status === 'original' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'
                    }`}>
                      {item.result}
                    </span>
                    <span className="text-[8px] text-neutral-600 block">{item.time}</span>
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
