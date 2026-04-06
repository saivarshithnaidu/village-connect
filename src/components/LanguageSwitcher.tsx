'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import { useTransition } from 'react';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center bg-emerald-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center px-3 mr-1 text-slate-400">
         <FiGlobe size={14} className={isPending ? 'animate-spin' : ''} />
      </div>
      <div className="flex gap-1">
        {routing.locales.map((cur) => (
          <button
            key={cur}
            onClick={() => handleLanguageChange(cur)}
            disabled={isPending}
            className={`
              px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${locale === cur 
                ? 'bg-white text-green-600 shadow-md ring-1 ring-slate-100 scale-105' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}
              ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {cur === 'en' ? 'EN' : 'తెలుగు'}
          </button>
        ))}
      </div>
    </div>
  );
}
