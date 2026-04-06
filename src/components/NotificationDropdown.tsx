'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { FiBell, FiCheck, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  type: 'upvote' | 'verified' | 'resolved' | 'assignment' | 'comment';
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const { user, token } = useAuth();
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !token) return;

    fetchNotifications();

    // Subscribe to NEW notifications for this user
    const channel = supabase
      .channel(`user-notifications:${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications((prev) => 
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'verified': return <FiCheck className="text-emerald-500" />;
      case 'upvote': return <FiBell className="text-green-500" />;
      case 'resolved': return <FiCheck className="text-emerald-500" />;
      default: return <FiInfo className="text-slate-400" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-emerald-50 hover:bg-slate-100 rounded-2xl transition-all group"
      >
        <FiBell size={20} className="text-slate-600 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-6 z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="px-6 mb-4 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-[10px]">{t('recent_alerts')}</h3>
            {unreadCount > 0 && <span className="text-[10px] font-bold text-green-600">{t('new_notifications', { count: unreadCount })}</span>}
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 px-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <FiInfo size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400">{t('no_notifications')}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex gap-4 ${n.is_read ? 'opacity-60 grayscale-[0.5]' : 'bg-emerald-50/50 hover:bg-emerald-50 border border-slate-50 hover:border-slate-100 shadow-sm'}`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${n.is_read ? 'bg-slate-100' : 'bg-white shadow-inner'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-grow">
                    <p className={`text-xs leading-relaxed ${n.is_read ? 'font-medium text-slate-500' : 'font-bold text-slate-900'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                      {formatDistanceToNow(new Date(n.created_at))} ago
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
