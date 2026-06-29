import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, MapPin, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { translations } from '@/lib/LanguageContext';

const DEFAULT_SLIDERS = [
  { id: '1', title: 'Premium Agrochemical Solutions', subtitle: 'Enhancing Crop Production & Soil Health Globally', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200' },
  { id: '2', title: 'Advanced Plant Nutrition', subtitle: 'Scientifically Formulated Organic Inputs', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=1200' }
];

const DEFAULT_CONTACT = {
  address: 'Plot No. 12-A, Industrial Estate, Phase II, Multan, Pakistan',
  phone: '+92 61 111 848 252',
  email: 'info@vitalagro.com.pk',
  whatsapp: '+92 301 1837160',
  mapsLink: 'https://goo.gl/maps/VitalAgroMultan'
};

const DEFAULT_SEO = {
  title: 'Vital Agro Chemical Industries (Pvt.) Ltd.',
  description: 'Premium Agrochemical and Fertilizer Manufacturing in Pakistan. Advanced Plant Nutrition, Crop Protection, and Organic Soil Solutions.',
  keywords: 'vital agro, fertilizer, organic inputs, crop protection, pesticide multan, meezan group'
};

const DEFAULT_SITE_DETAILS = {
  name: 'Vital Agro',
  logo: '/src/assets/vital agro logo.webp',
  favicon: '/favicon.ico'
};

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState('site');
  const [cmsLang, setCmsLang] = useState('en'); // active CMS translation language (en / ur)

  // 1. Site details state
  const [siteDetails, setSiteDetails] = useState(() => {
    const saved = localStorage.getItem('vital_settings_site');
    return saved ? JSON.parse(saved) : DEFAULT_SITE_DETAILS;
  });

  // 2. Contact details state
  const [contact, setContact] = useState(() => {
    const saved = localStorage.getItem('vital_settings_contact');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACT;
  });

  // 3. SEO details state
  const [seo, setSeo] = useState(() => {
    const saved = localStorage.getItem('vital_settings_seo');
    return saved ? JSON.parse(saved) : DEFAULT_SEO;
  });

  // 4. Sliders state
  const [sliders, setSliders] = useState(() => {
    const saved = localStorage.getItem('vital_settings_sliders');
    return saved ? JSON.parse(saved) : DEFAULT_SLIDERS;
  });

  // 5. CMS overrides state fields
  const [heroBadge, setHeroBadge] = useState('');
  const [heroHeading1, setHeroHeading1] = useState('');
  const [heroHeading2, setHeroHeading2] = useState('');
  const [heroSub, setHeroSub] = useState('');
  const [aboutBadge, setAboutBadge] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [footerDesc, setFooterDesc] = useState('');
  const [footerTagline, setFooterTagline] = useState('');

  // Form states for adding banner
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newImage, setNewImage] = useState('');

  // Load CMS overrides depending on language
  const loadCMSOverrides = (langCode) => {
    try {
      const overridesStr = localStorage.getItem(`vital_cms_overrides_${langCode}`);
      const defaultTr = translations[langCode] || translations.en;
      
      if (overridesStr) {
        const overrides = JSON.parse(overridesStr);
        setHeroBadge(overrides.hero?.badge || defaultTr.hero?.badge || '');
        setHeroHeading1(overrides.hero?.heading1 || defaultTr.hero?.heading1 || '');
        setHeroHeading2(overrides.hero?.heading2 || defaultTr.hero?.heading2 || '');
        setHeroSub(overrides.hero?.sub || defaultTr.hero?.sub || '');
        setAboutBadge(overrides.about?.badge || defaultTr.about?.badge || '');
        setAboutTitle(overrides.about?.title || defaultTr.about?.title || '');
        setAboutDesc(overrides.about?.desc || defaultTr.about?.desc || '');
        setFooterDesc(overrides.footer?.desc || defaultTr.footer?.desc || '');
        setFooterTagline(overrides.footer?.tagline || defaultTr.footer?.tagline || '');
      } else {
        setHeroBadge(defaultTr.hero?.badge || '');
        setHeroHeading1(defaultTr.hero?.heading1 || '');
        setHeroHeading2(defaultTr.hero?.heading2 || '');
        setHeroSub(defaultTr.hero?.sub || '');
        setAboutBadge(defaultTr.about?.badge || '');
        setAboutTitle(defaultTr.about?.title || '');
        setAboutDesc(defaultTr.about?.desc || '');
        setFooterDesc(defaultTr.footer?.desc || '');
        setFooterTagline(defaultTr.footer?.tagline || '');
      }
    } catch (e) {
      console.warn("Failed to load CMS overrides:", e);
    }
  };

  useEffect(() => {
    loadCMSOverrides(cmsLang);
  }, [cmsLang]);

  const handleSaveSiteDetails = (e) => {
    e.preventDefault();
    localStorage.setItem('vital_settings_site', JSON.stringify(siteDetails));
    toast.success('Site settings and branding attributes deployed.');
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    localStorage.setItem('vital_settings_contact', JSON.stringify(contact));
    toast.success('Contact info coordinates deployed successfully.');
  };

  const handleSaveSEO = (e) => {
    e.preventDefault();
    localStorage.setItem('vital_settings_seo', JSON.stringify(seo));
    toast.success('SEO meta data header rules saved.');
  };

  const handleSaveSliders = () => {
    localStorage.setItem('vital_settings_sliders', JSON.stringify(sliders));
    toast.success('Homepage slide banners updated.');
  };

  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newTitle || !newImage) {
      toast.error('Title and Image URL are required.');
      return;
    }
    const newSlide = {
      id: String(Date.now()),
      title: newTitle,
      subtitle: newSubtitle,
      image: newImage
    };
    setSliders(prev => [...prev, newSlide]);
    setNewTitle('');
    setNewSubtitle('');
    setNewImage('');
    toast.success('New banner slide queued.');
  };

  const handleDeleteSlide = (id) => {
    setSliders(prev => prev.filter(slide => slide.id !== id));
    toast.success('Slide banner removed.');
  };

  const handleSaveCMSOverrides = (e) => {
    e.preventDefault();
    const overrides = {
      hero: {
        badge: heroBadge,
        heading1: heroHeading1,
        heading2: heroHeading2,
        sub: heroSub,
      },
      about: {
        badge: aboutBadge,
        title: aboutTitle,
        desc: aboutDesc,
      },
      footer: {
        desc: footerDesc,
        tagline: footerTagline,
      }
    };
    
    localStorage.setItem(`vital_cms_overrides_${cmsLang}`, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('vital_cms_updated'));
    toast.success(`Homepage CMS variables for [${cmsLang.toUpperCase()}] updated instantly.`);
  };

  return (
    <div className="space-y-6 text-white text-left font-sans">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Website Configuration Settings</h2>
          <p className="text-white/40 text-xs mt-1 font-sans">Configure branding attributes, CMS overrides, details coordinates, and page SEO headers</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-6 text-xs uppercase font-bold font-mono overflow-x-auto pb-1 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('site')}
          className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'site' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          🎨 Site Branding
        </button>
        <button 
          onClick={() => setActiveTab('cms')}
          className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'cms' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          🌿 CMS Pages Editor
        </button>
        <button 
          onClick={() => setActiveTab('banners')}
          className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'banners' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          🖼️ Slide Banners
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'contact' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          📞 Contact Channels
        </button>
        <button 
          onClick={() => setActiveTab('seo')}
          className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'seo' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          🌐 SEO Settings
        </button>
      </div>

      {/* Tab: Site Details */}
      {activeTab === 'site' && (
        <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-6 max-w-xl shadow-xl">
          <h3 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
            <Sliders className="w-4 h-4 text-[#10B981]" /> Site Details & Logos
          </h3>
          <form onSubmit={handleSaveSiteDetails} className="space-y-4 text-xs text-left font-mono">
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Brand name</label>
              <input 
                type="text"
                required
                value={siteDetails.name}
                onChange={e => setSiteDetails({ ...siteDetails, name: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Branding Logo Asset URL</label>
              <input 
                type="text"
                required
                value={siteDetails.logo}
                onChange={e => setSiteDetails({ ...siteDetails, logo: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Site favicon.ico Path</label>
              <input 
                type="text"
                required
                value={siteDetails.favicon}
                onChange={e => setSiteDetails({ ...siteDetails, favicon: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
              />
            </div>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider cursor-pointer transition-all"
            >
              Deploy Branding
            </button>
          </form>
        </div>
      )}

      {/* Tab: CMS Page editor overrides */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Bilingual Homepage CMS Dictionary</h3>
            
            {/* Language Switcher */}
            <div className="flex bg-black/55 border border-white/5 rounded-xl p-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">
              <button
                onClick={() => setCmsLang('en')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${cmsLang === 'en' ? 'bg-[#10B981] text-[#020503]' : 'text-neutral-500 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setCmsLang('ur')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${cmsLang === 'ur' ? 'bg-[#10B981] text-[#020503]' : 'text-neutral-500 hover:text-white'}`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveCMSOverrides} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left side: Hero CMS inputs */}
            <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-4 shadow-lg text-left">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2 font-mono">
                🚀 Hero Landing Section CMS
              </h4>
              <div className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 uppercase block">Badge text indicator</label>
                  <input 
                    type="text"
                    required
                    value={heroBadge}
                    onChange={e => setHeroBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 uppercase block">Heading Line 1</label>
                    <input 
                      type="text"
                      required
                      value={heroHeading1}
                      onChange={e => setHeroHeading1(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 uppercase block">Heading Line 2</label>
                    <input 
                      type="text"
                      required
                      value={heroHeading2}
                      onChange={e => setHeroHeading2(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 uppercase block">Hero description details</label>
                  <textarea 
                    rows="3.5"
                    required
                    value={heroSub}
                    onChange={e => setHeroSub(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans resize-none leading-relaxed text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right side: About & Footer CMS inputs */}
            <div className="space-y-6">
              <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-4 shadow-lg text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2 font-mono">
                  🌱 About Overview & Footer CMS
                </h4>
                <div className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 uppercase block">About badge</label>
                      <input 
                        type="text"
                        required
                        value={aboutBadge}
                        onChange={e => setAboutBadge(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 uppercase block">About Title Header</label>
                      <input 
                        type="text"
                        required
                        value={aboutTitle}
                        onChange={e => setAboutTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 uppercase block">About description paragraph</label>
                    <textarea 
                      rows="3"
                      required
                      value={aboutDesc}
                      onChange={e => setAboutDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans resize-none leading-relaxed text-xs"
                    />
                  </div>
                  
                  <div className="h-px bg-white/5 my-2" />
                  
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 uppercase block">Footer description</label>
                    <textarea 
                      rows="2.5"
                      required
                      value={footerDesc}
                      onChange={e => setFooterDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans resize-none leading-relaxed text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 uppercase block">Footer copyright/tagline</label>
                    <input 
                      type="text"
                      required
                      value={footerTagline}
                      onChange={e => setFooterTagline(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => loadCMSOverrides(cmsLang)}
                  className="px-5 py-2.5 bg-neutral-900 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white rounded-xl uppercase text-[10px] tracking-wider cursor-pointer font-bold font-mono transition-all"
                >
                  Reset Defaults
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider cursor-pointer font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Save CMS Override
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Slide Banners */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Existing banners list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Active Homepage Sliders</h3>
              <button 
                onClick={handleSaveSliders}
                className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-black text-[10px] font-extrabold uppercase rounded-lg cursor-pointer transition-all"
              >
                Save Layout
              </button>
            </div>

            <div className="space-y-4">
              {sliders.map((slide, idx) => (
                <div key={slide.id} className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl overflow-hidden flex gap-4 p-4 items-center transition-all hover:border-white/10">
                  <div className="w-28 h-16 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1 text-left font-sans">
                    <span className="text-[8px] text-neutral-500 font-mono block">SLIDE #{idx + 1}</span>
                    <h4 className="font-bold text-xs text-white leading-snug">{slide.title}</h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">{slide.subtitle}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2.5 bg-red-955/20 hover:bg-red-900/30 border border-red-500/10 rounded-xl text-red-400 cursor-pointer transition-all animate-pulse"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Add slide banner */}
          <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Plus className="w-4 h-4 text-[#10B981]" /> Synthesize Banner Slide
            </h3>

            <form onSubmit={handleAddSlide} className="space-y-3.5 text-xs text-left font-mono">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">Slide Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ultra Premium Biotech Inputs"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">Slide Subtitle</label>
                <input 
                  type="text"
                  placeholder="e.g. Scientifically calibrated for yield maximization"
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">Image URL / Media Asset *</label>
                <input 
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider transition-all mt-2 cursor-pointer"
              >
                Synthesize Slide
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab: Contact points coordinates */}
      {activeTab === 'contact' && (
        <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-6 max-w-xl shadow-xl">
          <h3 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
            <MapPin className="w-4 h-4 text-[#10B981]" /> Contact details coordinates
          </h3>

          <form onSubmit={handleSaveContact} className="space-y-4 text-xs text-left font-mono">
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block font-mono">Office Physical Address</label>
              <textarea 
                rows="2.5"
                required
                value={contact.address}
                onChange={e => setContact({ ...contact, address: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white resize-none font-sans leading-relaxed text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">System Telephone</label>
                <input 
                  type="text"
                  required
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">WhatsApp Support Channel</label>
                <input 
                  type="text"
                  required
                  value={contact.whatsapp}
                  onChange={e => setContact({ ...contact, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">Official Email Address</label>
                <input 
                  type="email"
                  required
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-400 uppercase block">Google Maps Coordinates URL</label>
                <input 
                  type="text"
                  required
                  value={contact.mapsLink}
                  onChange={e => setContact({ ...contact, mapsLink: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-mono"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider cursor-pointer transition-all"
            >
              Save Parameters
            </button>
          </form>
        </div>
      )}

      {/* Tab: SEO configurations */}
      {activeTab === 'seo' && (
        <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-6 max-w-xl shadow-xl">
          <h3 className="font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
            <Globe className="w-4 h-4 text-[#10B981]" /> Search Engine Optimization Metadata
          </h3>

          <form onSubmit={handleSaveSEO} className="space-y-4 text-xs text-left font-mono">
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Metadata Title Tag</label>
              <input 
                type="text"
                required
                value={seo.title}
                onChange={e => setSeo({ ...seo, title: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Metadata Keywords</label>
              <input 
                type="text"
                required
                value={seo.keywords}
                onChange={e => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-neutral-400 uppercase block">Metadata Meta Description</label>
              <textarea 
                rows="3.5"
                required
                value={seo.description}
                onChange={e => setSeo({ ...seo, description: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-[#10b981]/15 rounded-xl outline-none focus:border-emerald-500/40 text-white font-sans resize-none leading-relaxed text-xs"
              />
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase text-[10px] tracking-wider cursor-pointer transition-all"
            >
              Apply SEO Configuration
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
