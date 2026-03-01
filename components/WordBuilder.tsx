
import React, { useState, useEffect } from 'react';
import { fetchAlphabet, speakText, stopAllAudio, triggerHaptic, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, WordChallenge, UserProfile, LANGUAGES, ExampleWord } from '../types';

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
  const [showNepali, setShowNepali] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
    const [comboStreak, setComboStreak] = useState(0);

  const langConfig = LANGUAGES.find(l => l.code === language)!;

  const isEnglishMode = showTranslation;
    const voiceId = resolveVoiceId();

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadWords = async (forceNew: boolean = false) => {
      if (forceNew) setBatchLoading(true); else setLoading(true);
      try {
          const alphabetData = await fetchAlphabet(language);
          const allExamples: ExampleWord[] = alphabetData.flatMap(letter => letter.examples || []);
          
          // Shuffle all examples
          const shuffledExamples = shuffleArray(allExamples.map(ex => ex.word)).map(word => 
            allExamples.find(ex => ex.word === word)!
          );
          
          // Filter out completed words
          const filteredExamples = shuffledExamples.filter(ex => !userProfile.completedWords.includes(ex.word));
          
          // Take first 10 or all if less
          const batch = filteredExamples.slice(0, 10);
          
          // Create challenges
          const wordChallenges: WordChallenge[] = batch.map(ex => ({
            word: ex.word,
            english: ex.english,
            scrambled: shuffleArray(ex.word.split('')),
            imageUrl: ex.imageUrl
          }));
          
          setChallenges(wordChallenges);
          setCurrentIdx(0);
          
          if (wordChallenges.length === 0 && allExamples.length > 0) {
              // If all completed, reset and load again
              loadWords(true);
          }
      } catch(e) { console.error(e) } 
      finally { setLoading(false); setLoading(false); }
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
    setShowNepali(false);
        setComboStreak(0);
  };

  const checkAnswer = () => {
    const formed = userSelection.join('');
    if (formed === current.word) {
        setIsCorrect(true);
        setComboStreak(prev => prev + 1);
        speakText(isEnglishMode ? `Correct! It's spelled ${current.word}.` : `सही! यो ${current.word} लेखिन्छ।`, voiceId);
        triggerHaptic([10, 5, 10]);
        addXp(10);
        completeWord(current.word);
    } else {
        setIsCorrect(false);
        setComboStreak(0);
        speakText(isEnglishMode ? "That's not quite right. Try again!" : "त्यो ठीक भएन। फेरि प्रयास गर्नुहोस्!", voiceId);
        setTimeout(() => setIsCorrect(null), 1000);
        setUserSelection([]);
        setShowNepali(false);
    }
  };

  const nextWord = () => {
      stopAllAudio();
      setUserSelection([]);
      setIsCorrect(null);
      setShowNepali(false);
      if (currentIdx < challenges.length - 1) {
          setCurrentIdx(prev => prev + 1);
      } else {
          loadWords(true);
      }
  };

  if (loading) return <div className="p-20 text-center font-bold text-emerald-600 animate-pulse text-2xl">{isEnglishMode ? 'Building your word factory...' : 'तपाईको शब्द कारखाना निर्माण गर्दै...'} 🏗️</div>;
  
  if (!current) return (
      <div className="p-20 text-center max-w-xl mx-auto bg-white rounded-[50px] shadow-2xl border-b-[12px] border-emerald-100 flex flex-col items-center">
          <div className="text-[120px] mb-8">🎖️</div>
          <h3 className="text-4xl font-bold mb-4 text-emerald-600">{isEnglishMode ? 'Vocabulary Master!' : 'शब्दकोष गुरु!'}</h3>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed font-medium">{isEnglishMode ? "You've finished all your current word challenges. Great job!" : 'तपाईंले आफ्ना सबै हालका शब्द चुनौतीहरू पूरा गर्नुभयो। राम्रो काम!'}</p>
          <button 
            onClick={() => loadWords(true)} 
            className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
              {isEnglishMode ? 'Download New Word Pack' : 'नयाँ शब्द प्याक डाउनलोड गर्नुहोस्'}
          </button>
      </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fadeIn pb-32 max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2 tracking-tighter">{isEnglishMode ? 'Word Builder' : 'शब्द निर्माता'} 🧱</h2>
            <p className="text-sm md:text-lg text-gray-400 font-medium">{isEnglishMode ? 'Spell the word to earn magic stars!' : 'जादुई तारा कमाउन शब्द हिज्जे गर्नुहोस्!'}</p>
        </div>

        <div className="w-full bg-white/90 backdrop-blur-md rounded-[60px] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col">
            <div className="bg-emerald-50/80 backdrop-blur-sm p-6 flex justify-between items-center px-8 md:px-12">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🧩</span>
                    <span className="font-bold text-emerald-700 tracking-wider">{isEnglishMode ? 'LEVEL' : 'स्तर'} {userProfile.completedWords.length + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-emerald-300 font-bold uppercase tracking-[0.2em] text-xs">
                        {currentIdx + 1} / {challenges.length}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                        {isEnglishMode ? 'Streak' : 'लगातार'} {comboStreak}
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Word Display and Image */}
                <div className="flex flex-col items-center space-y-4">
                    <div 
                        className="relative flex flex-col items-center w-full rounded-[40px] border-4 border-white shadow-inner overflow-hidden min-h-[300px]"
                        style={current.imageUrl ? {
                            backgroundImage: `url(${current.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        } : {
                            background: 'rgba(248, 250, 252, 0.8)',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        {/* Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 rounded-[40px]"></div>
                        
                        {/* Content overlay */}
                        <div className="relative z-10 flex flex-col items-center gap-4 w-full h-full">
                            {/* Positioned text elements */}
                            <div className="absolute top-6 left-6 text-left">
                                <h3 className={`text-4xl md:text-5xl font-black text-white tracking-tighter transition-all drop-shadow-2xl ${showTranslation ? '' : 'blur-2xl opacity-5 select-none'}`}>
                                    {current.english}
                                </h3>
                            </div>
                            
                            <div className="absolute top-6 right-6 text-right">
                                <p className={`text-3xl md:text-4xl font-black text-white tracking-tighter transition-all drop-shadow-xl ${showNepali ? '' : 'blur-2xl opacity-5 select-none'}`}>
                                    {current.word}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Buttons outside the picture */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => speakText(current.word, voiceId)}
                            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-600 px-4 py-2 rounded-xl font-bold shadow-md border-b-2 border-emerald-50 hover:scale-105 transition-all active:translate-y-0.5 text-sm"
                        >
                            🔊 {isEnglishMode ? 'Listen' : 'सुन्नुहोस्'}
                        </button>
                        <button 
                            onClick={() => setShowNepali(!showNepali)}
                            className="flex items-center gap-1.5 bg-indigo-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold shadow-md border-b-2 border-indigo-600 hover:scale-105 transition-all active:translate-y-0.5 text-sm"
                        >
                            👁️ {showNepali ? (isEnglishMode ? 'Hide' : 'लुकाउनु') : (isEnglishMode ? 'Show' : 'देखाउनु')} {isEnglishMode ? 'Nepali' : 'नेपाली'}
                        </button>
                    </div>
                </div>

                {/* Right Side: Word Builder Interface */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="flex flex-wrap justify-center gap-3 min-h-[100px] w-full bg-slate-50/80 backdrop-blur-sm p-6 rounded-[35px] border-4 border-dashed border-slate-100 shadow-inner">
                        {userSelection.length === 0 && (
                            <div className="flex items-center justify-center text-slate-300 font-bold italic opacity-50">{isEnglishMode ? 'Tap a block below to spell it...' : 'यसलाई हिज्जे गर्न तलको ब्लकमा ट्याप गर्नुहोस्...'}</div>
                        )}
                        {userSelection.map((char, i) => (
                            <div key={i} className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-black text-emerald-700 shadow-lg border-2 border-emerald-50 animate-popIn">
                                {char}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                        {current.scrambled.map((char, i) => (
                            <button 
                                key={i}
                                onClick={() => handleLetterClick(char)}
                                disabled={isCorrect === true}
                                className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:from-amber-600 active:to-amber-700 rounded-2xl shadow-xl border-b-4 border-amber-600 text-3xl font-black text-white transition transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:grayscale"
                            >
                                {char}
                            </button>
                        ))}
                    </div>

                    <div className="w-full max-w-md space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleReset} className="py-4 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all text-sm shadow-md active:scale-95">
                                {isEnglishMode ? 'Reset' : 'रिसेट'}
                            </button>
                            <button onClick={handleBackspace} className="py-4 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all text-sm shadow-md active:scale-95">
                                {isEnglishMode ? 'Undo' : 'पूर्ववत'}
                            </button>
                         </div>

                        {isCorrect ? (
                             <button onClick={nextWord} className="w-full py-6 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-[30px] font-black shadow-2xl animate-bounce text-xl transition-all active:translate-y-1">
                                {batchLoading ? 'Connecting...' : (isEnglishMode ? 'Next Word →' : 'अर्को शब्द →')}
                            </button>
                        ) : (
                            <button 
                                onClick={checkAnswer} 
                                disabled={userSelection.length === 0}
                                className="w-full py-6 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-[30px] font-black shadow-2xl text-xl transition-all active:translate-y-1 disabled:opacity-50"
                            >
                                {isEnglishMode ? 'Check Answer! ✨' : 'उत्तर जाँच गर्नुहोस्! ✨'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {isCorrect === false && <p className="text-red-500 font-black mb-8 animate-shake text-center text-lg">{isEnglishMode ? 'Try one more time! 💪' : 'फेरि एक पटक प्रयास गर्नुहोस्! 💪'}</p>}
            {isCorrect === true && <p className="text-emerald-500 font-black mb-8 text-2xl animate-pulse text-center">{isEnglishMode ? 'Correct! 🌟' : 'सही! 🌟'}</p>}
        </div>
        
        <button 
            disabled={true}
            className="mt-12 text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 bg-white/80 backdrop-blur-sm px-8 py-3 rounded-full shadow-sm opacity-50 cursor-not-allowed"
        >
            {isEnglishMode ? '📥 Get More Challenges' : '📥 थप चुनौतीहरू प्राप्त गर्नुहोस्'}
        </button>
    </div>
  );
};
