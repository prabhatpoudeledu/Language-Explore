import React, { useState } from 'react';
// Fix: Added LanguageCode import and updated Props to use it
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
        <div className="w-full flex flex-col items-center animate-fadeIn pb-20">
            <div className="relative w-full max-w-5xl aspect-[2/1] bg-blue-50/50 rounded-[60px] border-8 border-white shadow-inner overflow-hidden group">
                {/* Stylized Nepal Map Shape */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <svg viewBox="0 0 1000 500" className="w-full h-full text-indigo-200 fill-current">
                        <path d="M50,150 L200,100 L400,120 L600,150 L850,200 L950,350 L800,450 L600,400 L400,380 L150,420 L50,350 Z" />
                    </svg>
                </div>

                {/* Interactive Pins */}
                {langConfig.travelDiscoveries.map(place => (
                    <button
                        key={place.id}
                        onClick={() => handlePlaceClick(place)}
                        style={{ left: `${place.coords.x}%`, top: `${place.coords.y}%` }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex flex-col items-center gap-2 group/pin z-10`}
                    >
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[22px] shadow-xl flex items-center justify-center text-2xl md:text-3xl transition-transform active:scale-90 group-hover/pin:scale-125 group-hover/pin:z-20 border-4 border-white ${selectedPlace?.id === place.id ? 'bg-red-500 text-white scale-125' : 'bg-white text-gray-800'}`}>
                            {place.icon}
                        </div>
                        <span className={`px-4 py-1.5 rounded-full bg-white/90 backdrop-blur shadow-lg text-[10px] md:text-xs font-black tracking-tight transition-opacity ${selectedPlace?.id === place.id ? 'opacity-100 scale-110 text-red-600' : 'opacity-0 group-hover/pin:opacity-100'}`}>
                            {place.titleNative}
                        </span>
                    </button>
                ))}

                {/* Selected Place Overlay */}
                {selectedPlace && (
                    <div className="absolute bottom-6 right-6 left-6 md:left-auto md:w-[400px] bg-white/95 backdrop-blur rounded-[40px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-white animate-popIn z-30">
                        <button onClick={() => setSelectedPlace(null)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition text-2xl">✕</button>
                        
                        <div className="flex gap-6 items-start mb-6">
                            <div className="w-20 h-20 bg-red-50 rounded-[25px] flex items-center justify-center text-4xl shadow-inner flex-shrink-0">{selectedPlace.icon}</div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 leading-none">{selectedPlace.titleNative}</h3>
                                <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-1">{selectedPlace.titleEn}</p>
                            </div>
                        </div>

                        <div className="rounded-[30px] overflow-hidden aspect-video bg-gray-100 mb-6 border-4 border-white shadow-md relative">
                            {placeImage ? (
                                <img src={placeImage} alt={selectedPlace.titleEn} className="w-full h-full object-cover animate-fadeIn" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 animate-pulse">
                                    <span className="text-4xl">🎨</span>
                                    <p className="text-[10px] font-black uppercase mt-2">Discovering...</p>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-700 font-bold leading-relaxed mb-4 italic text-lg">"{selectedPlace.descriptionNative}"</p>
                        {showTranslation && <p className="text-gray-400 text-sm border-t pt-4 border-gray-50">{selectedPlace.descriptionEn}</p>}
                        
                        <button onClick={() => speakText(selectedPlace.descriptionNative, userProfile.voice)} className="mt-8 w-full bg-red-600 text-white py-4 rounded-[25px] font-black shadow-xl hover:scale-105 active:translate-y-1 transition">🔊 Listen & Learn</button>
                    </div>
                )}
                
                {!selectedPlace && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
                        <span className="text-8xl block mb-4">🗺️</span>
                        <p className="text-2xl font-black text-indigo-400 uppercase tracking-[0.5em]">Tap to Explore Nepal</p>
                    </div>
                )}
            </div>
        </div>
    );
};