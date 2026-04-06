import { Link } from '@/i18n/routing';
import { FiAlertCircle, FiZap, FiTrendingUp, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import CommunityFeed from '@/components/CommunityFeed';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-green-800 text-white py-24 sm:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-green-400 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8">
            Village <span className="text-green-300">Connect</span>
          </h1>
          <p className="text-lg sm:text-2xl text-green-100 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full font-bold text-lg shadow-xl shadow-green-900/40 transition-all hover:-translate-y-1"
            >
              {t('hero_cta')}
            </Link>
            <Link 
              href="/problems" 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:-translate-y-1"
            >
              {t('view_problems')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{t('how_it_works')}</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
            <p className="mt-6 text-xl text-slate-500 max-w-3xl mx-auto">
              {t('how_it_works_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="group p-8 rounded-3xl border border-slate-100 bg-emerald-50/50 hover:bg-white hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                <FiAlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('report_problem')}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('report_problem_desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="group p-8 rounded-3xl border border-slate-100 bg-emerald-50/50 hover:bg-white hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                <FiZap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('propose_solution')}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('propose_solution_desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="group p-8 rounded-3xl border border-slate-100 bg-emerald-50/50 hover:bg-white hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                <FiTrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('track_progress')}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('track_progress_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[2rem] sm:rounded-[40px] p-8 sm:p-20 shadow-xl flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">{t('reliability_title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-green-100 p-2 rounded-full text-green-600 shrink-0">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{t('verified_reports_title')}</h4>
                    <p className="text-slate-600 text-sm sm:text-base">{t('verified_reports_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
                    <FiShield />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{t('secure_access_title')}</h4>
                    <p className="text-slate-600 text-sm sm:text-base">{t('secure_access_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4 w-full">
              <div className="bg-green-600 rounded-3xl h-32 sm:h-48 flex items-center justify-center text-white text-3xl sm:text-5xl font-bold shadow-lg">
                1K+
              </div>
              <div className="bg-slate-900 rounded-3xl h-32 sm:h-48 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mt-8 sm:mt-12 shadow-lg">
                100+
              </div>
            </div>
          </div>
        </div>
      </section>

      <CommunityFeed />

      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-8">{t('ready_to_make_difference')}</h2>
          <Link 
            href="/register" 
            className="inline-block px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-xl transition-all hover:scale-105 shadow-2xl"
          >
            {t('create_account')}
          </Link>
        </div>
      </section>
    </div>
  );
}
