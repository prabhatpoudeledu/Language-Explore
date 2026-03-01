import React, { useEffect, useRef, useState } from 'react';
import { fetchNumbers, speakText, stopAllAudio, triggerHaptic, unlockAudio, resolveVoiceId, generatePronunciationHints, generateTracingSteps } from '../services/geminiService';
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
  const [traceStatus, setTraceStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [traceEffect, setTraceEffect] = useState<'success' | 'fail' | null>(null);
  const [traceNumberCount, setTraceNumberCount] = useState(0);
  const [completedNumbers, setCompletedNumbers] = useState<Set<string>>(new Set());
  const [aiHint, setAiHint] = useState<{ romanized: string; syllables: string[]; hint: string } | null>(null);
  const [aiSteps, setAiSteps] = useState<Array<{ step: number; instruction: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [activeAiPanel, setActiveAiPanel] = useState<'hint' | 'steps' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const voiceId = resolveVoiceId();

  const traceColor = '#1f2937';
  const aiOutputLang = showTranslation ? 'en' : 'np';
  const progressKey = `tracing_progress_v1_${language}`;

  const readAiCache = <T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const writeAiCache = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  };

  const buildAiKey = (type: string, target: string) => {
    const safeTarget = encodeURIComponent(target || 'unknown');
    return `ai_numbers_${language}_${aiOutputLang}_${type}_${safeTarget}`;
  };

  useEffect(() => {
    setActiveAiPanel(null);
    setAiError('');
    setAiHint(null);
    setAiSteps([]);
  }, [selectedNumber?.value, aiOutputLang]);

  const loadProgress = () => {
    try {
      const raw = localStorage.getItem(progressKey);
      if (!raw) return { letters: {} as Record<string, boolean>, numbers: {} as Record<string, boolean>, level: 0 };
      const parsed = JSON.parse(raw) as { letters?: Record<string, boolean>; numbers?: Record<string, boolean>; level?: number };
      return {
        letters: parsed.letters || {},
        numbers: parsed.numbers || {},
        level: parsed.level || 0
      };
    } catch {
      return { letters: {} as Record<string, boolean>, numbers: {} as Record<string, boolean>, level: 0 };
    }
  };

  const saveProgress = (lettersMap: Record<string, boolean>, numbersMap: Record<string, boolean>) => {
    const level = Object.keys(lettersMap).length;
    localStorage.setItem(progressKey, JSON.stringify({ letters: lettersMap, numbers: numbersMap, level }));
    setTraceNumberCount(Object.keys(numbersMap).length);
    setCompletedNumbers(new Set(Object.keys(numbersMap)));
  };

  const markNumberComplete = (value: number) => {
    const progress = loadProgress();
    const key = String(value);
    if (progress.numbers[key]) return;
    const updatedNumbers = { ...progress.numbers, [key]: true };
    saveProgress(progress.letters, updatedNumbers);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchNumbers(language);
        setNumbers(data);
        setSelectedNumber(data[0] || null);
        setPageIndex(0);
        const stored = loadProgress();
        setCompletedNumbers(new Set(Object.keys(stored.numbers)));
        setTraceNumberCount(Object.keys(stored.numbers).length);
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
    setTraceStatus('idle');
    setTraceEffect(null);
  };

  const checkTrace = () => {
    if (!canvasRef.current || !guideCanvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const gctx = guideCanvasRef.current.getContext('2d');
    if (!ctx || !gctx) return;
    const { width, height } = canvasRef.current;
    const drawData = ctx.getImageData(0, 0, width, height).data;
    const guideData = gctx.getImageData(0, 0, width, height).data;

    let guidePixels = 0;
    let overlapPixels = 0;
    for (let i = 3; i < guideData.length; i += 4) {
      const guideAlpha = guideData[i];
      if (guideAlpha > 0) {
        guidePixels++;
        if (drawData[i] > 0) overlapPixels++;
      }
    }

    const matchRatio = guidePixels === 0 ? 0 : overlapPixels / guidePixels;
    const threshold = selectedNumber && selectedNumber.numeral.length <= 1 ? 0.35 : 0.45;
    if (matchRatio >= threshold) {
      setTraceStatus('success');
      setTraceEffect('success');
      if (selectedNumber) {
        markNumberComplete(selectedNumber.value);
      }
      addXp(5);
    } else {
      setTraceStatus('fail');
      setTraceEffect('fail');
    }
    setTimeout(() => setTraceEffect(null), 1200);
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

  const handleAiHint = async () => {
    if (!selectedNumber) return;
    setActiveAiPanel('hint');
    setIsAiLoading(true);
    setAiError('');
    try {
      const cacheKey = buildAiKey('hint', String(selectedNumber.value));
      const cached = readAiCache<{ romanized: string; syllables: string[]; hint: string }>(cacheKey);
      if (cached) {
        setAiHint(cached);
        return;
      }
      const data = await generatePronunciationHints(selectedNumber.word, language, aiOutputLang);
      setAiHint(data);
      writeAiCache(cacheKey, data);
    } catch (e) {
      setAiError(showTranslation ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSteps = async () => {
    if (!selectedNumber) return;
    setActiveAiPanel('steps');
    setIsAiLoading(true);
    setAiError('');
    try {
      const cacheKey = buildAiKey('steps', String(selectedNumber.value));
      const cached = readAiCache<Array<{ step: number; instruction: string }>>(cacheKey);
      if (cached && cached.length > 0) {
        setAiSteps(cached);
        return;
      }
      const data = await generateTracingSteps(selectedNumber.numeral, language, aiOutputLang);
      setAiSteps(data.steps || []);
      if ((data.steps || []).length > 0) writeAiCache(cacheKey, data.steps || []);
    } catch (e) {
      setAiError(showTranslation ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black shadow-sm">{showTranslation ? 'Numbers' : 'संख्या'} {traceNumberCount}</div>
        </div>
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
              className={`rounded-2xl p-3 text-left shadow-sm border transition ${selectedNumber.value === n.value ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'} ${completedNumbers.has(String(n.value)) ? 'ring-2 ring-emerald-400' : ''}`}
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

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-amber-100 mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-lg font-black text-amber-600">
            {showTranslation ? 'AI Helpers' : 'एआई सहयोग'} ✨
          </h3>
          {isAiLoading && <span className="text-[10px] font-black text-amber-400">{showTranslation ? 'Loading...' : 'लोड हुँदै...'}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAiHint}
            disabled={isAiLoading}
            className={`px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {showTranslation ? 'Pronunciation Hints' : 'उच्चारण टिप्स'}
          </button>
          <button
            onClick={handleAiSteps}
            disabled={isAiLoading}
            className={`px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {showTranslation ? 'Writing Steps' : 'लेखन चरण'}
          </button>
        </div>

        {aiError && activeAiPanel && (
          <div className="mt-3 text-[10px] font-black text-rose-500">{aiError}</div>
        )}

        {activeAiPanel === 'hint' && aiHint && (
          <div className="mt-4 text-xs font-bold text-blue-900 bg-blue-50 rounded-xl px-3 py-2">
            <div>{aiHint.romanized}</div>
            {aiHint.syllables.length > 0 && <div>{aiHint.syllables.join('-')}</div>}
            <div>{aiHint.hint}</div>
          </div>
        )}

        {activeAiPanel === 'steps' && aiSteps.length > 0 && (
          <ol className="mt-4 space-y-2">
            {aiSteps.map(step => (
              <li key={step.step} className="text-xs font-bold text-emerald-900 bg-emerald-50 rounded-xl px-3 py-2">{step.step}. {step.instruction}</li>
            ))}
          </ol>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-pink-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-lg font-black text-pink-600">
            {showTranslation ? 'Trace Zone' : 'ट्रेस क्षेत्र'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full shadow-sm"
            >
              {showTranslation ? 'Clear' : 'सफा गर्नुहोस्'}
            </button>
            <button
              onClick={checkTrace}
              className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full shadow-sm"
            >
              {showTranslation ? 'Check' : 'जाँच'}
            </button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative w-full h-[240px] md:h-[320px] bg-white rounded-3xl border border-dashed border-pink-200 overflow-hidden touch-none overscroll-none"
        >
          <canvas
            ref={guideCanvasRef}
            className="absolute inset-0 pointer-events-none"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
          {traceStatus !== 'idle' && (
            <div className={`absolute inset-0 z-20 flex items-center justify-center ${traceStatus === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <div className={`text-5xl ${traceStatus === 'success' ? 'animate-bounce' : 'animate-pulse'}`}>{traceStatus === 'success' ? '✅' : '↻'}</div>
            </div>
          )}
          {traceEffect === 'success' && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              {[
                { left: '12%', top: '12%', delay: '0ms' },
                { left: '28%', top: '5%', delay: '100ms' },
                { left: '46%', top: '10%', delay: '200ms' },
                { left: '64%', top: '6%', delay: '150ms' },
                { left: '80%', top: '12%', delay: '250ms' },
                { left: '20%', top: '28%', delay: '80ms' },
                { left: '70%', top: '26%', delay: '120ms' }
              ].map((piece, idx) => (
                <span
                  key={idx}
                  className="absolute text-lg animate-bounce"
                  style={{ left: piece.left, top: piece.top, animationDelay: piece.delay }}
                >
                  ✨
                </span>
              ))}
              <div className="absolute inset-0 rounded-3xl border-4 border-emerald-300/60 animate-pulse"></div>
            </div>
          )}
          {traceEffect === 'fail' && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="absolute inset-0 rounded-3xl border-4 border-rose-300/60 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
