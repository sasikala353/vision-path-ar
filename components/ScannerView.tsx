
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CareerOpportunity } from '../types';

interface ScannerViewProps {
  onSave: (opp: CareerOpportunity) => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setStatus("ERROR: Camera access required.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setResult(null);
    setStatus("INITIATING X-RAY...");

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setStatus("SYNCING WITH INDUSTRY...");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `Analyze this B.Tech textbook concept. Return JSON with keys: topic, relevance (0-100), truthFilter (is it outdated?), industryEquivalent, upskilling[], freeLink (educational), motivation, resumeBullet.` } ,
            { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
          ]
        },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
      onSave({
        concept: data.topic,
        companies: [data.industryEquivalent],
        salary: `${data.relevance}% Relevance`,
        modernLink: data.freeLink,
        truthFilter: data.truthFilter,
        mission: data.motivation,
        impactLine: data.resumeBullet,
        timestamp: Date.now()
      });
      setStatus("");
    } catch (err) {
      setStatus("SCAN FAILED. TRY AGAIN.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
      {/* MOBILE TOP HUD */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 z-20 pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 md:h-8 bg-emerald-500"></div>
          <div>
            <h2 className="text-emerald-400 font-black tracking-tighter text-sm md:text-xl uppercase">Syllabus X-Ray</h2>
            <p className="text-[8px] md:text-[9px] text-emerald-500/60 font-mono italic">B.TECH CAREER CORE</p>
          </div>
        </div>
      </div>

      {/* CAMERA VIEWPORT */}
      <div className="relative flex-1">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
        <canvas ref={canvasRef} className="hidden" />

        {/* SCANNING ANIMATION */}
        {isScanning && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <div className="w-full h-[2px] bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] absolute top-0 animate-[scan_2.5s_linear_infinite]"></div>
            <div className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-emerald-400 font-mono text-[10px] font-bold tracking-[0.2em] animate-pulse">{status}</span>
            </div>
          </div>
        )}

        {/* RESPONSIVE RESULT OVERLAY */}
        {result && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 z-30 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass border-emerald-500/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90%] scrollbar-hide">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full mb-2 inline-block">Analysis Loaded</span>
                  <h3 className="text-xl md:text-3xl font-black text-white leading-tight">{result.topic}</h3>
                </div>
                <button onClick={() => setResult(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                <div className="bg-slate-800/60 p-4 md:p-5 rounded-3xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Relevance</p>
                  <p className={`text-2xl md:text-4xl font-black ${result.relevance > 70 ? 'text-emerald-400' : 'text-orange-400'}`}>{result.relevance}%</p>
                </div>
                <div className="bg-slate-800/60 p-4 md:p-5 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Industry Standard</p>
                  <p className="text-xs md:text-sm font-bold text-white italic truncate">{result.industryEquivalent}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                  <p className="text-[9px] text-orange-400 font-black uppercase tracking-widest mb-1">Truth Filter</p>
                  <p className="text-[11px] md:text-xs text-slate-300 leading-relaxed">{result.truthFilter}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.upskilling.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-500/20 rounded-lg text-[9px] font-bold text-blue-300 border border-blue-500/30">{skill}</span>
                    ))}
                  </div>
                  <a href={result.freeLink} target="_blank" className="block text-center py-2.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/40">
                    Get Free Resource →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE-FRIENDLY SCAN BUTTON */}
      <div className="p-8 md:p-10 flex flex-col items-center bg-slate-950/95 border-t border-slate-900 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button
          onClick={captureAndScan}
          disabled={isScanning}
          className={`relative group w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all ${
            isScanning ? 'scale-90 opacity-50' : 'hover:scale-105 active:scale-90'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse"></div>
          <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center text-2xl">
            📷
          </div>
        </button>
        <p className="mt-4 text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-emerald-500/70 font-black">
          {isScanning ? 'Decoding Theory' : 'Scan to Reveal Path'}
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ScannerView;
