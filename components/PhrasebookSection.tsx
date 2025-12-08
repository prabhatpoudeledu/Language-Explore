
import React, { useState, useEffect } from 'react';
import { fetchPhrases, speakText, translatePhrase } from '../services/geminiService';
import { LanguageCode, PhraseData, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Greeting': '👋',
    'Food': '🍏',
    'Daily': '🗓️'
};

export const PhrasebookSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
    const [phrases, setPhrases] = useState<PhraseData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Translation Tool State
    const [translateInput, setTranslateInput] = useState('');
    const [translationResult, setTranslationResult] = useState<PhraseData | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Accordion State
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchPhrases(language);
                setPhrases(data);
                // Expand first category by default
                const firstCat = data.length > 0 ? data[0].category : null;
                if(firstCat) setExpandedCategories(new Set([firstCat]));
            } catch (e) { console.error(e) }
            finally { setLoading(false); }
        };
        load();
        setTranslateInput('');
        setTranslationResult(null);
    }, [language]);

    const handlePlay = (text: string) => {
        speakText(text, userProfile.voice);
        addXp(2);
    };

    const handleTranslate = async () => {
        if(!translateInput.trim()) return;
        setIsTranslating(true);
        try {
            const result = await translatePhrase(translateInput, language);
            setTranslationResult(result);
            if(result) handlePlay(result.native);
        } catch(e) { console.error(e) }
        finally { setIsTranslating(false); }
    };

    const toggleCategory = (cat: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(cat)) {
            newSet.delete(cat);
        } else {
            newSet.add(cat);
        }
        setExpandedCategories(newSet);
    };

    if (loading) return <div className="p-10 text-center font-bold text-teal-600 animate-pulse">Loading Phrasebook...</div>;

    const categories = Array.from(new Set(phrases.map(p => p.category))) as string[];

    return (
        <div className="flex flex-col h-full p-4 overflow-y-auto pb-20">
            <h2 className="text-3xl font-bold text-center mb-6 text-teal-600">
                Common Phrases
            </h2>
            
            <div className="max-w-4xl mx-auto w-full space-y-8">
                
                {/* TRANSLATOR TOOL */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl p-6 shadow-xl text-white">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <span>💬</span> Instant Translator
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input 
                            type="text" 
                            value={translateInput}
                            onChange={(e) => setTranslateInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                            placeholder="Type a sentence in English..."
                            className="flex-1 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-teal-300 font-medium shadow-inner"
                        />
                        <button 
                            onClick={handleTranslate}
                            disabled={isTranslating || !translateInput}
                            className="bg-yellow-400 hover:bg-yellow-300 text-teal-900 font-bold px-6 py-3 rounded-xl shadow-md disabled:opacity-50 transition"
                        >
                            {isTranslating ? '...' : 'Translate'}
                        </button>
                    </div>
                    
                    {translationResult && (
                         <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-popIn flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-bold">{translationResult.native}</p>
                                <p className="text-sm opacity-90 italic">{translationResult.transliteration}</p>
                            </div>
                             <button 
                                onClick={() => handlePlay(translationResult.native)}
                                className="bg-white text-teal-600 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
                             >
                                🔊
                             </button>
                         </div>
                    )}
                </div>

                {/* CATEGORIES */}
                {categories.map(cat => (
                    <div key={cat} className="bg-white rounded-3xl shadow-lg border border-teal-100 overflow-hidden">
                        <button 
                            onClick={() => toggleCategory(cat)}
                            className="w-full bg-teal-50 p-4 border-b border-teal-100 flex items-center justify-between hover:bg-teal-100 transition"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{CATEGORY_ICONS[cat] || '💬'}</span>
                                <h3 className="text-xl font-bold text-teal-800">{cat}</h3>
                            </div>
                            <span className={`text-teal-400 text-xl transform transition-transform duration-300 ${expandedCategories.has(cat) ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        
                        {/* Collapsible Content */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategories.has(cat) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="divide-y divide-gray-100">
                                {phrases.filter(p => p.category === cat).map((phrase, idx) => (
                                    <div key={idx} className="p-4 hover:bg-teal-50/30 transition flex items-center justify-between group">
                                        <div className="flex-1">
                                            <p className="text-xl font-bold text-gray-800 mb-1">{phrase.native}</p>
                                            <p className="text-sm text-gray-500 italic mb-1">{phrase.transliteration}</p>
                                            <p className={`text-sm font-bold text-teal-600 transition-opacity ${showTranslation ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                                {phrase.english}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handlePlay(phrase.native)}
                                            className="bg-teal-100 text-teal-600 w-12 h-12 rounded-full flex items-center justify-center shadow-sm hover:bg-teal-200 hover:scale-105 transition active:scale-95"
                                            title="Speak"
                                        >
                                            🔊
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
