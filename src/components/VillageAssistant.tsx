'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FiMessageSquare, FiX, FiSend, FiZap, FiBox, FiInfo, FiTerminal, FiLayout, FiMaximize2, FiMinimize2, FiRefreshCw, FiMic, FiVolume2, FiSquare 
} from 'react-icons/fi';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  navigation?: string;
  isError?: boolean;
}

export default function VillageAssistant() {
  const { id } = useParams();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: locale === 'te' ? "నమస్కారం! నేను మీ విలేజ్ అసిస్టెంట్. ఈరోజు నేను మీకు ఎలా సహాయపడగలను? 🙏" : "Hello! I am your Village Assistant. How can I help you with local issues or government schemes today? 🙏" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(0);
  const [cache, setCache] = useState<{ query: string; response: any } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Voice Recognition Setup (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = locale === 'te' ? 'te-IN' : 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [locale]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // 2. Voice Output (TTS)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Basic language detection (Telugu/English)
    const isTelugu = /[\u0c00-\u0c7f]/.test(text);
    utterance.lang = isTelugu ? 'te-IN' : 'en-IN';
    
    // Find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang));
    if (voice) utterance.voice = voice;
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  // 3. Auto-scroll and Context Aware logic
  useEffect(() => {
    if (id) {
       fetch(`/api/problems/${id}`).then(res => res.json()).then(data => setContext(data)).catch(err => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string, retryCount = 0) => {
    if (e) e.preventDefault();
    const userMessage = (customQuery || input).trim();
    if (!userMessage || isLoading) return;

    if (cache && cache.query === userMessage && !customQuery) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setMessages(prev => [...prev, { role: 'assistant', content: cache.response.answer, category: cache.response.category, suggested_action: cache.response.suggested_action }]);
      setInput('');
      return;
    }

    const now = Date.now();
    if (now - lastCallTime < 2000 && !customQuery) {
       alert("Please wait a few seconds... 🙏");
       return;
    }

    if (!customQuery) setInput('');
    if (!customQuery) setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setLastCallTime(now);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages.slice(-5).map(m => ({ role: m.role, parts: [{ text: m.content }] })), context })
      });

      if (res.status === 429 && retryCount < 2) {
         setTimeout(() => handleSendMessage(undefined, userMessage, retryCount + 1), 2000);
         return;
      }

      const data = await res.json();
      setCache({ query: userMessage, response: data });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer, 
        category: data.category, 
        navigation: data.navigation 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Server is busy. Please try again! 📡", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-green-600 hover:bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center transition-all scale-100 hover:scale-110 active:scale-95 group"
        >
          <FiMessageSquare size={28} />
          <span className="absolute right-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Village Assistant AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-[420px] h-[650px]'}`}>
          {/* Header */}
          <div className={`p-5 flex items-center justify-between transition-colors ${isMinimized ? 'bg-white' : 'bg-green-600 text-white'}`}>
             <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMinimized ? 'bg-green-100 text-green-600' : 'bg-white text-green-600'}`}>
                   <FiZap size={16} />
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest">Village Assistant</h4>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                   {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                   <FiX />
                </button>
             </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-emerald-50/20 scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 group max-w-[95%]">
                       {m.role === 'assistant' && (
                          <button 
                            onClick={() => speakText(m.content)}
                            className="p-2 bg-white text-slate-400 hover:text-green-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Listen"
                          >
                            <FiVolume2 size={14} />
                          </button>
                       )}
                       <div className={`p-5 rounded-3xl font-bold leading-relaxed shadow-sm ${
                         m.role === 'user' 
                           ? 'bg-slate-900 text-slate-100 rounded-tr-none text-base' 
                           : m.isError ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none text-base' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none text-base'
                       }`}>
                          {m.content}
                       </div>
                    </div>

                    {m.role === 'assistant' && m.category && !m.isError && (
                       <div className="mt-3 ml-12 w-[85%] bg-white border-2 border-green-50 rounded-2xl p-4 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Topic:</span>
                                <span className={`text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-2 ${
                                   m.category.toLowerCase().includes('water') ? 'bg-blue-50 text-blue-600' :
                                   m.category.toLowerCase().includes('electricity') ? 'bg-amber-50 text-amber-600' :
                                   m.category.toLowerCase().includes('road') ? 'bg-slate-100 text-slate-600' :
                                   'bg-green-50 text-green-600'
                                }`}>
                                   {m.category.toLowerCase().includes('water') ? '💧' : 
                                    m.category.toLowerCase().includes('electricity') ? '⚡' : 
                                    m.category.toLowerCase().includes('road') ? '🛣️' : '⚙️'} 
                                   {m.category}
                                </span>
                             </div>
                          </div>

                          {m.navigation && (
                             <button 
                                onClick={() => window.open(`/${locale}${m.navigation}`, '_self')}
                                className="w-full py-3 bg-green-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                             >
                                <FiLayout size={14} /> View Related {m.category} Issues
                             </button>
                          )}
                       </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4">
                      <FiRefreshCw className="animate-spin text-green-500" /> AI Analyzing...
                   </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-50 bg-white">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                   <div className="relative flex-1">
                      <input 
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder={isListening ? "Listening..." : "Type or click mic to speak..."}
                         className={`w-full pl-6 pr-14 py-5 bg-white border ${isListening ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200'} rounded-2xl outline-none focus:ring-2 focus:ring-green-600 transition-all font-black text-lg text-black placeholder:text-slate-400`}
                      />
                      <button 
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                         {isListening ? <FiSquare /> : <FiMic size={20} />}
                      </button>
                   </div>
                   <button 
                     type="submit"
                     disabled={isLoading || !input.trim()}
                     className="p-5 bg-green-600 text-white rounded-2xl shadow-lg hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
                   >
                      <FiSend size={24} />
                   </button>
                </form>
                <p className="mt-4 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                   <FiBox /> Multilingual Voice Enabled • Stability Mode
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
