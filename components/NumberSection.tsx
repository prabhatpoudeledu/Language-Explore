import React, { useEffect, useRef, useState } from 'react';
import { fetchNumbers, speakText, stopAllAudio, triggerHaptic, unlockAudio, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, NumberData, UserProfile } from '../types';

interface Props {
  language: LanguageCode;
  userProfile: UserProfile;
  showTranslation: boolean;
  addXp: (amount: number) => void;
}

export const NumberSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [numbers, setNumbers] = useState<NumberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<NumberData | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
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
        const data = await fetchNumbers(language);
        setNumbers(data);
        setSelectedNumber(data[0] || null);
        setPageIndex(0);
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
    const traceText = selectedNumber?.numeral || '';
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
  }, [selectedNumber]);

  useEffect(() => {
    drawGuide();
  }, [selectedNumber]);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const getPageNumbers = () => {
    if (numbers.length === 0) return [] as NumberData[];
    if (pageIndex === 0) return numbers.filter(n => n.value >= 0 && n.value <= 10);
    const start = 11 + (pageIndex - 1) * 10;
    const end = start + 9;
    return numbers.filter(n => n.value >= start && n.value <= end);
  };

  const pageNumbers = getPageNumbers();
  const maxPageIndex = numbers.length <= 11
    ? 0
    : 1 + Math.floor((Math.max(...numbers.map(n => n.value)) - 11) / 10);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < maxPageIndex;
  const pageLabel = pageIndex === 0
    ? '0-10'
    : `${11 + (pageIndex - 1) * 10}-${20 + (pageIndex - 1) * 10}`;

  useEffect(() => {
    if (pageNumbers.length === 0) return;
    const isOnPage = selectedNumber && pageNumbers.some(n => n.value === selectedNumber.value);
    if (!isOnPage) {
      setSelectedNumber(pageNumbers[0]);
      clearCanvas();
    }
  }, [pageIndex, numbers, pageNumbers, selectedNumber]);

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

  const handleSelectNumber = async (item: NumberData) => {
    setSelectedNumber(item);
    clearCanvas();
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    triggerHaptic(5);
    await unlockAudio();
    speakText(item.word, voiceId);
    addXp(2);
  };

  const handlePlay = async () => {
    if (!selectedNumber) return;
    await unlockAudio();
    speakText(selectedNumber.word, voiceId);
    triggerHaptic(5);
    addXp(2);
  };

  if (loading) return (
    <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">
      {showTranslation ? 'Loading numbers...' : 'संख्या लोड हुँदै...'}
    </div>
  );

  if (!selectedNumber) return null;

  return (
    <div ref={sectionTopRef} className="max-w-6xl mx-auto animate-fadeIn pb-16 px-2 md:px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
          {showTranslation ? 'Numbers' : 'संख्या'} 🔢
        </h2>
        <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
          {showTranslation ? 'Pick a number and trace it!' : 'संख्या छान्नुहोस् र ट्रेस गर्नुहोस्!'}
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-indigo-100 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm md:text-lg font-black text-indigo-600">
              {showTranslation ? 'Number Board' : 'संख्या तालिका'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              {showTranslation ? `Page ${pageLabel}` : `पृष्ठ ${pageLabel}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => canPrev && setPageIndex(prev => prev - 1)}
              disabled={!canPrev}
              className="px-3 py-2 rounded-xl text-xs font-black bg-indigo-50 text-indigo-500 shadow-sm disabled:opacity-40"
            >
              {showTranslation ? 'Prev' : 'अघिल्लो'}
            </button>
            <button
              onClick={() => canNext && setPageIndex(prev => prev + 1)}
              disabled={!canNext}
              className="px-3 py-2 rounded-xl text-xs font-black bg-indigo-500 text-white shadow-sm disabled:opacity-40"
            >
              {showTranslation ? 'Next 10' : 'अर्को १०'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {pageNumbers.map((n) => (
            <button
              key={n.value}
              onClick={() => handleSelectNumber(n)}
              className={`rounded-2xl p-3 text-left shadow-sm border transition ${selectedNumber.value === n.value ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
            >
              <div className="flex items-stretch gap-3">
                <div className="flex-1">
                  <div className="text-[10px] font-black text-indigo-400">{n.value}</div>
                  {n.roman && (
                    <div className="text-[10px] font-black text-indigo-300">{n.roman}</div>
                  )}
                  <div className="text-sm font-black">{n.word}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-70">{n.pronunciation}</div>
                </div>
                <div className="min-w-[56px] flex items-center justify-end text-4xl font-black">
                  {n.numeral}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-emerald-100 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-5xl font-black text-emerald-600">{selectedNumber.numeral}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-black bg-blue-50 text-blue-600">
                English - {selectedNumber.value}
              </span>
              {selectedNumber.roman && (
                <span className="px-3 py-1 rounded-full text-sm font-black bg-amber-50 text-amber-600">
                  Roman - {selectedNumber.roman}
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-gray-800 mt-2">{selectedNumber.word}</div>
            <div className="text-sm font-black uppercase tracking-widest text-emerald-500">
              {selectedNumber.pronunciation}
            </div>
          </div>
          <button
            onClick={handlePlay}
            className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-lg transition active:scale-95"
          >
            {showTranslation ? 'Play Sound' : 'आवाज सुनाउनुहोस्'} 🔊
          </button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-lg font-black text-pink-600">
            {showTranslation ? 'Trace Zone' : 'ट्रेस क्षेत्र'}
          </h3>
          <button
            onClick={clearCanvas}
            className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full shadow-sm"
          >
            {showTranslation ? 'Clear' : 'सफा गर्नुहोस्'}
          </button>
        </div>
        <div
          ref={containerRef}
          className="relative w-full h-[240px] md:h-[320px] bg-white rounded-3xl border border-dashed border-pink-200 overflow-hidden"
        >
          <canvas
            ref={guideCanvasRef}
            className="absolute inset-0 pointer-events-none"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
        </div>
      </div>
    </div>
  );
};
