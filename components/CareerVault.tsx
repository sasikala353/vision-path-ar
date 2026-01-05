
import React from 'react';
import { CareerOpportunity } from '../types';

interface CareerVaultProps {
  opportunities: CareerOpportunity[];
}

const CareerVault: React.FC<CareerVaultProps> = ({ opportunities }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-black">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">SKILL VAULT</h2>
            <p className="text-sm text-slate-400 font-medium max-w-md">Your professional inventory. Turn theory into resume lines.</p>
          </div>
          <div className="text-left md:text-right">
            <span className="block text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em]">Concepts Mastered</span>
            <span className="text-2xl md:text-3xl font-black text-white">{opportunities.length} Total</span>
          </div>
        </header>

        {opportunities.length === 0 ? (
          <div className="text-center py-20 md:py-32 glass border-dashed border-2 border-slate-800 rounded-[32px] md:rounded-[50px] opacity-40">
            <span className="text-5xl md:text-8xl mb-6 md:mb-8 block">🔒</span>
            <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase tracking-widest">Vault Empty</h3>
            <p className="text-slate-500 text-sm max-w-[200px] md:max-w-xs mx-auto">Use the Syllabus X-Ray to add your first engineering concept.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="group glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-3xl rounded-full"></div>
                
                <div className="mb-4">
                  <span className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mb-1 block">Engineering Concept</span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight">{opp.concept}</h3>
                </div>
                
                <div className="bg-slate-950/40 px-4 py-3 rounded-2xl border border-white/5 flex justify-between items-center mb-6">
                  <span className="text-[9px] text-slate-500 uppercase font-black">Relevance</span>
                  <span className="text-xs font-black text-emerald-400">{opp.salary}</span>
                </div>

                <div className="flex-1 p-5 rounded-2xl bg-blue-600/5 border border-blue-500/10 mb-6">
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest mb-2">Resume Impact</p>
                  <p className="text-[11px] md:text-xs text-slate-200 font-medium leading-relaxed italic">
                    "{opp.impactLine}"
                  </p>
                </div>

                <div className="flex space-x-2 mt-auto">
                  <a 
                    href={opp.modernLink} 
                    target="_blank" 
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all"
                  >
                    Learn More
                  </a>
                  <button className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-slate-950 rounded-xl md:rounded-2xl hover:scale-105 transition-all">
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerVault;
