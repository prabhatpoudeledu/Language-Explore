
import React, { useState } from 'react';
import { LanguageCode, LANGUAGES, TravelDiscovery } from '../types';
import { speakText, triggerHaptic, generateTravelImage } from '../services/geminiService';

interface Props {
    language: LanguageCode;
    userProfile: { voice: string };
    addXp: (amount: number) => void;
    showTranslation: boolean;
}

export const NepalMap: React.FC<Props> = ({ language, userProfile, addXp, showTranslation }) => {
    const [selectedPlace, setSelectedPlace] = useState<TravelDiscovery | null>(null);
    const [placeImage, setPlaceImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const langConfig = LANGUAGES.find(l => l.code === language)!;

    const handlePlaceClick = async (place: TravelDiscovery) => {
        triggerHaptic(5);
        setSelectedPlace(place);
        setPlaceImage(null);
        setIsGenerating(true);
        
        speakText(place.titleNative, userProfile.voice);
        
        const img = await generateTravelImage(place.titleEn, 'Nepal');
        setPlaceImage(img);
        setIsGenerating(false);
        addXp(10);
    };

    return (
        <div className="w-full flex flex-col items-center animate-fadeIn pb-10">
            <div className="relative w-full max-w-4xl aspect-[2/1] bg-blue-50/20 rounded-[40px] border-4 border-white shadow-inner overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <svg viewBox="0 0 1000 500" className="w-full h-full text-indigo-100 fill-current">
                        <path d="M50,150 L200,100 L400,120 L600,150 L850,200 L950,350 L800,450 L600,400 L400,380 L150,420 L50,350 Z" />
                    </svg>
                </div>

                {langConfig.travelDiscoveries.map(place => (
                    <button
                        key={place.id}
                        onClick={() => handlePlaceClick(place)}
                        style={{ left: `${place.coords.x}%`, top: `${place.coords.y}%` }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex flex-col items-center gap-1 group/pin z-10`}
                    >
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-lg flex items-center justify-center text-xl md:text-2xl transition-transform active:scale-90 group-hover/pin:scale-110 border-2 border-white ${selectedPlace?.id === place.id ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}>
                            {place.icon}
                        </div>
                        <span className={`px-3 py-1 rounded-full bg-white/90 backdrop-blur shadow text-[8px] md:text-[10px] font-black tracking-tight transition-opacity ${selectedPlace?.id === place.id ? 'opacity-100 text-red-600' : 'opacity-0 group-hover/pin:opacity-100'}`}>
                            {showTranslation ? place.titleEn : place.titleNative}
                        </span>
                    </button>
                ))}

                {selectedPlace && (
                    <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:right-4 md:bottom-4 md:w-[320px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-popIn z-30">
                        <button onClick={() => setSelectedPlace(null)} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition text-xl">✕</button>
                        
                        <div className="flex gap-4 items-start mb-4">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0">{selectedPlace.icon}</div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800 leading-none">{showTranslation ? selectedPlace.titleEn : selectedPlace.titleNative}</h3>
                                <p className="text-red-500 font-bold uppercase tracking-widest text-[8px] mt-1">{showTranslation ? selectedPlace.titleNative : selectedPlace.titleEn}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden aspect-video bg-slate-50 mb-4 border border-slate-100 shadow-sm relative">
                            {placeImage ? (
                                <img src={placeImage} alt={selectedPlace.titleEn} className="w-full h-full object-cover animate-fadeIn" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 animate-pulse">
                                    <span className="text-3xl">📷</span>
                                    <p className="text-[8px] font-black uppercase mt-1">Focusing...</p>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-700 font-bold leading-snug mb-3 text-sm italic">"{showTranslation ? selectedPlace.descriptionEn : selectedPlace.descriptionNative}"</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed border-t pt-3 border-gray-50">
                            {showTranslation ? selectedPlace.detailsEn : selectedPlace.detailsNative}
                        </p>
                        
                        <button onClick={() => speakText(showTranslation ? selectedPlace.detailsEn : selectedPlace.detailsNative, userProfile.voice)} className="mt-5 w-full bg-red-600 text-white py-3 rounded-xl font-black shadow-md hover:scale-105 active:translate-y-1 transition text-xs">🔊 Hear Description</button>
                    </div>
                )}
                
                {!selectedPlace && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-30">
                        <p className="text-lg font-black text-indigo-400 uppercase tracking-[0.4em]">Tap to Explore</p>
                    </div>
                )}
            </div>
        </div>
    );
};
