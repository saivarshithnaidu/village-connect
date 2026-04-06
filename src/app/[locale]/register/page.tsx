'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    village: '',
    phone: '',
    role: 'villager'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (user) {
        // 2. Create profile in public.profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              village: formData.village,
              phone: formData.phone,
            }
          ]);

        if (profileError) {
          setError('Auth successful, but profile creation failed: ' + profileError.message);
          return;
        }

        // Success! Redirect immediately based on role
        if (formData.role === 'admin') router.push('/admin');
        else if (formData.role === 'volunteer') router.push('/volunteer/dashboard');
        else router.push('/villager/dashboard');
        return;
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-emerald-50 py-12 px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{t('register_title')}</h1>
          <p className="text-slate-500 font-medium italic">{t('register_subtitle')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-green-100 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Sidebar Info */}
            <div className="md:col-span-2 bg-green-600 p-8 sm:p-10 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-6">{t('choose_role')}</h3>
                <div className="space-y-6">
                  <div 
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.role === 'villager' ? 'bg-white/10 border-white' : 'border-white/20 hover:border-white/40'}`} 
                    onClick={() => setFormData({...formData, role: 'villager'})}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1">
                      <FiUser /> {t('villager_role')}
                    </div>
                    <p className="text-xs text-green-100">{t('villager_desc')}</p>
                  </div>
                  <div 
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.role === 'volunteer' ? 'bg-white/10 border-white' : 'border-white/20 hover:border-white/40'}`} 
                    onClick={() => setFormData({...formData, role: 'volunteer'})}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1">
                      <FiCheckCircle /> {t('volunteer_role')}
                    </div>
                    <p className="text-xs text-green-100">{t('volunteer_desc')}</p>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <p className="text-sm text-green-200">{t('already_part')}</p>
                <Link href="/login" className="text-white font-bold underline underline-offset-4 decoration-2 decoration-green-300 transition hover:text-green-100">
                  {t('login_here')}
                </Link>
              </div>
            </div>

            {/* Form Section */}
            <div className="md:col-span-3 p-8 sm:p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
                  <FiAlertCircle className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('full_name_label')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiUser />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('email_label')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiMail />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('password_label')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FiLock />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-sm"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('village_name_label')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiMapPin />
                      </div>
                      <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-sm"
                        placeholder="Your Village"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('phone_number_label')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <FiPhone />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-sm"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {t('complete_registration')} <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
