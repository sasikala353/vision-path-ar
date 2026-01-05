
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let response;

      if (userMsg.image) {
        const base64Data = userMsg.image.split(',')[1];
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: input || "Describe this image." },
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
            ]
          }
        });
      } else {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: input,
        });
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || 'Sorry, I could not generate a response.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: 'Error communicating with Gemini. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Creative Chat</h2>
          <p className="text-sm text-slate-400">Gemini 3 Flash • Fast & Intelligent</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold">Start a conversation</h3>
            <p className="max-w-xs mt-2">Ask questions, plan projects, or analyze images with our most advanced light model.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-100 border border-slate-700'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="User upload" className="max-w-xs rounded-lg mb-3 border border-white/20" />
              )}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-4 flex items-center p-2 bg-slate-800 rounded-lg relative w-fit">
              <img src={selectedImage} className="h-16 w-16 object-cover rounded" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white text-xs"
              >✕</button>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <label className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors border border-slate-700">
              🖼️
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message Gemini..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
