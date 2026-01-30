
import React, { useState, useEffect } from 'react';
import { fetchPhrases, speakText, translatePhrase, stopAllAudio, triggerHaptic, resolveVoiceId } from '../services/geminiService';
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
    const voiceId = resolveVoiceId(userProfile);

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
        const result = await translatePhrase(translateInput, language);
        setIsTranslating(false);
        if(result) {
            handlePlay(result.native);
            setTranslateInput('');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-teal-600 animate-pulse text-lg">Loading phrases... 💬</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-teal-600 mb-1">Common Phrases</h2>
                <p className="text-gray-400 text-sm font-medium">Talk like a native explorer!</p>
            </div>
            
            <div className="bg-teal-600 rounded-[35px] p-6 text-white shadow-xl border-b-8 border-teal-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Instant Translator 💬</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        value={translateInput} 
                        onChange={e => setTranslateInput(e.target.value)} 
                        placeholder="Say something in English..." 
                        className="flex-1 p-4 bg-white border border-teal-400 rounded-2xl text-gray-800 text-base shadow-inner outline-none focus:ring-2 focus:ring-yellow-400 transition" 
                    />
                    <button onClick={handleTranslate} disabled={isTranslating} className="bg-yellow-400 hover:bg-yellow-500 text-teal-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition active:scale-95 disabled:opacity-50">
                        {isTranslating ? '...' : 'Go!'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phrases.map((p, i) => (
                    <div key={i} className="bg-white p-6 rounded-[30px] shadow-sm border-b-4 border-teal-50 flex justify-between items-center group active:translate-y-0.5 transition duration-200">
                        <div className="flex-1">
                            <p className="text-xl font-bold text-gray-800 mb-0.5">{p.native}</p>
                            <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mb-2">{p.transliteration}</p>
                            {showTranslation && (
                                <p className="text-teal-700 font-bold text-[10px] bg-teal-50 px-2 py-0.5 rounded-lg inline-block">{p.english}</p>
                            )}
                        </div>
                        <button onClick={() => handlePlay(p.native)} className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-xl shadow-inner hover:scale-110 active:scale-90 transition">🔊</button>
                    </div>
                ))}
            </div>

            <div className="text-center pt-4">
                <button 
                    onClick={handleLoadMore} 
                    disabled={batchLoading}
                    className="bg-white text-teal-600 px-10 py-3 rounded-2xl font-bold shadow-md border-b-2 border-gray-100 hover:bg-teal-50 transition active:scale-95 disabled:opacity-50 text-base"
                >
                    {batchLoading ? 'Connecting...' : 'Download More'}
                </button>
            </div>
        </div>
    );
};
