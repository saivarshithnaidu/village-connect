'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FiSearch, FiFilter, FiCheckCircle, FiXCircle, 
  FiAlertCircle, FiClock, FiMapPin, FiActivity,
  FiArrowRight, FiTrash2, FiShield, FiUser, FiZap
} from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface Problem {
  id: string;
  _id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  priority: string;
  is_verified: boolean;
  is_urgent: boolean;
  assigned_to: string | null;
  reported_by: {
    name: string;
  };
  createdAt: string;
  upvotes: string[];
}

export default function CommandCenterPage() {
  const t = useTranslations();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      } else {
        fetchProblems();
      }
    }
  }, [authLoading, user]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/problems');
      const data = await res.json();
      if (res.ok) {
        setProblems(data);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/problems/${id}/verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProblems(prev => prev.map(p => p.id === id ? { ...p, is_verified: true } : p));
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProblems(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: any = {
      'open': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-slate-100 text-slate-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles['open']}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="w-12 h-12 border-4 border-slate-900 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 text-green-600 mb-2">
               <FiShield size={24} />
               <span className="text-xs font-black uppercase tracking-[0.4em]">Authority Command Center</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Operational <span className="text-green-600">Intelligence</span></h1>
            <p className="text-slate-400 font-bold mt-2">Managing {problems.length} active community data points.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-center gap-4">
                <div className="text-right border-r border-slate-100 pr-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Feed</p>
                   <p className="text-xs font-black text-green-600">CONNECTED</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 animate-pulse">
                   <FiActivity />
                </div>
             </div>
          </div>
        </header>

        {/* Global Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
           <div className="lg:col-span-2 relative group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text" 
                placeholder="INTEL SEARCH: Search titles, villages, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-6 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all shadow-sm"
              />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-[2rem] px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">ALL DEPARTMENTS</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-[2rem] px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">ALL STATUS</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
           </div>
           <button onClick={fetchProblems} className="bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-green-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
              <FiZap /> Refresh Ops Data
           </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                   <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Classification</th>
                   <th className="px-8 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Issue Intel</th>
                   <th className="px-8 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Location</th>
                   <th className="px-8 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Assignment</th>
                   <th className="px-8 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Verification</th>
                   <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Action Matrix</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="group hover:bg-emerald-50/30 transition-colors">
                     <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{problem.category}</span>
                           {getStatusBadge(problem.status)}
                           {problem.is_urgent && (
                             <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 w-max">URGENT</span>
                           )}
                        </div>
                     </td>
                     <td className="px-8 py-8">
                        <div>
                           <h4 className="font-black text-slate-900 mb-1 group-hover:text-green-600 transition-colors uppercase tracking-tight leading-tight">{problem.title}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">PID: {problem.id.slice(0,8)} • REPORTED {new Date(problem.createdAt).toLocaleDateString()}</p>
                        </div>
                     </td>
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                           <FiMapPin className="text-green-500 shrink-0" />
                           {problem.location}
                        </div>
                     </td>
                     <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                           {problem.assigned_to ? (
                             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Active Ops</span>
                             </div>
                           ) : (
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Unassigned</span>
                           )}
                        </div>
                     </td>
                     <td className="px-8 py-8">
                        {problem.is_verified ? (
                           <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                              <FiCheckCircle size={16} /> VERIFIED
                           </div>
                        ) : (
                           <button 
                             onClick={() => handleVerify(problem.id)}
                             className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                           >
                              <FiCheckCircle size={16} /> Click to Verify
                           </button>
                        )}
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <Link href={`/problems/${problem.id}`} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm">
                              <FiArrowRight size={18} />
                           </Link>
                           <button 
                             onClick={() => handleDelete(problem.id)}
                             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                           >
                              <FiTrash2 size={18} />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {filteredProblems.length === 0 && (
            <div className="py-24 text-center">
               <FiAlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-xs">No matching intelligence found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
