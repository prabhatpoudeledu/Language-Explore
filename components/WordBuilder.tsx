
import React, { useState, useEffect } from 'react';
import { fetchWordBatch, speakText, stopAllAudio, triggerHaptic } from '../services/geminiService';
import { LanguageCode, WordChallenge, UserProfile, LANGUAGES } from '../types';

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

  const langConfig = LANGUAGES.find(l => l.code === language)!;

  const loadWords = async (forceNew: boolean = false) => {
      if (forceNew) setBatchLoading(true); else setLoading(true);
      try {
          const data = await fetchWordBatch(language, forceNew);
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
        <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2 tracking-tighter">Word Builder 🧱</h2>
            <p className="text-sm md:text-lg text-gray-400 font-medium">Spell the word to earn magic stars!</p>
        </div>

        <div className="w-full bg-white rounded-[60px] shadow-2xl overflow-hidden border-b-[20px] border-emerald-50 flex flex-col">
            <div className="bg-emerald-50 p-6 flex justify-between items-center px-8 md:px-12">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🧩</span>
                    <span className="font-bold text-emerald-700 tracking-wider">LEVEL {userProfile.completedWords.length + 1}</span>
                </div>
                <div className="text-emerald-300 font-bold uppercase tracking-[0.2em] text-xs">
                    {currentIdx + 1} / {challenges.length}
                </div>
            </div>

            <div className="p-8 md:p-12 text-center flex-1 flex flex-col items-center">
                <div className="flex flex-col items-center gap-4 mb-10 w-full bg-slate-50 py-10 rounded-[40px] border-4 border-white shadow-inner">
                    <p className={`text-gray-300 font-bold uppercase tracking-widest text-[10px] ${showTranslation ? 'visible' : 'invisible'}`}>HOW DO WE SAY...</p>
                    <h3 className={`text-6xl md:text-7xl font-black text-indigo-600 tracking-tighter transition-all ${showTranslation ? '' : 'blur-2xl opacity-5 select-none'}`}>
                        {current.english}
                    </h3>
                    <button 
                        onClick={() => speakText(current.word, userProfile.voice)}
                        className="mt-4 flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black shadow-md border-b-4 border-emerald-50 hover:scale-105 transition-all active:translate-y-1"
                    >
                        🔊 Listen to Word
                    </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 min-h-[100px] w-full bg-slate-50 p-6 rounded-[35px] border-4 border-dashed border-slate-100 shadow-inner mb-10">
                    {userSelection.length === 0 && (
                        <div className="flex items-center justify-center text-slate-300 font-bold italic opacity-50">Tap a block below to spell it...</div>
                    )}
                    {userSelection.map((char, i) => (
                        <div key={i} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-emerald-700 shadow-lg border-2 border-emerald-50 animate-popIn">
                            {char}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-10 max-w-2xl">
                    {current.scrambled.map((char, i) => (
                        <button 
                            key={i}
                            onClick={() => handleLetterClick(char)}
                            disabled={isCorrect === true}
                            className="w-16 h-16 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 rounded-2xl shadow-xl border-b-4 border-amber-600 text-3xl font-black text-white transition transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:grayscale"
                        >
                            {char}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-md space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleReset} className="py-4 bg-slate-50 rounded-2xl font-black text-gray-400 hover:bg-slate-100 transition-all text-sm">
                            Reset
                        </button>
                        <button onClick={handleBackspace} className="py-4 bg-slate-50 rounded-2xl font-black text-gray-400 hover:bg-slate-100 transition-all text-sm">
                            Undo
                        </button>
                     </div>

                    {isCorrect ? (
                         <button onClick={nextWord} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[30px] font-black shadow-2xl animate-bounce text-xl transition-all active:translate-y-1">
                            {batchLoading ? 'Connecting...' : 'Next Word →'}
                        </button>
                    ) : (
                        <button 
                            onClick={checkAnswer} 
                            disabled={userSelection.length === 0}
                            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[30px] font-black shadow-2xl text-xl transition-all active:translate-y-1 disabled:opacity-50"
                        >
                            Check Answer! ✨
                        </button>
                    )}
                </div>
            </div>
            
            {isCorrect === false && <p className="text-red-500 font-black mb-8 animate-shake text-center text-lg">Try one more time! 💪</p>}
            {isCorrect === true && <p className="text-emerald-500 font-black mb-8 text-2xl animate-pulse text-center">Correct! 🌟</p>}
        </div>
        
        <button 
            onClick={() => loadWords(true)} 
            disabled={batchLoading}
            className="mt-12 text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px] hover:text-indigo-600 transition flex items-center gap-3 bg-white px-8 py-3 rounded-full shadow-sm hover:shadow-md"
        >
            {batchLoading ? 'Connecting...' : '📥 Get More Challenges'}
        </button>
    </div>
  );
};
