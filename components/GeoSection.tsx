
import React, { useState, useEffect } from 'react';
import { speakText, stopAllAudio, generateTravelImage, triggerHaptic } from '../services/geminiService';
import { TravelDiscovery, LanguageCode, UserProfile, LANGUAGES } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

export const GeoSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [discoveries, setDiscoveries] = useState<(TravelDiscovery & { imageBase64?: string })[]>([]);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});

  const langConfig = LANGUAGES.find(l => l.code === language)!;

  useEffect(() => {
    // Check local storage for pre-cached images from initialize phase
    const loadCached = async () => {
        const enriched = await Promise.all(langConfig.travelDiscoveries.map(async item => {
            const cacheKey = `explorer_v2_img_${item.titleEn}_${langConfig.country}`;
            const stored = localStorage.getItem(cacheKey);
            return { 
                ...item, 
                imageBase64: stored ? JSON.parse(stored) : undefined 
            };
        }));
        setDiscoveries(enriched);
    };
    loadCached();
    return () => stopAllAudio();
  }, [langConfig]);

  const handleRead = (item: TravelDiscovery) => {
      stopAllAudio();
      const text = `${item.titleNative}. ${showTranslation ? item.descriptionEn : item.descriptionNative}`;
      speakText(text, userProfile.voice);
      addXp(2);
  };

  const handleGenerateImage = async (item: TravelDiscovery) => {
      triggerHaptic(5);
      setGeneratingImages(prev => ({ ...prev, [item.id]: true }));
      const img = await generateTravelImage(item.titleEn, langConfig.country);
      if (img) {
          setDiscoveries(prev => prev.map(i => i.id === item.id ? { ...i, imageBase64: img } : i));
          addXp(15);
      }
      setGeneratingImages(prev => ({ ...prev, [item.id]: false }));
  };

  return (
      <div className="pb-32 animate-fadeIn">
          <div className="text-center mb-16">
              {/* Fix: Property 'travel' does not exist on type 'MenuTranslations'. Hardcoded to 'Places' as it is a sub-section of Discovery. */}
              <h2 className="text-5xl font-bold text-gray-800 mb-3">Places 🗺️</h2>
              <p className="text-xl text-gray-400 font-medium">Your interactive passport to {langConfig.country}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {discoveries.map((item) => (
                  <div key={item.id} className="bg-white rounded-[60px] shadow-2xl overflow-hidden border-b-[15px] border-orange-50 flex flex-col group hover:-translate-y-3 transition-all duration-500">
                      <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                          {item.imageBase64 ? (
                              <img src={item.imageBase64} alt={item.titleEn} className="w-full h-full object-cover animate-fadeIn" />
                          ) : (
                              <div className="text-center p-12 flex flex-col items-center">
                                  <span className="text-[130px] mb-8 drop-shadow-2xl animate-float">{item.icon}</span>
                                  <button 
                                    onClick={() => handleGenerateImage(item)}
                                    disabled={generatingImages[item.id]}
                                    className="bg-orange-500 text-white px-10 py-4 rounded-full font-bold text-sm shadow-xl hover:bg-orange-600 disabled:opacity-50 transition active:scale-95"
                                  >
                                      {generatingImages[item.id] ? 'Drawing...' : 'AI Snapshot ✨'}
                                  </button>
                              </div>
                          )}
                          <div className="absolute top-6 right-6">
                                <button onClick={() => handleRead(item)} className="w-14 h-14 bg-white/95 backdrop-blur text-orange-500 rounded-[22px] flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition border-2 border-orange-50">🔊</button>
                          </div>
                      </div>
                      <div className="p-12 flex-1 flex flex-col">
                          <h3 className="text-4xl font-bold text-gray-800 mb-1">{item.titleNative}</h3>
                          <p className="text-orange-500 font-bold mb-6 uppercase tracking-[0.2em] text-xs">{item.titleEn}</p>
                          <div className="flex-1 italic">
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    "{item.descriptionNative}"
                                </p>
                                {showTranslation && (
                                    <p className="text-gray-400 text-sm leading-relaxed border-t pt-4 border-orange-50">
                                        {item.descriptionEn}
                                    </p>
                                )}
                          </div>
                          <button onClick={() => handleRead(item)} className="mt-8 w-full bg-orange-50 text-orange-600 py-5 rounded-[30px] font-bold text-sm hover:bg-orange-100 transition shadow-sm">
                              Learn More About {item.titleEn}
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};
