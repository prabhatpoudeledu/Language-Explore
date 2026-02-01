
import React, { useState, useEffect } from 'react';
import { fetchPhrases, speakText, translatePhrase, stopAllAudio, triggerHaptic, resolveVoiceId, unlockAudio } from '../services/geminiService';
import { LanguageCode, PhraseData, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

export const PhrasebookSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
    const [phrases, setPhrases] = useState<PhraseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [batchLoading, setBatchLoading] = useState(false);
    const [translateInput, setTranslateInput] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [latestTranslation, setLatestTranslation] = useState<PhraseData | null>(null);
    const voiceId = resolveVoiceId(userProfile);
    const isEnglishMode = showTranslation;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchPhrases(language);
            setPhrases(data);
            setLoading(false);
        };
        load();
        return () => stopAllAudio();
    }, [language]);

    const handlePlay = async (text: string) => {
        console.log('[ChattyClub] Phrase click', JSON.stringify({ text, language, voiceId }));
        stopAllAudio();
        await unlockAudio();
        speakText(text, voiceId);
        triggerHaptic(5);
        addXp(2);
    };

    const handleLoadMore = async () => {
        setBatchLoading(true);
        const data = await fetchPhrases(language, true);
        setPhrases(data);
        setBatchLoading(false);
        addXp(20);
    };

    const handleTranslate = async () => {
        if(!translateInput.trim()) return;
        setIsTranslating(true);
        const result = await translatePhrase(translateInput, language, isEnglishMode ? 'toNative' : 'toEnglish');
        setIsTranslating(false);
        if(result) {
            setLatestTranslation(result);
            handlePlay(isEnglishMode ? result.native : result.english);
            setTranslateInput('');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600 animate-pulse text-lg">Loading phrases... 💬</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
                    {isEnglishMode ? 'Common Phrases' : 'सामान्य वाक्यांशहरू'} 💬
                </h2>
                <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
                    {isEnglishMode ? 'Talk like a native explorer!' : 'देशी वक्ताजस्तो बोल्नुहोस्!'}
                </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600 to-pink-500 rounded-[35px] p-6 text-white shadow-xl border-b-8 border-indigo-800">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">Instant Translator ✨</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        value={translateInput} 
                        onChange={e => setTranslateInput(e.target.value)} 
                        placeholder={isEnglishMode ? "Say something in English..." : "नेपालीमा केही लेख्नुहोस्..."} 
                        className="flex-1 p-4 bg-white border border-indigo-200 rounded-2xl text-gray-800 text-base shadow-inner outline-none focus:ring-2 focus:ring-yellow-300 transition" 
                    />
                    <button onClick={handleTranslate} disabled={isTranslating} className="bg-yellow-300 hover:bg-yellow-400 text-indigo-900 px-8 py-4 rounded-2xl font-black text-lg shadow-lg transition active:scale-95 disabled:opacity-50">
                        {isTranslating ? '...' : 'Go!'}
                    </button>
                </div>
                {latestTranslation && (
                    <div className="mt-4 bg-white/95 text-slate-800 rounded-2xl p-4 shadow-inner border border-white/70">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-lg font-black text-indigo-700">
                                    {isEnglishMode ? latestTranslation.native : latestTranslation.english}
                                </p>
                                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">
                                    {latestTranslation.transliteration}
                                </p>
                                <span className="inline-block mt-2 text-[10px] font-black px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                    {isEnglishMode ? latestTranslation.english : latestTranslation.native}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePlay(latestTranslation.native)}
                                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs shadow-sm hover:bg-indigo-100 transition"
                                >
                                    {isEnglishMode ? 'Native' : 'नेपाली'} 🔊
                                </button>
                                <button
                                    onClick={() => handlePlay(latestTranslation.english)}
                                    className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-black text-xs shadow-sm hover:bg-pink-100 transition"
                                >
                                    {isEnglishMode ? 'English' : 'English'} 🔊
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phrases.map((p, i) => {
                    const primaryText = isEnglishMode ? p.english : p.native;
                    const secondaryText = isEnglishMode ? p.native : p.english;
                    const showTransliteration = !isEnglishMode || secondaryText === p.native;
                    return (
                        <div key={i} className="bg-white p-6 rounded-[30px] shadow-sm border-b-4 border-indigo-50 flex justify-between items-center group active:translate-y-0.5 transition duration-200">
                            <div className="flex-1">
                                <p className="text-xl font-black text-gray-800 mb-0.5">{primaryText}</p>
                                {showTransliteration && (
                                    <p className="text-[8px] text-indigo-200 font-black uppercase tracking-widest mb-2">{p.transliteration}</p>
                                )}
                                <p className="text-indigo-700 font-black text-[10px] bg-indigo-50 px-2 py-0.5 rounded-lg inline-block">{secondaryText}</p>
                            </div>
                            <button onClick={() => handlePlay(p.native)} className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-xl shadow-inner hover:scale-110 active:scale-90 transition">🔊</button>
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-4">
                <button 
                    onClick={handleLoadMore} 
                    disabled={batchLoading}
                    className="bg-white text-indigo-600 px-10 py-3 rounded-2xl font-black shadow-md border-b-2 border-gray-100 hover:bg-indigo-50 transition active:scale-95 disabled:opacity-50 text-base"
                >
                    {batchLoading ? 'Connecting...' : 'Download More'}
                </button>
            </div>
        </div>
    );
};
