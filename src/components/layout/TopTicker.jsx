import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { MessageSquare, MapPin, Mail } from 'lucide-react';

export default function TopTicker() {
  const { lang } = useLanguage();

  const tickerItems = [
    {
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />,
      text: lang === 'en' ? 'WhatsApp Support: +92 301 1837160' : 'واٹس ایپ سپورٹ: 1837160 301 92+',
      link: 'https://wa.me/923011837160',
    },
    {
      icon: <Mail className="w-3.5 h-3.5 text-[#76C945]" />,
      text: 'info@vitalagro.com',
      link: 'mailto:info@vitalagro.com',
    },
    {
      icon: <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />,
      text: lang === 'en' 
        ? 'Head Office: Plot 50 & 56, Vital Office, Haroonabad, Bahawalnagar, Pakistan' 
        : 'ہیڈ آفس: پلاٹ 50 اور 56، وائٹل آفس، ہارون آباد، بہاولنگر، پاکستان',
    },
  ];

  // Repeat items to fill space and ensure seamless loop
  const doubledItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-[#031505] border-b border-[#76C945]/15 text-white/80 text-[11px] font-semibold tracking-wide h-8 flex items-center relative overflow-hidden z-[60] select-none">
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
          animation: marquee 35s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-container py-1.5">
        {doubledItems.map((item, idx) => {
          const content = (
            <div className="flex items-center gap-2 whitespace-nowrap mx-8 hover:text-white transition-colors duration-200 cursor-pointer">
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
