'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiFilter, FiSearch, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface Problem {
  id: string; // Real-time ID
  _id: string; // Legacy ID
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  priority: string;
  isVerified: boolean;
  is_urgent: boolean;
  district: string;
  reportedBy: {
    name: string;
    village: string;
  };
  createdAt: string;
  upvotes: string[];
}

export default function ProblemsPage() {
  const t = useTranslations();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '', district: '', urgency: '' });
  const [districts, setDistricts] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error("Error fetching districts", err));
  }, []);

  useEffect(() => {
    fetchProblems();

    // Subscribe to REAL-TIME changes
    const channel = supabase
      .channel('public:problems')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'problems' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New problem reported! Add it to the list
            setProblems((prev) => [payload.new as Problem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProblems((prev) => {
              const updated = prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p);
              return sortProblems(updated);
            });
          } else if (payload.eventType === 'DELETE') {
            setProblems((prev) => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const sortProblems = (data: Problem[]) => {
    return [...data].sort((a, b) => {
      // Pin urgent issues to the top
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filter as any).toString();
      const res = await fetch(`/api/problems?${query}`);
      const data = await res.json();
      if (res.ok) {
        // filter on client side for newly added fields if backend doesnt support them yet
        let filtered = data;
        if (filter.district) filtered = filtered.filter((p: any) => p.district === filter.district);
        if (filter.urgency === 'urgent') filtered = filtered.filter((p: any) => p.is_urgent);
        
        setProblems(sortProblems(filtered));
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: any = {
    'open': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'resolved': 'bg-green-100 text-green-700 border-green-200',
    'closed': 'bg-slate-100 text-slate-700 border-slate-200',
    'urgent': 'bg-red-100 text-red-700 border-red-200',
    'critical': 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-emerald-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{t('community_issues')}</h1>
            <p className="text-slate-500 font-medium italic">{t('active_problems')}</p>
          </div>
          
          {user && (user.role === 'villager' || user.role === 'admin') && (
            <Link 
              href="/problems/create" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-100 transition-all hover:scale-105 active:scale-95"
            >
              <FiPlus /> {t('report_problem')}
            </Link>
          )}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 mb-10 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              className="w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative col-span-2 md:col-span-1">
              <select 
                className="w-full bg-emerald-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 appearance-none"
                value={filter.category}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
              >
                <option value="">{t('all_categories')}</option>
                <option value="infrastructure">{t('infrastructure')}</option>
                <option value="health">{t('health')}</option>
                <option value="education">{t('education')}</option>
                <option value="agriculture">{t('agriculture')}</option>
                <option value="water">{t('water')}</option>
                <option value="electricity">{t('electricity')}</option>
                <option value="transport">{t('transport')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
            
            <div className="relative col-span-2 md:col-span-1">
              <select 
                className="w-full bg-emerald-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 appearance-none"
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
              >
                <option value="">{t('all_status')}</option>
                <option value="open">{t('status_open')}</option>
                <option value="in-progress">{t('status_in_progress')}</option>
                <option value="resolved">{t('status_resolved')}</option>
                <option value="closed">{t('status_closed')}</option>
              </select>
            </div>

            <div className="relative col-span-1">
              <select 
                className="w-full bg-emerald-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 appearance-none"
                value={filter.district}
                onChange={(e) => setFilter({...filter, district: e.target.value})}
              >
                <option value="">All Districts</option>
                {districts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="relative col-span-1">
              <select 
                className="w-full bg-emerald-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900 appearance-none"
                value={filter.urgency}
                onChange={(e) => setFilter({...filter, urgency: e.target.value})}
              >
                <option value="">Any Urgency</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <FiAlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold text-xl">{t('no_problems_found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {problems.map((problem) => (
              <Link 
                key={problem._id} 
                href={`/problems/${problem._id}`}
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusColors[problem.status]}`}>
                      {t(`status_${problem.status.replace('-', '_')}`)}
                    </span>
                    {problem.isVerified && (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        <FiCheckCircle /> {t('status_verified')}
                      </span>
                    )}
                    {problem.is_urgent && (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        🔥 Urgent
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-extrabold mb-3 group-hover:text-green-600 transition-colors line-clamp-2 ${problem.is_urgent ? 'text-red-600' : 'text-slate-900'}`}>
                    {problem.title}
                  </h3>
                  
                  <p className="text-slate-500 font-medium mb-6 line-clamp-3 leading-relaxed">
                    {problem.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                      <FiMapPin className="text-green-500" />
                      {problem.location || problem.reportedBy.village || 'Community Area'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-bold capitalize">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {t(problem.category) || problem.category}
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-6 bg-emerald-50/80 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black text-xs">
                      {problem.reportedBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">{problem.reportedBy.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(problem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                    {problem.upvotes.length} 
                    <span className="text-[10px] uppercase text-slate-400">Upvotes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
