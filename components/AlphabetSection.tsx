import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, triggerHaptic, stopAllAudio, getAudioVault, preCacheAlphabet, unlockAudio, geminiService } from '../services/geminiService';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cachedSounds, setCachedSounds] = useState<Set<string>>(new Set());
  const [lastClickedChar, setLastClickedChar] = useState<string | null>(null);

  const [exampleImageSrc, setExampleImageSrc] = useState<string>('');

  const isEnglishMode = showTranslation;

  // Resize canvases
  useEffect(() => {
    const resizeCanvases = () => {
      if (!canvasRef.current || !guideCanvasRef.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      guideCanvasRef.current.width = width;
      guideCanvasRef.current.height = height;

      drawGuide();
    };

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [selectedLetter, selectedExample]);

  // Clean solid faint guide - full word centered, auto-sized to fit
  const drawGuide = () => {
    if (!guideCanvasRef.current) return;
    const gctx = guideCanvasRef.current.getContext('2d');
    if (!gctx) return;

    gctx.clearRect(0, 0, guideCanvasRef.current.width, guideCanvasRef.current.height);

    const traceText = selectedExample ? selectedExample.word : selectedLetter?.char || '';
    if (!traceText) return;

    const width = guideCanvasRef.current.width;
    const height = guideCanvasRef.current.height;

    // Auto-scale font to fit entire word/letter perfectly
    let fontSize = height * 0.55;
    gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
    let textWidth = gctx.measureText(traceText).width;

    while (textWidth > width * 0.9 && fontSize > 20) {
      fontSize -= 2;
      gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
      textWidth = gctx.measureText(traceText).width;
    }

    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';

    // Soft sky blue faint guide
    gctx.strokeStyle = '#93c5fd';
    gctx.lineWidth = 8;
    gctx.strokeText(traceText, width / 2, height / 2);
  };

  useEffect(() => {
    drawGuide();
  }, [selectedLetter, selectedExample]);

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
    if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        setCheckResult(null);
    }
  };

  const playLetterSound = async (letter: LetterData) => {
    await unlockAudio();
    setIsSoundLoading(true);

    const localAudio = letter.letterNepaliAudio;
    if (localAudio) {
      const audio = new Audio(localAudio);
      audio.onended = () => setIsSoundLoading(false);
      audio.onerror = () => {
        speakText(letter.char, userProfile.voice).finally(() => setIsSoundLoading(false));
      };
      audio.play().catch(() => speakText(letter.char, userProfile.voice).finally(() => setIsSoundLoading(false)));
    } else {
      speakText(letter.char, userProfile.voice).finally(() => setIsSoundLoading(false));
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

    await playLetterSound(l);

    const newVault = getAudioVault();
    setCachedSounds(new Set(Object.keys(newVault)));
    addXp(5);
  };

  const playNepaliWordSound = async (ex: ExampleWord) => {
    await unlockAudio();
    const localAudio = ex.nepaliAudio;
    if (localAudio) {
      const audio = new Audio(localAudio);
      audio.onerror = () => speakText(ex.word, userProfile.voice);
      audio.play().catch(() => speakText(ex.word, userProfile.voice));
    } else {
      speakText(ex.word, userProfile.voice);
    }
  };

  const playEnglishWordSound = async (ex: ExampleWord) => {
    await unlockAudio();
    const localAudio = ex.englishAudio;
    if (localAudio) {
      const audio = new Audio(localAudio);
      audio.onerror = () => speakText(ex.english, userProfile.voice);
      audio.play().catch(() => speakText(ex.english, userProfile.voice));
    } else {
      speakText(ex.english, userProfile.voice);
    }
  };

  const handleExampleClick = async (ex: ExampleWord) => {
    setSelectedExample(ex);
    setExampleImageSrc(ex.imageUrl || '');
    triggerHaptic(10);

    await playNepaliWordSound(ex);

    setCheckResult(null);
    clearCanvas();

    addXp(5);
  };

  const handleImageError = async () => {
    if (selectedExample && exampleImageSrc.startsWith('/assets/images/')) {
      const generatedUrl = await geminiService.generateImage(
        `Simple kid-friendly illustration of ${selectedExample.english} for Nepali alphabet learning app`
      );
      setExampleImageSrc(generatedUrl);
    }
  };

  // Navigation
  const currentIndex = selectedLetter ? letters.findIndex(l => l.char === selectedLetter.char) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < letters.length - 1;
  const handleNext = () => { if (hasNext) handleSelect(letters[currentIndex + 1]); };
  const handlePrev = () => { if (hasPrev) handleSelect(letters[currentIndex - 1]); };

  // Soft pen
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
    ctx.strokeStyle = '#f472b6'; // Soft pink
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Tracing check
  const checkDrawingLocally = async () => {
    if (!canvasRef.current || (!selectedLetter && !selectedExample)) return;
    setIsChecking(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    const ghost = document.createElement('canvas');
    ghost.width = width;
    ghost.height = height;
    const gctx = ghost.getContext('2d')!;

    const traceText = selectedExample ? selectedExample.word : selectedLetter!.char;

    let fontSize = height * 0.55;
    gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
    let textWidth = gctx.measureText(traceText).width;

    while (textWidth > width * 0.9 && fontSize > 20) {
      fontSize -= 2;
      gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
      textWidth = gctx.measureText(traceText).width;
    }

    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.strokeStyle = 'black';
    gctx.lineWidth = 8;
    gctx.strokeText(traceText, width / 2, height / 2);

    const userData = ctx.getImageData(0, 0, width, height).data;
    const ghostData = gctx.getImageData(0, 0, width, height).data;

    let totalCharPixels = 0;
    let matchedPixels = 0;

    for (let i = 3; i < ghostData.length; i += 4) {
      const isCharPixel = ghostData[i] > 20;
      if (isCharPixel) {
        totalCharPixels++;
        const isUserPixel = userData[i] > 20;
        if (isUserPixel) matchedPixels++;
      }
    }

    const coverage = totalCharPixels > 0 ? matchedPixels / totalCharPixels : 0;
    await new Promise(r => setTimeout(r, 600));
    setIsChecking(false);

    const threshold = traceText.length > 8 ? 0.20 : traceText.length > 5 ? 0.25 : traceText.length > 3 ? 0.30 : 0.35;

    if (coverage > threshold) {
      setCheckResult('success');
      speakText(isEnglishMode ? "Amazing! You did it!" : "वाह! तपाईंले गर्नुभयो!", userProfile.voice);
      triggerHaptic([15, 10, 15]);
      addXp(selectedExample ? 20 : 30);
    } else {
      setCheckResult('fail');
      speakText(isEnglishMode ? "Great try! Let's do it again!" : "राम्रो प्रयास! फेरि गरौं!", userProfile.voice);
      triggerHaptic(20);
    }
  };

  if (loading) return <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">{isEnglishMode ? 'Unpacking...' : 'प्याक खोल्दै...'} 📦</div>;

  if (selectedLetter) {
    return (
      <div className="max-w-7xl mx-auto animate-fadeIn pb-16 px-4">
        {/* Header - slick back button */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => { stopAllAudio(); setSelectedLetter(null); setSelectedExample(null); }} className="flex items-center gap-2 text-base text-gray-600 hover:text-indigo-600 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md active:scale-95 transition">
            ← {isEnglishMode ? 'Back to Alphabet' : 'वर्णमाला फर्कनुहोस्'}
            <span className="text-xs text-gray-400">{isEnglishMode ? '(वर्णमाला फर्कनुहोस्)' : '(Back to Alphabet)'}</span>
          </button>
          <div className="flex gap-3">
            {hasPrev && (
              <button onClick={handlePrev} className="bg-gradient-to-br from-indigo-400 to-indigo-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-black text-white active:scale-95 transition">
                {letters[currentIndex - 1].char}
              </button>
            )}
            {hasNext && (
              <button onClick={handleNext} className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-black text-white active:scale-95 transition">
                {letters[currentIndex + 1].char}
              </button>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Letter + Examples */}
          <div className="space-y-8">
            {/* Letter Card - slick listen icon */}
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-indigo-100 text-center">
              <div className="text-8xl font-black text-indigo-600 mb-4 drop-shadow-md">{selectedLetter.char}</div>
              <p className="text-2xl text-indigo-300 font-black uppercase tracking-widest mb-8">{selectedLetter.transliteration}</p>
              {/* Speaker icon button instead of big button */}
              <button
                onClick={() => playLetterSound(selectedLetter)}
                disabled={isSoundLoading}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-2xl hover:shadow-indigo-500/50 active:scale-95 transition"
              >
                <span className="text-3xl">{isSoundLoading ? '⏳' : '🔊'}</span>
              </button>
              <p className="text-sm text-indigo-500 mt-3">
                {isEnglishMode ? 'Listen to Letter' : 'अक्षर सुन्नुहोस्'}
                <span className="block text-xs text-indigo-400">
                  {isEnglishMode ? '(अक्षर सुन्नुहोस्)' : '(Listen to Letter)'}
                </span>
              </p>
            </div>

            {/* Examples - slick cards */}
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-amber-100">
              <h3 className="text-xl font-black text-amber-600 mb-5">
                {isEnglishMode ? 'Example Words' : 'उदाहरण शब्दहरू'}
                <span className="block text-xs text-amber-400">
                  {isEnglishMode ? '(उदाहरण शब्दहरू)' : '(Example Words)'}
                </span>
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {selectedLetter.examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(ex)}
                    className={`w-full text-left p-5 rounded-2xl transition-all shadow-md flex items-center justify-between group ${selectedExample?.word === ex.word ? 'bg-gradient-to-r from-amber-200 to-amber-300 border-amber-400' : 'bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200'}`}
                  >
                    <div>
                      <p className="text-xl font-black text-gray-800">{ex.word}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase mt-1">{ex.english}</p>
                    </div>
                    <span className="text-2xl group-hover:scale-125 transition">🔊</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Tracing + Small Picture */}
          <div className="lg:col-span-2 space-y-6">
            {/* Small Picture */}
            {selectedExample && (
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-purple-100 flex flex-col items-center">
                <h3 className="text-lg font-black text-purple-600 mb-4">
                  {isEnglishMode ? 'Picture' : 'चित्र'}
                  <span className="block text-xs text-purple-400">
                    {isEnglishMode ? '(चित्र)' : '(Picture)'}
                  </span>
                </h3>
                <div className="w-full max-w-sm aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-lg border-4 border-purple-100 relative">
                  <img
                    src={exampleImageSrc}
                    alt={selectedExample.english}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <button
                      onClick={() => playEnglishWordSound(selectedExample)}
                      className="bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg font-bold text-sm text-blue-600 flex items-center gap-1.5 border-2 border-blue-200 hover:border-blue-400 active:scale-95 transition-all"
                    >
                      {isEnglishMode ? 'English' : 'अंग्रेजी'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal Tracing */}
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-emerald-100 flex flex-col items-center">
              <h3 className="text-2xl font-black text-emerald-600 mb-6">
                {selectedExample ? (isEnglishMode ? 'Trace the Word' : 'शब्द लेख्नुहोस्') : (isEnglishMode ? 'Trace the Letter' : 'अक्षर लेख्नुहोस्')}
                <span className="block text-sm text-emerald-400">
                  {selectedExample ? (isEnglishMode ? '(शब्द लेख्नुहोस्)' : '(Trace the Word)') : (isEnglishMode ? '(अक्षर लेख्नुहोस्)' : '(Trace the Letter)')} ✨
                </span>
              </h3>
              <div ref={containerRef} className="relative w-full max-w-5xl h-64 bg-gradient-to-b from-emerald-50 to-blue-50 rounded-3xl overflow-hidden border-6 border-emerald-300 shadow-2xl">
                {/* Faint solid guide */}
                <canvas
                  ref={guideCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
                />
                {/* User drawing */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-10"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {checkResult && (
                  <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md ${checkResult === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
                    <div className="text-9xl animate-bounce">{checkResult === 'success' ? '🌟🌟🌟' : '😊'}</div>
                  </div>
                )}
              </div>

              {/* Slick Clear & Check buttons */}
              <div className="flex gap-6 w-full max-w-md mt-8">
                <button onClick={clearCanvas} className="flex-1 py-4 bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 hover:shadow-pink-500/50 transition">
                  {isEnglishMode ? 'Clear' : 'सफा गर्नुहोस्'}
                  <span className="block text-xs opacity-90">{isEnglishMode ? '(सफा गर्नुहोस्)' : '(Clear)'}</span>
                </button>
                <button 
                  onClick={checkDrawingLocally} 
                  disabled={isChecking}
                  className={`flex-1 py-4 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 hover:shadow-emerald-500/50 transition ${isChecking ? 'opacity-70' : ''}`}
                >
                  {isChecking ? (isEnglishMode ? 'Checking...' : 'जाँच गर्दै...') : (isEnglishMode ? 'Check!' : 'जाँच गर्नुहोस्!')}
                  <span className="block text-xs opacity-90">{isChecking ? '' : (isEnglishMode ? '(जाँच गर्नुहोस्!)' : '(Check!)')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Mixer - slick buttons */}
        {selectedLetter.type === 'Consonant' && selectedLetter.combos && !selectedExample && (
          <div className="mt-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-pink-100">
            <h3 className="text-2xl font-black text-pink-600 mb-6 text-center">
              {isEnglishMode ? 'Sound Mixer' : 'ध्वनि मिक्सर'}
              <span className="block text-sm text-pink-400">{isEnglishMode ? '(ध्वनि मिक्सर) 🧪' : '(Sound Mixer) 🧪'}</span>
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-11 gap-4">
              {selectedLetter.combos.map((combo, idx) => (
                <button key={idx} onClick={() => speakText(combo.char, userProfile.voice)} className="bg-gradient-to-br from-pink-300 to-pink-400 p-4 rounded-2xl flex flex-col items-center justify-center hover:from-pink-400 hover:to-pink-500 transition active:scale-95 shadow-lg">
                  <span className="text-3xl font-black text-white drop-shadow">{combo.char}</span>
                  <span className="text-xs text-white/90 font-black uppercase mt-1 drop-shadow">{combo.sound}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="pb-16 animate-fadeIn px-2">
      <div className="flex flex-col items-center mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
          {showTranslation ? 'Alphabet' : 'वर्णमाला'} 🖌️
        </h2>
        <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
          {showTranslation ? 'Tap a letter bubble!' : 'अक्षर बबलमा ट्याप गर्नुहोस्!'}
        </p>
      </div>

      <div className="space-y-10 max-w-5xl mx-auto">
        {['Vowel', 'Consonant'].map(type => {
          const list = letters.filter(l => l.type === type);
          if (list.length === 0) return null;
          const color = type === 'Vowel' ? 'pink' : 'indigo';
          return (
            <section key={type}>
              <div className="flex items-center gap-4 mb-6">
                <span className={`bg-${color}-500 text-white px-6 py-1.5 rounded-full font-black shadow-md text-sm border-b-4 border-${color}-700`}>
                  {type}s
                </span>
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