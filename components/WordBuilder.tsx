import React, { useState, useEffect } from 'react';
import { fetchWordBatch, speakText } from '../services/geminiService';
import { LanguageCode, WordChallenge, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
}

export const WordBuilder: React.FC<Props> = ({ language, userProfile, showTranslation }) => {
  const [challenges, setChallenges] = useState<WordChallenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchCount, setBatchCount] = useState(0); 
  const [showNextBatchOption, setShowNextBatchOption] = useState(false);

  const loadWords = async (reset: boolean = false) => {
      setLoading(true);
      try {
          const data = await fetchWordBatch(language, 10);
          if (reset) {
              setChallenges(data);
              setCurrentIdx(0);
              setBatchCount(1);
          } else {
              setChallenges(data); 
              setCurrentIdx(0);
              setBatchCount(prev => prev + 1);
          }
          setShowNextBatchOption(false);
      } catch(e) { console.error(e) } 
      finally { setLoading(false); }
  };

  useEffect(() => {
    // Reset game when language changes
    setChallenges([]);
    setCurrentIdx(0);
    setBatchCount(0);
    loadWords(true);
  }, [language]);

  const current = challenges[currentIdx];

  const handleLetterClick = (letter: string) => {
    if(isCorrect) return;
    setUserSelection([...userSelection, letter]);
    speakText(letter, userProfile.voice);
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
        speakText(`Correct! ${current.word}.`, userProfile.voice);
    } else {
        setIsCorrect(false);
        speakText("Try again!", userProfile.voice);
        setTimeout(() => setIsCorrect(null), 1000);
        setUserSelection([]);
    }
  };

  const nextWord = () => {
      setUserSelection([]);
      setIsCorrect(null);

      if (currentIdx < challenges.length - 1) {
          setCurrentIdx(prev => prev + 1);
      } else {
          setShowNextBatchOption(true);
      }
  };

  if (loading) return <div className="p-10 text-center font-bold text-green-600 animate-pulse">Loading Words...</div>;
  
  if (showNextBatchOption) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-b-8 border-green-300 max-w-md w-full animate-popIn">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Batch Complete!</h2>
                  <p className="text-gray-500 mb-8">You learned 10 new words.</p>
                  
                  <button 
                    onClick={() => loadWords(false)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-105 mb-4"
                  >
                      Load Next 10 Words →
                  </button>
                  <button 
                    onClick={() => {
                        setChallenges([]);
                        loadWords(true);
                    }}
                    className="text-green-600 font-bold hover:underline"
                  >
                      Restart from beginning
                  </button>
              </div>
          </div>
      )
  }

  if (!current) return <div className="p-10 text-center">No words loaded.</div>;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 overflow-y-auto">
        <h2 className="text-3xl font-bold text-green-600 mb-8">Word Builder</h2>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-lg text-center border-b-8 border-green-200">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Level {batchCount}
                    </span>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        {currentIdx + 1} / {challenges.length}
                    </p>
                </div>
                
                <p className={`text-gray-600 font-medium mb-1 transition-opacity ${showTranslation ? 'opacity-100' : 'opacity-0'}`}>Make the word for:</p>
                <h3 
                  className={`text-3xl md:text-4xl font-bold text-indigo-600 transition-all ${showTranslation ? '' : 'blur-md hover:blur-0 cursor-help'}`}
                  title={showTranslation ? undefined : "Tap to reveal"}
                >
                    {current.english}
                </h3>
            </div>
            
            {/* Answer Box */}
            <div className="flex flex-wrap justify-center gap-2 min-h-[70px] mb-8 bg-green-50 p-4 rounded-xl border-inner border-green-100">
                {userSelection.map((char, i) => (
                    <div key={i} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-xl font-bold text-green-700 shadow-sm border border-green-200 animate-popIn">
                        {char}
                    </div>
                ))}
                {userSelection.length === 0 && <span className="text-gray-400 italic self-center text-sm">Tap letters below</span>}
            </div>

            {/* Scrambled Letters Options */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {current.scrambled.map((char, i) => (
                    <button 
                        key={i}
                        onClick={() => handleLetterClick(char)}
                        disabled={isCorrect === true}
                        className="w-14 h-14 bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 rounded-full shadow-md border-b-4 border-yellow-500 text-2xl font-bold text-yellow-900 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {char}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                 <div className="flex justify-center gap-4">
                    <button onClick={handleReset} disabled={userSelection.length === 0} className="px-5 py-2 bg-gray-200 rounded-full font-bold text-gray-600 hover:bg-gray-300 disabled:opacity-50">
                        Clear
                    </button>
                    <button onClick={handleBackspace} disabled={userSelection.length === 0} className="px-5 py-2 bg-gray-200 rounded-full font-bold text-gray-600 hover:bg-gray-300 disabled:opacity-50">
                        ⌫
                    </button>
                 </div>

                {isCorrect ? (
                     <button onClick={nextWord} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg animate-bounce text-lg">
                        Next Word →
                    </button>
                ) : (
                    <button onClick={checkAnswer} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg text-lg">
                        Check Answer
                    </button>
                )}
            </div>
            
            {isCorrect === false && <p className="text-red-500 font-bold mt-4 animate-shake">Oops! Try again.</p>}
            {isCorrect === true && <p className="text-green-500 font-bold mt-4 text-xl animate-pulse">Great Job!</p>}
        </div>
    </div>
  );
};