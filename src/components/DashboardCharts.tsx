'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { useTranslations } from 'next-intl';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiAward, FiInfo } from 'react-icons/fi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface DashboardChartsProps {
  data: {
    categoryData: { name: string, value: number }[];
    statusData: { name: string, value: number }[];
    trendData: { name: string, reports: number }[];
    leaderboard: { name: string, village: string, points: number, reports: number }[];
  }
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const t = useTranslations();
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Trend Area Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black shadow-inner">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{t('monthly_reports')}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('village_growth')}</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 900, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black shadow-inner">
              <FiPieChart size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{t('issue_types')}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('categorical_distribution')}</p>
            </div>
          </div>
          <div className="h-80 w-full flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend Mini Table */}
            <div className="w-full md:w-48 space-y-3">
              {data.categoryData.map((c, i) => (
                <div key={c.name} className="flex justify-between items-center text-[10px] font-black uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-slate-500">{c.name}</span>
                  </div>
                  <span className="text-slate-900">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Village Leaderboard Section */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-green-400 border border-white/10 shadow-xl rotate-3">
                 <FiAward size={32} />
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tight leading-none uppercase">{t('community_champions').split(' ')[0]} <span className="text-green-400">{t('community_champions').split(' ')[1] || ''}</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{t('champions_desc')}</p>
               </div>
            </div>
            <button className="hidden md:flex px-8 py-4 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95">
               {t('full_rankings')} <FiTrendingUp className="ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {data.leaderboard.map((member, index) => (
              <div 
                key={member.name}
                className={`p-8 rounded-[2.5rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:scale-105 group relative flex flex-col items-center text-center ${index === 0 ? 'border-green-500/30 scale-110 z-20' : ''}`}
              >
                {index === 0 && <span className="absolute -top-4 bg-green-500 text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-green-500/50">{t('top_rank')}</span>}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-4 shadow-xl ${index === 0 ? 'bg-green-600' : 'bg-slate-800'}`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-black text-lg text-white group-hover:text-green-300 transition-colors">{member.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{member.village}</p>
                <div className="mt-6 flex flex-col items-center">
                   <p className="text-3xl font-black text-white">{member.points}</p>
                   <p className="text-[10px] font-black uppercase text-green-400 tracking-tighter">{t('impact_points')}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400">
                   <FiInfo size={10} /> {t('reports_count', { count: member.reports })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
