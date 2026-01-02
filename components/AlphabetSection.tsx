
import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, validateHandwriting, triggerHaptic, stopAllAudio, getAudioVault, preCacheAlphabet } from '../services/geminiService';
import { LetterData, LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

export const AlphabetSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'success' | 'fail' | null>(null);
  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cachedSounds, setCachedSounds] = useState<Set<string>>(new Set());
  const [lastClickedChar, setLastClickedChar] = useState<string | null>(null);

  const langConfig = LANGUAGES.find(l => l.code === language)!;
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAlphabet(language);
        setLetters(data);
        preCacheAlphabet(language, userProfile.voice);
        const vault = getAudioVault();
        setCachedSounds(new Set(Object.keys(vault)));
      } catch (e) {} finally { setLoading(false); }
    };
    load();
    const interval = setInterval(() => {
        const vault = getAudioVault();
        setCachedSounds(new Set(Object.keys(vault)));
    }, 2000);
    return () => {
        stopAllAudio();
        clearInterval(interval);
    };
  }, [language, userProfile.voice]);

  const handleSelect = async (l: LetterData) => {
    triggerHaptic(5);
    setLastClickedChar(l.char);
    setTimeout(() => setLastClickedChar(null), 300);
    setSelectedLetter(l);
    setCheckResult(null);
    const vault = getAudioVault();
    if (!vault[l.char]) setIsSoundLoading(true);
    await speakText(l.char, userProfile.voice);
    setIsSoundLoading(false);
    const newVault = getAudioVault();
    setCachedSounds(new Set(Object.keys(newVault)));
    addXp(5);
  };

  const currentIndex = selectedLetter ? letters.findIndex(l => l.char === selectedLetter.char) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < letters.length - 1;

  const handleNext = () => { if (hasNext) handleSelect(letters[currentIndex + 1]); };
  const handlePrev = () => { if (hasPrev) handleSelect(letters[currentIndex - 1]); };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    setCheckResult(null);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    if (e.cancelable) e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6366f1'; 
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setCheckResult(null);
    }
  };

  const checkDrawing = async () => {
      if(!canvasRef.current || !selectedLetter) return;
      setIsChecking(true);
      const base64 = canvasRef.current.toDataURL('image/png').split(',')[1];
      const isMatch = await validateHandwriting(base64, selectedLetter.char, language);
      setIsChecking(false);
      if (isMatch) {
          setCheckResult('success');
          speakText("Amazing!", userProfile.voice);
          triggerHaptic([10, 5, 10]);
          addXp(25);
      } else {
          setCheckResult('fail');
          speakText("Try again!", userProfile.voice);
          triggerHaptic(20);
      }
  };

  if (loading) return <div className="p-20 text-center text-2xl font-black animate-pulse text-indigo-500">Unpacking... 📦</div>;

  const vowels = letters.filter(l => l.type === 'Vowel');
  const consonants = letters.filter(l => l.type === 'Consonant');

  if (selectedLetter) {
      return (
          <div className="p-4 max-w-6xl mx-auto animate-fadeIn pb-24">
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => { stopAllAudio(); setSelectedLetter(null); }} className="font-black text-gray-500 hover:text-indigo-600 flex items-center gap-3 transition-all text-xl bg-white px-8 py-4 rounded-[30px] shadow-xl border-b-[6px] border-slate-50 active:translate-y-1 transform">
                    <span className="text-3xl">🏠</span> Back
                </button>
                <div className="flex gap-4">
                    {hasPrev && (
                        <button onClick={handlePrev} className="bg-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-b-[8px] border-indigo-50 text-3xl font-black text-indigo-600 hover:scale-110 transition transform active:translate-y-1">
                            {letters[currentIndex - 1].char}
                        </button>
                    )}
                    {hasNext && (
                        <button onClick={handleNext} className="bg-indigo-600 w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-b-[8px] border-indigo-900 text-3xl font-black text-white hover:scale-110 transition transform active:translate-y-1">
                            {letters[currentIndex + 1].char}
                        </button>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 bg-white p-10 rounded-[50px] shadow-2xl text-center flex flex-col items-center border-b-[15px] border-indigo-50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full group-hover:scale-125 transition-transform"></div>
                      <div className="text-[120px] font-black text-indigo-600 mb-4 drop-shadow-xl leading-none animate-bounce relative z-10" style={{ animationDuration: '4s' }}>{selectedLetter.char}</div>
                      <p className="text-3xl text-indigo-200 font-black mb-10 uppercase tracking-[0.4em] relative z-10">{selectedLetter.transliteration}</p>
                      
                      <button 
                        onClick={() => handleSelect(selectedLetter)} 
                        disabled={isSoundLoading}
                        className={`bg-indigo-600 text-white w-full py-6 rounded-[35px] font-black text-2xl hover:scale-105 transition shadow-2xl border-b-[10px] border-indigo-800 active:translate-y-1 flex items-center justify-center gap-4 relative z-10 ${isSoundLoading ? 'opacity-50' : ''}`}
                      >
                          <span className="text-3xl">{isSoundLoading ? '⏳' : '🔊'}</span> Listen
                      </button>
                      
                      <div className="mt-8 bg-amber-50 p-8 rounded-[40px] w-full border-b-[10px] border-amber-100 relative z-10 text-center">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4">Example</p>
                          <p className="text-4xl font-black text-gray-800 mb-1">{selectedLetter.exampleWord}</p>
                          <p className={`text-xl text-gray-400 font-bold mb-6 tracking-tight ${showTranslation ? 'visible' : 'invisible'}`}>{selectedLetter.exampleWordEnglish}</p>
                          <button onClick={() => speakText(selectedLetter.exampleWord, userProfile.voice)} className="bg-amber-400 text-white px-8 py-3 rounded-[25px] font-black text-xl hover:scale-110 transition shadow-xl border-b-4 border-amber-600 active:translate-y-1 transform">🔊 Hear</button>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[50px] shadow-2xl flex flex-col items-center border-b-[15px] border-emerald-50 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-br-full"></div>
                            <h3 className="text-3xl font-black text-emerald-600 mb-8 flex items-center gap-4">Trace ✨</h3>
                            <div className="relative border-[8px] border-dashed border-emerald-100 rounded-[40px] overflow-hidden bg-emerald-50/20 w-full max-w-[340px] aspect-square mx-auto shadow-inner transform" style={{ touchAction: 'none' }}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none text-[250px] font-black select-none">{selectedLetter.char}</div>
                                <canvas 
                                    ref={canvasRef} width={340} height={340} 
                                    className="relative z-10 touch-none cursor-crosshair w-full h-full" 
                                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} 
                                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} 
                                />
                                {checkResult && <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xl transition-all duration-500 ${checkResult === 'success' ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}><div className="text-[120px] animate-popIn drop-shadow-xl transform">{checkResult === 'success' ? '⭐' : '❌'}</div></div>}
                            </div>
                            <div className="flex gap-6 w-full mt-10 max-w-[340px] mx-auto">
                                <button onClick={clearCanvas} className="flex-1 py-4 bg-slate-100 text-gray-400 rounded-[25px] font-black text-xl border-b-[8px] border-slate-200 active:translate-y-1 transition-transform">Erase</button>
                                <button onClick={checkDrawing} disabled={isChecking} className={`flex-[2] py-4 rounded-[25px] font-black text-2xl shadow-xl transition-all active:translate-y-1 border-b-[10px] disabled:opacity-50 text-white transform ${checkResult === 'success' ? 'bg-emerald-500 border-emerald-700' : 'bg-indigo-600 border-indigo-800'}`}>
                                    {isChecking ? '...' : 'Check! 🚀'}
                                </button>
                            </div>
                        </div>

                        {selectedLetter.type === 'Consonant' && selectedLetter.combos && (
                            <div className="bg-white p-10 rounded-[50px] shadow-2xl border-b-[15px] border-pink-50 relative overflow-hidden group">
                                <h3 className="text-2xl font-black text-pink-500 mb-6 flex items-center gap-4">Sound Mixer 🧪</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-3">
                                    {selectedLetter.combos.map((combo, idx) => (
                                        <button key={idx} onClick={() => speakText(combo.char, userProfile.voice)} className="bg-pink-50 p-4 rounded-[25px] flex flex-col items-center justify-center hover:bg-pink-100 transition-all active:translate-y-2 border-b-[6px] border-pink-200 group transform">
                                            <span className="text-2xl font-black text-pink-700">{combo.char}</span>
                                            <span className="text-[10px] text-pink-300 font-black uppercase mt-1 tracking-tighter">{combo.sound}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="pb-32 animate-fadeIn px-4">
      <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 tracking-tighter">{langConfig.menu.alphabet} 🖌️</h2>
          <p className="text-xl text-indigo-500 font-black bg-white px-8 py-3 rounded-full shadow-lg border-2 border-indigo-50">Tap a bubble!</p>
      </div>

      <div className="space-y-16 max-w-7xl mx-auto">
        {vowels.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="bg-pink-500 text-white px-8 py-2 rounded-full font-black shadow-xl text-xl border-b-[8px] border-pink-700">Vowels</span>
              <div className="h-3 bg-pink-100 flex-1 rounded-full shadow-inner"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8">
                {vowels.map((l, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleSelect(l)} 
                        className={`bg-white aspect-square rounded-[35px] md:rounded-[45px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border-b-[10px] border-pink-50 flex flex-col items-center justify-center transition-all transform hover:scale-110 hover:rotate-6 active:translate-y-4 group relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''}`}
                    >
                        {cachedSounds.has(l.char) && <div className="absolute -top-1 -right-1 text-2xl drop-shadow-md animate-bounce">✨</div>}
                        <span className="text-4xl md:text-5xl font-black text-gray-800 group-hover:text-pink-600 leading-none transform transition-transform group-active:scale-90">{l.char}</span>
                        <span className="text-[10px] text-pink-200 font-black mt-2 uppercase tracking-[0.3em]">{l.transliteration}</span>
                    </button>
                ))}
            </div>
          </section>
        )}

        {consonants.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="bg-indigo-500 text-white px-8 py-2 rounded-full font-black shadow-xl text-xl border-b-[8px] border-indigo-700">Consonants</span>
              <div className="h-3 bg-indigo-100 flex-1 rounded-full shadow-inner"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8">
                {consonants.map((l, i) => {
                    return (
                        <button 
                            key={i} 
                            onClick={() => handleSelect(l)} 
                            className={`bg-white aspect-square rounded-[35px] md:rounded-[45px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border-b-[10px] border-indigo-50 flex flex-col items-center justify-center transition-all transform hover:scale-110 hover:-rotate-6 active:translate-y-4 group relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''}`}
                        >
                            {cachedSounds.has(l.char) && <div className="absolute -top-1 -right-1 text-2xl drop-shadow-md animate-bounce">✨</div>}
                            <span className="text-4xl md:text-5xl font-black text-gray-800 group-hover:text-indigo-600 leading-none transform transition-transform group-active:scale-90">{l.char}</span>
                            <span className="text-[10px] text-indigo-200 font-black mt-2 uppercase tracking-[0.3em]">{l.transliteration}</span>
                        </button>
                    );
                })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
