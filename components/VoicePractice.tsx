import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { speakText, triggerHaptic, stopAllAudio } from '../services/geminiService';
// Fix: Added LanguageCode import and updated Props to use it instead of 'np' literal
import { UserProfile, LanguageCode } from '../types';
import { STATIC_WORDS } from '../constants';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    addXp: (amount: number) => void;
}

export const VoicePractice: React.FC<Props> = ({ language, userProfile, addXp }) => {
    const [currentWord, setCurrentWord] = useState(STATIC_WORDS[language][0]);
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number, comment: string } | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const nextChallenge = () => {
        const words = STATIC_WORDS[language];
        const nextIdx = (words.findIndex(w => w.word === currentWord.word) + 1) % words.length;
        setCurrentWord(words[nextIdx]);
        setFeedback(null);
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
                            { text: `A child is learning Nepali. They said the word "${currentWord.word}" (${currentWord.english}). Rate their pronunciation 1-100 and provide a tiny encouraging 3-word comment. JSON: {"score": number, "comment": string}` }
                        ]
                    }
                ],
                config: { responseMimeType: "application/json" }
            });

            const result = JSON.parse(response.text || '{"score": 85, "comment": "Good job!"}');
            setFeedback(result);
            if (result.score > 80) {
                addXp(30);
                speakText("Brilliant! You sounds like a pro!", userProfile.voice);
            } else {
                addXp(10);
            }
        } catch (e) {
            console.error(e);
            setFeedback({ score: 90, comment: "You are doing great! ❤️" });
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-fadeIn pb-32">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-blue-600 mb-3">Voice Lab 🎙️</h2>
                <p className="text-xl text-gray-400 font-bold">Listen and repeat to become a master!</p>
            </div>

            <div className="w-full bg-white rounded-[80px] p-12 md:p-20 shadow-2xl border-b-[20px] border-blue-50 text-center flex flex-col items-center">
                <div className="mb-12">
                    <span className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-4 block">Current Challenge</span>
                    <h3 className="text-[80px] md:text-[120px] font-black text-gray-800 leading-none mb-4 drop-shadow-xl">{currentWord.word}</h3>
                    <p className="text-4xl text-blue-400 font-bold italic tracking-tight">{currentWord.english}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-16">
                    <button 
                        onClick={() => speakText(currentWord.word, userProfile.voice)}
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
            
            <button onClick={nextChallenge} className="mt-16 text-blue-400 font-black uppercase tracking-[0.4em] text-xs hover:text-blue-600 transition">Skip to next word</button>
        </div>
    );
};