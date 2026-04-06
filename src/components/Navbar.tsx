'use client';

import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { FiAlertCircle, FiLogOut } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const t = useTranslations();

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-green-200">
                <FiAlertCircle className="text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                Village<span className="text-green-600">Connect</span>
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/problems"
                className="text-slate-500 hover:text-green-600 px-3 py-2 text-sm font-black uppercase tracking-widest transition-colors"
              >
                {t('nav_problems')}
              </Link>
              {user && (
                <Link
                  href={user.role === 'admin' ? '/admin' : `/${user.role}/dashboard`}
                  className="text-slate-500 hover:text-green-600 px-3 py-2 text-sm font-black uppercase tracking-widest transition-colors"
                >
                  {t('nav_dashboard')}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            
            {loading ? (
              <div className="h-10 flex items-center px-4 bg-emerald-50 rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Sync...</span>
              </div>
            ) : user ? (
              <>
                <NotificationDropdown />
                <div className="hidden md:flex items-center bg-emerald-50 px-4 py-2 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-black text-xs mr-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                  title={t('logout')}
                >
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-green-600 font-black uppercase tracking-widest text-xs px-4 py-2 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-green-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
