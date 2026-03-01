import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, triggerHaptic, stopAllAudio, getAudioVault, preCacheAlphabet, unlockAudio, geminiService, resolveVoiceId, tryPlayLocalSoundWithTransliteration, registerHtmlAudio, unregisterHtmlAudio, generateExampleWords, generateExampleSentences, generateSimpleStory, generatePronunciationHints, generateTracingSteps } from '../services/geminiService';
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
  const [traceEffect, setTraceEffect] = useState<'success' | 'fail' | null>(null);
  const [traceLevel, setTraceLevel] = useState(0);
  const [traceLetterCount, setTraceLetterCount] = useState(0);
  const [aiExamples, setAiExamples] = useState<Array<{ native: string; romanized: string; english: string }>>([]);
  const [aiSentences, setAiSentences] = useState<Array<{ native: string; romanized: string; english: string }>>([]);
  const [aiStory, setAiStory] = useState<string>('');
  const [aiHint, setAiHint] = useState<{ romanized: string; syllables: string[]; hint: string } | null>(null);
  const [aiSteps, setAiSteps] = useState<Array<{ step: number; instruction: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [activeAiPanel, setActiveAiPanel] = useState<'examples' | 'sentences' | 'story' | 'hint' | 'steps' | null>(null);
  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cachedSounds, setCachedSounds] = useState<Set<string>>(new Set());
  const [lastClickedChar, setLastClickedChar] = useState<string | null>(null);
  const [isGroupPlaying, setIsGroupPlaying] = useState(false);
  const [groupPlayingType, setGroupPlayingType] = useState<'Vowel' | 'Consonant' | null>(null);
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const [playingComboChar, setPlayingComboChar] = useState<string | null>(null);
  const [isComboGroupPlaying, setIsComboGroupPlaying] = useState(false);
  const [activeType, setActiveType] = useState<'Vowel' | 'Consonant'>('Vowel');
  const cancelPlaybackRef = useRef(false);

  const [exampleImageSrc, setExampleImageSrc] = useState<string>('');

  const isEnglishMode = showTranslation;
  const voiceId = resolveVoiceId();
  const traceColor = '#1f2937';
  const progressKey = `tracing_progress_v1_${language}`;

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
    setTraceLevel(level);
    setTraceLetterCount(Object.keys(lettersMap).length);
  };

  const markLetterComplete = (char: string) => {
    const progress = loadProgress();
    if (progress.letters[char]) return;
    const updatedLetters = { ...progress.letters, [char]: true };
    saveProgress(updatedLetters, progress.numbers);
  };

  const resizeCanvases = () => {
    if (!canvasRef.current || !guideCanvasRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    guideCanvasRef.current.width = width;
    guideCanvasRef.current.height = height;
    drawGuide();
  };

  // Resize canvases
  useEffect(() => {
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    return () => window.removeEventListener('resize', resizeCanvases);
  }, [selectedLetter, selectedExample]);

  useEffect(() => {
    if (!selectedLetter && !selectedExample) return;
    const id = requestAnimationFrame(() => resizeCanvases());
    return () => cancelAnimationFrame(id);
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
    gctx.strokeStyle = traceColor;
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
        setSelectedLetter(null);
        setSelectedExample(null);
        preCacheAlphabet(language, voiceId);
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
  }, [language, voiceId]);

  useEffect(() => {
    const stored = loadProgress();
    setTraceLevel(Object.keys(stored.letters).length);
    setTraceLetterCount(Object.keys(stored.letters).length);
  }, [language]);

  const resetPlayback = () => {
    cancelPlaybackRef.current = true;
    stopAllAudio();
    setIsGroupPlaying(false);
    setGroupPlayingType(null);
    setPlayingChar(null);
    setPlayingComboChar(null);
    setIsComboGroupPlaying(false);
  };

  useEffect(() => {
    return () => {
      resetPlayback();
    };
  }, []);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        setCheckResult(null);
        setTraceEffect(null);
    }
  };

  const playLetterSoundWithPromise = async (letter: LetterData) => {
    await unlockAudio();
    setPlayingChar(letter.char);
    const localAudio = letter.letterNepaliAudio;

    if (localAudio) {
      return new Promise<void>((resolve) => {
        let didFallback = false;
        const audio = new Audio(localAudio);
        registerHtmlAudio(audio);

        const finish = () => {
          unregisterHtmlAudio(audio);
          audio.onended = null;
          audio.onerror = null;
          setPlayingChar(null);
          resolve();
        };

        const fallback = async () => {
          if (didFallback) return;
          didFallback = true;
          try {
            await speakText(letter.char, voiceId);
          } finally {
            setPlayingChar(null);
            resolve();
          }
        };

        audio.onended = finish;
        audio.onerror = () => {
          unregisterHtmlAudio(audio);
          fallback();
        };
        audio.play().catch(fallback);
      });
    }

    await speakText(letter.char, voiceId);
    setPlayingChar(null);
  };

  const playLetterSound = async (letter: LetterData) => {
    setIsSoundLoading(true);
    try {
      await playLetterSoundWithPromise(letter);
    } finally {
      setIsSoundLoading(false);
    }
  };

  const playLetterGroup = async (type: 'Vowel' | 'Consonant') => {
    if (isGroupPlaying) return;
    const list = letters.filter(l => l.type === type);
    if (list.length === 0) return;

    cancelPlaybackRef.current = false;
    setIsGroupPlaying(true);
    setGroupPlayingType(type);
    stopAllAudio();

    try {
      await unlockAudio();
      for (const letter of list) {
        if (cancelPlaybackRef.current) break;
        await playLetterSoundWithPromise(letter);
        if (cancelPlaybackRef.current) break;
        await new Promise(r => setTimeout(r, 250));
      }
    } finally {
      setPlayingChar(null);
      setIsGroupPlaying(false);
      setGroupPlayingType(null);
    }
  };

  const playComboSound = async (comboChar: string) => {
    setPlayingComboChar(comboChar);
    try {
      await unlockAudio();
      await speakText(comboChar, voiceId);
    } finally {
      setPlayingComboChar(null);
    }
  };

  const playComboGroup = async (combos: { char: string }[]) => {
    if (isComboGroupPlaying) return;
    if (!combos || combos.length === 0) return;
    cancelPlaybackRef.current = false;
    setIsComboGroupPlaying(true);
    stopAllAudio();
    try {
      await unlockAudio();
      for (const combo of combos) {
        if (cancelPlaybackRef.current) break;
        setPlayingComboChar(combo.char);
        await speakText(combo.char, voiceId);
        if (cancelPlaybackRef.current) break;
        await new Promise(r => setTimeout(r, 200));
      }
    } finally {
      setPlayingComboChar(null);
      setIsComboGroupPlaying(false);
    }
  };

  const aiOutputLang = isEnglishMode ? 'en' : 'np';
  const aiLetter = selectedLetter?.char || '';
  const aiWord = selectedExample?.word || selectedLetter?.examples?.[0]?.word || '';

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
    return `ai_alpha_${language}_${aiOutputLang}_${type}_${safeTarget}`;
  };

  useEffect(() => {
    setActiveAiPanel(null);
    setAiError('');
    setAiExamples([]);
    setAiSentences([]);
    setAiStory('');
    setAiHint(null);
    setAiSteps([]);
  }, [aiLetter, aiWord, aiOutputLang]);

  const handleAiExamples = async () => {
    if (!aiLetter) return;
    setActiveAiPanel('examples');
    setIsAiLoading(true);
    setAiError('');
    setAiExamples([]);
    try {
      const cacheKey = buildAiKey('examples', aiLetter);
      const cached = readAiCache<Array<{ native: string; romanized: string; english: string }>>(cacheKey);
      if (cached && cached.length > 0) {
        setAiExamples(cached);
        return;
      }
      const items = await generateExampleWords(aiLetter, language, aiOutputLang, 5);
      setAiExamples(items);
      if (items.length > 0) writeAiCache(cacheKey, items);
    } catch (e) {
      setAiError(isEnglishMode ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSentences = async () => {
    if (!aiWord) return;
    setActiveAiPanel('sentences');
    setIsAiLoading(true);
    setAiError('');
    setAiSentences([]);
    try {
      const cacheKey = buildAiKey('sentences', aiWord);
      const cached = readAiCache<Array<{ native: string; romanized: string; english: string }>>(cacheKey);
      if (cached && cached.length > 0) {
        setAiSentences(cached);
        return;
      }
      const items = await generateExampleSentences(aiWord, language, aiOutputLang, 3);
      setAiSentences(items);
      if (items.length > 0) writeAiCache(cacheKey, items);
    } catch (e) {
      setAiError(isEnglishMode ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiStory = async () => {
    const words = [aiWord || aiLetter].filter(Boolean);
    if (words.length === 0) return;
    const target = words.join('_');
    setActiveAiPanel('story');
    setIsAiLoading(true);
    setAiError('');
    setAiStory('');
    try {
      const cacheKey = buildAiKey('story', target);
      const cached = readAiCache<{ story?: string }>(cacheKey);
      if (cached?.story) {
        setAiStory(cached.story);
        return;
      }
      const data = await generateSimpleStory(words, language, aiOutputLang);
      setAiStory(data.story || '');
      if (data.story) writeAiCache(cacheKey, { story: data.story });
    } catch (e) {
      setAiError(isEnglishMode ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiHint = async () => {
    if (!aiLetter) return;
    setActiveAiPanel('hint');
    setIsAiLoading(true);
    setAiError('');
    setAiHint(null);
    try {
      const cacheKey = buildAiKey('hint', aiLetter);
      const cached = readAiCache<{ romanized: string; syllables: string[]; hint: string }>(cacheKey);
      if (cached) {
        setAiHint(cached);
        return;
      }
      const data = await generatePronunciationHints(aiLetter, language, aiOutputLang);
      setAiHint(data);
      writeAiCache(cacheKey, data);
    } catch (e) {
      setAiError(isEnglishMode ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSteps = async () => {
    const target = selectedExample ? selectedExample.word : aiLetter;
    if (!target) return;
    setActiveAiPanel('steps');
    setIsAiLoading(true);
    setAiError('');
    setAiSteps([]);
    try {
      const cacheKey = buildAiKey('steps', target);
      const cached = readAiCache<Array<{ step: number; instruction: string }>>(cacheKey);
      if (cached && cached.length > 0) {
        setAiSteps(cached);
        return;
      }
      const data = await generateTracingSteps(target, language, aiOutputLang);
      setAiSteps(data.steps || []);
      if ((data.steps || []).length > 0) writeAiCache(cacheKey, data.steps || []);
    } catch (e) {
      setAiError(isEnglishMode ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelect = async (l: LetterData) => {
    triggerHaptic(5);
    setLastClickedChar(l.char);
    setTimeout(() => setLastClickedChar(null), 300);
    setSelectedLetter(l);
    setSelectedExample(null);
    setActiveAiPanel(null);
    setAiError('');
    setCheckResult(null);
    clearCanvas();

    await playLetterSound(l);

    const newVault = getAudioVault();
    setCachedSounds(new Set(Object.keys(newVault)));
    addXp(5);
  };

  const playNepaliWordSound = async (ex: ExampleWord) => {
    await unlockAudio();
    const usedLocal = await tryPlayLocalSoundWithTransliteration(ex.transliteration || ex.word, voiceId, false);
    if (usedLocal) return;
    const localAudio = ex.nepaliAudio;
    if (localAudio) {
      let didFallback = false;
      const fallback = () => {
        if (didFallback) return;
        didFallback = true;
        speakText(ex.word, voiceId);
      };
      const audio = new Audio(localAudio);
      registerHtmlAudio(audio);
      audio.onerror = fallback;
      audio.onended = () => unregisterHtmlAudio(audio);
      audio.play().catch(() => {
        unregisterHtmlAudio(audio);
        fallback();
      });
    } else {
      speakText(ex.word, voiceId);
    }
  };

  const playEnglishWordSound = async (ex: ExampleWord) => {
    await unlockAudio();
    const usedLocal = await tryPlayLocalSoundWithTransliteration(ex.transliteration || ex.word, voiceId, true);
    if (usedLocal) return;
    const localAudio = ex.englishAudio;
    if (localAudio) {
      let didFallback = false;
      const fallback = () => {
        if (didFallback) return;
        didFallback = true;
        speakText(ex.english, voiceId);
      };
      const audio = new Audio(localAudio);
      registerHtmlAudio(audio);
      audio.onerror = fallback;
      audio.onended = () => unregisterHtmlAudio(audio);
      audio.play().catch(() => {
        unregisterHtmlAudio(audio);
        fallback();
      });
    } else {
      speakText(ex.english, voiceId);
    }
  };

  const handleExampleClick = async (ex: ExampleWord) => {
    setSelectedExample(ex);
    setExampleImageSrc(ex.imageUrl || '');
    setActiveAiPanel(null);
    setAiError('');
    triggerHaptic(10);
    sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    ctx.strokeStyle = traceColor;
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
      setTraceEffect('success');
      speakText(isEnglishMode ? "Amazing! You did it!" : "वाह! तपाईंले गर्नुभयो!", voiceId);
      triggerHaptic([15, 10, 15]);
      addXp(selectedExample ? 20 : 30);
      if (!selectedExample && selectedLetter) {
        markLetterComplete(selectedLetter.char);
      }
    } else {
      setCheckResult('fail');
      setTraceEffect('fail');
      speakText(isEnglishMode ? "Great try! Let's do it again!" : "राम्रो प्रयास! फेरि गरौं!", voiceId);
      triggerHaptic(20);
    }
    setTimeout(() => setTraceEffect(null), 1200);
  };

  if (loading) return <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">{isEnglishMode ? 'Unpacking...' : 'प्याक खोल्दै...'} 📦</div>;

  if (selectedLetter) {
    return (
      <div ref={sectionTopRef} className="max-w-7xl mx-auto animate-fadeIn pb-16 px-2 md:px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
          <button
            onClick={() => {
              stopAllAudio();
              if (selectedExample) {
                setSelectedExample(null);
                setCheckResult(null);
                clearCanvas();
                return;
              }
              setSelectedLetter(null);
            }}
            aria-label={selectedExample ? 'Back to examples' : 'Back to alphabet'}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-indigo-600 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm active:scale-95 transition"
          >
            <span className="text-base md:text-sm">←</span>
            <span className="hidden md:inline">
              {selectedExample
                ? (isEnglishMode ? 'Back to Examples' : 'उदाहरणमा फर्कनुहोस्')
                : (isEnglishMode ? 'Back to Alphabet' : 'वर्णमाला फर्कनुहोस्')}
            </span>
          </button>
          <div className="flex gap-2 md:gap-3">
            {hasPrev && (
              <button onClick={handlePrev} className="bg-gradient-to-br from-indigo-400 to-indigo-600 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center text-xl md:text-2xl font-black text-white active:scale-95 transition">
                {letters[currentIndex - 1].char}
              </button>
            )}
            {hasNext && (
              <button onClick={handleNext} className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center text-xl md:text-2xl font-black text-white active:scale-95 transition">
                {letters[currentIndex + 1].char}
              </button>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className={`grid grid-cols-1 gap-4 md:gap-6 ${selectedExample ? '' : 'md:grid-cols-[180px_1fr] lg:grid-cols-[260px_1fr]'}`}>
          {/* Left: Letter + Examples (merged) */}
          <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-indigo-100">
            {!selectedExample ? (
              <>
                <button
                  onClick={() => playLetterSound(selectedLetter)}
                  disabled={isSoundLoading}
                  className="w-full text-center rounded-2xl active:scale-[0.99] transition"
                >
                  <div className="text-5xl md:text-7xl font-black text-indigo-600 mb-2 md:mb-3 drop-shadow-md">{selectedLetter.char}</div>
                  <p className="text-sm md:text-xl text-indigo-300 font-black uppercase tracking-widest">
                    {selectedLetter.transliteration}
                  </p>
                  <p className="text-[10px] md:text-sm text-indigo-500 mt-2">
                    {isEnglishMode ? 'Tap the letter to hear it' : 'अक्षर थिचेर सुन्नुहोस्'}
                  </p>
                </button>

                <div className="mt-5 md:mt-6">
                  <h3 className="text-sm md:text-lg font-black text-amber-600 mb-3">
                    {isEnglishMode ? 'Example Words' : 'उदाहरण शब्दहरू'}
                  </h3>
                  <div className="space-y-2 max-h-[320px] md:max-h-96 overflow-y-auto pr-1">
                    {selectedLetter.examples.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(ex)}
                        className={`w-full text-left p-3 md:p-4 rounded-2xl transition-all shadow-md ${selectedExample?.word === ex.word ? 'bg-gradient-to-r from-amber-200 to-amber-300 border-amber-400' : 'bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200'}`}
                      >
                        <p className="text-sm md:text-lg font-black text-gray-800">{ex.word}</p>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mt-0.5">{ex.english}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">{isEnglishMode ? 'Selected Word' : 'छानिएको शब्द'}</div>
                <div className="text-4xl md:text-6xl font-black text-indigo-700 mt-2 mb-1">{selectedExample.word}</div>
                <div className="text-xs md:text-sm text-indigo-300 font-black uppercase tracking-widest">{selectedExample.transliteration}</div>
                <div className="inline-flex items-center gap-2 mt-3 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-black">
                  {selectedExample.english}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <button
                    onClick={() => playNepaliWordSound(selectedExample)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs shadow-sm hover:bg-indigo-100 transition"
                  >
                    {isEnglishMode ? 'Nepali' : 'नेपाली'} 🔊
                  </button>
                  <button
                    onClick={() => playEnglishWordSound(selectedExample)}
                    className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-black text-xs shadow-sm hover:bg-pink-100 transition"
                  >
                    {isEnglishMode ? 'English' : 'English'} 🔊
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Tracing + Picture */}
          <div className="space-y-4 md:space-y-6">
            {/* Tracing */}
            <div className="bg-white/90 backdrop-blur-md p-4 md:p-8 rounded-3xl shadow-xl border border-emerald-100 flex flex-col items-center">
              <h3 className="text-lg md:text-2xl font-black text-emerald-600 mb-4 md:mb-6 text-center">
                {selectedExample ? (isEnglishMode ? 'Trace the Word' : 'शब्द लेख्नुहोस्') : (isEnglishMode ? 'Trace the Letter' : 'अक्षर लेख्नुहोस्')}
                <span className="block text-xs md:text-sm text-emerald-400">
                  {selectedExample ? (isEnglishMode ? '(शब्द लेख्नुहोस्)' : '(Trace the Word)') : (isEnglishMode ? '(अक्षर लेख्नुहोस्)' : '(Trace the Letter)')} ✨
                </span>
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <div className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-black shadow-sm">{isEnglishMode ? 'Level' : 'स्तर'} {traceLevel}</div>
                <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black shadow-sm">{isEnglishMode ? 'Letters' : 'अक्षर'} {traceLetterCount}</div>
              </div>
              <div ref={containerRef} className="relative w-full max-w-5xl h-52 md:h-64 bg-gradient-to-b from-emerald-50 to-blue-50 rounded-3xl overflow-hidden border-4 md:border-6 border-emerald-300 shadow-2xl touch-none overscroll-none">
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
                    <div className={`text-9xl ${checkResult === 'success' ? 'animate-bounce' : 'animate-pulse'}`}>{checkResult === 'success' ? '🌟🌟🌟' : '😊'}</div>
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

              {/* Slick Clear & Check buttons */}
              <div className="flex gap-3 md:gap-6 w-full max-w-md mt-6 md:mt-8">
                <button onClick={clearCanvas} className="flex-1 py-3 md:py-4 bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-2xl font-black text-sm md:text-lg shadow-lg active:scale-95 hover:shadow-pink-500/50 transition">
                  {isEnglishMode ? 'Clear' : 'सफा गर्नुहोस्'}
                  <span className="block text-[10px] md:text-xs opacity-90">{isEnglishMode ? '(सफा गर्नुहोस्)' : '(Clear)'}</span>
                </button>
                <button 
                  onClick={checkDrawingLocally} 
                  disabled={isChecking}
                  className={`flex-1 py-3 md:py-4 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl font-black text-sm md:text-lg shadow-lg active:scale-95 hover:shadow-emerald-500/50 transition ${isChecking ? 'opacity-70' : ''}`}
                >
                  {isChecking ? (isEnglishMode ? 'Checking...' : 'जाँच गर्दै...') : (isEnglishMode ? 'Check!' : 'जाँच गर्नुहोस्!')}
                  <span className="block text-[10px] md:text-xs opacity-90">{isChecking ? '' : (isEnglishMode ? '(जाँच गर्नुहोस्!)' : '(Check!)')}</span>
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm md:text-lg font-black text-amber-600">
                  {isEnglishMode ? 'AI Magic' : 'एआई जादू'} ✨
                </h3>
                {isAiLoading && <span className="text-[10px] font-black text-amber-400">{isEnglishMode ? 'Loading...' : 'लोड हुँदै...'}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAiExamples}
                  disabled={isAiLoading}
                  className={`px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isEnglishMode ? 'More Examples' : 'थप उदाहरण'}
                </button>
                <button
                  onClick={handleAiSentences}
                  disabled={isAiLoading}
                  className={`px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isEnglishMode ? 'Simple Sentences' : 'सरल वाक्य'}
                </button>
                <button
                  onClick={handleAiStory}
                  disabled={isAiLoading}
                  className={`px-3 py-2 rounded-xl bg-pink-50 text-pink-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isEnglishMode ? 'Tiny Story' : 'सानो कथा'}
                </button>
                <button
                  onClick={handleAiHint}
                  disabled={isAiLoading}
                  className={`px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isEnglishMode ? 'Pronunciation Hints' : 'उच्चारण टिप्स'}
                </button>
                <button
                  onClick={handleAiSteps}
                  disabled={isAiLoading}
                  className={`px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black shadow-sm ${isAiLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isEnglishMode ? 'Writing Steps' : 'लेखन चरण'}
                </button>
              </div>

              {aiError && activeAiPanel && (
                <div className="mt-3 text-[10px] font-black text-rose-500">{aiError}</div>
              )}

              {activeAiPanel === 'examples' && aiExamples.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-black text-amber-500 uppercase tracking-widest">{isEnglishMode ? 'Examples' : 'उदाहरण'}</div>
                  <div className="mt-2 space-y-2">
                    {aiExamples.map((ex, idx) => (
                      <div key={idx} className="bg-amber-50 rounded-xl px-3 py-2 text-xs font-bold text-amber-900">
                        {ex.native} · {ex.romanized} · {ex.english}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAiPanel === 'sentences' && aiSentences.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-black text-indigo-500 uppercase tracking-widest">{isEnglishMode ? 'Sentences' : 'वाक्य'}</div>
                  <div className="mt-2 space-y-2">
                    {aiSentences.map((item, idx) => (
                      <div key={idx} className="bg-indigo-50 rounded-xl px-3 py-2 text-xs font-bold text-indigo-900">
                        {item.native} · {item.romanized} · {item.english}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAiPanel === 'story' && aiStory && (
                <div className="mt-4">
                  <div className="text-xs font-black text-pink-500 uppercase tracking-widest">{isEnglishMode ? 'Story' : 'कथा'}</div>
                  <p className="mt-2 text-xs font-bold text-pink-900 bg-pink-50 rounded-xl px-3 py-2 leading-relaxed">{aiStory}</p>
                </div>
              )}

              {activeAiPanel === 'hint' && aiHint && (
                <div className="mt-4">
                  <div className="text-xs font-black text-blue-500 uppercase tracking-widest">{isEnglishMode ? 'Pronunciation' : 'उच्चारण'}</div>
                  <div className="mt-2 text-xs font-bold text-blue-900 bg-blue-50 rounded-xl px-3 py-2">
                    <div>{aiHint.romanized}</div>
                    {aiHint.syllables.length > 0 && <div>{aiHint.syllables.join('-')}</div>}
                    <div>{aiHint.hint}</div>
                  </div>
                </div>
              )}

              {activeAiPanel === 'steps' && aiSteps.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-black text-emerald-500 uppercase tracking-widest">{isEnglishMode ? 'Writing Steps' : 'लेखन चरण'}</div>
                  <ol className="mt-2 space-y-2">
                    {aiSteps.map(step => (
                      <li key={step.step} className="text-xs font-bold text-emerald-900 bg-emerald-50 rounded-xl px-3 py-2">{step.step}. {step.instruction}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Picture */}
            {selectedExample && (
              <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-purple-100 flex flex-col items-center">
                <h3 className="text-sm md:text-lg font-black text-purple-600 mb-3 md:mb-4">
                  {isEnglishMode ? 'Picture' : 'चित्र'}
                  <span className="block text-[10px] md:text-xs text-purple-400">
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
                      className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg font-bold text-xs md:text-sm text-blue-600 flex items-center gap-1.5 border-2 border-blue-200 hover:border-blue-400 active:scale-95 transition-all"
                    >
                      {isEnglishMode ? 'English' : 'अंग्रेजी'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sound Mixer - slick buttons */}
        {!selectedExample && selectedLetter.type === 'Consonant' && selectedLetter.combos && (
          <div className="mt-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-pink-100">
            <button
              onClick={() => playComboGroup(selectedLetter.combos)}
              disabled={isComboGroupPlaying}
              className={`w-full text-2xl font-black text-pink-600 mb-6 text-center active:scale-[0.99] transition ${isComboGroupPlaying ? 'opacity-70 cursor-not-allowed' : 'hover:text-pink-700'}`}
            >
              {isComboGroupPlaying
                ? (isEnglishMode ? 'Playing Sound Mixer...' : 'ध्वनि मिक्सर बज्दै...')
                : (isEnglishMode ? 'Sound Mixer' : 'ध्वनि मिक्सर')}
              <span className="block text-sm text-pink-400">{isEnglishMode ? '(ध्वनि मिक्सर) 🧪' : '(Sound Mixer) 🧪'}</span>
            </button>
            <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-11 gap-2 md:gap-4">
              {selectedLetter.combos.map((combo, idx) => (
                <button key={idx} onClick={() => playComboSound(combo.char)} className={`bg-gradient-to-br from-pink-300 to-pink-400 p-1.5 md:p-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center hover:from-pink-400 hover:to-pink-500 transition active:scale-95 shadow-lg ${playingComboChar === combo.char ? 'ring-2 md:ring-4 ring-pink-500 scale-105 shadow-xl' : ''}`}>
                  <span className="text-xl md:text-3xl font-black text-white drop-shadow">{combo.char}</span>
                  <span className="text-[8px] md:text-xs text-white/90 font-black uppercase mt-0.5 md:mt-1 drop-shadow">{combo.sound}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  const activeLetters = letters.filter(l => l.type === activeType);
  const activeColor = activeType === 'Vowel' ? 'pink' : 'indigo';

  return (
    <div className="pb-16 animate-fadeIn px-2">
      <div className="flex flex-col items-center mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2 tracking-tighter">
          {showTranslation ? 'Nepali Letters' : 'नेपाली अक्षर'}
        </h2>
        <div className="bg-white rounded-2xl p-1 flex items-center gap-2 shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveType('Vowel')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition ${activeType === 'Vowel' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
          >
            {showTranslation ? 'Vowels' : 'स्वर'}
          </button>
          <button
            onClick={() => setActiveType('Consonant')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition ${activeType === 'Consonant' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
          >
            {showTranslation ? 'Consonants' : 'व्यञ्जन'}
          </button>
        </div>
        <p className="text-xs text-slate-400 font-bold mt-3">
          {showTranslation ? 'Tap a letter to hear its sound' : 'अक्षर थिचेर आवाज सुन्नुहोस्'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => playLetterGroup(activeType)}
            disabled={isGroupPlaying}
            className={`bg-${activeColor}-500 text-white px-4 py-1.5 rounded-full font-black shadow-md text-xs border-b-4 border-${activeColor}-700 active:scale-95 transition ${isGroupPlaying ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'}`}
          >
            {isGroupPlaying && groupPlayingType === activeType
              ? (isEnglishMode ? `Playing ${activeType}s...` : `${activeType === 'Vowel' ? 'स्वर' : 'व्यञ्जन'} बज्दै...`)
              : (activeType === 'Vowel' ? (showTranslation ? 'Play Vowels' : 'स्वर बजाउनुहोस्') : (showTranslation ? 'Play Consonants' : 'व्यञ्जन बजाउनुहोस्'))}
          </button>
          <div className={`h-1 bg-${activeColor}-100 flex-1 rounded-full`} />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {activeLetters.map((l, i) => (
            <button
              key={i}
              onClick={() => handleSelect(l)}
              className={`bg-white aspect-square rounded-[22px] shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all active:scale-95 relative ${lastClickedChar === l.char ? 'animate-card-pop' : ''} ${playingChar === l.char ? `ring-2 ring-${activeColor}-400` : ''}`}
            >
              {cachedSounds.has(l.char) && <div className="absolute -top-1 -right-1 text-sm">✨</div>}
              <span className="text-2xl md:text-3xl font-black text-slate-800 leading-none">{l.char}</span>
              <span className="text-[8px] text-slate-300 font-black mt-1 uppercase">{l.transliteration}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};