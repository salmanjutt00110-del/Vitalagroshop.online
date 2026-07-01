import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { MessageSquare, Phone, Mail, Truck, Clock, Megaphone } from 'lucide-react';

export default function TopTicker() {
  const { lang } = useLanguage();

  const tickerItems = [
    {
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />,
      text: lang === 'en' ? 'WhatsApp Support: +92 301 1837160' : 'واٹس ایپ سپورٹ: 1837160 301 92+',
      link: 'https://wa.me/923011837160',
    },
    {
      icon: <Phone className="w-3.5 h-3.5 text-[#0E7A43]" />,
      text: lang === 'en' ? 'Phone Support: +92 301 1837160' : 'فون سپورٹ: 1837160 301 92+',
      link: 'tel:+923011837160',
    },
    {
      icon: <Mail className="w-3.5 h-3.5 text-emerald-600" />,
      text: lang === 'en' ? 'Email Support: info@vitalagro.com' : 'ای میل سپورٹ: info@vitalagro.com',
      link: 'mailto:info@vitalagro.com',
    },
    {
      icon: <Truck className="w-3.5 h-3.5 text-blue-600" />,
      text: lang === 'en' ? 'Free Shipping on Orders Above Rs. 10,000' : '10,000 روپے سے زائد کے آرڈرز پر مفت ڈیلیوری',
    },
    {
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      text: lang === 'en' ? 'Office Hours: Mon - Sat (8:00 AM - 5:00 PM)' : 'دفتر کے اوقات: پیر تا ہفتہ (صبح 8:00 بجے تا شام 5:00 بجے)',
    },
    {
      icon: <Megaphone className="w-3.5 h-3.5 text-red-500 animate-bounce" />,
      text: lang === 'en' ? 'Announcement: Certified Premium Bio-Stimulants now available!' : 'اعلان: تصدیق شدہ پریمیم بائیو محرکات اب دستیاب ہیں!',
    }
  ];

  // Repeat items to fill space and ensure seamless loop
  const doubledItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="w-full text-[#0E7A43] text-[10px] sm:text-[11px] font-extrabold tracking-widest h-8 flex items-center relative overflow-hidden z-[60] select-none border-b border-[#0E7A43]/10"
         style={{
           background: 'rgba(234, 251, 243, 0.75)',
           backdropFilter: 'blur(16px)',
           WebkitBackdropFilter: 'blur(16px)',
           boxShadow: '0 1px 12px rgba(14, 122, 67, 0.06)'
         }}>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.3333%, 0, 0);
          }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee 45s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-container py-1.5">
        {doubledItems.map((item, idx) => {
          const content = (
            <div className="flex items-center gap-2.5 whitespace-nowrap mx-10 hover:text-emerald-950 transition-colors duration-200 cursor-pointer">
              {item.icon}
              <span>{item.text}</span>
            </div>
          );

          if (item.link) {
            return (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                {content}
              </a>
            );
          }

          return <div key={idx}>{content}</div>;
        })}
      </div>
    </div>
  );
}
