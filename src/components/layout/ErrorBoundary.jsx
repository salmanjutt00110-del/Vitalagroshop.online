import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isUrdu = typeof window !== 'undefined' && localStorage.getItem('vital_agro_lang') === 'ur';

      return (
        <div className="min-h-[60vh] w-full flex items-center justify-center p-6 bg-[#02140c] text-white select-none">
          <div className="relative max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 filter blur-xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 filter blur-xl rounded-full pointer-events-none" />

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full animate-pulse">
                <ShieldAlert size={40} />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
              {isUrdu ? 'سسٹمک خرابی پیش آگئی' : 'System Error Occurred'}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mb-8 leading-relaxed font-medium">
              {isUrdu 
                ? 'اس ماڈیول میں کوئی خرابی پیش آئی ہے۔ پلیٹ فارم کے دیگر حصے مکمل طور پر فعال ہیں۔' 
                : 'Something went wrong inside this module. The rest of the platform remains fully operational.'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={this.handleRetry}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-103 active:scale-97 cursor-pointer"
              >
                <RefreshCw size={14} className="text-[#76C945]" />
                <span>{isUrdu ? 'دوبارہ کوشش' : 'Retry'}</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-3 bg-[#76C945] hover:bg-[#8AD65A] text-[#0A2E1F] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all hover:scale-103 active:scale-97 shadow-lg shadow-[#76C945]/15 cursor-pointer"
              >
                <Home size={14} />
                <span>{isUrdu ? 'ہوم پیج' : 'Go Home'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
