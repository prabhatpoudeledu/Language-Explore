import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { speakText, triggerHaptic, stopAllAudio, resolveVoiceId } from '../services/geminiService';
// Fix: Added LanguageCode import and updated Props to use it instead of 'np' literal
import { UserProfile, LanguageCode, WordChallenge, PhraseData } from '../types';
import { STATIC_WORDS, STATIC_PHRASES } from '../constants';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    addXp: (amount: number) => void;
}

interface VoiceChallenge {
    id: string;
    type: 'word' | 'phrase';
    text: string;
    english: string;
    category?: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const VoicePractice: React.FC<Props> = ({ language, userProfile, addXp }) => {
    const [currentChallenge, setCurrentChallenge] = useState<VoiceChallenge | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number, comment: string } | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [challengeHistory, setChallengeHistory] = useState<string[]>([]);
    const [streakCount, setStreakCount] = useState(0);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const voiceId = resolveVoiceId(userProfile);

    // Generate random challenge from constants
    const generateRandomChallenge = (): VoiceChallenge => {
        const words = STATIC_WORDS[language] || [];
        const phrases = STATIC_PHRASES[language] || [];

        // Filter out recently used challenges
        const availableWords = words.filter(w => !challengeHistory.includes(`word-${w.word}`));
        const availablePhrases = phrases.filter(p => !challengeHistory.includes(`phrase-${p.native}`));

        // If we've used most challenges, reset history
        if (availableWords.length + availablePhrases.length < 3) {
            setChallengeHistory([]);
        }

        const useWords = availableWords.length > 0 && (availablePhrases.length === 0 || Math.random() > 0.4);
        const sourceArray = useWords ? availableWords : availablePhrases;

        if (sourceArray.length === 0) {
            // Fallback to basic challenges
            return {
                id: 'fallback-hello',
                type: 'phrase',
                text: 'नमस्ते',
                english: 'Hello',
                category: 'Greeting',
                difficulty: 'easy'
            };
        }

        const randomItem = sourceArray[Math.floor(Math.random() * sourceArray.length)];

        if (useWords) {
            const word = randomItem as WordChallenge;
            return {
                id: `word-${word.word}`,
                type: 'word',
                text: word.word,
                english: word.english,
                difficulty: word.word.length > 6 ? 'hard' : word.word.length > 3 ? 'medium' : 'easy'
            };
        } else {
            const phrase = randomItem as PhraseData;
            return {
                id: `phrase-${phrase.native}`,
                type: 'phrase',
                text: phrase.native,
                english: phrase.english,
                category: phrase.category,
                difficulty: phrase.native.length > 15 ? 'hard' : phrase.native.length > 8 ? 'medium' : 'easy'
            };
        }
    };

    // Initialize first challenge
    useEffect(() => {
        const challenge = generateRandomChallenge();
        setCurrentChallenge(challenge);
    }, [language]);

    const nextChallenge = () => {
        if (currentChallenge) {
            setChallengeHistory(prev => [...prev.slice(-9), currentChallenge.id]); // Keep last 10
        }

        const challenge = generateRandomChallenge();
        setCurrentChallenge(challenge);
        setFeedback(null);
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getDifficultyIcon = (diff: string) => {
        switch (diff) {
            case 'easy': return '🌱';
            case 'medium': return '⚡';
            case 'hard': return '🔥';
            default: return '🎯';
        }
    };

    const startRecording = async () => {
        try {
            stopAllAudio();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const base64 = await blobToBase64(blob);
                evaluateSpeech(base64);
            };

            recorder.start();
            setIsRecording(true);
            triggerHaptic(50);
        } catch (e) {
            alert("Microphone access is needed for Voice Lab! 🎙️");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsEvaluating(true);
            triggerHaptic(20);
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
        });
    };

    const evaluateSpeech = async (base64Audio: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        parts: [
                            { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
                            { text: `A child is learning Nepali. They said "${currentChallenge?.text}" (${currentChallenge?.english}). Rate their pronunciation 1-100 and provide a tiny encouraging 3-word comment. JSON: {"score": number, "comment": string}` }
                        ]
                    }
                ],
                config: { responseMimeType: "application/json" }
            });

            const result = JSON.parse(response.text || '{"score": 85, "comment": "Good job!"}');
            setFeedback(result);

            // Update streak and XP based on performance
            if (result.score >= 80) {
                setStreakCount(prev => prev + 1);
                const baseXp = currentChallenge?.difficulty === 'hard' ? 40 : currentChallenge?.difficulty === 'medium' ? 30 : 20;
                const streakBonus = Math.min(streakCount * 5, 25); // Max 25 bonus XP
                addXp(baseXp + streakBonus);
                speakText("Brilliant! You sounds like a pro!", voiceId);
            } else {
                setStreakCount(0);
                addXp(10);
            }
        } catch (e) {
            console.error(e);
            setFeedback({ score: 90, comment: "You are doing great! ❤️" });
            setStreakCount(prev => prev + 1);
            addXp(15);
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-fadeIn pb-32">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-blue-600 mb-3">Voice Lab 🎙️</h2>
                <p className="text-xl text-gray-400 font-bold">Practice speaking Nepali with random challenges!</p>
            </div>

            {/* Difficulty and Streak Display */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-100 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="font-bold text-blue-600">Streak: {streakCount}</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-100 flex items-center gap-2">
                    <span className="text-2xl">{getDifficultyIcon(currentChallenge?.difficulty || 'easy')}</span>
                    <span className={`font-bold capitalize ${getDifficultyColor(currentChallenge?.difficulty || 'easy')}`}>
                        {currentChallenge?.difficulty || 'easy'}
                    </span>
                </div>
            </div>

            {/* Difficulty Selector */}
            <div className="flex gap-3 mb-12">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center gap-2
                            ${difficulty === level
                                ? `bg-${level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red'}-500 text-white shadow-lg scale-105`
                                : `bg-${level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red'}-100 text-${level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red'}-800 hover:bg-${level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red'}-200`
                            }
                        `}
                    >
                        <span>{getDifficultyIcon(level)}</span>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>

            <div className="w-full bg-white rounded-[80px] p-12 md:p-20 shadow-2xl border-b-[20px] border-blue-50 text-center flex flex-col items-center">
                {currentChallenge && (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest
                                    ${currentChallenge.type === 'word' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {currentChallenge.type === 'word' ? '📝 Word' : '💬 Phrase'}
                                </span>
                                {currentChallenge.category && (
                                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-600">
                                        {currentChallenge.category}
                                    </span>
                                )}
                            </div>
                            <span className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-4 block">Current Challenge</span>
                            <h3 className="text-[60px] md:text-[100px] font-black text-gray-800 leading-none mb-4 drop-shadow-xl">{currentChallenge.text}</h3>
                            <p className="text-3xl text-blue-400 font-bold italic tracking-tight">{currentChallenge.english}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-16">
                            <button
                                onClick={() => {
                                    stopAllAudio();
                                    speakText(currentChallenge.text, voiceId);
                                    triggerHaptic(5);
                                    addXp(2);
                                }}
                                className="bg-blue-50 text-blue-600 px-10 py-6 rounded-[35px] font-black text-2xl flex items-center gap-4 hover:bg-blue-100 transition active:scale-95 border-4 border-white shadow-inner"
                            >
                                <span>🔊</span> Hear Master
                            </button>

                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`px-10 py-6 rounded-[35px] font-black text-2xl flex items-center gap-4 transition shadow-2xl active:translate-y-2 border-b-8 ${isRecording ? 'bg-red-500 border-red-800 text-white animate-pulse' : 'bg-blue-600 border-blue-800 text-white'}`}
                            >
                                <span>{isRecording ? '⏹️' : '🎙️'}</span> {isRecording ? 'I am listening...' : 'Hold to Speak'}
                            </button>
                        </div>
                    </>
                )}

                {isEvaluating && (
                    <div className="flex flex-col items-center gap-4 animate-fadeIn">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-500 font-black uppercase tracking-widest text-xs">Asking the Guru...</p>
                    </div>
                )}

                {feedback && !isEvaluating && (
                    <div className="w-full max-w-md bg-slate-50 p-10 rounded-[50px] animate-popIn border-4 border-white shadow-inner flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="60" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                                <circle cx="64" cy="64" r="60" fill="transparent" stroke="#2563EB" strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * feedback.score) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <span className="text-3xl font-black text-blue-600">{feedback.score}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-800 mb-2">{feedback.comment}</p>
                        <div className="flex gap-1 text-2xl mb-8">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={star <= Math.round(feedback.score / 20) ? 'text-yellow-400' : 'text-slate-200'}>⭐</span>
                            ))}
                        </div>
                        <button onClick={nextChallenge} className="bg-indigo-600 text-white px-10 py-4 rounded-full font-black shadow-xl hover:scale-105 transition active:translate-y-1">Next Challenge →</button>
                    </div>
                )}
            </div>

            <div className="flex gap-6 mt-12">
                <button onClick={nextChallenge} className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs hover:text-blue-600 transition">Skip Challenge</button>
                <button
                    onClick={() => {
                        setChallengeHistory([]);
                        setStreakCount(0);
                        nextChallenge();
                    }}
                    className="text-purple-400 font-black uppercase tracking-[0.4em] text-xs hover:text-purple-600 transition"
                >
                    Reset Progress
                </button>
            </div>
        </div>
    );
};