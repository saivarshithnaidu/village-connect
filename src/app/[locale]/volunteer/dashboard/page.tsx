'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { 
  FiZap, FiCheckCircle, FiClock, FiAlertCircle, 
  FiTrendingUp, FiArrowRight, FiShield, FiMessageSquare
} from 'react-icons/fi';

interface Problem {
  _id: string;
  title: string;
  status: string;
  category: string;
  createdAt: string;
  isVerified: boolean;
  upvotes: string[];
}

export default function VolunteerDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [unverifiedProblems, setUnverifiedProblems] = useState<Problem[]>([]);
  const [activeProblems, setActiveProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'volunteer') {
        router.push('/volunteer/dashboard');
      } else if (token) {
        fetchDashboardData();
      }
    }
  }, [authLoading, user, token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch unverified problems for volunteers to see
      const res1 = await fetch('/api/problems?isVerified=false', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data1 = await res1.json();
      
      // Fetch problems the volunteer is involved in (e.g., active ones)
      const res2 = await fetch('/api/problems?status=in-progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data2 = await res2.json();

      if (res1.ok) setUnverifiedProblems(data1.slice(0, 5));
      if (res2.ok) setActiveProblems(data2.slice(0, 5));
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-50 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Volunteer <span className="text-green-600">Portal</span>
          </h1>
          <p className="text-slate-500 font-medium">Hello, {user?.name}. Your technical expertise helps build our village.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Areas */}
          <div className="lg:col-span-8 space-y-10">
            {/* Action Card */}
            <div className="bg-gradient-to-r from-slate-900 to-green-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="z-10 md:w-2/3">
                <h2 className="text-3xl font-black mb-4 tracking-tight">Need a solution?</h2>
                <p className="text-green-100 text-lg mb-8 leading-relaxed">Browse active reports and propose technical solutions to help our community members.</p>
                <Link href="/problems" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-slate-100 transition-all active:scale-95">
                  <FiZap /> Browse Active Reports
                </Link>
              </div>
              <div className="z-10 md:w-1/3 flex justify-center">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                  <FiZap size={64} className="text-green-400" />
                </div>
              </div>
            </div>

            {/* Unverified Queue */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/50 uppercase tracking-widest text-xs font-black text-slate-400">
                <span>Recent Reports (Verification Pending)</span>
                <FiShield className="text-green-500" />
              </div>
              <div className="p-2 sm:p-8">
                {authLoading || loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : unverifiedProblems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No reports pending verification. Well done!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unverifiedProblems.map((problem) => (
                      <Link key={problem._id} href={`/problems/${problem._id}`} className="group p-6 bg-emerald-50 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-green-500/5 border border-transparent hover:border-green-100 transition-all flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-slate-900 group-hover:text-green-600 transition-colors mb-2 text-sm line-clamp-1">{problem.title}</h4>
                          <span className="text-[9px] font-black uppercase text-green-500 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 mb-4 inline-block">
                            {problem.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-bold text-slate-400 italic">Reported {new Date(problem.createdAt).toLocaleDateString()}</span>
                          <FiArrowRight size={14} className="text-slate-300 group-hover:text-green-600 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/problems" className="mt-8 flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                  All community problems <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Your Impact</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                    <FiMessageSquare size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Solutions Proposed</h4>
                    <p className="font-bold text-slate-500">12 Solutions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <FiCheckCircle size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Problems Solved</h4>
                    <p className="font-bold text-slate-500">5 Implemented</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <FiTrendingUp size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest mb-1">Community Rating</h4>
                    <p className="font-bold text-slate-500 text-lg">4.9 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FiShield size={80} />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Guidelines</h3>
               <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                 As a volunteer, please ensure all proposed solutions are technically sound and culturally appropriate for the village.
               </p>
               <Link href="#" className="font-bold text-green-600 hover:text-green-700 text-sm flex items-center gap-2">
                 Read full guidelines <FiArrowRight />
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
