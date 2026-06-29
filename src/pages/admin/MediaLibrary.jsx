import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Video, Trash2, Copy, Check, Search, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_MEDIA = [
  { id: '1', name: 'vital_agro_logo.webp', type: 'image', size: '22 KB', url: '/src/assets/vital agro logo.webp' },
  { id: '2', name: 'easy_grow_chemical.webp', type: 'image', size: '1.6 MB', url: '/easy-grow.png' },
  { id: '3', name: 'corporate_profile_2026.pdf', type: 'document', size: '4.2 MB', url: '#' },
  { id: '4', name: 'vital_promo_banner.mp4', type: 'video', size: '52 MB', url: '#' }
];

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState(DEFAULT_MEDIA);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // all, image, document, video
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const handleCopyLink = (item) => {
    const link = window.location.origin + item.url;
    navigator.clipboard.writeText(link);
    setCopiedId(item.id);
    toast.success('Asset URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this asset from library?')) {
      setMediaItems(prev => prev.filter(m => m.id !== id));
      toast.success('Asset deleted from library.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      
      const newMedia = {
        id: String(Date.now()),
        name: file.name.replace(/\.[^/.]+$/, "") + ".webp", // Compress simulation WebP conversion
        type: isImg ? 'image' : isVid ? 'video' : 'document',
        size: `${Math.round(file.size / 1024)} KB`,
        url: '#'
      };
      setMediaItems(prev => [newMedia, ...prev]);
      toast.success(`Asset uploaded and compressed to WebP: ${newMedia.name}`);
    }
  };

  // Filter and search items
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeFilterTab === 'all' || item.type === activeFilterTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 text-emerald-950 text-left font-sans">
      <div>
        <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">Media & Document Library</h2>
        <p className="text-neutral-500 text-xs mt-1">Upload and compress product labels, 3D files, banners, and brochures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT: Upload Dropzone */}
        <div className="bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Upload Asset Files</h3>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-emerald-900/5 hover:border-emerald-500/20 rounded-xl p-8 bg-emerald-950/10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
          >
            <Upload className="w-10 h-10 text-[#10B981] mb-3" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981] font-mono">Drag & Drop Files Here</span>
            <p className="text-[10px] text-neutral-500 mt-1 font-mono">Auto-compress to WebP | Maximum 100MB</p>
          </div>
        </div>

        {/* RIGHT: Assets Grid / List */}
        <div className="lg:col-span-2 bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 rounded-2xl p-5 space-y-4 shadow-lg">
          
          {/* Filters and search bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search assets name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-emerald-950/10 border border-emerald-900/5 focus:border-[#10b981]/40 rounded-xl py-2 pl-9 pr-4 text-xs text-emerald-950 outline-none font-mono"
              />
            </div>

            {/* Layout Toggle and Filter Buttons */}
            <div className="flex items-center gap-2 justify-between">
              
              {/* Filter Tabs */}
              <div className="flex bg-black/55 border border-emerald-900/5 rounded-xl p-0.5 font-mono text-[9px] uppercase font-bold tracking-wider">
                {['all', 'image', 'document', 'video'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilterTab(tab)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeFilterTab === tab 
                        ? 'bg-[#10B981] text-[#020503]'
                        : 'text-neutral-500 hover:text-emerald-950'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* View mode toggle */}
              <div className="flex bg-black border border-emerald-900/5 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/80 text-emerald-950' : 'text-neutral-500'}`}
                >
                  <Grid size={13} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/80 text-emerald-950' : 'text-neutral-500'}`}
                >
                  <List size={13} />
                </button>
              </div>

            </div>

          </div>

          {/* Grid display */}
          {filteredMedia.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-emerald-900/5 rounded-xl font-mono text-neutral-500">
              No matching assets registered in library.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMedia.map(item => {
                const isImage = item.type === 'image';
                const isVideo = item.type === 'video';
                return (
                  <div key={item.id} className="p-4 bg-emerald-950/5 border border-[#10b981]/15 hover:bg-slate-50/80 rounded-xl flex items-center justify-between gap-4 font-mono text-xs transition-all duration-150 relative group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-emerald-950/10 border border-[#10b981]/15 rounded-lg flex items-center justify-center shrink-0">
                        {isImage && <ImageIcon className="w-5 h-5 text-emerald-400" />}
                        {isVideo && <Video className="w-5 h-5 text-purple-400" />}
                        {item.type === 'document' && <FileText className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-emerald-950 font-bold block truncate max-w-[120px]" title={item.name}>{item.name}</span>
                        <span className="text-neutral-500 text-[9px] block uppercase mt-0.5">{item.size} • {item.type}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyLink(item)}
                        className="p-2 bg-emerald-950/10 border border-[#10b981]/15 hover:bg-neutral-850 hover:border-emerald-900/10 rounded-lg text-neutral-500 hover:text-emerald-950 transition-all cursor-pointer"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-955/20 hover:bg-red-900/30 border border-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List display */
            <div className="overflow-x-auto font-mono">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-emerald-900/5 text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
                    <th className="py-2.5 px-3">Asset Details</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map(item => (
                    <tr key={item.id} className="border-b border-emerald-900/5 hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-3 text-emerald-950 font-bold">{item.name}</td>
                      <td className="py-3 px-3 text-neutral-400">{item.size}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                          item.type === 'image' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' :
                          item.type === 'video' ? 'bg-purple-955/20 text-purple-400 border border-purple-500/20' :
                          'bg-blue-955/20 text-blue-400 border border-blue-500/25'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleCopyLink(item)}
                            className="p-1.5 bg-black/55 border border-[#10b981]/15 hover:bg-neutral-850 hover:border-emerald-900/10 rounded-lg text-neutral-500 hover:text-emerald-950 transition-all cursor-pointer"
                            title="Copy URL"
                          >
                            {copiedId === item.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-red-955/20 hover:bg-red-900/30 border border-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Delete asset"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
