
import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, triggerHaptic, stopAllAudio, getAudioVault, preCacheAlphabet } from '../services/geminiService';
import { LetterData, LanguageCode, UserProfile, LANGUAGES, ExampleWord } from '../types';

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
  const [selectedExample, setSelectedExample] = useState<ExampleWord | null>(null);
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

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setCheckResult(null);
    }
  };

  const handleSelect = async (l: LetterData) => {
    triggerHaptic(5);
    setLastClickedChar(l.char);
    setTimeout(() => setLastClickedChar(null), 300);
    setSelectedLetter(l);
    setSelectedExample(null);
    setCheckResult(null);
    clearCanvas();
    
    // Fetch voice sound
    const vault = getAudioVault();
    if (!vault[l.char]) setIsSoundLoading(true);
    speakText(l.char, userProfile.voice).then(() => setIsSoundLoading(false));
    
    const newVault = getAudioVault();
    setCachedSounds(new Set(Object.keys(newVault)));
    addXp(5);
  };

  const handleExampleClick = async (ex: ExampleWord) => {
      setSelectedExample(ex);
      triggerHaptic(10);
      
      // Hear word
      speakText(ex.word, userProfile.voice);
      addXp(2);
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

  const checkDrawingLocally = async () => {
      if(!canvasRef.current || !selectedLetter) return;
      setIsChecking(true);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const width = canvas.width;
      const height = canvas.height;

      const ghost = document.createElement('canvas');
      ghost.width = width;
      ghost.height = height;
      const gctx = ghost.getContext('2d')!;
      
      gctx.font = `black 200px Fredoka, sans-serif`;
      gctx.textAlign = 'center';
      gctx.textBaseline = 'middle';
      gctx.fillText(selectedLetter.char, width / 2, height / 2);
      
      const userData = ctx.getImageData(0, 0, width, height).data;
      const ghostData = gctx.getImageData(0, 0, width, height).data;
      
      let totalCharPixels = 0;
      let matchedPixels = 0;
      
      for (let i = 3; i < ghostData.length; i += 4) {
          const isCharPixel = ghostData[i] > 10;
          if (isCharPixel) {
              totalCharPixels++;
              const isUserPixel = userData[i] > 10;
              if (isUserPixel) matchedPixels++;
          }
      }

      const coverage = matchedPixels / totalCharPixels;
      await new Promise(r => setTimeout(r, 400));
      setIsChecking(false);

      if (coverage > 0.45) {
          setCheckResult('success');
          speakText("Amazing! Perfect tracing!", userProfile.voice);
          triggerHaptic([15, 10, 15]);
          addXp(25);
      } else {
          setCheckResult('fail');
          speakText("Keep trying! Follow the shape!", userProfile.voice);
          triggerHaptic(20);
      }
  };

  if (loading) return <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">Unpacking... 📦</div>;

  if (selectedLetter) {
      return (
          <div className="max-w-6xl mx-auto animate-fadeIn pb-16 px-4">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => { stopAllAudio(); setSelectedLetter(null); }} className="font-black text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-all text-sm bg-white px-5 py-2.5 rounded-2xl shadow-md active:translate-y-0.5">
                    🏠 Back
                </button>
                <div className="flex gap-2">
                    {hasPrev && (
                        <button onClick={handlePrev} className="bg-white w-12 h-12 rounded-full shadow-md flex items-center justify-center border-b-4 border-indigo-50 text-xl font-black text-indigo-600 active:translate-y-0.5">
                            {letters[currentIndex - 1].char}
                        </button>
                    )}
                    {hasNext && (
                        <button onClick={handleNext} className="bg-indigo-600 w-12 h-12 rounded-full shadow-md flex items-center justify-center border-b-4 border-indigo-900 text-xl font-black text-white active:translate-y-0.5">
                            {letters[currentIndex + 1].char}
                        </button>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Letter Info & Examples */}
                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white p-6 rounded-[35px] shadow-lg text-center flex flex-col items-center border-b-[10px] border-indigo-50 relative overflow-hidden">
                          <div className="text-8xl font-black text-indigo-600 mb-2 drop-shadow-md leading-none animate-bounce" style={{ animationDuration: '4s' }}>{selectedLetter.char}</div>
                          <p className="text-2xl text-indigo-200 font-black mb-6 uppercase tracking-widest">{selectedLetter.transliteration}</p>
                          
                          <button 
                            onClick={() => handleSelect(selectedLetter)} 
                            disabled={isSoundLoading}
                            className={`bg-indigo-600 text-white w-full py-4 rounded-2xl font-black text-lg hover:scale-105 shadow-md border-b-4 border-indigo-800 active:translate-y-0.5 flex items-center justify-center gap-2 ${isSoundLoading ? 'opacity-50' : ''}`}
                          >
                              {isSoundLoading ? '⏳' : '🔊 Listen'}
                          </button>
                      </div>

                      <div className="bg-white p-6 rounded-[35px] shadow-lg border-b-[10px] border-amber-50">
                          <h3 className="text-lg font-black text-amber-500 mb-4 uppercase tracking-widest">Example Words</h3>
                          <div className="space-y-2">
                              {selectedLetter.examples.map((ex, idx) => (
                                  <button 
                                      key={idx} 
                                      onClick={() => handleExampleClick(ex)}
                                      className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group ${selectedExample?.word === ex.word ? 'bg-amber-100 border-amber-300' : 'bg-slate-50 border-transparent hover:bg-amber-50'}`}
                                  >
                                      <div>
                                          <p className="text-xl font-black text-gray-800 leading-none">{ex.word}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{ex.english}</p>
                                      </div>
                                      <span className="text-xl group-hover:scale-125 transition">🔊</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Interaction & Feedback */}
                  <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Trace Section */}
                            <div className="bg-white p-6 rounded-[35px] shadow-lg flex flex-col items-center border-b-[10px] border-emerald-50 relative overflow-hidden">
                                <h3 className="text-xl font-black text-emerald-600 mb-4 flex items-center gap-2">Trace ✨</h3>
                                <div className="relative border-4 border-dashed border-emerald-100 rounded-3xl overflow-hidden bg-emerald-50/20 w-full aspect-square shadow-inner" style={{ touchAction: 'none' }}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none text-[200px] font-black select-none">{selectedLetter.char}</div>
                                    <canvas 
                                        ref={canvasRef} width={280} height={280} 
                                        className="relative z-10 touch-none cursor-crosshair w-full h-full" 
                                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} 
                                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} 
                                    />
                                    {checkResult && <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md ${checkResult === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}><div className="text-8xl animate-popIn">{checkResult === 'success' ? '⭐' : '❌'}</div></div>}
                                </div>
                                <div className="flex gap-4 w-full mt-6">
                                    <button onClick={clearCanvas} className="flex-1 py-3 bg-white border border-slate-100 text-gray-400 rounded-xl font-black text-sm transition">Clear</button>
                                    {checkResult === 'success' ? (
                                        <button onClick={handleNext} className="flex-[2] py-3 bg-emerald-500 text-white rounded-xl font-black text-lg shadow-md border-b-4 border-emerald-700 animate-pulse">Next Letter →</button>
                                    ) : (
                                        <button onClick={checkDrawingLocally} disabled={isChecking} className={`flex-[2] py-3 rounded-xl font-black text-lg shadow-md border-b-4 disabled:opacity-50 text-white ${checkResult === 'fail' ? 'bg-red-500 border-red-700' : 'bg-indigo-600 border-indigo-800'}`}>
                                            {isChecking ? '...' : 'Check!'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Example Visual Section */}
                            <div className="bg-white p-6 rounded-[35px] shadow-lg flex flex-col items-center border-b-[10px] border-amber-50">
                                <h3 className="text-xl font-black text-amber-500 mb-4">Picture Box 🖼️</h3>
                                <div className="w-full aspect-square bg-slate-50 rounded-3xl overflow-hidden shadow-inner border-2 border-slate-100 relative">
                                    {selectedExample ? (
                                        selectedExample.imageUrl ? (
                                            <div className="w-full h-full animate-fadeIn flex flex-col items-center">
                                                <img src={selectedExample.imageUrl} alt={selectedExample.english} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-4 inset-x-4 flex justify-center">
                                                    <button onClick={() => speakText(selectedExample.word, userProfile.voice)} className="bg-white/90 backdrop-blur px-6 py-2 rounded-2xl shadow-xl font-black text-amber-600 flex items-center gap-2 border-2 border-amber-100 active:scale-95 transition">
                                                        🔊 Listen Again
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                                <span className="text-6xl">🎨</span>
                                                <p className="text-[10px] font-black uppercase mt-2">No image available</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                                            <span className="text-5xl mb-4">👆</span>
                                            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Tap an example word on the left to see it here and hear it!</p>
                                        </div>
                                    )}
                                </div>
                                {selectedExample && (
                                    <div className="mt-4 text-center animate-fadeIn">
                                        <p className="text-2xl font-black text-gray-800 leading-none">{selectedExample.word}</p>
                                        <p className="text-sm font-bold text-gray-400 italic">"{selectedExample.english}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedLetter.type === 'Consonant' && selectedLetter.combos && (
                            <div className="bg-white p-6 rounded-[35px] shadow-lg border-b-[10px] border-pink-50">
                                <h3 className="text-lg font-black text-pink-500 mb-4">Sound Mixer 🧪</h3>
                                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-11 gap-2">
                                    {selectedLetter.combos.map((combo, idx) => (
                                        <button key={idx} onClick={() => speakText(combo.char, userProfile.voice)} className="bg-pink-50 p-2 rounded-xl flex flex-col items-center justify-center hover:bg-pink-100 transition active:translate-y-0.5 border-b-2 border-pink-200">
                                            <span className="text-lg font-black text-pink-700">{combo.char}</span>
                                            <span className="text-[7px] text-pink-300 font-black uppercase mt-0.5">{combo.sound}</span>
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
    <div className="pb-16 animate-fadeIn px-2">
      <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
            {showTranslation ? langConfig.menu.alphabetEn : langConfig.menu.alphabet} 🖌️
          </h2>
          <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">Tap a letter bubble!</p>
      </div>

      <div className="space-y-10 max-w-5xl mx-auto">
        {['Vowel', 'Consonant'].map(type => {
            const list = letters.filter(l => l.type === type);
            if (list.length === 0) return null;
            const color = type === 'Vowel' ? 'pink' : 'indigo';
            return (
              <section key={type}>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`bg-${color}-500 text-white px-6 py-1.5 rounded-full font-black shadow-md text-sm border-b-4 border-${color}-700`}>{type}s</span>
                  <div className={`h-1.5 bg-${color}-100 flex-1 rounded-full shadow-inner`}></div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4">
                    {list.map((l, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSelect(l)} 
                            className={`bg-white aspect-square rounded-[25px] md:rounded-[35px] shadow-sm border-b-4 border-${color}-50 flex flex-col items-center justify-center transition-all transform hover:scale-110 active:translate-y-2 group relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''}`}
                        >
                            {cachedSounds.has(l.char) && <div className="absolute -top-1 -right-1 text-lg drop-shadow-sm animate-bounce">✨</div>}
                            <span className="text-3xl md:text-4xl font-black text-gray-800 leading-none">{l.char}</span>
                            <span className="text-[7px] text-indigo-200 font-black mt-1 uppercase">{l.transliteration}</span>
                        </button>
                    ))}
                </div>
              </section>
            );
        })}
      </div>
    </div>
  );
};
