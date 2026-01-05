
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CareerOpportunity, ChatMessage } from '../types';

interface RoleplaySimulatorProps {
  currentConcept: CareerOpportunity | null;
}

const RoleplaySimulator: React.FC<RoleplaySimulatorProps> = ({ currentConcept }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const intro = currentConcept 
        ? `I've analyzed "${currentConcept.concept}". Master this, and you're ready for industry roles. \n\nHow do you want to upskill? Ask about salary trends or projects.`
        : `Hey B.Tech! I'm your Career Mentor. Scan a textbook topic to reveal your 2026 career path. \n\nWhat are you studying today?`;
        
      setMessages([{
        id: 'init',
        role: 'model',
        content: intro,
        timestamp: Date.now()
      }]);
    }
  }, [currentConcept]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = currentConcept 
        ? `User study: "${currentConcept.concept}" (${currentConcept.salary}). Modern version: "${currentConcept.companies[0]}".`
        : "The user is a B.Tech student.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `YOU ARE A B.TECH CAREER MENTOR. 
          CONTEXT: ${context}
          USER QUESTION: "${input}"
          GOALS: Answer job questions accurately, suggest free skills, be MOTIVATING. Be concise.`,
        config: { tools: [{ googleSearch: {} }] }
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: response.text || 'Mentor signal weak. Try again.',
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/20 overflow-hidden">
      <header className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tight">Career Mentor Chat</h2>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Market Sync: Active</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-2xl md:rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white shadow-xl rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none'
            }`}>
              <div className="text-[13px] md:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[8px] md:text-[9px] mt-2 opacity-40 font-bold">
                {msg.role === 'user' ? 'STUDENT' : 'MENTOR'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-2xl p-3 flex items-center space-x-2 animate-pulse">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce"></div>
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-75"></div>
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 md:space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="internships, salary, skills..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-xs md:text-sm text-white"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90"
          >
            🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleplaySimulator;
