
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ url: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `High-fidelity conceptual educational visualization for a student: ${prompt}` }] },
        config: { imageConfig: { aspectRatio: '16:9' } }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      if (imageUrl) {
        setResults(prev => [{ url: imageUrl, prompt }, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-slate-800 p-8 flex flex-col space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Visualization Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 h-48 resize-none transition-all placeholder:text-slate-700 font-medium"
            placeholder="Visualise the flow of electrons in a semiconductor..."
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:bg-cyan-400 active:scale-95 disabled:opacity-20 transition-all shadow-lg"
        >
          {isGenerating ? 'Rendering...' : 'Generate Visual'}
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto bg-slate-900/10">
        <div className="grid grid-cols-1 gap-8">
          {isGenerating && <div className="aspect-video glass rounded-[40px] animate-pulse border-2 border-dashed border-cyan-500/20"></div>}
          {results.map((img, i) => (
            <div key={i} className="group relative glass rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
              <img src={img.url} className="w-full h-auto object-cover" alt={img.prompt} />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium text-slate-300 italic">"{img.prompt}"</p>
              </div>
            </div>
          ))}
          {!isGenerating && results.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
              <span className="text-7xl mb-6">💡</span>
              <p className="max-w-xs uppercase tracking-widest font-black text-xs">Transform theory into high-fidelity visual logic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageView;
