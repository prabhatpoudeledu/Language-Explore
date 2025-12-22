
import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, validateHandwriting, triggerHaptic, stopAllAudio } from '../services/geminiService';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const langConfig = LANGUAGES.find(l => l.code === language)!;
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAlphabet(language);
        setLetters(data);
      } catch (e) {} finally { setLoading(false); }
    };
    load();
    return () => stopAllAudio();
  }, [language]);

  const handleSelect = (l: LetterData) => {
    triggerHaptic(5);
    setSelectedLetter(l);
    setCheckResult(null);
    speakText(l.char, userProfile.voice);
    addXp(5);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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
          speakText("Amazing! You wrote it perfectly!", userProfile.voice);
          triggerHaptic([10, 5, 10]);
          addXp(25);
      } else {
          setCheckResult('fail');
          speakText("Almost! Try tracing one more time.", userProfile.voice);
          triggerHaptic(20);
      }
  };

  if (loading) return <div className="p-40 text-center text-4xl font-bold animate-pulse text-indigo-500">Unpacking the Alphabet... 📦</div>;

  const vowels = letters.filter(l => l.type === 'Vowel');
  const consonants = letters.filter(l => l.type === 'Consonant');

  if (selectedLetter) {
      return (
          <div className="p-4 max-w-6xl mx-auto animate-fadeIn pb-20">
              <button onClick={() => { stopAllAudio(); setSelectedLetter(null); }} className="mb-12 font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-3 transition-all text-xl">
                <span className="text-3xl">←</span> Back to Gallery
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 bg-white p-14 rounded-[70px] shadow-2xl text-center flex flex-col items-center border-b-[15px] border-indigo-50">
                      <div className="text-[200px] font-bold text-indigo-600 mb-8 drop-shadow-xl leading-none">{selectedLetter.char}</div>
                      <p className="text-4xl text-gray-300 font-bold mb-10 uppercase tracking-widest">{selectedLetter.transliteration}</p>
                      <button onClick={() => speakText(selectedLetter.char, userProfile.voice)} className="bg-indigo-100 text-indigo-600 px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 transition shadow-xl">🔊 Listen</button>
                      
                      <div className="mt-16 bg-yellow-50 p-10 rounded-[50px] w-full border-b-[10px] border-yellow-100">
                          <p className="text-[12px] font-bold text-yellow-600 uppercase tracking-[0.3em] mb-6">Example Discovery</p>
                          <p className="text-6xl font-bold text-gray-800 mb-3">{selectedLetter.exampleWord}</p>
                          <p className={`text-3xl text-gray-400 font-medium mb-10 ${showTranslation ? 'visible' : 'invisible'}`}>{selectedLetter.exampleWordEnglish}</p>
                          <button onClick={() => speakText(selectedLetter.exampleWord, userProfile.voice)} className="text-indigo-600 font-bold text-xl hover:underline transition-all flex items-center gap-3 mx-auto"><span>🔊</span> Play Word</button>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white p-12 rounded-[70px] shadow-2xl flex flex-col items-center border-b-[15px] border-emerald-50 relative">
                            <h3 className="text-3xl font-bold text-emerald-600 mb-10 flex items-center gap-4">Trace the Character 🖌️</h3>
                            
                            <div className="relative border-8 border-dashed border-emerald-100 rounded-[50px] overflow-hidden bg-emerald-50/20 w-full max-w-[400px] aspect-square mx-auto shadow-inner">
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none text-[320px] font-bold select-none">{selectedLetter.char}</div>
                                <canvas 
                                    ref={canvasRef} 
                                    width={400} 
                                    height={400} 
                                    className="relative z-10 touch-none cursor-crosshair w-full h-full" 
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                {checkResult && (
                                    <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm transition-all ${checkResult === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        <div className="text-[150px] animate-popIn drop-shadow-2xl">
                                            {checkResult === 'success' ? '⭐' : '❌'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-6 w-full mt-12 max-w-[400px] mx-auto">
                                <button onClick={clearCanvas} className="flex-1 py-6 bg-slate-50 text-gray-400 rounded-[30px] font-bold text-xl hover:bg-slate-100 transition shadow-sm border-2 border-slate-100">Clear</button>
                                <button 
                                    onClick={checkDrawing} 
                                    disabled={isChecking} 
                                    className={`flex-[2] py-6 rounded-[30px] font-bold text-2xl shadow-2xl transition active:scale-95 disabled:opacity-50 text-white
                                        ${checkResult === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}
                                    `}
                                >
                                    {isChecking ? 'Checking...' : checkResult === 'success' ? 'Perfect! Write More?' : 'Check Drawing'}
                                </button>
                            </div>
                            {checkResult === 'fail' && <p className="mt-6 text-red-500 font-bold animate-shake text-lg">Not quite! Let's try once more!</p>}
                        </div>

                        {selectedLetter.type === 'Consonant' && selectedLetter.combos && (
                            <div className="bg-white p-14 rounded-[70px] shadow-2xl border-b-[15px] border-pink-50">
                                <h3 className="text-3xl font-bold text-pink-500 mb-10 flex items-center gap-4">Sound Combinations 🧩</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-6">
                                    {selectedLetter.combos.map((combo, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => speakText(combo.char, userProfile.voice)}
                                            className="bg-pink-50 p-6 rounded-[35px] flex flex-col items-center justify-center hover:bg-pink-100 transition active:scale-95 group border-2 border-pink-100"
                                        >
                                            <span className="text-4xl font-bold text-pink-700">{combo.char}</span>
                                            <span className="text-[12px] text-pink-300 font-bold uppercase mt-2 opacity-100">{combo.sound}</span>
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
    <div className="pb-32 animate-fadeIn">
      <div className="flex flex-col items-center mb-20 text-center px-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4">{langConfig.menu.alphabet} 🖌️</h2>
          <p className="text-2xl text-gray-400 font-medium">Tap a letter to learn how it sounds and how to draw it!</p>
      </div>

      <div className="space-y-32 max-w-7xl mx-auto px-8">
        {vowels.length > 0 && (
          <section>
            <div className="flex items-center gap-10 mb-12">
              <span className="bg-pink-500 text-white px-10 py-4 rounded-full font-bold shadow-2xl text-2xl">Vowels</span>
              <div className="h-2 bg-slate-100 flex-1 rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
                {vowels.map((l, i) => (
                    <button key={i} onClick={() => handleSelect(l)} className="bg-white aspect-square rounded-[45px] shadow-xl border-b-[12px] border-indigo-50 flex flex-col items-center justify-center hover:scale-115 transition-all active:scale-95 group">
                        <span className="text-6xl font-bold text-gray-800 group-hover:text-indigo-600 transition leading-none">{l.char}</span>
                        <span className="text-[12px] text-gray-300 font-bold uppercase tracking-widest mt-4">{l.transliteration}</span>
                    </button>
                ))}
            </div>
          </section>
        )}

        {consonants.length > 0 && (
          <section>
            <div className="flex items-center gap-10 mb-12">
              <span className="bg-indigo-500 text-white px-10 py-4 rounded-full font-bold shadow-2xl text-2xl">Consonants</span>
              <div className="h-2 bg-slate-100 flex-1 rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
                {consonants.map((l, i) => (
                    <button key={i} onClick={() => handleSelect(l)} className="bg-white aspect-square rounded-[45px] shadow-xl border-b-[12px] border-emerald-50 flex flex-col items-center justify-center hover:scale-115 transition-all active:scale-95 group">
                        <span className="text-6xl font-bold text-gray-800 group-hover:text-emerald-600 transition leading-none">{l.char}</span>
                        <span className="text-[12px] text-gray-300 font-bold uppercase tracking-widest mt-4">{l.transliteration}</span>
                    </button>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
