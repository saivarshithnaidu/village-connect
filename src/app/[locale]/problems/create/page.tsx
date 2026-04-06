'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiArrowLeft, FiCamera, FiMapPin, FiSend, FiInfo, FiTag, FiClock, FiCheckCircle, FiPlus, FiBox, FiZap, FiX, FiEdit3, FiSearch, FiVideo 
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

// Load map dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-80 bg-slate-100 animate-pulse rounded-[2.5rem]" />
});

export default function CreateProblemPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infrastructure',
    location: '',
    district: '',
    mandal: '',
    village: '',
    priority: 'medium',
    district_id: '',
    mandal_id: '',
    village_id: ''
  });

  const [districts, setDistricts] = useState<any[]>([]);
  const [mandals, setMandals] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  
  // States
  const [aiData, setAiData] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Camera States
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [useManualMandal, setUseManualMandal] = useState(false);
  const [useManualVillage, setUseManualVillage] = useState(false);
  const [isLoadingMandals, setIsLoadingMandals] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  // 1. Initial Load: Fetch Districts
  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error("Error fetching districts", err));
  }, []);

  // 2. Cascade: Watch District Selection
  useEffect(() => {
    if (formData.district_id) {
       setIsLoadingMandals(true);
       fetch(`/api/locations?districtId=${formData.district_id}`)
         .then(res => res.json())
         .then(data => {
            setMandals(data);
            if (data.length === 0) setUseManualMandal(true);
            else setUseManualMandal(false);
         })
         .catch(err => console.error("Error fetching mandals", err))
         .finally(() => setIsLoadingMandals(false));
       
       setVillages([]);
       setFormData(prev => ({ ...prev, mandal_id: '', village_id: '', mandal: '', village: '' }));
    }
  }, [formData.district_id]);

  // 3. Cascade: Watch Mandal Selection
  useEffect(() => {
    if (formData.mandal_id && !useManualMandal) {
       setIsLoadingVillages(true);
       fetch(`/api/locations?mandalId=${formData.mandal_id}`)
         .then(res => res.json())
         .then(data => {
            setVillages(data);
            if (data.length === 0) setUseManualVillage(true);
            else setUseManualVillage(false);
         })
         .catch(err => console.error("Error fetching villages", err))
         .finally(() => setIsLoadingVillages(false));
       
       setFormData(prev => ({ ...prev, village_id: '', village: '' }));
    } else if (useManualMandal) {
       setUseManualVillage(true);
       setVillages([]);
    }
  }, [formData.mandal_id, useManualMandal]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (err) => {
        setError('Please enable location access to pin the problem accurately.');
        setIsGettingLocation(false);
      }
    );
  };

  // Image Upload Logic
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // CAMERA LOGIC
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Cannot access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Match canvas size to video aspect ratio
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        
        setImagePreviews(prev => [...prev, dataUrl]);
        
        // Convert to File for consistency
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setImageFiles(prev => [...prev, file]);
          });
          
        stopCamera();
      }
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSmartEnhance = async () => {
    if (imageFiles.length === 0) {
      alert("Please upload or capture a photo first! 📸");
      return;
    }

    const file = imageFiles[0];
    setIsEnhancing(true);
    try {
      const base64 = imagePreviews[0].includes('base64') 
        ? imagePreviews[0].split(',')[1] 
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
          });

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            image: base64,
            mimeType: 'image/jpeg' 
        })
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiData(data);
      
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        category: data.type?.toLowerCase() || 'infrastructure',
        priority: data.severity?.toLowerCase() || 'medium'
      }));
      
    } catch (err) {
      console.error(err);
      alert("AI was unable to process this image. 🤖");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push(`/${locale}/login`); return; }
    if (!formData.title) { setError('Please enter a Title.'); return; }
    if (!formData.description) { setError('Please describe the problem.'); return; }
    if (!formData.village) { setError('Please select or type your Village.'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        is_urgent: isUrgent,
        coordinates: coords,
        imageUrls: imagePreviews,
        reportedBy: { id: user.id, name: user.name || 'Community Member', village: formData.village },
        status: isUrgent ? 'urgent' : 'open',
        upvotes: [],
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) { router.push(`/${locale}/problems`); }
      else { const data = await res.json(); setError(data.message || 'Something went wrong'); }
    } catch (err) { setError('Failed to submit.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-emerald-50 min-h-screen py-10 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-bold text-sm mb-6 uppercase tracking-widest"
        >
          <FiArrowLeft /> {locale === 'te' ? 'తిరిగి వెళ్ళు' : 'Back'}
        </button>

        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden">
          <div className="mb-8 sm:mb-12 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">Report a Problem</h1>
            <p className="text-slate-400 font-bold max-w-md text-sm sm:text-base text-xs">Help your local community. Every report counts!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 relative z-10">
            {error && (
              <div className="p-4 sm:p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-black uppercase transition-all animate-bounce">
                <FiInfo className="shrink-0" /> {error}
              </div>
            )}

            {/* Gallery + Camera */}
            <div className="group">
              <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px] mb-3 ml-1">Visual Information</label>
              
              {showCamera ? (
                <div className="relative h-[400px] sm:h-96 bg-black rounded-2xl sm:rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl border-2 sm:border-4 border-slate-900">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 flex justify-center gap-4 sm:gap-6 pointer-events-auto">
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border-4 sm:border-8 border-green-500 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl"
                    />
                    <button 
                      type="button" 
                      onClick={stopCamera}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all text-white shadow-2xl"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative h-24 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg border border-slate-100">
                      <img src={src} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 sm:p-2 bg-red-500/80 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="h-24 sm:h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center hover:bg-white hover:border-green-400 transition-all cursor-pointer relative">
                     <FiPlus size={20} className="text-slate-300 mb-1" />
                     <span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-400">Gallery</span>
                     <input type="file" onChange={handleImageChange} multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>

                  <button 
                    type="button" 
                    onClick={startCamera}
                    className="h-24 sm:h-32 bg-emerald-50 border-2 border-emerald-100 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center hover:bg-emerald-100 hover:border-green-400 transition-all cursor-pointer"
                  >
                     <FiVideo size={20} className="text-emerald-400 mb-1" />
                     <span className="text-[7px] sm:text-[8px] font-black uppercase text-emerald-500">Live Camera</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 flex items-center gap-2">
                    <FiInfo className="text-green-400 shrink-0" /> Clear images improve AI accuracy.
                 </p>
                 {imagePreviews.length > 0 && !showCamera && (
                    <button type="button" disabled={isEnhancing} onClick={handleSmartEnhance} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-[9px] sm:text-[10px] font-black uppercase hover:bg-green-100 transition-all disabled:opacity-50 border border-green-100">
                      {isEnhancing ? <><div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> AI Processing...</> : <><FiZap /> Smart Enhance</>}
                    </button>
                 )}
              </div>
            </div>

            {/* Title */}
            <div className="relative">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px]">Title</label>
                {aiData?.title && <span className="text-[7px] sm:text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><FiZap size={8} /> AI SUGGESTED</span>}
              </div>
              <div className="relative">
                <FiBox className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-emerald-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-bold text-base sm:text-lg" placeholder="Short title..." />
              </div>
            </div>

            {/* Map */}
            <div className="group">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px]">Pin Location</label>
                <button type="button" onClick={handleGetLocation} className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-800 transition-colors">
                  {isGettingLocation ? <FiCheckCircle className="animate-spin text-xs" /> : <FiMapPin className="text-xs" />} {isGettingLocation ? 'Locating...' : 'Use My Location'}
                </button>
              </div>
              <div className="h-64 sm:h-80 bg-slate-100 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner relative">
                <MapComponent markers={coords ? [{ id: 'temp', lat: coords.lat, lng: coords.lng, title: 'Pinned Location', category: 'current' }] : []} onMapClick={(xy) => setCoords(xy)} />
              </div>
            </div>

            {/* Hierarchy */}
            <div className="space-y-4 md:space-y-0 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-slate-50 p-5 sm:p-7 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-inner">
                <div>
                   <label className="block text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 sm:mb-3 ml-1">District</label>
                   <select value={formData.district_id} onChange={(e) => { const d = districts.find(d => d.id === e.target.value); setFormData(prev => ({ ...prev, district_id: e.target.value, district: d?.name || '' })); }} className="w-full p-4 sm:p-5 bg-white border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-black text-black transition-all outline-none">
                      <option value="">DISTRICT...</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.name_te})</option>)}
                   </select>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2 sm:mb-3 ml-1">
                      <label className="block text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Mandal</label>
                      {formData.district_id && !isLoadingMandals && (
                        <button type="button" onClick={() => setUseManualMandal(!useManualMandal)} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[8px] font-black uppercase tracking-tight hover:bg-black hover:text-white transition-all shadow-sm">
                           {useManualMandal ? <><FiSearch /> Registry</> : <><FiEdit3 /> Type</>}
                        </button>
                      )}
                   </div>
                   {isLoadingMandals ? <div className="p-4 sm:p-5 bg-white border rounded-2xl animate-pulse text-[8px] font-black text-slate-400">FETCHING...</div> : useManualMandal ? <input type="text" value={formData.mandal} onChange={(e) => setFormData(prev => ({ ...prev, mandal: e.target.value, mandal_id: 'custom' }))} placeholder="Mandal..." className="w-full p-4 sm:p-5 bg-white border-2 border-green-200 rounded-2xl text-sm sm:text-base font-black text-black outline-none" /> : (
                      <select value={formData.mandal_id} disabled={!formData.district_id} onChange={(e) => { const m = mandals.find(m => m.id === e.target.value); setFormData(prev => ({ ...prev, mandal_id: e.target.value, mandal: m?.name || '' })); }} className="w-full p-4 sm:p-5 bg-white border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-black text-black transition-all outline-none">
                         <option value="">{mandals.length === 0 ? "NONE" : "CHOOSE..."}</option>
                         {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                   )}
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2 sm:mb-3 ml-1">
                      <label className="block text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Village</label>
                      {(formData.mandal_id || useManualMandal) && !isLoadingVillages && (
                        <button type="button" onClick={() => setUseManualVillage(!useManualVillage)} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[8px] font-black uppercase tracking-tight hover:bg-black hover:text-white transition-all shadow-sm">
                           {useManualVillage ? <><FiSearch /> Registry</> : <><FiEdit3 /> Type</>}
                        </button>
                      )}
                   </div>
                   {isLoadingVillages ? <div className="p-4 sm:p-5 bg-white border rounded-2xl animate-pulse text-[8px] font-black text-slate-400">FETCHING...</div> : useManualVillage ? <input type="text" value={formData.village} onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value, village_id: 'custom', location: `${e.target.value}, ${formData.mandal}` }))} placeholder="Village..." className="w-full p-4 sm:p-5 bg-white border-2 border-green-200 rounded-2xl text-sm sm:text-base font-black text-black outline-none" /> : (
                      <select value={formData.village_id} disabled={!formData.mandal_id && !useManualMandal} onChange={(e) => { const v = villages.find(v => v.id === e.target.value); setFormData(prev => ({ ...prev, village_id: e.target.value, village: v?.name || '', location: `${v?.name}, ${formData.mandal}` })); }} className="w-full p-4 sm:p-5 bg-white border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-black text-black transition-all outline-none">
                         <option value="">{villages.length === 0 ? "NONE" : "CHOOSE..."}</option>
                         {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                   )}
                </div>
            </div>

            {/* Description */}
            <div className="relative">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px]">Description</label>
                {aiData?.description && <span className="text-[7px] sm:text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><FiZap size={8} /> AI GENERATED</span>}
              </div>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="block w-full px-4 py-4 bg-emerald-50 border border-slate-200 rounded-2xl sm:rounded-[2rem] text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-bold text-sm sm:text-base" placeholder="Problem details..." />
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px] mb-2 ml-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="block w-full p-4 bg-emerald-50 border border-slate-200 rounded-2xl font-bold text-sm sm:text-base">
                  <option value="infrastructure">Infrastructure</option><option value="water">Water</option><option value="roads">Roads</option><option value="electricity">Electricity</option><option value="sanitation">Sanitation</option><option value="health">Health</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest text-[9px] sm:text-[10px] mb-2 ml-1">Urgency</label>
                <div className="flex gap-2 sm:gap-4">
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} type="button" onClick={() => setFormData({...formData, priority: p})} className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-emerald-50 text-slate-400 hover:bg-emerald-100'}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 sm:py-5 bg-green-600 hover:bg-slate-900 text-white rounded-2xl sm:rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-[1.01] sm:hover:scale-[1.02] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-base">
              {isSubmitting ? 'SUBMITTING...' : <><FiSend /> SUBMIT REPORT</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
