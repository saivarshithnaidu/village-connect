'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { 
  FiPlus, FiList, FiCheckCircle, FiClock, FiAlertCircle, 
  FiTrendingUp, FiArrowRight, FiFileText, FiMapPin, FiStar
} from 'react-icons/fi';

interface Problem {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  location: string;
  upvotes: string[];
}

export default function VillagerDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myProblems, setMyProblems] = useState<Problem[]>([]);
  const [assignedProblems, setAssignedProblems] = useState<Problem[]>([]);
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
      // Fetch problems reported by me
      const res1 = await fetch('/api/problems?status=open', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data1 = await res1.json();
      
      // Fetch problems assigned to me
      const res2 = await fetch('/api/problems/assigned/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data2 = await res2.json();

      if (res1.ok) setMyProblems(data1.slice(0, 5));
      if (res2.ok) setAssignedProblems(data2);
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Reported', count: myProblems.length, icon: FiList, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Assigned', count: assignedProblems.length, icon: FiStar, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Resolved', count: myProblems.filter(p => p.status === 'resolved').length, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="bg-emerald-50 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Hello, <span className="text-green-600">{user?.name}</span>
            </h1>
            <p className="text-slate-500 font-medium">Welcome back to your village command center.</p>
          </div>
          <Link 
            href="/problems/create" 
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <FiPlus /> New Problem Report
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200 border border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900">{stat.count}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={32} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Assigned Problems */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">Assigned to You</h3>
              <FiStar className="text-amber-500" />
            </div>
            <div className="p-4 sm:p-8">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : assignedProblems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  No problems currently assigned to you.
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedProblems.map((problem) => (
                    <Link key={problem._id} href={`/problems/${problem._id}`} className="group flex items-center justify-between p-6 bg-emerald-50 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-green-500/5 border border-transparent hover:border-green-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm font-black italic">!</div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">{problem.title}</h4>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                            <FiMapPin size={10} /> {problem.location}
                          </p>
                        </div>
                      </div>
                      <FiArrowRight className="text-slate-300 group-hover:text-green-600 transition-all opacity-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / My Reports */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">Your Recent Reports</h3>
              <FiFileText className="text-green-500" />
            </div>
            <div className="p-4 sm:p-8">
              {authLoading || loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myProblems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  You haven't reported any problems yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myProblems.map((problem) => (
                    <div key={problem._id} className="flex items-center justify-between p-5 border-b border-slate-50 last:border-0 hover:bg-emerald-50/50 rounded-2xl transition-all">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{problem.title}</h4>
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {problem.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] font-bold">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/problems" className="mt-8 flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all pb-2">
                All community problems <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
