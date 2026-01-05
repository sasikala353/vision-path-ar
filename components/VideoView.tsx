
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// window.aistudio is provided by the environment, removing local declaration to avoid conflicts

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      // Use type casting to avoid conflicting with existing global declarations
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    } catch (e) {
      console.warn('AI Studio environment not fully initialized');
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume the key selection was successful after triggering openSelectKey
      setNeedsKey(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setVideoUrl(null);
    setStatus('Initializing Veo engine...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Processing frames (this may take 1-2 minutes)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        setStatus('Engine is thinking... Adding motion vectors...');
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Fetching final render...');
        // Append API key when fetching from the download link
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error('Video error:', error);
      // Reset the key selection state if requested entity was not found
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
      setStatus('Generation failed. Ensure you have a paid API key selected.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold">Motion Lab</h2>
        <p className="text-sm text-slate-400">Veo 3.1 Fast • Cinematic Video Generation</p>
      </header>

      <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {needsKey ? (
          <div className="glass p-10 rounded-3xl text-center max-w-md">
            <div className="text-5xl mb-6">🔑</div>
            <h3 className="text-2xl font-bold mb-3">API Key Required</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Video generation requires a paid API key. Please select a project with billing enabled in Google AI Studio.
            </p>
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Open Key Selector
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="mt-4 block text-xs text-blue-400 underline"
            >
              Learn more about billing
            </a>
          </div>
        ) : (
          <div className="w-full space-y-8">
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-3xl p-6 text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none shadow-inner"
                placeholder="A cinematic drone shot through a neon-lit cyberpunk canyon..."
              />
              <div className="absolute bottom-6 right-6 flex space-x-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Rendering...' : 'Animate'}
                </button>
              </div>
            </div>

            {status && <p className="text-center text-sm text-slate-500 font-medium animate-pulse italic">{status}</p>}

            {videoUrl && (
              <div className="glass rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border border-slate-700">
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <a 
                    href={videoUrl} 
                    download="astra-video.mp4" 
                    className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-xs text-white border border-white/20 hover:bg-black/70"
                  >
                    Download MP4
                  </a>
                </div>
              </div>
            )}

            {!videoUrl && !isGenerating && (
              <div className="aspect-video glass rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-800 opacity-40">
                <span className="text-6xl mb-4">🎥</span>
                <p className="font-medium">No video generated yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoView;
