import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';

export default function BankManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [instructions, setInstructions] = useState('');

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/banks');
      setAccounts(response.data);
    } catch (e) {
      console.error("Failed to load banks:", e);
      toast.error("Failed to load banking coordinates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setBankName('');
    setAccountTitle('');
    setAccountNumber('');
    setIban('');
    setQrCode('');
    setInstructions('');
    setModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setBankName(acc.bank_name || '');
    setAccountTitle(acc.account_title || '');
    setAccountNumber(acc.account_number || '');
    setIban(acc.iban || '');
    setQrCode(acc.qr_code || '');
    setInstructions(acc.instructions || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!bankName || !accountTitle || !accountNumber || !iban) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const qr = qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(iban)}`;

    const payload = {
      bank_name: bankName,
      account_title: accountTitle,
      account_number: accountNumber,
      iban,
      qr_code: qr,
      instructions
    };

    try {
      if (editingAccount) {
        await apiClient.put(`/banks/${editingAccount.id}`, { ...payload, status: editingAccount.status });
        toast.success('Bank account updated successfully.');
      } else {
        await apiClient.post('/banks', payload);
        toast.success('Bank account added successfully.');
      }
      setModalOpen(false);
      fetchBankAccounts();
    } catch (err) {
      console.error("Failed to save bank account:", err);
      toast.error('Failed to save bank account coordinates.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      try {
        await apiClient.delete(`/banks/${id}`);
        toast.success('Bank account removed.');
        fetchBankAccounts();
      } catch (err) {
        console.error("Failed to delete bank account:", err);
        toast.error('Failed to remove bank account.');
      }
    }
  };

  const toggleStatus = async (acc) => {
    const nextStatus = acc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.put(`/banks/${acc.id}`, {
        bank_name: acc.bank_name,
        account_title: acc.account_title,
        account_number: acc.account_number,
        iban: acc.iban,
        qr_code: acc.qr_code,
        instructions: acc.instructions,
        status: nextStatus
      });
      toast.success(`Account status set to ${nextStatus}.`);
      fetchBankAccounts();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      toast.error('Failed to toggle status.');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-emerald-950 text-left font-sans">
      <div className="flex justify-between items-center border-b border-emerald-900/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider uppercase text-emerald-400">
            Bank Account Management
          </h2>
          <p className="text-neutral-500 text-xs mt-1">
            Configure active banking coordinates displayed during checkout
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black rounded-xl text-xs font-extrabold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
        >
          <Plus size={14} className="stroke-[3]" />
          Add Bank Account
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-mono text-neutral-500">Loading banking coordinates...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-emerald-900/5 rounded-2xl">
          <p className="text-neutral-500 text-xs font-mono tracking-wide uppercase">No bank accounts configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map(acc => {
            const isActive = acc.status === 'Active';
            return (
              <div 
                key={acc.id}
                className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#121212] border-emerald-500/20 shadow-[0_15px_30px_rgba(16,185,129,0.04)]' 
                    : 'bg-[#060b07]/30 backdrop-blur-xl border border-[#10b981]/15 opacity-60'
                }`}
              >
                {/* Status indicators */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-white/60 text-neutral-500 border border-emerald-900/10'}`}>
                    {acc.status || 'Inactive'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isActive} 
                      onChange={() => toggleStatus(acc)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-700 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex gap-5 items-start">
                  {/* QR Code and Logo */}
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center border border-emerald-900/5 shadow-inner">
                      <img src={acc.qr_code} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[8px] text-neutral-400 uppercase font-mono tracking-wider">Scan to Pay</span>
                  </div>

                  {/* Account details */}
                  <div className="flex-1 space-y-3 font-mono text-xs">
                    <div>
                      <h4 className="text-emerald-950 font-bold text-sm leading-tight uppercase font-sans tracking-wide">{acc.bank_name}</h4>
                      <p className="text-neutral-500 text-[10px] mt-0.5 font-sans leading-none">{acc.instructions || 'Corporate Account'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-500 uppercase block">Account Title</span>
                      <span className="text-emerald-950 font-bold block truncate max-w-[200px]" title={acc.account_title}>{acc.account_title}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-500 uppercase block">Account Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold block">{acc.account_number}</span>
                        <button 
                          onClick={() => copyToClipboard(acc.account_number, `num-${acc.id}`)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-emerald-950 transition-all cursor-pointer"
                        >
                          {copiedId === `num-${acc.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-500 uppercase block">IBAN</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold block truncate max-w-[150px]" title={acc.iban}>{acc.iban}</span>
                        <button 
                          onClick={() => copyToClipboard(acc.iban, `iban-${acc.id}`)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-emerald-950 transition-all cursor-pointer"
                        >
                          {copiedId === `iban-${acc.id}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom edit actions */}
                <div className="flex justify-end gap-2 border-t border-emerald-900/5 mt-4 pt-3.5">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-2 bg-emerald-950/10 border border-[#10b981]/15 hover:bg-neutral-850 hover:border-emerald-900/10 rounded-lg text-neutral-700 hover:text-emerald-950 transition-all flex items-center gap-1 text-[10px] uppercase cursor-pointer"
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-2 bg-red-955/20 hover:bg-red-900/30 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all flex items-center gap-1 text-[10px] uppercase cursor-pointer"
                  >
                    <Trash2 size={11} /> Purge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg bg-[#060b07]/55 backdrop-blur-xl border border-[#10b981]/15 shadow-2xl rounded-2xl p-6 text-emerald-950 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-900/5">
              <h3 className="font-bold text-sm tracking-wider uppercase text-emerald-400 font-mono">
                {editingAccount ? 'Edit Bank Account details' : 'Configure New Bank Account'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-emerald-950 text-xs">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meezan Bank"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">Instructions / Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Pine Avenue, Lahore"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">Account Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vital Agro Chemical Industries"
                  value={accountTitle}
                  onChange={e => setAccountTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1203094857392019"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">IBAN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PK49MEZN..."
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase block font-mono">QR Code URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to generate automatically"
                  value={qrCode}
                  onChange={e => setQrCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-emerald-950/5 border border-[#10b981]/15 rounded-xl text-xs outline-none focus:border-emerald-500/40 text-emerald-950 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-900/5 font-mono">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-emerald-900/5 text-neutral-400 hover:bg-slate-50 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs rounded-xl cursor-pointer uppercase"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
