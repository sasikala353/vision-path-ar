
import React, { useState } from 'react';
import ImageView from './ImageView';
import VideoView from './VideoView';

const MediaStudio: React.FC = () => {
  const [mode, setMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Media Studio</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Visual Concept Realization</p>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setMode('IMAGE')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'IMAGE' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Blueprints
          </button>
          <button 
            onClick={() => setMode('VIDEO')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'VIDEO' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Motion
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {mode === 'IMAGE' ? <ImageView /> : <VideoView />}
      </div>
    </div>
  );
};

export default MediaStudio;
