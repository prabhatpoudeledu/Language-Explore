
import React, { useState, useEffect } from 'react';
import { fetchWordBatch, speakText, stopAllAudio, triggerHaptic } from '../services/geminiService';
import { LanguageCode, WordChallenge, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
    completeWord: (word: string) => void;
}

export const WordBuilder: React.FC<Props> = ({ language, userProfile, showTranslation, addXp, completeWord }) => {
  const [challenges, setChallenges] = useState<WordChallenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);

  const loadWords = async (forceNew: boolean = false) => {
      if (forceNew) setBatchLoading(true); else setLoading(true);
      try {
          const data = await fetchWordBatch(language, forceNew);
          // Filter out words mastered by the current user
          const filtered = data.filter(c => !userProfile.completedWords.includes(c.word));
          
          setChallenges(filtered);
          setCurrentIdx(0);
          
          if (filtered.length === 0 && data.length > 0) {
              loadWords(true);
          }
      } catch(e) { console.error(e) } 
      finally { setLoading(false); setBatchLoading(false); }
  };

  useEffect(() => {
    loadWords();
    return () => stopAllAudio();
  }, [language]);

  const current = challenges[currentIdx];

  const handleLetterClick = (letter: string) => {
    if(isCorrect) return;
    setUserSelection([...userSelection, letter]);
    // NO VOICE OVER ON MOVE OVER/CLICK PER REQUEST
    triggerHaptic(5);
  };

  const handleBackspace = () => {
      if (userSelection.length > 0) {
          setUserSelection(userSelection.slice(0, -1));
      }
  }

  const handleReset = () => {
    setUserSelection([]);
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    const formed = userSelection.join('');
    if (formed === current.word) {
        setIsCorrect(true);
        // VOICE OVER ON CHECK MY SPELLING PER REQUEST
        speakText(`Correct! It's spelled ${current.word}.`, userProfile.voice);
        triggerHaptic([10, 5, 10]);
        addXp(10);
        completeWord(current.word);
    } else {
        setIsCorrect(false);
        speakText("That's not quite right. Try again!", userProfile.voice);
        setTimeout(() => setIsCorrect(null), 1000);
        setUserSelection([]);
    }
  };

  const nextWord = () => {
      stopAllAudio();
      setUserSelection([]);
      setIsCorrect(null);
      if (currentIdx < challenges.length - 1) {
          setCurrentIdx(prev => prev + 1);
      } else {
          loadWords(true);
      }
  };

  if (loading) return <div className="p-20 text-center font-bold text-emerald-600 animate-pulse text-2xl">Building your word factory... 🏗️</div>;
  
  if (!current) return (
      <div className="p-20 text-center max-w-xl mx-auto bg-white rounded-[50px] shadow-2xl border-b-[12px] border-emerald-100 flex flex-col items-center">
          <div className="text-[120px] mb-8">🎖️</div>
          <h3 className="text-4xl font-bold mb-4 text-emerald-600">Vocabulary Master!</h3>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed font-medium">You've finished all your current word challenges. Great job!</p>
          <button 
            onClick={() => loadWords(true)} 
            className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
              Download New Word Pack
          </button>
      </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fadeIn pb-32 max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-emerald-600 mb-3">Word Builder 🧱</h2>
            <p className="text-xl text-gray-400 font-medium">Tap the letters in the right order!</p>
        </div>

        <div className="w-full bg-white rounded-[60px] shadow-2xl overflow-hidden border-b-[20px] border-emerald-50 flex flex-col">
            {/* Top Bar Progress */}
            <div className="bg-emerald-50 p-6 flex justify-between items-center px-12">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🧩</span>
                    <span className="font-bold text-emerald-700 tracking-wider">LEVEL {userProfile.completedWords.length + 1}</span>
                </div>
                <div className="text-emerald-300 font-bold uppercase tracking-[0.2em] text-sm">
                    {currentIdx + 1} / {challenges.length}
                </div>
            </div>

            {/* Main Word Area */}
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="mb-10 w-full">
                    <p className={`text-gray-300 font-bold uppercase tracking-widest text-xs mb-3 ${showTranslation ? 'visible' : 'invisible'}`}>THE WORD FOR:</p>
                    <h3 className={`text-7xl font-bold text-indigo-600 transition-all ${showTranslation ? '' : 'blur-2xl opacity-5 select-none'}`}>
                        {current.english}
                    </h3>
                </div>
                
                {/* Result Display Slot */}
                <div className="flex flex-wrap justify-center gap-4 min-h-[120px] w-full bg-slate-50 p-8 rounded-[40px] border-4 border-dashed border-slate-100 shadow-inner mb-12">
                    {userSelection.length === 0 && (
                        <div className="flex items-center justify-center text-slate-300 font-bold italic opacity-50">Start spelling...</div>
                    )}
                    {userSelection.map((char, i) => (
                        <div key={i} className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl font-bold text-emerald-700 shadow-xl border-2 border-emerald-50 animate-popIn">
                            {char}
                        </div>
                    ))}
                </div>

                {/* Scrambled Letters Pool */}
                <div className="flex flex-wrap justify-center gap-5 mb-12 max-w-2xl">
                    {current.scrambled.map((char, i) => (
                        <button 
                            key={i}
                            onClick={() => handleLetterClick(char)}
                            disabled={isCorrect === true}
                            className="w-20 h-20 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 rounded-[30px] shadow-xl border-b-[8px] border-amber-600 text-4xl font-bold text-white transition transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:grayscale"
                        >
                            {char}
                        </button>
                    ))}
                </div>

                {/* Control Panel */}
                <div className="w-full max-w-xl space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleReset} className="py-5 bg-gray-100 rounded-3xl font-bold text-gray-500 hover:bg-gray-200 transition-all active:scale-95">
                            Reset Block
                        </button>
                        <button onClick={handleBackspace} className="py-5 bg-gray-100 rounded-3xl font-bold text-gray-500 hover:bg-gray-200 transition-all active:scale-95">
                            Undo Last
                        </button>
                     </div>

                    {isCorrect ? (
                         <button onClick={nextWord} className="w-full py-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[40px] font-bold shadow-2xl animate-bounce text-3xl transition-all active:scale-95">
                            {batchLoading ? 'Fetching New...' : 'Amazing! Next Word →'}
                        </button>
                    ) : (
                        <button 
                            onClick={checkAnswer} 
                            disabled={userSelection.length === 0}
                            className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[40px] font-bold shadow-2xl text-3xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Check My Spelling 🔊
                        </button>
                    )}
                </div>
            </div>
            
            {isCorrect === false && <p className="text-red-500 font-bold mb-10 animate-shake bg-red-50 p-5 rounded-3xl inline-block mx-auto text-xl border-2 border-red-100">Try one more time!</p>}
            {isCorrect === true && <p className="text-emerald-500 font-bold mb-10 text-3xl animate-pulse">Correct! 🌟</p>}
        </div>
        
        <button 
            onClick={() => loadWords(true)} 
            disabled={batchLoading}
            className="mt-16 text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs hover:text-indigo-600 transition flex items-center gap-3 bg-white px-8 py-3 rounded-full shadow-sm hover:shadow-md"
        >
            {batchLoading ? 'Connecting...' : '📥 GET MORE CHALLENGES'}
        </button>
    </div>
  );
};
