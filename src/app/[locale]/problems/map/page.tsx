'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FiArrowLeft, FiFilter, FiSearch, FiLayers, FiList } from 'react-icons/fi';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

interface Problem {
  id: string;
  _id: string;
  title: string;
  category: string;
  location_lat: number;
  location_lng: number;
  priority: string;
}

export default function ProblemsMapPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '' });

  useEffect(() => {
    fetchProblems();
  }, [filter]);

  const fetchProblems = async () => {
    try {
      const query = new URLSearchParams(filter as any).toString();
      const res = await fetch(`/api/problems?${query}`);
      const data = await res.json();
      if (res.ok) {
        setProblems(data);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const markers = problems
    .filter(p => p.location_lat && p.location_lng)
    .map(p => ({
      id: p.id || p._id,
      lat: p.location_lat,
      lng: p.location_lng,
      title: p.title,
      category: p.priority === 'urgent' ? 'urgent' : p.category
    }));

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-8 left-8 right-8 z-10 flex flex-col md:flex-row gap-4 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => router.back()}
            className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all shadow-xl"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 shadow-xl text-white">
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">Community Issue <span className="text-green-400">Heatmap</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{problems.length} issues reported on map</p>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-end pointer-events-auto gap-4">
          <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] p-2">
            <Link 
              href="/problems" 
              className="px-6 py-3 text-[10px] items-center gap-2 font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex"
            >
              <FiList /> Grid View
            </Link>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-[1.2rem] text-[10px] flex items-center gap-2 font-black uppercase tracking-widest shadow-lg">
              <FiLayers /> Map View
            </button>
          </div>
          
          <select 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-green-400 transition-all cursor-pointer"
            value={filter.category}
            onChange={(e) => setFilter({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="health">Health</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
          </select>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-grow">
        <MapComponent 
          markers={markers} 
          initialViewState={{ latitude: 20.5937, longitude: 78.9629, zoom: 4 }} 
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-12 left-12 flex items-center gap-8 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">General Issue</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Urgent Status</span>
        </div>
      </div>
    </div>
  );
}
