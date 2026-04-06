'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { 
  FiArrowLeft, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, 
  FiThumbsUp, FiMessageSquare, FiSend, FiPlus, FiTrash2, FiEdit, FiUser, FiZap, FiRefreshCw, FiSearch
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
import CommentsSection from '@/components/CommentsSection';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });
import StatusTimeline from '@/components/StatusTimeline';

interface Problem {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  isVerified: boolean;
  priority: string;
  is_urgent: boolean;
  assigned_to?: string;
  image_url?: string;
  before_image_url?: string;
  after_image_url?: string;
  deadline?: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    village: string;
  };
  upvotes: string[];
  solutions: any[];
  createdAt: string;
  verified_at?: string;
  assigned_at?: string;
  in_progress_at?: string;
  completed_at?: string;
  location_lat?: number;
  location_lng?: number;
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { user, token } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [solutionForm, setSolutionForm] = useState({ title: '', description: '' });

  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAiSynthesizing, setIsAiSynthesizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleGetAiSummary = async () => {
    if (!token) return;
    setIsAiSynthesizing(true);
    try {
      const res = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: id })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error('AI Summary error:', err);
    } finally {
      setIsAiSynthesizing(false);
    }
  };

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           text: problem?.description,
           targetLanguage: locale === 'en' ? 'en' : 'te' 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTranslatedText(data.translatedText);
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const fetchProblem = async () => {
    try {
      const res = await fetch(`/api/problems/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok) {
        setProblem(data);
        if (user && data.upvotes.includes(user.id)) {
          setIsUpvoted(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`/api/problems/${id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProblem(data);
        setIsUpvoted(!isUpvoted);
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(`/api/problems/${id}/verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProblem();
        alert(t('verify_success'));
      }
    } catch (err) {
      console.error('Failed to verify:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('delete_confirm'))) return;
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        router.push('/problems');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleClaimTask = async () => {
    if (!user || (user.role !== 'volunteer' && user.role !== 'admin')) return;
    try {
      const res = await fetch(`/api/problems/${id}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProblem();
        alert(t('claim_success'));
      }
    } catch (err) {
      console.error('Failed to claim:', err);
    }
  };

  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        fetchProblem();
        alert(t('resolve_success'));
      }
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const handleProposeSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          problemId: id,
          title: solutionForm.title,
          description: solutionForm.description
        })
      });
      if (res.ok) {
        setIsSolutionModalOpen(false);
        setSolutionForm({ title: '', description: '' });
        fetchProblem();
        alert(t('propose_success'));
      }
    } catch (err) {
      console.error('Failed to propose solution:', err);
    }
  };

  const statusColors: any = {
    'open': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'resolved': 'bg-green-100 text-green-700 border-green-200',
    'closed': 'bg-slate-100 text-slate-700 border-slate-200',
    'urgent': 'bg-red-100 text-red-700 border-red-200',
    'critical': 'bg-red-100 text-red-700 border-red-200',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!problem) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-6">
      <FiAlertCircle size={64} className="text-red-300 mb-6" />
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Problem Not Found</h1>
      <button onClick={() => router.push('/problems')} className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold shadow-lg">
        Back to Problems
      </button>
    </div>
  );

  return (
    <div className="bg-emerald-50 min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="group mb-8 flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold tracking-tight transition-colors"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> {t('back')}
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden mb-10">
              <div className="p-8 sm:p-12">
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusColors[problem.status]}`}>
                    {problem.status === 'open' ? t('status_open') : 
                     problem.status === 'resolved' ? t('status_resolved') : 
                     problem.status}
                  </span>
                  {problem.isVerified && (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                      <FiCheckCircle /> {t('verified_issue_badge')}
                    </span>
                  )}
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-400 bg-emerald-50 border border-slate-100 uppercase tracking-widest leading-normal">
                    {t(problem.category.toLowerCase())}
                  </span>
                  {problem.is_urgent && (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-red-100">
                      🔥 {t('status_urgent_badge')}
                    </span>
                  )}
                </div>

                <h1 className={`text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-tight ${problem.is_urgent ? 'text-red-600' : 'text-slate-900'}`}>
                  {problem.title}
                </h1>

                <div className="flex flex-wrap items-center gap-8 mb-10 border-y border-slate-50 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 transform rotate-3">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{t('reported_by_label')}</p>
                      <p className="text-base font-bold text-slate-900 leading-tight">{problem.reportedBy.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 transform -rotate-3">
                      <FiClock size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{t('date_reported_label')}</p>
                      <p className="text-base font-bold text-slate-900 leading-tight">{new Date(problem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Before & After Images Slider */}
                {(problem.image_url || problem.before_image_url) && (
                  <div className="mb-12">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-4">{t('evidence_outcome')}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                           <img src={problem.before_image_url || problem.image_url} alt="Before" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">BEFORE</div>
                        </div>
                        {problem.after_image_url ? (
                          <div className="bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                             <img src={problem.after_image_url} alt="After" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">AFTER</div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50/50 rounded-[2rem] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center p-8 h-64">
                             <FiCheckCircle size={32} className="text-emerald-300 mb-2" />
                             <p className="text-emerald-600 font-bold uppercase text-xs tracking-widest">{t('waiting_resolution')}</p>
                             <p className="text-emerald-400 text-xs text-center mt-2 font-medium">{t('waiting_resolution_desc')}</p>
                          </div>
                        )}
                     </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">{t('description_label')}</h3>
                    <button
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isTranslating ? (
                        <FiRefreshCw className="animate-spin" />
                      ) : (
                        <FiZap />
                      )}
                      {translatedText ? t('back') : t('translate')}
                    </button>
                  </div>
                  <div className={`p-6 rounded-3xl transition-all ${translatedText ? 'bg-green-50/50 border-2 border-green-100' : 'bg-transparent'}`}>
                    <p className={`text-lg leading-relaxed whitespace-pre-wrap font-medium ${translatedText ? 'text-green-900' : 'text-slate-600'}`}>
                      {translatedText || problem.description}
                    </p>
                    {translatedText && (
                      <p className="mt-4 text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">
                        {t('ai_translated_to', { language: locale === 'en' ? 'ENGLISH' : 'TELUGU' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="bg-green-50 rounded-3xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600">
                      <FiMapPin size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-green-900 uppercase text-[10px] tracking-widest mb-1">{t('problem_location_label')}</h4>
                      <p className="font-bold text-slate-700">{problem.location || problem.reportedBy.village || 'Near Village Center'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleUpvote}
                      className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl transition-all shadow-md active:scale-95 ${isUpvoted ? 'bg-green-600 text-white shadow-green-200' : 'bg-white text-slate-400 hover:text-green-600 hover:border-green-500 border border-slate-100'}`}
                    >
                      <FiThumbsUp size={24} className="mb-1" />
                      <span className="text-[10px] font-black uppercase leading-none">{problem.upvotes.length} Votes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Journey Timeline */}
            <StatusTimeline 
              status={problem.status} 
              isVerified={problem.isVerified} 
              assignedTo={problem.assigned_to}
              timestamps={{
                reportedAt: problem.createdAt,
                verifiedAt: problem.verified_at,
                assignedAt: problem.assigned_at,
                inProgressAt: problem.in_progress_at,
                completedAt: problem.completed_at
              }}
            />

            {/* Solutions Section */}
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 p-8 sm:p-12 mb-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('proposed_solutions')}</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-600 uppercase">
                    <FiMessageSquare /> {problem.solutions?.length || 0}
                  </div>
                </div>

                {problem.solutions?.length === 0 ? (
                  <div className="text-center py-16 bg-emerald-50/50 rounded-3xl border border-dashed border-slate-200">
                    <FiZap size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold mb-6">{t('no_solutions_yet')}</p>
                    {user && (user.role === 'volunteer' || user.role === 'admin') && (
                      <button 
                        onClick={() => setIsSolutionModalOpen(true)}
                        className="px-8 py-3 bg-green-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-green-200 transition-all font-bold"
                      >
                        {t('propose_first_solution')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Solution items would go here */}
                  </div>
                )}
              </div>

              {/* Real-time Community Comments */}
              <CommentsSection problemId={id as string} />
            </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-green-900/10">
              <h3 className="text-2xl font-black mb-6 tracking-tight">{t('take_action')}</h3>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">{t('take_action_desc')}</p>
              <div className="space-y-4">
                <button 
                  onClick={handleUpvote}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <FiThumbsUp /> {isUpvoted ? t('remove_vote') : t('upvote_issue')}
                </button>
                {user && (user.role === 'volunteer' || user.role === 'admin') && (
                  <>
                    <button 
                      onClick={handleClaimTask}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900"
                    >
                      <FiZap /> {t('claim_task')}
                    </button>
                    {(problem.status === 'in-progress' || problem.status === 'in_progress') && (
                      <button 
                        onClick={handleResolve}
                        className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <FiCheckCircle /> {t('resolve_issue_action')}
                      </button>
                    )}
                    <button 
                      onClick={() => setIsSolutionModalOpen(true)}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <FiPlus /> {t('propose_solution_modal_title')}
                    </button>
                  </>
                )}
                {user && user.role === 'admin' && (
                  <>
                    <button 
                      onClick={handleVerify}
                      className="w-full py-4 bg-blue-500 hover:bg-blue-400 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <FiCheckCircle /> {t('verify_problem_action')}
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full py-4 bg-red-500 hover:bg-red-400 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <FiTrash2 /> {t('delete_report_action')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Location Map */}
            {problem.location_lat && problem.location_lng && (
              <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl h-64 overflow-hidden relative">
                <MapComponent 
                  markers={[{
                    id: problem._id,
                    lat: problem.location_lat,
                    lng: problem.location_lng,
                    title: problem.title,
                    category: problem.category
                  }]}
                  initialViewState={{
                    latitude: problem.location_lat,
                    longitude: problem.location_lng,
                    zoom: 12
                  }}
                  interactive={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
                <p className="absolute bottom-6 left-6 text-[10px] font-black text-white uppercase tracking-widest">Digital Village Pin</p>
              </div>
            )}

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg">
              <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-[0.2em] border-b border-slate-50 pb-4">{t('community_impact_label')}</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-green-600">85%</div>
                  <div className="text-xs font-bold text-slate-500 uppercase leading-normal">{t('community_agreement')}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-green-600">42</div>
                  <div className="text-xs font-bold text-slate-500 uppercase leading-normal">{t('villagers_watching')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Final Synthesis - Professional Record */}
        {(problem.status === 'resolved' || problem.status === 'closed') && (
          <div className="mt-12 bg-slate-900 rounded-[3rem] p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <FiZap size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 text-green-400 mb-4 animate-pulse">
                   <FiZap />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">Intelligence Powered Synthesis</span>
                </div>
                <h3 className="text-4xl font-black mb-8 tracking-tighter">Final AI <span className="text-green-500">Case Review</span></h3>
                
                {!aiSummary ? (
                   <div className="py-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
                      <p className="text-slate-400 font-bold mb-8 max-w-sm">The problem is resolved. Finalize the case folder by generating a professional AI outcome report.</p>
                      <button 
                        onClick={handleGetAiSummary}
                        disabled={isAiSynthesizing}
                        className="px-10 py-5 bg-green-500 hover:bg-green-400 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-green-900/40 transition-all active:scale-95 flex items-center gap-3"
                      >
                         {isAiSynthesizing ? <FiRefreshCw className="animate-spin" /> : <FiSearch />} 
                         {isAiSynthesizing ? 'Compiling Intel...' : 'Generate Outcome Report'}
                      </button>
                   </div>
                ) : (
                   <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-12 mb-8">
                      <div className="prose prose-invert prose-emerald max-w-none prose-sm leading-relaxed whitespace-pre-line font-medium text-slate-200">
                         {aiSummary}
                      </div>
                      <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Digital Authority Record Verified • VillageConnect CORE™</span>
                         <button onClick={() => setAiSummary(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Regenerate Analysis</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Propose Solution Modal */}
      {isSolutionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('propose_solution_modal_title')}</h2>
            <p className="text-slate-500 font-medium mb-8">{t('propose_solution_modal_desc')}</p>
            
            <form onSubmit={handleProposeSolution} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">{t('solution_title_label')}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('solution_placeholder')}
                  className="w-full px-6 py-4 bg-emerald-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 transition-all font-black text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                  value={solutionForm.title}
                  onChange={(e) => setSolutionForm({ ...solutionForm, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">{t('solution_desc_label')}</label>
                <textarea 
                  required
                  rows={4}
                  placeholder={t('description_placeholder')}
                  className="w-full px-6 py-4 bg-emerald-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-green-500 transition-all font-black text-slate-900 placeholder:text-slate-400 placeholder:font-medium h-32"
                  value={solutionForm.description}
                  onChange={(e) => setSolutionForm({ ...solutionForm, description: e.target.value })}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsSolutionModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-green-500 shadow-lg shadow-green-200 transition-all"
                >
                  {t('submit_plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
