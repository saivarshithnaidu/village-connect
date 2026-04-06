'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function CommunityFeed() {
  const t = useTranslations();
  const [latestIssues, setLatestIssues] = useState<any[]>([]);
  const [resolvedIssues, setResolvedIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
         // Fetch latest issues
         const resLatest = await fetch('/api/problems?status=open');
         if (resLatest.ok) {
            const data = await resLatest.json();
            setLatestIssues(data.slice(0, 3));
         }
         
         // Fetch recently resolved issues
         const resResolved = await fetch('/api/problems?status=resolved');
         if (resResolved.ok) {
            const data = await resResolved.json();
            setResolvedIssues(data.slice(0, 3));
         }
      } catch (err) {
         console.error('Failed to fetch feed', err);
      } finally {
         setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  if (loading) return null;

  return (
    <section className="py-24 bg-emerald-50 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{t('community_feed_title')}</h2>
          <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-slate-500 max-w-3xl mx-auto">
            {t('community_feed_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Latest Issues Column */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <FiAlertCircle size={28} className="text-amber-500" />
              <h3 className="text-2xl font-black text-slate-900 uppercase">{t('latest_issues')}</h3>
            </div>
            <div className="space-y-6">
              {latestIssues.length === 0 ? <p className="text-slate-400">{t('no_recent_issues')}</p> : latestIssues.map(issue => (
                <Link href={`/problems/${issue._id}`} key={issue._id} className="block group p-6 bg-slate-50 hover:bg-emerald-50 rounded-3xl transition-colors border border-transparent hover:border-emerald-100">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">{issue.title}</h4>
                     {issue.is_urgent && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">🔥 {t('urgent_label')}</span>}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><FiClock /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                     <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{issue.district || 'Village'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Resolved Column */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <FiCheckCircle size={28} className="text-green-500" />
              <h3 className="text-2xl font-black text-slate-900 uppercase">{t('recently_resolved')}</h3>
            </div>
            <div className="space-y-6">
              {resolvedIssues.length === 0 ? <p className="text-slate-400">{t('no_resolved_issues')}</p> : resolvedIssues.map(issue => (
                <Link href={`/problems/${issue._id}`} key={issue._id} className="block group p-6 bg-slate-50 hover:bg-emerald-50 rounded-3xl transition-colors border border-transparent hover:border-emerald-100">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">{issue.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{issue.description}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1 text-green-500"><FiCheckCircle /> {t('status_resolved')}</span>
                     <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{issue.district || 'Village'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
