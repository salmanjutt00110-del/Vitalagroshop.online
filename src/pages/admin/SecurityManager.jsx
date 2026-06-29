import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, UserCheck, Trash2, Activity, ShieldAlert, Lock, Unlock, Server, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getThemeClasses } from './themeHelper';

export default function SecurityManager({ theme }) {
  const c = getThemeClasses(theme);
  
  // Dummy Data for Premium Demonstration
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@vitalagro.com', role: 'Super Admin', status: 'active', lastLogin: '2 mins ago', ip: '192.168.1.1' },
    { id: 2, email: 'finance@vitalagro.com', role: 'Financial Manager', status: 'active', lastLogin: '5 hours ago', ip: '10.0.0.45' },
    { id: 3, email: 'dispatch@vitalagro.com', role: 'Logistics Officer', status: 'suspended', lastLogin: '2 days ago', ip: '172.16.2.9' },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 101, action: 'LOGIN_SUCCESS', user: 'admin@vitalagro.com', timestamp: new Date().toISOString(), details: 'Authenticated via 2FA' },
    { id: 102, action: 'UPDATE_ORDER', user: 'dispatch@vitalagro.com', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Order #ORD-77X dispatched' },
    { id: 103, action: 'LOGIN_FAILED', user: 'unknown', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Invalid credentials attempted' },
    { id: 104, action: 'DELETE_PRODUCT', user: 'admin@vitalagro.com', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Product [ID: 99] removed from catalog' },
  ]);

  const [tfaActive, setTfaActive] = useState(() => localStorage.getItem('vital_2fa_active') === 'true');

  const handleToggle2FA = () => {
    const newState = !tfaActive;
    setTfaActive(newState);
    localStorage.setItem('vital_2fa_active', newState.toString());
    toast.success(newState ? '2FA Enabled System-Wide' : '2FA Disabled');
  };

  const getActionColor = (action) => {
    if (action.includes('FAILED') || action.includes('DELETE')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (action.includes('SUCCESS')) return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#8AD65A] uppercase tracking-widest drop-shadow-md">
            Security & Access Control
          </h1>
          <p className="text-neutral-400 font-mono text-xs mt-1">Manage RBAC, monitor telemetry, and enforce system security</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Users & Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Sessions */}
          <div className={`${c.card} p-6 space-y-6`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Users size={16} /> Authorized Operators
              </h2>
              <button className="text-[10px] bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded-lg font-bold uppercase transition-colors border border-[#10B981]/20">
                + Invite User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Identity</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-xs font-bold text-white">{user.email}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">Last Seen: {user.lastLogin}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md border border-purple-400/20">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.status === 'active' ? (
                          <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-1.5 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded hover:bg-white/10 ml-2">
                          <Shield size={14} />
                        </button>
                        <button className="p-1.5 text-red-400 hover:text-red-300 transition-colors bg-white/5 rounded hover:bg-white/10 ml-2">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`${c.card} p-5 flex flex-col gap-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]`}>
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <Server size={20} />
                </div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold px-2 py-1 bg-blue-500/10 rounded">Online</span>
              </div>
              <div>
                <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Main Database</h3>
                <p className="text-2xl font-black text-white mt-1">99.99%</p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Uptime SLA Maintained</p>
              </div>
            </div>
            
            <div className={`${c.card} p-5 flex flex-col gap-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]`}>
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30">
                  <ShieldAlert size={20} />
                </div>
                <span className="text-[10px] font-mono text-red-400 uppercase font-bold px-2 py-1 bg-red-500/10 rounded">Action Req</span>
              </div>
              <div>
                <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Failed Logins</h3>
                <p className="text-2xl font-black text-white mt-1">14<span className="text-sm text-neutral-500 ml-1">/24h</span></p>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Failed attempts detected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs & 2FA */}
        <div className="space-y-6">
          
          {/* Security Protocols */}
          <div className={`${c.card} p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-bl-full pointer-events-none" />
            <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={16} /> Global Protocols
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Two-Factor Auth</h3>
                  <p className="text-[10px] text-neutral-500 leading-snug mt-1">Enforce 2FA for all admin operators</p>
                </div>
                <button 
                  onClick={handleToggle2FA}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner ${tfaActive ? 'bg-[#10B981]' : 'bg-neutral-700'}`}
                >
                  <motion.div 
                    layout
                    className={`w-4 h-4 rounded-full bg-white shadow-md`}
                    animate={{ x: tfaActive ? 24 : 0 }}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">IP Whitelisting <Lock size={12}/></h3>
                  <p className="text-[10px] text-neutral-500 leading-snug mt-1">Restrict access to specific IP ranges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className={`${c.card} p-6 flex-1 h-[500px] flex flex-col`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Activity size={16} /> System Telemetry
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ WebkitOverflowScrolling: "touch" }}>
              {auditLogs.map((log) => (
                <div key={log.id} className="relative pl-6 pb-2 border-l border-white/10 last:border-0">
                  <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-black ${getActionColor(log.action).split(' ')[1].replace('/10', '')} shadow-md`} />
                  
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-white font-medium mt-2">{log.details}</p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">Initiator: {log.user}</p>
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

// Quick inline stub for missing icon in case I didn't import Users
const Users = ({size=16}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
