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
        
        // Start background caching for all letters
        preCacheAlphabet(language, userProfile.voice);
        
        const vault = getAudioVault();
        setCachedSounds(new Set(Object.keys(vault)));
      } catch (e) {} finally { setLoading(false); }
    };
    load();
    
    // Periodically sync cached sounds state to show checkmarks
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
    
    // Clear the click animation class after it finishes
    setTimeout(() => setLastClickedChar(null), 300);

    setSelectedLetter(l);
    setCheckResult(null);
    
    // Auto-trigger sound download and play
    const vault = getAudioVault();
    if (!vault[l.char]) {
        setIsSoundLoading(true);
    }
    
    await speakText(l.char, userProfile.voice);
    setIsSoundLoading(false);
    
    // Refresh checkmark
    const newVault = getAudioVault();
    setCachedSounds(new Set(Object.keys(newVault)));
    
    addXp(5);
  };

  const currentIndex = selectedLetter ? letters.findIndex(l => l.char === selectedLetter.char) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < letters.length - 1;

  const handleNext = () => {
      if (!hasNext) return;
      handleSelect(letters[currentIndex + 1]);
  };

  const handlePrev = () => {
      if (!hasPrev) return;
      handleSelect(letters[currentIndex - 1]);
  };

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

    ctx.lineWidth = 14;
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
      setCheckResult(null);
      
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

  if (loading) return <div className="p-40 text-center text-4xl font-bold animate-pulse text-indigo-500">Unpacking the Alphabet... 📦</div>;

  const vowels = letters.filter(l => l.type === 'Vowel');
  const consonants = letters.filter(l => l.type === 'Consonant');

  if (selectedLetter) {
      return (
          <div className="p-4 max-w-6xl mx-auto animate-fadeIn pb-20">
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => { stopAllAudio(); setSelectedLetter(null); }} className="font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-3 transition-all text-xl bg-white px-6 py-3 rounded-3xl shadow-lg border-b-4 border-slate-100 active:translate-y-1">
                    <span className="text-3xl">🏠</span> Grid
                </button>
                <div className="flex gap-4">
                    {hasPrev && (
                        <button onClick={handlePrev} className="bg-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-b-8 border-indigo-100 text-3xl font-bold text-indigo-600 hover:scale-110 transition active:translate-y-1">
                            {letters[currentIndex - 1].char}
                        </button>
                    )}
                    {hasNext && (
                        <button onClick={handleNext} className="bg-indigo-600 w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-b-8 border-indigo-800 text-3xl font-bold text-white hover:scale-110 transition active:translate-y-1">
                            {letters[currentIndex + 1].char}
                        </button>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 bg-white p-10 rounded-[50px] shadow-2xl text-center flex flex-col items-center border-b-[16px] border-indigo-50">
                      <div className="text-[120px] font-bold text-indigo-600 mb-4 drop-shadow-2xl leading-none animate-bounce" style={{ animationDuration: '3s' }}>{selectedLetter.char}</div>
                      <p className="text-3xl text-indigo-200 font-bold mb-10 uppercase tracking-[0.3em]">{selectedLetter.transliteration}</p>
                      
                      <button 
                        onClick={() => handleSelect(selectedLetter)} 
                        disabled={isSoundLoading}
                        className={`bg-indigo-600 text-white w-full py-5 rounded-3xl font-bold text-2xl hover:scale-105 transition shadow-xl border-b-[8px] border-indigo-800 active:translate-y-1 flex items-center justify-center gap-4 ${isSoundLoading ? 'opacity-50' : ''}`}
                      >
                          <span className="text-3xl">{isSoundLoading ? '⏳' : '🔊'}</span> {isSoundLoading ? 'Baking sound...' : 'Hear sound'}
                      </button>
                      
                      <div className="mt-8 bg-amber-50 p-8 rounded-[40px] w-full border-b-[10px] border-amber-100">
                          <p className="text-[12px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-4">Example Word</p>
                          <p className="text-5xl font-bold text-gray-800 mb-2">{selectedLetter.exampleWord}</p>
                          <p className={`text-xl text-gray-400 font-medium mb-8 ${showTranslation ? 'visible' : 'invisible'}`}>{selectedLetter.exampleWordEnglish}</p>
                          <button onClick={() => speakText(selectedLetter.exampleWord, userProfile.voice)} className="bg-amber-400 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg border-b-4 border-amber-600 active:translate-y-1">🔊 Word</button>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[50px] shadow-2xl flex flex-col items-center border-b-[16px] border-emerald-50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/10 rounded-br-full"></div>
                            <h3 className="text-3xl font-bold text-emerald-600 mb-8 flex items-center gap-4">Magic Trace ✨</h3>
                            <div className="relative border-[10px] border-dashed border-emerald-100 rounded-[50px] overflow-hidden bg-emerald-50/10 w-full max-w-[340px] aspect-square mx-auto shadow-inner" style={{ touchAction: 'none' }}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-[250px] font-bold select-none">{selectedLetter.char}</div>
                                <canvas 
                                    ref={canvasRef} width={340} height={340} 
                                    className="relative z-10 touch-none cursor-crosshair w-full h-full" 
                                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} 
                                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} 
                                />
                                {checkResult && <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md transition-all ${checkResult === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}><div className="text-[120px] animate-popIn drop-shadow-2xl">{checkResult === 'success' ? '⭐' : '❌'}</div></div>}
                            </div>
                            <div className="flex gap-6 w-full mt-10 max-w-[340px] mx-auto">
                                <button onClick={clearCanvas} className="flex-1 py-4 bg-slate-100 text-gray-400 rounded-3xl font-bold text-xl border-b-4 border-slate-200 active:translate-y-1">Erase</button>
                                <button onClick={checkDrawing} disabled={isChecking} className={`flex-[2] py-4 rounded-3xl font-bold text-2xl shadow-xl transition active:translate-y-1 border-b-[8px] disabled:opacity-50 text-white ${checkResult === 'success' ? 'bg-emerald-500 border-emerald-700' : 'bg-indigo-600 border-indigo-800'}`}>
                                    {isChecking ? '...' : 'Check! 🚀'}
                                </button>
                            </div>
                        </div>

                        {selectedLetter.type === 'Consonant' && selectedLetter.combos && (
                            <div className="bg-white p-8 rounded-[50px] shadow-2xl border-b-[16px] border-pink-50">
                                <h3 className="text-2xl font-bold text-pink-500 mb-8">Sound Mixer 🧪</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-3">
                                    {selectedLetter.combos.map((combo, idx) => (
                                        <button key={idx} onClick={() => speakText(combo.char, userProfile.voice)} className="bg-pink-50 p-4 rounded-3xl flex flex-col items-center justify-center hover:bg-pink-100 transition-all active:translate-y-1 border-b-4 border-pink-200 group">
                                            <span className="text-2xl font-bold text-pink-700">{combo.char}</span>
                                            <span className="text-[10px] text-pink-300 font-bold uppercase mt-1">{combo.sound}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                  </div>
              </div>

              {/* Character Navigation Footer */}
              <div className="mt-16 flex justify-center gap-10">
                  {hasPrev && (
                      <button onClick={handlePrev} className="flex flex-col items-center gap-3 group">
                          <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center border-b-[12px] border-indigo-50 text-5xl font-bold text-indigo-300 group-hover:scale-110 group-hover:text-indigo-600 transition group-active:translate-y-2">
                              {letters[currentIndex - 1].char}
                          </div>
                          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Go Back</span>
                      </button>
                  )}
                  {hasNext && (
                      <button onClick={handleNext} className="flex flex-col items-center gap-3 group">
                          <div className="w-24 h-24 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center border-b-[12px] border-indigo-900 text-5xl font-bold text-white group-hover:scale-110 transition group-active:translate-y-2">
                              {letters[currentIndex + 1].char}
                          </div>
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Keep Going</span>
                      </button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="pb-32 animate-fadeIn px-2">
      <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">{langConfig.menu.alphabet} 🖌️</h2>
          <p className="text-xl text-indigo-400 font-bold bg-indigo-50 px-8 py-3 rounded-full">Choose a magic letter!</p>
      </div>

      <div className="space-y-16 max-w-7xl mx-auto">
        {vowels.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-10">
              <span className="bg-pink-500 text-white px-8 py-2 rounded-full font-bold shadow-xl text-lg border-b-4 border-pink-700">Vowels</span>
              <div className="h-2 bg-pink-100 flex-1 rounded-full"></div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 md:gap-6">
                {vowels.map((l, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleSelect(l)} 
                        className={`bg-white aspect-square rounded-[35px] shadow-xl border-b-[10px] border-pink-50 flex flex-col items-center justify-center transition-all transform hover:scale-110 hover:rotate-3 active:translate-y-2 group relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''}`}
                    >
                        {cachedSounds.has(l.char) && <div className="absolute top-2 right-2 text-xl" title="Sound Ready">✅</div>}
                        <span className="text-3xl md:text-5xl font-bold text-gray-800 group-hover:text-pink-600 leading-none">{l.char}</span>
                        <span className="text-xs text-pink-200 font-bold mt-2 uppercase tracking-widest">{l.transliteration}</span>
                    </button>
                ))}
            </div>
          </section>
        )}

        {consonants.length > 0 && (
          <section>
            <div className="flex items-center gap-6 mb-10">
              <span className="bg-indigo-500 text-white px-8 py-2 rounded-full font-bold shadow-xl text-lg border-b-4 border-indigo-700">Consonants</span>
              <div className="h-2 bg-indigo-100 flex-1 rounded-full"></div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 md:gap-6">
                {consonants.map((l, i) => {
                    return (
                        <button 
                            key={i} 
                            onClick={() => handleSelect(l)} 
                            className={`bg-white aspect-square rounded-[35px] shadow-xl border-b-[10px] border-indigo-50 flex flex-col items-center justify-center transition-all transform hover:scale-110 hover:-rotate-3 active:translate-y-2 group relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''}`}
                        >
                            {cachedSounds.has(l.char) && <div className="absolute top-2 right-2 text-xl" title="Sound Ready">✅</div>}
                            <span className="text-3xl md:text-5xl font-bold text-gray-800 group-hover:text-indigo-600 leading-none">{l.char}</span>
                            <span className="text-xs text-indigo-200 font-bold mt-2 uppercase tracking-widest">{l.transliteration}</span>
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