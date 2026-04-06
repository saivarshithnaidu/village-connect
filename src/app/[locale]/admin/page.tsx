'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { 
  FiUsers, FiAlertCircle, FiCheckCircle, FiActivity, 
  FiBarChart2, FiClock, FiArrowRight, FiShield, FiMapPin 
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), { ssr: false });

interface AdminStats {
  totalUsers: number;
  totalProblems: number;
  solvedProblems: number;
  unsolvedProblems: number;
  totalSolutions: number;
  recentProblems: any[];
}

export default function AdminDashboard() {
  const t = useTranslations();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push(user.role === 'volunteer' ? '/volunteer/dashboard' : '/villager/dashboard');
      } else if (token) {
        fetchAdminData();
      }
    }
  }, [authLoading, user, token]);

  const fetchAdminData = async () => {
    try {
      // Fetch core stats first
      const statsRes = await fetch('/api/admin/stats', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data || null);
      }

      // Fetch analytics second
      const analyticsRes = await fetch('/api/admin/analytics', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data || null);
      }
    } catch (err) {
      console.error('Admin Data Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-emerald-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">
               Village<span className="text-green-600">Console</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">{t('admin_hub')}</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/admin/users" 
              className="px-8 py-4 bg-green-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:scale-105 transition-all flex items-center gap-2"
            >
              <FiUsers /> {t('admin_users')}
            </Link>
          </div>
        </header>

        {/* Top Cards Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in fade-in duration-700">
          <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl flex flex-col justify-between h-56 transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-center text-green-600">
               <FiUsers size={32} className="group-hover:rotate-12 transition-transform" />
               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin_total_users')}</span>
            </div>
            <p className="text-6xl font-black text-slate-900 leading-none">{stats?.totalUsers || 0}</p>
          </div>
          <div className="p-10 rounded-[3rem] bg-slate-900 border border-slate-800 text-white flex flex-col justify-between h-56 transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-center text-slate-400">
               <FiAlertCircle size={32} className="text-red-400" />
               <span className="text-[10px] uppercase font-black tracking-widest">{t('admin_unsolved')}</span>
            </div>
            <p className="text-6xl font-black text-white leading-none">{stats?.unsolvedProblems || 0}</p>
          </div>
          <div className="p-10 rounded-[3rem] bg-emerald-500 border border-emerald-400 text-white flex flex-col justify-between h-56 transition-all group hover:-translate-y-2 shadow-xl shadow-emerald-100">
            <div className="flex justify-between items-center text-white/60">
               <FiCheckCircle size={32} className="text-white" />
               <span className="text-[10px] uppercase font-black tracking-widest">{t('admin_success_rate')}</span>
            </div>
            <p className="text-6xl font-black text-white leading-none">
               {analytics ? Math.round((analytics.totalStats.resolved / analytics.totalStats.totalIssues) * 100) : 0}%
            </p>
          </div>
          <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl flex flex-col justify-between h-56 transition-all group hover:-translate-y-2">
            <div className="flex justify-between items-center text-emerald-600">
               <FiActivity size={32} />
               <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin_engagement')}</span>
            </div>
            <p className="text-6xl font-black text-slate-900 leading-none">{stats?.totalSolutions || 0}</p>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        {analytics && (
          <div className="mb-16">
            {(() => {
               const resRate = analytics.totalStats.totalIssues ? (analytics.totalStats.resolved / analytics.totalStats.totalIssues) * 100 : 0;
               let scoreLabel = 'Needs Attention';
               let scoreColor = 'bg-red-100 text-red-700 border-red-200';
               if (resRate >= 80) {
                 scoreLabel = 'Good (Healthy)';
                 scoreColor = 'bg-green-100 text-green-700 border-green-200';
               } else if (resRate >= 50) {
                 scoreLabel = 'Average';
                 scoreColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
               }
               return (
                 <div className={`p-8 mb-10 rounded-[2.5rem] border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${scoreColor}`}>
                   <div>
                     <h3 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2"><FiActivity /> Community Health Score</h3>
                     <p className="font-bold opacity-80 mt-1">Based on overall resolution efficiency across all villages.</p>
                   </div>
                   <div className="text-right">
                     <p className="text-5xl font-black">{Math.round(resRate)}%</p>
                     <p className="text-xs font-black uppercase tracking-widest mt-2">{scoreLabel}</p>
                   </div>
                 </div>
               );
             })()}
            <DashboardCharts data={analytics} />
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Problems Queue */}
          <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-12">
            <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-50">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-wider text-sm leading-none">{t('admin_queue')}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t('admin_queue_desc')}</p>
               </div>
               <FiBarChart2 size={24} className="text-green-600" />
            </div>
            <div className="space-y-6">
              {stats?.recentProblems?.map((problem) => (
                <div key={problem._id} className="group p-8 bg-emerald-50/50 hover:bg-emerald-50 rounded-[2.5rem] border border-transparent hover:border-slate-100 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-green-600 transition-all text-lg mb-2 uppercase tracking-tight">{problem.title}</h4>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> {problem.reportedBy.name}</span>
                      <span className="flex items-center gap-2"><FiClock size={12} /> {new Date(problem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/problems/${problem._id}`}
                    className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                  >
                    <FiArrowRight />
                  </Link>
                </div>
              ))}
              <Link href="/admin/command-center" className="mt-10 py-5 bg-emerald-50 rounded-3xl border border-slate-100 flex items-center justify-center gap-3 text-green-600 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-50 transition-all">
                {t('admin_full_center')} <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Side Utils */}
          <div className="space-y-12">
             <div className="bg-gradient-to-br from-slate-900 to-green-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                <h3 className="text-2xl font-black mb-8 tracking-tight uppercase text-sm italic">{t('admin_tools')}</h3>
                <div className="grid grid-cols-1 gap-6">
                  <button className="py-8 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95">
                    <FiShield size={32} className="mb-4 text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('admin_diagnostics')}</span>
                  </button>
                  <Link 
                    href="/problems/map"
                    className="py-8 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <FiMapPin size={32} className="mb-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('admin_map')}</span>
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
