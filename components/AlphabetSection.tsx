import React, { useState, useEffect, useRef } from 'react';
import { fetchAlphabet, speakText } from '../services/geminiService';
import { LetterData, LanguageCode, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
}

export const AlphabetSection: React.FC<Props> = ({ language, userProfile, showTranslation }) => {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<LetterData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLetters([]); // Clear old letters immediately to avoid showing wrong language
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.lineWidth = 12; // Thicker for kids
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
    }
  };

  const handleSelect = (l: LetterData) => {
    setSelectedLetter(l);
    setTimeout(clearCanvas, 50);
    speakText(l.char, userProfile.voice);
  };

  if (loading) return <div className="p-10 text-center text-2xl font-bold text-sky-600 animate-pulse">Loading Alphabet...</div>;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          Alphabet
      </h2>
      
      {!selectedLetter ? (
        <div className="flex-1 overflow-y-auto">
             {/* Dynamic categorization based on available data types */}
             {letters.some(l => l.type === 'Vowel') && (
                 <>
                    <h3 className="text-xl font-bold ml-4 mb-2 text-indigo-400">Vowels</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4">
                        {letters.filter(l => l.type === 'Vowel').map((l, idx) => (
                            <LetterCard key={idx} letter={l} onClick={handleSelect} />
                        ))}
                    </div>
                 </>
             )}

             {letters.some(l => l.type === 'Consonant') && (
                 <>
                    <h3 className="text-xl font-bold ml-4 mt-4 mb-2 text-indigo-400">Consonants</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 pb-20">
                        {letters.filter(l => l.type === 'Consonant').map((l, idx) => (
                            <LetterCard key={idx} letter={l} onClick={handleSelect} />
                        ))}
                    </div>
                 </>
             )}

             {letters.some(l => l.type === 'Character') && (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 pb-20">
                    {letters.map((l, idx) => (
                        <LetterCard key={idx} letter={l} onClick={handleSelect} />
                    ))}
                 </div>
             )}
        </div>
      ) : (
        <div className="flex flex-col items-center p-2 animate-fadeIn pb-20">
            <button 
                onClick={() => setSelectedLetter(null)}
                className="self-start mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700"
            >
                ← Back
            </button>

            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center w-full max-w-5xl">
                {/* Info Card */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-300 w-full lg:w-1/2 text-center">
                    <div className="flex justify-center items-baseline gap-4">
                        <div className="text-9xl font-bold text-indigo-600 mb-4">{selectedLetter.char}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-700 mb-2">{selectedLetter.transliteration}</div>
                    
                    <button 
                        onClick={() => speakText(selectedLetter.char, userProfile.voice)}
                        className="mb-6 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold hover:bg-indigo-200"
                    >
                        🔊 Listen
                    </button>

                    <div className="mt-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
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
                            className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full shadow-md transition"
                        >
                            🔊 Listen to Word
                        </button>
                    </div>
                </div>

                {/* Writing Canvas */}
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
                        onClick={clearCanvas}
                        className="mt-4 px-6 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition"
                    >
                        Clear Canvas
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

interface LetterCardProps {
    letter: LetterData;
    onClick: (l: LetterData) => void;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, onClick }) => (
    <button
        onClick={() => onClick(letter)}
        className="bg-white aspect-square p-2 rounded-2xl shadow-md border-b-4 border-indigo-100 hover:border-indigo-400 transform hover:-translate-y-1 transition flex flex-col items-center justify-center"
    >
        <span className="text-3xl md:text-4xl font-bold text-gray-800">{letter.char}</span>
        <span className="text-xs text-gray-400 mt-1">{letter.transliteration}</span>
    </button>
);