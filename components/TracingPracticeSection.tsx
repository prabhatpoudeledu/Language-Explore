import React, { useEffect, useRef, useState } from 'react';
import { fetchAlphabet, speakText, stopAllAudio, triggerHaptic, unlockAudio, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, LetterData, UserProfile } from '../types';

interface Props {
  language: LanguageCode;
  userProfile: UserProfile;
  showTranslation: boolean;
  addXp: (amount: number) => void;
}

export const TracingPracticeSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [showAlphabetList, setShowAlphabetList] = useState(true);
  const [showMixer, setShowMixer] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const voiceId = resolveVoiceId(userProfile);

  const traceColor = userProfile.avatar === '👦' || userProfile.gender === 'male'
    ? '#60a5fa'
    : '#d946ef';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAlphabet(language);
        setLetters(data);
        setSelectedLetter(data[0] || null);
        setSelectedCombo(null);
        setShowAlphabetList(true);
        setShowMixer(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => stopAllAudio();
  }, [language]);

  const drawGuide = () => {
    if (!guideCanvasRef.current) return;
    const gctx = guideCanvasRef.current.getContext('2d');
    if (!gctx) return;

    gctx.clearRect(0, 0, guideCanvasRef.current.width, guideCanvasRef.current.height);
    const traceText = selectedCombo || selectedLetter?.char || '';
    if (!traceText) return;

    const width = guideCanvasRef.current.width;
    const height = guideCanvasRef.current.height;

    let fontSize = height * 0.6;
    gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
    let textWidth = gctx.measureText(traceText).width;

    while (textWidth > width * 0.9 && fontSize > 20) {
      fontSize -= 2;
      gctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
      textWidth = gctx.measureText(traceText).width;
    }

    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.strokeStyle = traceColor;
    gctx.lineWidth = 8;
    gctx.strokeText(traceText, width / 2, height / 2);
  };

  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !guideCanvasRef.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      guideCanvasRef.current.width = width;
      guideCanvasRef.current.height = height;
      drawGuide();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [selectedLetter, selectedCombo]);

  useEffect(() => {
    drawGuide();
  }, [selectedLetter, selectedCombo]);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
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
    ctx.strokeStyle = traceColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSelectLetter = async (letter: LetterData) => {
    setSelectedLetter(letter);
    setSelectedCombo(null);
    setShowAlphabetList(false);
    setShowMixer(true);
    clearCanvas();
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    triggerHaptic(5);
    await unlockAudio();
    speakText(letter.char, voiceId);
    addXp(2);
  };

  const handleSelectCombo = async (comboChar: string) => {
    if (!selectedLetter) return;
    setSelectedCombo(comboChar);
    setShowMixer(false);
    clearCanvas();
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    triggerHaptic(5);
    await unlockAudio();
    speakText(comboChar, voiceId);
    addXp(2);
  };

  const currentLetterIndex = selectedLetter
    ? letters.findIndex(l => l.char === selectedLetter.char)
    : -1;
  const hasPrevLetter = currentLetterIndex > 0;
  const hasNextLetter = currentLetterIndex > -1 && currentLetterIndex < letters.length - 1;
  const handlePrevLetter = () => {
    if (!hasPrevLetter) return;
    handleSelectLetter(letters[currentLetterIndex - 1]);
  };
  const handleNextLetter = () => {
    if (!hasNextLetter) return;
    handleSelectLetter(letters[currentLetterIndex + 1]);
  };

  const combos = selectedLetter?.combos || [];
  const currentComboIndex = selectedCombo ? combos.findIndex(c => c.char === selectedCombo) : -1;
  const hasPrevCombo = currentComboIndex > 0;
  const hasNextCombo = currentComboIndex > -1 && currentComboIndex < combos.length - 1;
  const handlePrevCombo = () => {
    if (!hasPrevCombo) return;
    handleSelectCombo(combos[currentComboIndex - 1].char);
  };
  const handleNextCombo = () => {
    if (!hasNextCombo) return;
    handleSelectCombo(combos[currentComboIndex + 1].char);
  };

  if (loading) return <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">{showTranslation ? 'Loading practice...' : 'अभ्यास लोड हुँदै...'}</div>;

  if (!selectedLetter) return null;

  return (
    <div ref={sectionTopRef} className="max-w-6xl mx-auto animate-fadeIn pb-16 px-2 md:px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
          {showTranslation ? 'Tracing Practice' : 'लेखन अभ्यास'} ✍️
        </h2>
        <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
          {showTranslation ? 'Pick a letter and trace it!' : 'अक्षर छान्नुहोस् र ट्रेस गर्नुहोस्!'}
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-indigo-100 mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-lg font-black text-indigo-600">
            {showTranslation ? 'Alphabet List' : 'वर्णमाला सूची'}
          </h3>
          <button
            onClick={() => setShowAlphabetList(prev => !prev)}
            className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full shadow-sm"
          >
            {showAlphabetList ? (showTranslation ? 'Hide' : 'लुकाउनुहोस्') : (showTranslation ? 'Show' : 'देखाउनुहोस्')}
          </button>
        </div>
        {showAlphabetList && (
          <div className="flex flex-wrap gap-2">
            {letters.map((l, i) => (
              <button
                key={i}
                onClick={() => handleSelectLetter(l)}
                className={`px-4 py-2 rounded-2xl font-black text-lg shadow-sm transition ${selectedLetter.char === l.char ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              >
                {l.char}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedLetter?.combos && selectedLetter.combos.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-pink-100 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm md:text-lg font-black text-pink-600">
              {showTranslation ? 'Sound Mixer' : 'ध्वनि मिक्सर'}
            </h3>
            <button
              onClick={() => setShowMixer(prev => !prev)}
              className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full shadow-sm"
            >
              {showMixer ? (showTranslation ? 'Hide' : 'लुकाउनुहोस्') : (showTranslation ? 'Show' : 'देखाउनुहोस्')}
            </button>
          </div>
          {showMixer && (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {selectedLetter.combos.map((combo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCombo(combo.char)}
                  className={`bg-gradient-to-br from-pink-300 to-pink-400 p-2 rounded-xl flex flex-col items-center justify-center shadow-lg transition active:scale-95 ${selectedCombo === combo.char ? 'ring-2 ring-pink-500 scale-105' : ''}`}
                >
                  <span className="text-lg md:text-xl font-black text-white drop-shadow">{combo.char}</span>
                  <span className="text-[8px] md:text-[10px] text-white/90 font-black uppercase mt-0.5 drop-shadow">{combo.sound}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-emerald-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg md:text-xl font-black text-emerald-600">
                {showTranslation ? 'Trace Here' : 'यहाँ ट्रेस गर्नुहोस्'}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevLetter}
                    disabled={!hasPrevLetter}
                    className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs shadow-sm disabled:opacity-40"
                  >
                    ← {hasPrevLetter ? letters[currentLetterIndex - 1]?.char : ''}
                  </button>
                  <button
                    onClick={handleNextLetter}
                    disabled={!hasNextLetter}
                    className="px-4 py-2 rounded-full bg-indigo-600 text-white font-black text-xs shadow-sm disabled:opacity-40"
                  >
                    {hasNextLetter ? letters[currentLetterIndex + 1]?.char : ''} →
                  </button>
                </div>
                {selectedLetter?.combos && selectedLetter.combos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevCombo}
                      disabled={!hasPrevCombo}
                      className="px-4 py-2 rounded-full bg-pink-50 text-pink-600 font-black text-xs shadow-sm disabled:opacity-40"
                    >
                      ← {hasPrevCombo ? combos[currentComboIndex - 1]?.char : ''}
                    </button>
                    <button
                      onClick={handleNextCombo}
                      disabled={!hasNextCombo}
                      className="px-4 py-2 rounded-full bg-pink-500 text-white font-black text-xs shadow-sm disabled:opacity-40"
                    >
                      {hasNextCombo ? combos[currentComboIndex + 1]?.char : ''} →
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div ref={containerRef} className="relative w-full h-52 md:h-64 bg-gradient-to-b from-emerald-50 to-blue-50 rounded-3xl overflow-hidden border-4 border-emerald-300 shadow-2xl">
              <canvas ref={guideCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-45" />
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
            </div>
            <div className="flex justify-center mt-4">
              <button onClick={clearCanvas} className="px-6 py-2 rounded-2xl bg-pink-500 text-white font-black text-sm shadow-lg active:scale-95">
                {showTranslation ? 'Clear' : 'सफा गर्नुहोस्'}
              </button>
            </div>
        </div>

      </div>
    </div>
  );
};
