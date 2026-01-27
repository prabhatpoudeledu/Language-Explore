
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

    // Fix for default markers in webpack/vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Custom icon for markers
    const customIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const MapSizer: React.FC = () => {
        const map = useMap();

        useEffect(() => {
            const resize = () => map.invalidateSize();
            const timeout = window.setTimeout(resize, 100);
            window.addEventListener('resize', resize);
            return () => {
                window.clearTimeout(timeout);
                window.removeEventListener('resize', resize);
            };
        }, [map]);

        return null;
    };

    return (
        <div className="w-full flex flex-col items-center animate-fadeIn pb-10">
            <div className="relative w-full max-w-4xl h-[600px] rounded-[40px] border-4 border-white shadow-inner overflow-hidden group">
                <MapContainer 
                    center={[28.3949, 84.1240]} 
                    zoom={7} 
                    style={{ height: '100%', width: '100%', borderRadius: '36px' }}
                >
                    <MapSizer />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {langConfig.travelDiscoveries.map(place => (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => handlePlaceClick(place),
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">{place.icon}</div>
                                    <h3 className="font-bold text-lg">{showTranslation ? place.titleEn : place.titleNative}</h3>
                                    <p className="text-sm text-gray-600">{showTranslation ? place.titleNative : place.titleEn}</p>
                                    <p className="text-sm mt-2">{showTranslation ? place.descriptionEn : place.descriptionNative}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

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
