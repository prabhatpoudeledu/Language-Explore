
import React, { useState, useEffect } from 'react';
import { triggerHaptic, speakText, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

type PuzzleType = 'memory' | 'word-scramble' | 'quiz' | 'matching';

interface PuzzleItem {
    id: number;
    text: string;
    english: string;
    icon: string;
    matched: boolean;
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
    const [deck, setDeck] = useState<PuzzleItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [solvedCount, setSolvedCount] = useState(0);
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

    const langConfig = LANGUAGES.find(l => l.code === language)!;
    const voiceId = resolveVoiceId(userProfile);

    // Initialize quiz questions
    useEffect(() => {
        const questions: QuizQuestion[] = [
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
        setQuizQuestions(questions);
    }, []);

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

    const generateDeck = () => {
        const items = langConfig.travelDiscoveries.slice(0, 12).map((d, i) => ({
            id: i,
            text: d.titleNative,
            english: d.titleEn,
            icon: d.icon,
            matched: false
        }));
        setDeck(items.sort(() => Math.random() - 0.5));
        setSolvedCount(0);
        setSelectedId(null);
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
        if (deck.find(d => d.id === id)?.matched) return;

        triggerHaptic(5);
        const item = deck.find(d => d.id === id)!;
        speakText(item.text, voiceId);

        if (selectedId === null) {
            setSelectedId(id);
        } else if (selectedId === id) {
            setSelectedId(null);
        } else {
            setDeck(prev => prev.map(p => p.id === id ? { ...p, matched: true } : p));
            setSolvedCount(s => s + 1);
            addXp(10);
            setSelectedId(null);
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
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-purple-600 mb-2">🧠 Memory Discovery</h3>
                            <p className="text-gray-600">Tap tiles to discover Nepal's amazing places!</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {deck.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMemorySelect(item.id)}
                                    className={`aspect-square rounded-3xl shadow-lg border-b-4 transition-all transform active:scale-95 flex flex-col items-center justify-center p-4
                                        ${item.matched ? 'bg-gradient-to-br from-green-400 to-blue-500 border-green-600 text-white' : 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-600 text-white'}
                                    `}
                                >
                                    {item.matched ? (
                                        <>
                                            <span className="text-4xl mb-2">{item.icon}</span>
                                            <p className="text-sm font-bold text-center leading-tight">{item.text}</p>
                                            {showTranslation && (
                                                <p className="text-xs opacity-80 mt-1">{item.english}</p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold">?</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">Discovered: {solvedCount} / {deck.length}</p>
                        </div>
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
