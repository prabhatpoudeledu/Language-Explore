
import React, { useState, useEffect } from 'react';
import { fetchPhrases, speakText, translatePhrase, stopAllAudio, triggerHaptic } from '../services/geminiService';
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

    const handlePlay = (text: string) => {
        stopAllAudio();
        speakText(text, userProfile.voice);
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
        const result = await translatePhrase(translateInput, language);
        setIsTranslating(false);
        if(result) {
            handlePlay(result.native);
            setTranslateInput('');
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-teal-600 animate-pulse text-2xl">Organizing your conversation book... 💬</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-teal-600 mb-2">Common Phrases</h2>
                <p className="text-gray-400 text-lg font-medium">Learn to speak like a native explorer!</p>
            </div>
            
            <div className="bg-teal-600 rounded-[40px] p-10 text-white shadow-2xl border-b-[12px] border-teal-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">Instant Translator 💬 <span className="text-sm font-normal opacity-70">powered by AI</span></h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        value={translateInput} 
                        onChange={e => setTranslateInput(e.target.value)} 
                        placeholder="Type anything in English to translate..." 
                        className="flex-1 p-5 rounded-2xl text-gray-800 text-lg shadow-inner outline-none focus:ring-4 focus:ring-yellow-400 transition" 
                    />
                    <button onClick={handleTranslate} disabled={isTranslating} className="bg-yellow-400 hover:bg-yellow-500 text-teal-900 px-10 py-5 rounded-2xl font-bold text-xl shadow-lg transition active:scale-95 disabled:opacity-50">
                        {isTranslating ? '...' : 'Translate'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {phrases.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-[35px] shadow-xl border-b-8 border-teal-50 flex justify-between items-center group hover:-translate-y-1 transition duration-300">
                        <div>
                            <p className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition">{p.native}</p>
                            <p className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-3">{p.transliteration}</p>
                            {showTranslation && (
                                <div className="bg-teal-50 px-3 py-1 rounded-lg inline-block">
                                    <p className="text-teal-700 font-bold text-sm">{p.english}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => handlePlay(p.native)} className="w-16 h-16 bg-white border-4 border-teal-50 text-teal-500 rounded-full flex items-center justify-center text-2xl shadow-md hover:scale-110 active:scale-90 transition">🔊</button>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8">
                <button 
                    onClick={handleLoadMore} 
                    disabled={batchLoading}
                    className="bg-white text-teal-600 px-12 py-5 rounded-[30px] font-bold shadow-xl border-b-4 border-gray-100 hover:bg-teal-50 transition active:scale-95 disabled:opacity-50 text-lg"
                >
                    {batchLoading ? 'Downloading New Set...' : '📥 Download 10 More Phrases'}
                </button>
            </div>
        </div>
    );
};
