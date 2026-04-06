'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiUser, FiSearch, FiShield, FiMapPin, FiMail, FiClock } from 'react-icons/fi';

interface UserProfile {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  village: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors: any = {
    'admin': 'bg-green-100 text-green-700 border-green-200',
    'volunteer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'villager': 'bg-slate-100 text-slate-700 border-slate-200'
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-emerald-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold mb-4 transition-colors"
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Community <span className="text-green-600">Users</span></h1>
            <p className="text-slate-500 font-medium">Manage and monitor all village members and volunteers</p>
          </div>

          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or village..." 
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Details</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Village</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Joined Date</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FiMail /> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${roleColors[u.role] || 'bg-emerald-50 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                      <div className="flex items-center gap-1"><FiMapPin className="text-slate-300" /> {u.village || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">
                      <div className="flex items-center gap-1"><FiClock className="text-slate-300" /> {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm">
                        <FiShield size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="py-24 text-center">
              <FiUser size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
