import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { Copy, Check, Building2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const BANK_ACCOUNTS = [
  { sno: 1, name: 'JS BANK',             iban: 'PK75JSBL9077000001107064' },
  { sno: 2, name: 'HBL',                 iban: 'PK55HABB0004697901070703' },
  { sno: 3, name: 'BANK AL HABIB',       iban: 'PK80BAHL0139098100230301' },
  { sno: 4, name: 'HABIB METROPOLITAN',  iban: 'PK39MPBL0208027140267178' },
  { sno: 5, name: 'MCB BANK',            iban: 'PK38MUCB1137058881007015' },
  { sno: 6, name: 'MEEZAN BANK',         iban: 'PK05MEZN0012810107354095' },
  { sno: 7, name: 'UBL',                 iban: 'PK15UNIL0109000302165122' },
];

const TEXTS = {
  en: {
    title: 'VITAL AGRO CHEMICAL INDUSTRIES (PVT) LTD',
    subtitle: 'ALL BANK ACCOUNTS',
    sno: 'S.NO.',
    bankName: 'BANK NAME',
    iban: 'INTERNATIONAL BANK ACCOUNT NUMBER (IBAN)',
    copied: 'Copied!',
    copyIban: 'Copy IBAN',
    codTitle: 'IMPORTANT: COD ORDER CONFIRMATION POLICY',
    codNotice: 'IMPORTANT NOTICE regarding Cash on Delivery (COD) Orders:',
    codPoints: [
      { bold: 'Pre-Confirmation Payment:', text: 'For all COD orders, a mandatory pre-confirmation payment of 299 PKR is required from the customer.' },
      { bold: 'Order Processing:', text: 'This amount covers Delivery Charges and enables us to process your order.' },
      { bold: 'Confirmation:', text: 'Your order will only be officially confirmed after this pre-confirmation payment is successfully received through any of our listed bank accounts.' },
    ],
    codFooter: 'Please use any of the above listed bank details to make this payment.',
    showBanks: 'Show Bank Details',
    hideBanks: 'Hide Bank Details',
  },
  ur: {
    title: 'وائٹل ایگرو کیمیکل انڈسٹریز (پرائیویٹ) لمیٹڈ',
    subtitle: 'تمام بینک اکاؤنٹس',
    sno: 'نمبر',
    bankName: 'بینک کا نام',
    iban: 'بین الاقوامی بینک اکاؤنٹ نمبر (IBAN)',
    copied: 'کاپی ہوگیا!',
    copyIban: 'IBAN کاپی کریں',
    codTitle: 'اہم: COD آرڈر کنفرمیشن پالیسی',
    codNotice: 'کیش آن ڈیلیوری (COD) آرڈرز کے بارے میں اہم نوٹس:',
    codPoints: [
      { bold: 'پیشگی تصدیقی رقم:', text: 'تمام COD آرڈرز کے لیے صارف سے 299 روپے کی لازمی پیشگی تصدیقی رقم درکار ہے۔' },
      { bold: 'آرڈر پروسیسنگ:', text: 'یہ رقم ڈیلیوری چارجز کے لیے ہے اور آپ کے آرڈر کی پروسیسنگ ممکن بناتی ہے۔' },
      { bold: 'تصدیق:', text: 'آپ کا آرڈر صرف اسی وقت تصدیق شدہ ہوگا جب یہ پیشگی رقم ہمارے کسی بھی بینک اکاؤنٹ میں موصول ہو جائے۔' },
    ],
    codFooter: 'براہ کرم یہ رقم اوپر درج کسی بھی بینک اکاؤنٹ میں جمع کروائیں۔',
    showBanks: 'بینک تفصیلات دکھائیں',
    hideBanks: 'بینک تفصیلات چھپائیں',
  }
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const tx = TEXTS[lang] || TEXTS.en;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-emerald-500/15 transition-all cursor-pointer active:scale-90 group/copy"
      title={copied ? tx.copied : tx.copyIban}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover/copy:text-emerald-400 transition-colors" />
      )}
    </button>
  );
}

export default function BankDetails() {
  const { lang } = useLanguage();
  const tx = TEXTS[lang] || TEXTS.en;
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative w-full py-16 sm:py-20 overflow-hidden select-none">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-amber-500/[0.03] blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Toggle Button */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl cursor-pointer transition-all duration-300 border"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255,255,255,0.02) 100%)',
            borderColor: expanded ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm sm:text-base font-black text-emerald-950 tracking-wide">
            {expanded ? tx.hideBanks : tx.showBanks}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          )}
        </motion.button>

        {/* Expandable Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6">

                {/* Header Card */}
                <div
                  className="rounded-[24px] p-6 sm:p-8 border overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(28px)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Glowing orb */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none" />

                  <div className="text-center space-y-2 relative z-10">
                    <h2 className="text-sm sm:text-lg font-black text-emerald-950 tracking-wide leading-tight">
                      {tx.title}
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                      <span className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-emerald-500/40" />
                      <span className="text-xs sm:text-sm font-black text-emerald-400 tracking-widest uppercase">
                        {tx.subtitle}
                      </span>
                      <span className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-emerald-500/40" />
                    </div>
                  </div>

                  {/* Bank Table */}
                  <div className="mt-6 rounded-2xl overflow-hidden border border-emerald-900/10">
                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_1fr_1fr_40px] sm:grid-cols-[50px_1fr_1.5fr_40px] bg-emerald-500/10 border-b border-emerald-500/20">
                      <div className="p-2.5 sm:p-3 text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-widest uppercase text-center">{tx.sno}</div>
                      <div className="p-2.5 sm:p-3 text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-widest uppercase">{tx.bankName}</div>
                      <div className="p-2.5 sm:p-3 text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-widest uppercase">{tx.iban}</div>
                      <div className="p-2.5 sm:p-3" />
                    </div>

                    {/* Rows */}
                    {BANK_ACCOUNTS.map((bank, idx) => (
                      <motion.div
                        key={bank.sno}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                        className={`grid grid-cols-[40px_1fr_1fr_40px] sm:grid-cols-[50px_1fr_1.5fr_40px] items-center border-b border-emerald-900/5 last:border-b-0 group/row hover:bg-white/80 transition-colors ${
                          idx % 2 === 0 ? 'bg-white/60' : 'bg-transparent'
                        }`}
                      >
                        <div className="p-2.5 sm:p-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                            {bank.sno}
                          </span>
                        </div>
                        <div className="p-2.5 sm:p-3">
                          <span className="text-[11px] sm:text-xs font-bold text-neutral-800 tracking-wide">{bank.name}</span>
                        </div>
                        <div className="p-2.5 sm:p-3">
                          <span className="text-[9px] sm:text-[11px] font-mono font-bold text-neutral-600 tracking-wider break-all leading-relaxed">{bank.iban}</span>
                        </div>
                        <div className="p-2.5 sm:p-3 flex justify-center">
                          <CopyButton text={bank.iban} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* COD Policy Card */}
                <div
                  className="rounded-[24px] p-5 sm:p-6 border overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />

                  {/* COD Badge */}
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-[10px] sm:text-xs font-black text-amber-400 tracking-widest uppercase">
                      {tx.codTitle}
                    </h3>
                  </div>

                  <p className="text-[11px] sm:text-xs font-bold text-neutral-700 mb-3 relative z-10">
                    {tx.codNotice}
                  </p>

                  <ol className="space-y-2 relative z-10">
                    {tx.codPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-[10px] sm:text-[11px]">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-neutral-600 leading-relaxed">
                          <strong className="text-neutral-800">{point.bold}</strong>{' '}
                          {point.text}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <p className="text-[10px] text-neutral-500 font-semibold mt-4 pt-3 border-t border-amber-500/10 relative z-10">
                    {tx.codFooter}
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
