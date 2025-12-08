
import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText, validateHandwriting } from '../services/geminiService';
import { LetterData, LanguageCode, UserProfile } from '../types';

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
  
  // Game Mode State
  const [gameMode, setGameMode] = useState(false);
  const [gameTarget, setGameTarget] = useState<LetterData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'correct' | 'incorrect' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Reading Mode State
  const [readingMode, setReadingMode] = useState<'Vowel' | 'Consonant' | null>(null);
  const [highlightedChar, setHighlightedChar] = useState<string | null>(null);
  const stopReadingRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLetters([]); // Clear old letters
      try {
        const data = await fetchAlphabet(language);
        setLetters(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]); 

  // --- Drawing Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4f46e5'; 
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      // Reset game state on clear if needed, usually just keeps same target
    }
  };

  // --- Game Logic ---
  const startGame = () => {
      setGameMode(true);
      pickRandomTarget();
  };

  const pickRandomTarget = () => {
      if(letters.length === 0) return;
      const random = letters[Math.floor(Math.random() * letters.length)];
      setGameTarget(random);
      setCheckResult(null);
      setTimeout(clearCanvas, 100);
      speakText(`Draw the letter ${random.char}`, userProfile.voice);
  };

  const checkDrawing = async () => {
      if(!canvasRef.current || !gameTarget) return;
      
      setIsChecking(true);
      const base64 = canvasRef.current.toDataURL('image/png').split(',')[1]; // Remove prefix
      
      const isMatch = await validateHandwriting(base64, gameTarget.char, language);
      
      setIsChecking(false);
      if (isMatch) {
          setCheckResult('correct');
          speakText("Excellent! That looks correct.", userProfile.voice);
          addXp(20);
      } else {
          setCheckResult('incorrect');
          speakText("Not quite. Try again!", userProfile.voice);
      }
  };

  const exitGame = () => {
      setGameMode(false);
      setGameTarget(null);
      setCheckResult(null);
  };

  // --- Interaction Logic ---
  const handleSelect = (l: LetterData) => {
    if (readingMode) return;
    setSelectedLetter(l);
    setTimeout(clearCanvas, 50);
    speakText(l.char, userProfile.voice);
    addXp(5);
  };

  const handleHover = (l: LetterData) => {
      if (userProfile.autoPlaySound && !readingMode && !selectedLetter && !gameMode) {
          speakText(l.char, userProfile.voice);
      }
  }

  const startReadingSequence = async (type: 'Vowel' | 'Consonant') => {
      if (readingMode) return;
      setReadingMode(type);
      stopReadingRef.current = false;
      
      const targets = letters.filter(l => l.type === type);
      
      for (const l of targets) {
          if (stopReadingRef.current) break;
          
          setHighlightedChar(l.char);
          // Wait for audio to finish before moving to next
          await speakText(l.char, userProfile.voice);
          // Small pause between letters
          await new Promise(r => setTimeout(r, 300));
      }
      
      setReadingMode(null);
      setHighlightedChar(null);
  };

  const stopReading = () => {
      stopReadingRef.current = true;
      setReadingMode(null);
      setHighlightedChar(null);
  }

  if (loading) return <div className="p-10 text-center text-2xl font-bold text-sky-600 animate-pulse">Loading Alphabet...</div>;

  // --- GAME VIEW ---
  if (gameMode && gameTarget) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-popIn pb-20">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border-4 border-indigo-200">
                  <div className="flex justify-between items-center mb-6">
                       <button onClick={exitGame} className="px-4 py-2 bg-gray-100 rounded-full font-bold text-gray-500 hover:bg-gray-200">
                           Exit Game
                       </button>
                       <h2 className="text-2xl font-bold text-indigo-600">Drawing Challenge 🎮</h2>
                       <div className="w-20"></div> {/* Spacer */}
                  </div>

                  <div className="text-center mb-6">
                      <p className="text-gray-500 mb-2 font-bold">Draw this letter:</p>
                      <div className="text-8xl font-bold text-indigo-600 mb-2">{gameTarget.char}</div>
                      <p className="text-sm text-gray-400">{gameTarget.transliteration}</p>
                  </div>

                  <div className="relative border-4 border-dashed border-indigo-200 rounded-2xl overflow-hidden bg-indigo-50/50 touch-none mx-auto w-full max-w-[320px] shadow-inner">
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={320}
                            className="cursor-crosshair w-full h-auto"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                       <div className="flex justify-center gap-4">
                           <button onClick={clearCanvas} className="px-6 py-2 bg-gray-200 text-gray-600 font-bold rounded-full hover:bg-gray-300">
                               Clear
                           </button>
                           {checkResult === 'correct' ? (
                               <button onClick={pickRandomTarget} className="px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 animate-bounce">
                                   Next Letter →
                               </button>
                           ) : (
                               <button 
                                onClick={checkDrawing} 
                                disabled={isChecking}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                               >
                                   {isChecking ? 'Checking...' : 'Check My Drawing'}
                               </button>
                           )}
                       </div>
                       
                       {checkResult === 'incorrect' && (
                           <p className="text-center text-red-500 font-bold animate-shake">Not quite right. Try again!</p>
                       )}
                       {checkResult === 'correct' && (
                           <p className="text-center text-green-500 font-bold text-xl animate-popIn">Perfect! +20 XP</p>
                       )}
                  </div>
              </div>
          </div>
      )
  }

  // --- DETAIL VIEW ---
  if (selectedLetter) {
    return (
        <div className="flex flex-col items-center p-2 animate-fadeIn pb-20">
            <button 
                onClick={() => setSelectedLetter(null)}
                className="self-start mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700"
            >
                ← Back
            </button>

            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full max-w-5xl">
                {/* Info Card */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-300 w-full lg:w-1/2 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl select-none">🔤</div>
                    <div className="flex justify-center items-baseline gap-4 relative z-10">
                        <div className="text-9xl font-bold text-indigo-600 mb-4 drop-shadow-sm">{selectedLetter.char}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-700 mb-2">{selectedLetter.transliteration}</div>
                    
                    <button 
                        onClick={() => speakText(selectedLetter.char, userProfile.voice)}
                        className="mb-6 bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full font-bold hover:bg-indigo-200 shadow-sm"
                    >
                        🔊 Listen
                    </button>

                    <div className="mt-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">
                             Example Word
                        </p>
                        <p className="text-4xl font-bold text-gray-800 mb-1">{selectedLetter.exampleWord}</p>
                        <p className="text-lg text-gray-600 italic">
                            {selectedLetter.exampleWordTransliteration} <br/> 
                            <span className={`text-indigo-500 not-italic font-bold transition-opacity duration-300 ${showTranslation ? 'opacity-100' : 'opacity-0 hover:opacity-100 cursor-help'}`}>
                                ({selectedLetter.exampleWordEnglish})
                            </span>
                        </p>
                        <button 
                            onClick={() => speakText(selectedLetter.exampleWord, userProfile.voice)}
                            className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full shadow-md transition text-sm font-bold"
                        >
                            🔊 Listen to Word
                        </button>
                    </div>
                </div>

                {/* Writing Canvas (Practice Mode) */}
                <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-green-300 w-full lg:w-1/2 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-green-600 mb-2">
                        Practice Writing
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">Trace the letter below</p>
                    
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 touch-none">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                            <span className="text-[200px] font-bold text-gray-800 select-none leading-none mt-4">{selectedLetter.char}</span>
                        </div>
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={320}
                            className="cursor-crosshair w-full h-auto max-w-[320px]"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                    <button 
                        onClick={() => { clearCanvas(); addXp(2); }}
                        className="mt-4 px-6 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition"
                    >
                        Clear Canvas
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center mb-6 relative">
          <h2 className="text-3xl font-bold text-center text-indigo-600">
              Alphabet
          </h2>
          <button 
            onClick={startGame}
            className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 animate-bounce"
          >
              <span>🎮</span> Drawing Challenge
          </button>
      </div>

      <p className="text-center text-gray-400 mb-6 text-sm">
          {userProfile.autoPlaySound ? "Hover to listen!" : "Click to explore!"}
      </p>
      
      <div className="flex-1 overflow-y-auto">
             {/* VOWELS */}
             {letters.some(l => l.type === 'Vowel') && (
                 <div className="mb-8">
                    <div className="flex items-center justify-between ml-4 mr-4 mb-3">
                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                            <span>🅰️</span> Vowels
                        </h3>
                        {readingMode === 'Vowel' ? (
                            <button onClick={stopReading} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                ⏹ Stop
                            </button>
                        ) : (
                            <button 
                                onClick={() => startReadingSequence('Vowel')}
                                disabled={!!readingMode}
                                className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-full text-xs font-bold transition disabled:opacity-50"
                            >
                                🔊 Read All
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-indigo-50/50 rounded-3xl mx-2">
                        {letters.filter(l => l.type === 'Vowel').map((l, idx) => (
                            <LetterCard 
                                key={idx} 
                                letter={l} 
                                onClick={handleSelect} 
                                onHover={() => handleHover(l)}
                                isHighlighted={highlightedChar === l.char}
                            />
                        ))}
                    </div>
                 </div>
             )}

             {/* CONSONANTS */}
             {letters.some(l => l.type === 'Consonant') && (
                 <div className="pb-20">
                    <div className="flex items-center justify-between ml-4 mr-4 mb-3 mt-6">
                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                            <span>🅱️</span> Consonants
                        </h3>
                         {readingMode === 'Consonant' ? (
                            <button onClick={stopReading} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                ⏹ Stop
                            </button>
                        ) : (
                            <button 
                                onClick={() => startReadingSequence('Consonant')}
                                disabled={!!readingMode}
                                className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-full text-xs font-bold transition disabled:opacity-50"
                            >
                                🔊 Read All
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-purple-50/50 rounded-3xl mx-2">
                        {letters.filter(l => l.type === 'Consonant').map((l, idx) => (
                            <LetterCard 
                                key={idx} 
                                letter={l} 
                                onClick={handleSelect}
                                onHover={() => handleHover(l)}
                                isHighlighted={highlightedChar === l.char}
                            />
                        ))}
                    </div>
                 </div>
             )}
        </div>
    </div>
  );
};

interface LetterCardProps {
    letter: LetterData;
    onClick: (l: LetterData) => void;
    onHover: () => void;
    isHighlighted: boolean;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onClick, onHover, isHighlighted }) => (
    <button
        onClick={() => onClick(letter)}
        onMouseEnter={onHover}
        className={`bg-white aspect-square p-2 rounded-2xl shadow-md border-b-4 
                   transition flex flex-col items-center justify-center relative overflow-hidden group
                   ${isHighlighted ? 'border-yellow-400 bg-yellow-50 scale-110 z-10 ring-4 ring-yellow-200' : 'border-indigo-100 hover:border-indigo-400 transform hover:-translate-y-1 hover:scale-105'}
                   `}
    >
        {/* Background Decoration */}
        <div className="absolute -right-2 -top-2 text-4xl opacity-5 group-hover:opacity-10 transition">🌟</div>
        
        <span className={`text-3xl md:text-4xl font-bold ${isHighlighted ? 'text-indigo-700' : 'text-gray-800'}`}>{letter.char}</span>
        <span className="text-xs text-gray-400 mt-1 font-semibold">{letter.transliteration}</span>
    </button>
);
