'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { FiAlertCircle, FiLogOut, FiMenu, FiX, FiHome, FiGrid, FiUser, FiBell } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/problems', label: t('nav_problems'), icon: <FiGrid /> },
    { 
      href: user?.role === 'admin' ? '/admin' : `/${user?.role}/dashboard`, 
      label: t('nav_dashboard'), 
      icon: <FiUser />,
      protected: true 
    },
  ];

  const activeLink = (href: string) => pathname.startsWith(href) ? 'text-green-600 bg-green-50/50' : 'text-slate-500 hover:text-green-600';

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-3 -ml-3 text-slate-500 hover:text-green-600 focus:outline-none transition-colors rounded-2xl active:scale-95"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-green-200">
                <FiAlertCircle className="text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                Village<span className="text-green-600">Connect</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                (!link.protected || user) && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeLink(link.href)}`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <LanguageSwitcher />
            
            {loading ? (
              <div className="h-10 flex items-center px-4 bg-emerald-50 rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Auth Sync...</span>
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
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-green-600 font-black uppercase tracking-widest text-[10px] sm:text-xs px-2 sm:px-4 py-2 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div 
        className={`sm:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center mr-2 shadow-lg shadow-green-200">
                  <FiAlertCircle className="text-white" size={16} />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">Village<span className="text-green-600">Connect</span></span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-green-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all bg-emerald-50 text-green-600 shadow-sm"
              >
                <FiHome /> Home
              </Link>
              {navLinks.map((link) => (
                (!link.protected || user) && (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeLink(link.href)}`}
                  >
                    {link.icon} {link.label}
                  </Link>
                )
              ))}
            </div>

            {user && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-black text-sm mr-4 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                >
                  <FiLogOut /> {t('logout')}
                </button>
              </div>
            )}
          </div>

          <div className="absolute bottom-10 left-0 right-0 px-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            VillageConnect Mobile Core v1.0
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
