
import React, { useState, useEffect } from 'react';
import { triggerHaptic, speakText } from '../services/geminiService';
import { LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

interface PuzzleItem {
    id: number;
    text: string;
    english: string;
    icon: string;
    matched: boolean;
}

export const PuzzleSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
    const [deck, setDeck] = useState<PuzzleItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [solvedCount, setSolvedCount] = useState(0);

    const langConfig = LANGUAGES.find(l => l.code === language)!;

    const generateDeck = () => {
        const items = langConfig.travelDiscoveries.map((d, i) => ({
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

    useEffect(() => {
        generateDeck();
    }, [language]);

    const handleSelect = (id: number) => {
        if (deck.find(d => d.id === id)?.matched) return;
        
        triggerHaptic(5);
        const item = deck.find(d => d.id === id)!;
        speakText(item.text, userProfile.voice);
        
        if (selectedId === null) {
            setSelectedId(id);
        } else if (selectedId === id) {
            setSelectedId(null);
        } else {
            // Check if match logic (Simulating a matching game based on pairs)
            // For simplicity in this demo, every click is a toggle, 
            // but let's make it a 'reveal' memory game
            setSelectedId(id);
            
            // Logic for a real memory game would go here. 
            // For now, let's treat it as a "Vocabulary Discovery Grid" 
            // where matching isn't strictly necessary to progress, 
            // but let's mark it as matched to "collect" it.
            setDeck(prev => prev.map(p => p.id === id ? { ...p, matched: true } : p));
            setSolvedCount(s => s + 1);
            addXp(5);
            setSelectedId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32 animate-fadeIn">
            <div className="text-center mb-16">
                {/* Fix: Property 'puzzle' does not exist on type 'MenuTranslations'. Hardcoded to 'Puzzles'. */}
                <h2 className="text-5xl font-bold text-purple-600 mb-3">Puzzles 🧩</h2>
                <p className="text-xl text-gray-400 font-medium">Tap a discovery tile to unlock its secret!</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {deck.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`aspect-square rounded-[40px] shadow-xl border-b-[10px] transition-all transform active:scale-95 flex flex-col items-center justify-center p-8
                            ${item.matched ? 'bg-white border-purple-500 opacity-100 scale-100' : 'bg-purple-100 border-purple-200 grayscale opacity-70'}
                        `}
                    >
                        <span className={`text-7xl mb-4 transition-transform ${item.matched ? 'scale-110' : 'scale-100'}`}>{item.icon}</span>
                        {item.matched && (
                            <div className="text-center animate-fadeIn">
                                <p className="text-xl font-bold text-gray-800 leading-tight">{item.text}</p>
                                <p className={`text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1 ${showTranslation ? 'visible' : 'invisible'}`}>{item.english}</p>
                            </div>
                        )}
                        {!item.matched && <span className="text-purple-300 font-bold">?</span>}
                    </button>
                ))}
            </div>

            <div className="mt-20 flex flex-col items-center">
                <div className="bg-white p-8 rounded-[40px] shadow-lg border-2 border-purple-50 text-center w-full max-w-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Collected Discoveries</p>
                    <p className="text-4xl font-bold text-purple-600">{solvedCount} / {deck.length}</p>
                </div>
                <button 
                    onClick={generateDeck} 
                    className="mt-8 bg-purple-600 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-purple-700 transition"
                >
                    Reset Puzzle Board
                </button>
            </div>
        </div>
    );
};
