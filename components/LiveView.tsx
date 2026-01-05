
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{role: string, text: string}[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Decoding functions for Live API
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, {role: 'Gemini', text: message.serverContent!.outputTranscription!.text}]);
            }
            if (message.serverContent?.inputTranscription) {
               setTranscript(prev => [...prev, {role: 'You', text: message.serverContent!.inputTranscription!.text}]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a friendly companion. Talk naturally, be concise, and help the user with anything they need.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session:', err);
      alert('Microphone access is required for Live mode.');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold">Voice Nexus</h2>
        <p className="text-sm text-slate-400">Gemini 2.5 Live • Natural Speech Interaction</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative p-8">
        <div className="w-full max-w-lg flex flex-col items-center">
          <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive ? 'bg-blue-600/20' : 'bg-slate-800'
          }`}>
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-blue-500/30 animate-ping [animation-delay:200ms]"></div>
                <div className="absolute inset-4 rounded-full border-2 border-blue-500/10 animate-ping [animation-delay:400ms]"></div>
              </>
            )}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 ${
              isActive ? 'bg-blue-600 scale-110' : 'bg-slate-700'
            }`}>
              {isActive ? '🎙️' : '🔇'}
            </div>
          </div>

          <h3 className="mt-8 text-2xl font-bold tracking-tight">
            {isActive ? 'Gemini is listening...' : 'Ready for a chat?'}
          </h3>
          <p className="mt-2 text-slate-400 text-center max-w-sm">
            {isActive 
              ? 'Speak naturally as if you were talking to a friend.' 
              : 'Turn on Live mode to interact with Gemini using your voice in real-time.'}
          </p>

          <button
            onClick={isActive ? stopSession : startSession}
            className={`mt-10 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white text-slate-950 hover:bg-slate-200'
            }`}
          >
            {isActive ? 'Stop Session' : 'Go Live'}
          </button>
        </div>

        {transcript.length > 0 && (
          <div className="absolute bottom-8 left-8 right-8 max-h-48 overflow-y-auto glass rounded-2xl p-4 space-y-2">
            {transcript.slice(-5).map((t, i) => (
              <div key={i} className="text-sm">
                <span className={`font-bold mr-2 ${t.role === 'You' ? 'text-blue-400' : 'text-emerald-400'}`}>{t.role}:</span>
                <span className="text-slate-300">{t.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveView;
