
import React, { useState, useEffect } from 'react';
import { triggerHaptic, speakText, resolveVoiceId, generateQuizQuestions, generateWordScrambles, fetchQuizContent } from '../services/geminiService';
import { LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

type PuzzleType = 'memory' | 'word-scramble' | 'quiz' | 'matching';

interface MemoryCard {
    id: number;
    pairId: number;
    text: string;
    english: string;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface QuizQuestion {
    id: number;
    question: string;
    questionEn: string;
    options: string[];
    optionsEn: string[];
    correctAnswer: number;
    fact: string;
    factEn: string;
}

interface WordScrambleItem {
    id: number;
    scrambled: string;
    answer: string;
    english: string;
    hint: string;
    hintEn: string;
}

export const PuzzleSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
    const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>('memory');
    const [memoryDeck, setMemoryDeck] = useState<MemoryCard[]>([]);
    const [memorySelected, setMemorySelected] = useState<number[]>([]);
    const [memoryMoves, setMemoryMoves] = useState(0);
    const [memoryMatches, setMemoryMatches] = useState(0);
    const [memoryLocked, setMemoryLocked] = useState(false);
    const [memoryStreak, setMemoryStreak] = useState(0);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [wordScrambles, setWordScrambles] = useState<WordScrambleItem[]>([]);
    const [currentScrambleIndex, setCurrentScrambleIndex] = useState(0);
    const [scrambleInput, setScrambleInput] = useState('');
    const [scrambleSolved, setScrambleSolved] = useState(false);
    const [matchingPairs, setMatchingPairs] = useState<Array<{id: number, text: string, english: string, type: 'nepali' | 'english', matched: boolean}>>([]);
    const [matchingSelected, setMatchingSelected] = useState<number[]>([]);
    const [matchingScore, setMatchingScore] = useState(0);
    const [quizLoading, setQuizLoading] = useState(false);
    const [scrambleLoading, setScrambleLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const isAiBusy = quizLoading || scrambleLoading;

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

    const buildAiKey = (type: string) => `ai_puzzle_${language}_${type}`;

    const langConfig = LANGUAGES.find(l => l.code === language)!;
    const voiceId = resolveVoiceId();

    const defaultQuizQuestions: QuizQuestion[] = [
            {
                id: 1,
                question: 'सगरमाथा कहाँ अवस्थित छ?',
                questionEn: 'Where is Mount Everest located?',
                options: ['नेपालमा', 'भारतमा', 'चीनमा', 'तिब्बतमा'],
                optionsEn: ['In Nepal', 'In India', 'In China', 'In Tibet'],
                correctAnswer: 0,
                fact: 'सगरमाथा नेपाल र चीनको सीमामा अवस्थित विश्वको सर्वोच्च शिखर हो!',
                factEn: 'Mount Everest, located on the border of Nepal and China, is the highest peak in the world!'
            },
            {
                id: 2,
                question: 'नेपालको राजधानी कुन हो?',
                questionEn: 'What is the capital of Nepal?',
                options: ['पोखरा', 'लुम्बिनी', 'काठमाडौं', 'भक्तपुर'],
                optionsEn: ['Pokhara', 'Lumbini', 'Kathmandu', 'Bhaktapur'],
                correctAnswer: 2,
                fact: 'काठमाडौं नेपालको राजधानी हो जहाँ हजारौं मन्दिरहरू छन्!',
                factEn: 'Kathmandu is Nepal\'s capital city with thousands of temples!'
            },
            {
                id: 3,
                question: 'भगवान बुद्धको जन्मस्थल कहाँ हो?',
                questionEn: 'Where was Lord Buddha born?',
                options: ['काठमाडौं', 'पोखरा', 'लुम्बिनी', 'जनकपुर'],
                optionsEn: ['Kathmandu', 'Pokhara', 'Lumbini', 'Janakpur'],
                correctAnswer: 2,
                fact: 'लुम्बिनीमा भगवान बुद्धको जन्म भएको थियो र यो विश्व सम्पदा स्थल हो!',
                factEn: 'Lord Buddha was born in Lumbini, which is a UNESCO World Heritage Site!'
            },
            {
                id: 4,
                question: 'नेपालको सबैभन्दा ठूलो ताल कुन हो?',
                questionEn: 'What is Nepal\'s largest lake?',
                options: ['फेवा ताल', 'रारा ताल', 'बेगनास ताल', 'तिलिचो ताल'],
                optionsEn: ['Phewa Lake', 'Rara Lake', 'Begnas Lake', 'Tilicho Lake'],
                correctAnswer: 1,
                fact: 'रारा ताल नेपालको सबैभन्दा ठूलो ताल हो र यो सुन्दर हिमालयी क्षेत्रमा अवस्थित छ!',
                factEn: 'Rara Lake is Nepal\'s largest lake and is located in a beautiful Himalayan region!'
            },
            {
                id: 5,
                question: 'नेपालको राष्ट्रिय जनावर कुन हो?',
                questionEn: 'What is Nepal\'s national animal?',
                options: ['हात्ती', 'गैंडा', 'गाई', 'बाघ'],
                optionsEn: ['Elephant', 'Rhino', 'Cow', 'Tiger'],
                correctAnswer: 1,
                fact: 'एकसिंगे गैंडा नेपालको राष्ट्रिय जनावर हो र चितवन राष्ट्रिय निकुञ्जमा पाइन्छ!',
                factEn: 'The one-horned rhinoceros is Nepal\'s national animal and can be found in Chitwan National Park!'
            }
        ];

    // Initialize quiz questions
    useEffect(() => {
        const load = async () => {
            const remote = await fetchQuizContent(language);
            if (remote && remote.length > 0) {
                setQuizQuestions(remote.map((q, idx) => ({
                    id: q.id || idx + 1,
                    question: q.question,
                    questionEn: q.questionEn,
                    options: q.options,
                    optionsEn: q.optionsEn,
                    correctAnswer: q.correctAnswer,
                    fact: q.fact,
                    factEn: q.factEn
                })));
                return;
            }
            setQuizQuestions(defaultQuizQuestions);
        };
        load();
    }, [language]);

    // Initialize word scrambles
    useEffect(() => {
        const scrambles: WordScrambleItem[] = [
            {
                id: 1,
                scrambled: 'सगमाथार',
                answer: 'सगरमाथा',
                english: 'Mount Everest',
                hint: 'विश्वको सर्वोच्च शिखर',
                hintEn: 'World\'s highest peak'
            },
            {
                id: 2,
                scrambled: 'काठमाडौं',
                answer: 'काठमाडौं',
                english: 'Kathmandu',
                hint: 'नेपालको राजधानी',
                hintEn: 'Capital of Nepal'
            },
            {
                id: 3,
                scrambled: 'पोखरा',
                answer: 'पोखरा',
                english: 'Pokhara',
                hint: 'तालहरूको शहर',
                hintEn: 'City of lakes'
            },
            {
                id: 4,
                scrambled: 'लुम्बिनी',
                answer: 'लुम्बिनी',
                english: 'Lumbini',
                hint: 'बुद्धको जन्मस्थल',
                hintEn: 'Birthplace of Buddha'
            },
            {
                id: 5,
                scrambled: 'चितवन',
                answer: 'चितवन',
                english: 'Chitwan',
                hint: 'जंगल र गैंडाहरू',
                hintEn: 'Jungle and rhinos'
            }
        ];
        setWordScrambles(scrambles);
    }, []);

    const refreshQuiz = async () => {
        setQuizLoading(true);
        setAiError('');
        try {
            const cacheKey = buildAiKey('quiz');
            const cached = readAiCache<QuizQuestion[]>(cacheKey);
            if (cached && cached.length > 0) {
                setQuizQuestions(cached);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                return;
            }
            const generated = await generateQuizQuestions(language, 5);
            if (generated.length > 0) {
                const mapped: QuizQuestion[] = generated.map((q, idx) => ({
                    id: idx + 1,
                    question: q.questionNative,
                    questionEn: q.questionEn,
                    options: q.optionsNative,
                    optionsEn: q.optionsEn,
                    correctAnswer: q.correctIndex,
                    fact: q.factNative,
                    factEn: q.factEn
                }));
                setQuizQuestions(mapped);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                writeAiCache(cacheKey, mapped);
            }
        } catch (e) {
            setAiError('AI is busy right now. Please wait and try again.');
        } finally {
            setQuizLoading(false);
        }
    };

    const refreshScrambles = async () => {
        setScrambleLoading(true);
        setAiError('');
        try {
            const cacheKey = buildAiKey('scramble');
            const cached = readAiCache<WordScrambleItem[]>(cacheKey);
            if (cached && cached.length > 0) {
                setWordScrambles(cached);
                setCurrentScrambleIndex(0);
                setScrambleInput('');
                setScrambleSolved(false);
                return;
            }
            const generated = await generateWordScrambles(language, 5);
            if (generated.length > 0) {
                const mapped: WordScrambleItem[] = generated.map((item, idx) => ({
                    id: idx + 1,
                    scrambled: item.scrambled,
                    answer: item.answer,
                    english: item.english,
                    hint: item.hint,
                    hintEn: item.hintEn
                }));
                setWordScrambles(mapped);
                setCurrentScrambleIndex(0);
                setScrambleInput('');
                setScrambleSolved(false);
                writeAiCache(cacheKey, mapped);
            }
        } catch (e) {
            setAiError('AI is busy right now. Please wait and try again.');
        } finally {
            setScrambleLoading(false);
        }
    };

    const generateDeck = () => {
        const pairs = langConfig.travelDiscoveries.slice(0, 6).map((d, i) => ({
            pairId: i,
            text: d.titleNative,
            english: d.titleEn,
            icon: d.icon
        }));
        const cards: MemoryCard[] = pairs.flatMap(item => ([
            {
                id: item.pairId * 2,
                pairId: item.pairId,
                text: item.text,
                english: item.english,
                icon: item.icon,
                isFlipped: false,
                isMatched: false
            },
            {
                id: item.pairId * 2 + 1,
                pairId: item.pairId,
                text: item.text,
                english: item.english,
                icon: item.icon,
                isFlipped: false,
                isMatched: false
            }
        ]));
        setMemoryDeck(cards.sort(() => Math.random() - 0.5));
        setMemorySelected([]);
        setMemoryMoves(0);
        setMemoryMatches(0);
        setMemoryLocked(false);
        setMemoryStreak(0);
    };

    const generateMatchingPairs = () => {
        const pairs = langConfig.travelDiscoveries.slice(0, 6).flatMap((d, i) => [
            { id: i * 2, text: d.titleNative, english: d.titleEn, type: 'nepali' as const, matched: false },
            { id: i * 2 + 1, text: d.titleEn, english: d.titleNative, type: 'english' as const, matched: false }
        ]);
        setMatchingPairs(pairs.sort(() => Math.random() - 0.5));
        setMatchingSelected([]);
        setMatchingScore(0);
    };

    useEffect(() => {
        generateDeck();
        generateMatchingPairs();
    }, [language]);

    const handleMemorySelect = (id: number) => {
        if (memoryLocked) return;
        if (memorySelected.length >= 2) return;
        const card = memoryDeck.find(c => c.id === id);
        if (!card || card.isMatched || card.isFlipped) return;

        triggerHaptic(5);
        speakText(card.text, voiceId);

        setMemoryDeck(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

        if (memorySelected.length === 0) {
            setMemorySelected([id]);
            return;
        }

        if (memorySelected.length === 1) {
            const firstId = memorySelected[0];
            const firstCard = memoryDeck.find(c => c.id === firstId);
            setMemorySelected([firstId, id]);
            setMemoryMoves(prev => prev + 1);
            setMemoryLocked(true);

            if (firstCard && firstCard.pairId === card.pairId) {
                setMemoryDeck(prev => prev.map(c =>
                    c.id === firstId || c.id === id ? { ...c, isMatched: true } : c
                ));
                setMemoryMatches(prev => prev + 1);
                setMemoryStreak(prev => prev + 1);
                addXp(15);
                triggerHaptic(10);
                setMemorySelected([]);
                setMemoryLocked(false);
            } else {
                setMemoryStreak(0);
                setTimeout(() => {
                    setMemoryDeck(prev => prev.map(c =>
                        c.id === firstId || c.id === id ? { ...c, isFlipped: false } : c
                    ));
                    setMemorySelected([]);
                    setMemoryLocked(false);
                }, 800);
            }
        }
    };

    const handleQuizAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        const currentQuestion = quizQuestions[currentQuizIndex];

        if (answerIndex === currentQuestion.correctAnswer) {
            setQuizScore(prev => prev + 1);
            addXp(15);
            triggerHaptic(10);
        }

        setShowQuizResult(true);

        setTimeout(() => {
            setShowQuizResult(false);
            setSelectedAnswer(null);
            if (currentQuizIndex < quizQuestions.length - 1) {
                setCurrentQuizIndex(prev => prev + 1);
            } else {
                // Quiz completed
                setCurrentQuizIndex(0);
                setQuizScore(0);
            }
        }, 2000);
    };

    const handleScrambleSubmit = () => {
        const currentScramble = wordScrambles[currentScrambleIndex];
        if (scrambleInput.toLowerCase().trim() === currentScramble.answer.toLowerCase()) {
            setScrambleSolved(true);
            addXp(20);
            triggerHaptic(10);

            setTimeout(() => {
                setScrambleSolved(false);
                setScrambleInput('');
                if (currentScrambleIndex < wordScrambles.length - 1) {
                    setCurrentScrambleIndex(prev => prev + 1);
                } else {
                    setCurrentScrambleIndex(0);
                }
            }, 2000);
        }
    };

    const handleMatchingSelect = (id: number) => {
        if (matchingPairs.find(p => p.id === id)?.matched) return;

        const newSelected = [...matchingSelected, id];
        setMatchingSelected(newSelected);

        if (newSelected.length === 2) {
            const [firstId, secondId] = newSelected;
            const firstItem = matchingPairs.find(p => p.id === firstId)!;
            const secondItem = matchingPairs.find(p => p.id === secondId)!;

            // Check if they form a matching pair
            const isMatch = (
                (firstItem.type === 'nepali' && secondItem.type === 'english' && firstItem.english === secondItem.text) ||
                (firstItem.type === 'english' && secondItem.type === 'nepali' && firstItem.english === secondItem.text)
            );

            if (isMatch) {
                setMatchingPairs(prev => prev.map(p =>
                    p.id === firstId || p.id === secondId ? { ...p, matched: true } : p
                ));
                setMatchingScore(prev => prev + 1);
                addXp(12);
                triggerHaptic(10);
            }

            setTimeout(() => {
                setMatchingSelected([]);
            }, 1000);
        }
    };

    const renderPuzzleContent = () => {
        switch (currentPuzzle) {
            case 'memory':
                const totalPairs = Math.max(1, Math.floor(memoryDeck.length / 2));
                const progress = Math.min(100, Math.round((memoryMatches / totalPairs) * 100));
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-3xl font-black text-purple-600 mb-2">🧠 Memory Expedition</h3>
                            <p className="text-gray-600 font-medium">Flip two cards. Match the same place to win treasures!</p>
                        </div>

                        <div className="bg-white/90 border border-purple-100 rounded-3xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">🏔️</div>
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-purple-400 font-black">Progress</div>
                                    <div className="text-lg font-black text-purple-700">{memoryMatches} / {totalPairs} pairs</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-black">
                                <div className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600">Moves: {memoryMoves}</div>
                                <div className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600">Streak: {memoryStreak}</div>
                            </div>
                            <div className="w-full md:w-64 h-3 bg-purple-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
                            {memoryDeck.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMemorySelect(item.id)}
                                    className={`aspect-square rounded-3xl shadow-lg border-b-4 transition-all transform active:scale-95 flex flex-col items-center justify-center p-3 md:p-4
                                        ${item.isMatched ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-600 text-white' : item.isFlipped ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-600 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-100 border-slate-300 text-slate-400'}
                                    `}
                                >
                                    {item.isFlipped || item.isMatched ? (
                                        <>
                                            <span className="text-4xl mb-2">{item.icon}</span>
                                            <p className="text-sm font-bold text-center leading-tight">{item.text}</p>
                                            {showTranslation && (
                                                <p className="text-xs opacity-80 mt-1">{item.english}</p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-3xl font-black">✦</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {memoryMatches === totalPairs && (
                            <div className="text-center bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-lg">
                                <div className="text-3xl font-black text-emerald-600">🎉 Explorer Master!</div>
                                <p className="text-sm text-emerald-700 mt-2 font-semibold">You found every pair. Tap reset to play a new round.</p>
                            </div>
                        )}
                    </div>
                );

            case 'quiz':
                const currentQuestion = quizQuestions[currentQuizIndex];
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-blue-600 mb-2">🧠 Nepal Quiz</h3>
                            <p className="text-gray-600">Test your knowledge about Nepal!</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={refreshQuiz}
                                disabled={quizLoading}
                                className="px-6 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold shadow-sm hover:bg-blue-100 disabled:opacity-50"
                            >
                                {quizLoading ? 'Generating...' : '✨ Generate New Quiz'}
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-blue-100">
                            <div className="text-center mb-6">
                                <p className="text-xl font-bold text-gray-800 mb-2">
                                    {showTranslation ? currentQuestion.questionEn : currentQuestion.question}
                                </p>
                                <p className="text-sm text-gray-500">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-6">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuizAnswer(index)}
                                        disabled={showQuizResult}
                                        className={`p-4 rounded-2xl font-bold text-left transition-all transform active:scale-95
                                            ${showQuizResult
                                                ? index === currentQuestion.correctAnswer
                                                    ? 'bg-green-500 text-white'
                                                    : selectedAnswer === index
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-gray-200 text-gray-500'
                                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                            }
                                        `}
                                    >
                                        {showTranslation ? currentQuestion.optionsEn[index] : option}
                                    </button>
                                ))}
                            </div>

                            {showQuizResult && (
                                <div className="text-center animate-fadeIn">
                                    <p className="text-lg font-bold text-green-600 mb-2">
                                        {selectedAnswer === currentQuestion.correctAnswer ? '🎉 Correct!' : '❌ Try again next time!'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {showTranslation ? currentQuestion.factEn : currentQuestion.fact}
                                    </p>
                                </div>
                            )}

                            <div className="text-center mt-6">
                                <p className="text-lg font-bold text-blue-600">Score: {quizScore} / {quizQuestions.length}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'word-scramble':
                const currentScramble = wordScrambles[currentScrambleIndex];
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-green-600 mb-2">🔤 Word Scramble</h3>
                            <p className="text-gray-600">Unscramble the Nepali words!</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={refreshScrambles}
                                disabled={scrambleLoading}
                                className="px-6 py-3 rounded-2xl bg-green-50 text-green-700 font-bold shadow-sm hover:bg-green-100 disabled:opacity-50"
                            >
                                {scrambleLoading ? 'Generating...' : '✨ Generate New Scrambles'}
                            </button>
                        </div>
                        {aiError && (
                            <div className="text-center text-[10px] font-black text-rose-500">{aiError}</div>
                        )}

                        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-green-100">
                            <div className="text-center mb-6">
                                <p className="text-4xl font-bold text-green-600 mb-4">{currentScramble.scrambled}</p>
                                <p className="text-sm text-gray-500 mb-2">
                                    {showTranslation ? currentScramble.hintEn : currentScramble.hint}
                                </p>
                                {showTranslation && (
                                    <p className="text-sm text-blue-600">({currentScramble.english})</p>
                                )}
                            </div>

                            <div className="flex gap-4 mb-6">
                                <input
                                    type="text"
                                    value={scrambleInput}
                                    onChange={(e) => setScrambleInput(e.target.value)}
                                    placeholder="Type the unscrambled word..."
                                    className="flex-1 p-4 rounded-2xl border-2 border-gray-300 focus:border-green-500 focus:outline-none text-lg font-bold"
                                    disabled={scrambleSolved}
                                />
                                <button
                                    onClick={handleScrambleSubmit}
                                    disabled={!scrambleInput.trim() || scrambleSolved}
                                    className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition disabled:opacity-50"
                                >
                                    Check
                                </button>
                            </div>

                            {scrambleSolved && (
                                <div className="text-center animate-fadeIn">
                                    <p className="text-2xl font-bold text-green-600 mb-2">🎉 Excellent! You got it!</p>
                                    <p className="text-lg text-gray-600">
                                        {currentScramble.answer} = {currentScramble.english}
                                    </p>
                                </div>
                            )}

                            <div className="text-center mt-6">
                                <p className="text-lg font-bold text-green-600">Word {currentScrambleIndex + 1} of {wordScrambles.length}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'matching':
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-orange-600 mb-2">🔗 Match the Words</h3>
                            <p className="text-gray-600">Match Nepali words with their English translations!</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {matchingPairs.map((pair) => (
                                <button
                                    key={pair.id}
                                    onClick={() => handleMatchingSelect(pair.id)}
                                    disabled={pair.matched}
                                    className={`p-4 rounded-2xl font-bold transition-all transform active:scale-95
                                        ${pair.matched
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : matchingSelected.includes(pair.id)
                                                ? 'bg-yellow-400 text-black shadow-lg scale-105'
                                                : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
                                        }
                                    `}
                                >
                                    {pair.text}
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-bold text-orange-600">Matches Found: {matchingScore} / {matchingPairs.length / 2}</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32 animate-fadeIn">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-purple-600 mb-3">🧩 Nepal Puzzles</h2>
                <p className="text-xl text-gray-400 font-medium">Choose a fun game to learn about Nepal!</p>
            </div>

            {/* Puzzle Type Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {[
                    { type: 'memory' as PuzzleType, name: 'Memory Game', icon: '🧠', color: 'purple' },
                    { type: 'quiz' as PuzzleType, name: 'Quiz Time', icon: '❓', color: 'blue' },
                    { type: 'word-scramble' as PuzzleType, name: 'Word Scramble', icon: '🔤', color: 'green' },
                    { type: 'matching' as PuzzleType, name: 'Word Match', icon: '🔗', color: 'orange' }
                ].map(({ type, name, icon, color }) => (
                    <button
                        key={type}
                        onClick={() => setCurrentPuzzle(type)}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center gap-2
                            ${currentPuzzle === type
                                ? `bg-${color}-500 text-white shadow-lg scale-105`
                                : `bg-${color}-100 text-${color}-800 hover:bg-${color}-200`
                            }
                        `}
                    >
                        <span className="text-xl">{icon}</span>
                        {name}
                    </button>
                ))}
            </div>

            {/* Puzzle Content */}
            {renderPuzzleContent()}

            {/* Reset Button */}
            <div className="mt-12 text-center">
                <button
                    onClick={() => {
                        generateDeck();
                        generateMatchingPairs();
                        setCurrentQuizIndex(0);
                        setQuizScore(0);
                        setCurrentScrambleIndex(0);
                        setScrambleInput('');
                        setScrambleSolved(false);
                        setMatchingSelected([]);
                        setMatchingScore(0);
                    }}
                    className="bg-purple-600 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-purple-700 transition"
                >
                    🔄 Reset All Games
                </button>
            </div>
        </div>
    );
};
