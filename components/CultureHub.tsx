
import React, { useState } from 'react';
import { NepalMap } from './NepalMap';
import { SongSection } from './SongSection';
import { PuzzleSection } from './PuzzleSection';
import { LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
    googleCredential?: string | null;
}

type TabId = 'places' | 'songs' | 'puzzles';

export const CultureHub: React.FC<Props> = ({ language, userProfile, showTranslation, addXp, googleCredential }) => {
    const [activeTab, setActiveTab] = useState<TabId>('places');
    const langConfig = LANGUAGES.find(l => l.code === language)!;

    const tabs: { id: TabId; label: string; icon: string; color: string }[] = [
        { id: 'places', label: 'Places', icon: '🏛️', color: 'orange' },
        { id: 'songs', label: 'Songs', icon: '🎵', color: 'pink' },
        { id: 'puzzles', label: 'Puzzles', icon: '🧩', color: 'purple' }
    ];

    return (
        <div className="flex flex-col animate-fadeIn max-w-7xl mx-auto px-2 sm:px-4">
            <div className="text-center mb-8 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-3 md:mb-4">{langConfig.menu.discovery} 🎭</h2>
                <p className="text-lg md:text-2xl text-gray-400 font-medium italic">Explore the sights, sounds, and games of {langConfig.country}!</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-10 md:mb-16 bg-white p-3 md:p-4 rounded-[25px] md:rounded-[40px] shadow-xl border-2 border-slate-50 self-center w-full max-w-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[100px] px-4 md:px-10 py-3 md:py-5 rounded-[20px] md:rounded-[30px] font-bold text-base md:text-xl flex items-center justify-center gap-2 md:gap-4 transition-all transform active:scale-95
                            ${activeTab === tab.id 
                                ? `bg-${tab.color}-500 text-white shadow-xl scale-105 md:scale-110` 
                                : `bg-slate-50 text-gray-400 hover:bg-slate-100`
                            }
                        `}
                    >
                        <span className="text-xl md:text-2xl">{tab.icon}</span>
                        <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="min-h-[400px] md:min-h-[600px] animate-fadeIn">
                {activeTab === 'places' && (
                    <NepalMap language="np" userProfile={userProfile} showTranslation={showTranslation} addXp={addXp} />
                )}
                {activeTab === 'songs' && (
                    <SongSection language={language} userProfile={userProfile} showTranslation={showTranslation} addXp={addXp} googleCredential={googleCredential} />
                )}
                {activeTab === 'puzzles' && (
                    <PuzzleSection language={language} userProfile={userProfile} showTranslation={showTranslation} addXp={addXp} />
                )}
            </div>
        </div>
    );
};
