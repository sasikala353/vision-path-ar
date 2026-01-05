
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  activeConceptName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, activeConceptName }) => {
  const navItems = [
    { id: AppView.SCANNER, label: 'Syllabus X-Ray', sub: 'Industry Relevance', icon: '🔍' },
    { id: AppView.ROLEPLAY, label: 'Career Mentor', sub: 'Live Job Chat', icon: '👨‍🏫' },
    { id: AppView.VAULT, label: 'Skill Vault', sub: 'Resume Builder', icon: '📜' },
    { id: AppView.MEDIA, label: 'Visual Lab', sub: 'Concepts in Motion', icon: '⚡' },
  ];

  return (
    <aside className="w-72 glass border-r border-slate-800 flex flex-col h-full z-10">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          VISIONPATH AR
        </h1>
        <p className="text-[10px] text-emerald-500/60 mt-1 uppercase tracking-[0.2em] font-bold italic">B.Tech Career Engine</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group border ${
              activeView === item.id
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className={`text-2xl ${activeView === item.id ? 'grayscale-0' : 'grayscale opacity-50'}`}>
              {item.icon}
            </span>
            <div className="text-left">
              <span className="block font-bold text-sm tracking-tight">{item.label}</span>
              <span className="block text-[10px] opacity-50 uppercase font-medium">{item.sub}</span>
            </div>
          </button>
        ))}
      </nav>

      {activeConceptName && (
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 animate-pulse">
          <p className="text-[9px] uppercase text-cyan-500 font-bold tracking-widest mb-1">Current Study Focus</p>
          <p className="text-xs font-medium text-slate-300 truncate">{activeConceptName}</p>
        </div>
      )}

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            <span className="text-[10px] text-slate-300 font-bold uppercase">Ready for Career Guidance</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
