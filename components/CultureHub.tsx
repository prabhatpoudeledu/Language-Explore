
import React, { useState } from 'react';
import { NepalMap } from './NepalMap';
import { SongSection } from './SongSection';
import { PuzzleSection } from './PuzzleSection';
import { generateCultureExplanation } from '../services/geminiService';
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
    const [cultureTopic, setCultureTopic] = useState('Dashain');
    const [cultureText, setCultureText] = useState('');
    const [cultureLoading, setCultureLoading] = useState(false);
    const [cultureError, setCultureError] = useState('');
    const langConfig = LANGUAGES.find(l => l.code === language)!;
    const outputLang = showTranslation ? 'en' : 'np';

    const tabs: { id: TabId; label: string; icon: string; color: string }[] = [
        { id: 'places', label: 'Places', icon: '🏛️', color: 'orange' },
        { id: 'songs', label: 'Songs', icon: '🎵', color: 'pink' },
        { id: 'puzzles', label: 'Puzzles', icon: '🧩', color: 'purple' }
    ];

    const handleCultureGenerate = async () => {
        setCultureLoading(true);
        setCultureError('');
        try {
            const data = await generateCultureExplanation(cultureTopic, language, outputLang);
            setCultureText(data.text || '');
        } catch (e) {
            setCultureError(showTranslation ? 'AI is busy right now. Please wait and try again.' : 'एआई अहिले व्यस्त छ। कृपया केहीबेर पर्खनुहोस्।');
        } finally {
            setCultureLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-fadeIn max-w-7xl mx-auto px-2 sm:px-4">
            <div className="text-center mb-8 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-3 md:mb-4">{langConfig.menu.discovery} 🎭</h2>
                <p className="text-lg md:text-2xl text-gray-400 font-medium italic">Explore the sights, sounds, and games of {langConfig.country}!</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-[28px] shadow-xl border border-amber-100 p-4 md:p-6 mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="text-xs font-black text-amber-500 uppercase tracking-widest">{showTranslation ? 'Culture Spark' : 'संस्कृति झिल्को'}</div>
                        <h3 className="text-xl md:text-2xl font-black text-amber-700 mt-1">{showTranslation ? 'Learn about Nepal' : 'नेपालको बारेमा सिक्नुहोस्'}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={cultureTopic}
                            onChange={e => setCultureTopic(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-amber-100 bg-amber-50 text-amber-800 text-sm font-bold"
                        >
                            {['Dashain', 'Tihar', 'Lumbini', 'Himalayas', 'Kathmandu'].map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCultureGenerate}
                            disabled={cultureLoading}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-black shadow-md disabled:opacity-50"
                        >
                            {cultureLoading ? (showTranslation ? 'Generating...' : 'बन्दैछ...') : (showTranslation ? 'Generate' : 'बनाउनुहोस्')}
                        </button>
                    </div>
                </div>
                {cultureText && (
                    <p className="mt-4 text-sm font-bold text-amber-900 bg-amber-50 rounded-2xl px-4 py-3 leading-relaxed">{cultureText}</p>
                )}
                {cultureError && (
                    <div className="mt-3 text-[10px] font-black text-rose-500">{cultureError}</div>
                )}
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
