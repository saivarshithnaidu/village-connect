'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { FiMessageSquare, FiSend, FiUser, FiInfo } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  user_id: string;
  problem_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    village: string;
  };
}

export default function CommentsSection({ problemId }: { problemId: string }) {
  const { user, token } = useAuth();
  const t = useTranslations();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();

    // Subscribe to NEW comments for this problem
    const channel = supabase
      .channel(`problem-comments:${problemId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'problem_comments', 
          filter: `problem_id=eq.${problemId}` 
        },
        async (payload) => {
          // Fetch user profile for the new comment
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', payload.new.user_id).single();
          const commentWithUser = { ...payload.new, user: profile } as Comment;
          setComments((prev) => [...prev, commentWithUser]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [problemId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?problemId=${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ problemId, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">
          <FiMessageSquare size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('community_discussion')}</h2>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('comments_count', { count: comments.length })}</p>
        </div>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-12 relative">
          <textarea
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comment_placeholder')}
            className="w-full p-6 bg-emerald-50 border border-slate-200 rounded-[2rem] text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium min-h-[120px]"
          ></textarea>
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute bottom-4 right-4 bg-green-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? t('posting') : <><FiSend /> {t('post_message')}</>}
          </button>
        </form>
      ) : (
        <div className="mb-12 p-8 bg-emerald-50 rounded-3xl border border-dashed border-slate-200 text-center">
            <FiInfo className="mx-auto text-slate-300 mb-3" size={24} />
            <p className="text-sm font-bold text-slate-500 italic">{t('login_to_discuss')}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 font-bold italic">{t('no_comments')}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-6 animate-in fade-in slide-in-from-left-4">
              <div className="shrink-0 w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                <FiUser size={20} />
              </div>
              <div className="flex-grow group">
                <div className="bg-emerald-50 backdrop-blur-md rounded-[2rem] p-6 hover:bg-slate-100/50 transition-colors border border-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                       {comment.user.name} <span className="text-slate-400 font-bold lowercase">{t('from_village', { village: comment.user.village })}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {formatDistanceToNow(new Date(comment.created_at))} ago
                    </p>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
