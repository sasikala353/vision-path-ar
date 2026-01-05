
import React, { useState } from 'react';
import { AppView, CareerOpportunity } from './types';
import Sidebar from './components/Sidebar';
import ScannerView from './components/ScannerView';
import CareerVault from './components/CareerVault';
import RoleplaySimulator from './components/RoleplaySimulator';
import MediaStudio from './components/MediaStudio';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.SCANNER);
  const [savedOpportunities, setSavedOpportunities] = useState<CareerOpportunity[]>([]);
  const [activeConcept, setActiveConcept] = useState<CareerOpportunity | null>(null);

  const handleSaveOpportunity = (opp: CareerOpportunity) => {
    setSavedOpportunities(prev => {
      if (prev.find(o => o.concept === opp.concept)) return prev;
      return [opp, ...prev];
    });
    setActiveConcept(opp);
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.SCANNER:
        return <ScannerView onSave={handleSaveOpportunity} />;
      case AppView.VAULT:
        return <CareerVault opportunities={savedOpportunities} />;
      case AppView.ROLEPLAY:
        return <RoleplaySimulator currentConcept={activeConcept} />;
      case AppView.MEDIA:
        return <MediaStudio />;
      default:
        return <ScannerView onSave={handleSaveOpportunity} />;
    }
  };

  const navItems = [
    { id: AppView.SCANNER, label: 'X-Ray', icon: '🔍' },
    { id: AppView.ROLEPLAY, label: 'Mentor', icon: '👨‍🏫' },
    { id: AppView.VAULT, label: 'Vault', icon: '📜' },
    { id: AppView.MEDIA, label: 'Lab', icon: '⚡' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-950 text-slate-50 overflow-hidden font-['Inter']">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeView={activeView} onViewChange={setActiveView} activeConceptName={activeConcept?.concept} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative pb-[72px] md:pb-0">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] glass border-t border-slate-800 flex items-center justify-around px-4 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              activeView === item.id ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            {activeView === item.id && (
              <div className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-2"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
