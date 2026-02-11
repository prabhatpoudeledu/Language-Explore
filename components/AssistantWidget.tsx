import React, { useEffect, useMemo, useState } from 'react';
import { askKidAssistant, speakText, stopAllAudio, triggerHaptic, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, UserProfile } from '../types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  language: LanguageCode;
  userProfile: UserProfile;
}

export const AssistantWidget: React.FC<Props> = ({ language, userProfile }) => {
  const persistEnabled = userProfile.assistantPersist ?? true;
  const storageKey = useMemo(() => `assistant_chat_${userProfile.id}`, [userProfile.id]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'नमस्ते! म तिमीको नेपाली साथी हुँ। के सिक्न मन छ?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const voiceId = resolveVoiceId(userProfile);

  useEffect(() => {
    if (!persistEnabled) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { messages: Message[]; savedAt: number };
      const thirtyDays = 1000 * 60 * 60 * 24 * 30;
      if (Date.now() - parsed.savedAt > thirtyDays) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (parsed.messages?.length) setMessages(parsed.messages);
    } catch (e) {}
  }, [persistEnabled, storageKey]);

  useEffect(() => {
    if (!persistEnabled) {
      localStorage.removeItem(storageKey);
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({ messages, savedAt: Date.now() }));
    } catch (e) {}
  }, [messages, persistEnabled, storageKey]);

  const sanitizeForSpeech = (text: string) => {
    return text
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[^\p{L}\p{N}\p{Z}\p{P}]/gu, '')
      .trim();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);
    triggerHaptic(5);

    const reply = await askKidAssistant(text, language);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    const speechText = sanitizeForSpeech(reply);
    if (speechText) {
      stopAllAudio();
      await speakText(speechText, voiceId);
    }
  };

  const handleSpeak = async (text: string) => {
    stopAllAudio();
    await speakText(text, voiceId);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      {isOpen && (
        <div className="w-[320px] max-w-[90vw] bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden mb-3">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="font-black text-sm">Nepali Helper ✨</div>
            <button onClick={() => setIsOpen(false)} className="text-white/90 text-lg">✕</button>
          </div>
          <div className="p-3 max-h-[320px] overflow-y-auto space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-slate-700'} px-3 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm`}> 
                  {m.text}
                </div>
                {m.role === 'assistant' && (
                  <button onClick={() => handleSpeak(m.text)} className="ml-2 text-indigo-400">🔊</button>
                )}
              </div>
            ))}
            {isTyping && <div className="text-xs text-slate-400 font-bold">...typing</div>}
          </div>
          <div className="p-3 border-t border-indigo-50 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="नेपालीमा सोध्नुहोस्..."
              className="flex-1 px-3 py-2 rounded-2xl border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-sm font-black shadow">Send</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="bg-indigo-600 text-white px-4 py-3 rounded-full shadow-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition"
      >
        🧒 Nepali Helper
      </button>
    </div>
  );
};
