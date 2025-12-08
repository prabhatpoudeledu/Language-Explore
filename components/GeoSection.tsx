
import React, { useState, useEffect } from 'react';
import { fetchGeographyItems, speakText } from '../services/geminiService';
import { GeoItem, LanguageCode, LANGUAGES, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

const CATEGORIES = [
    { id: 'Symbols', label: 'National Symbols', icon: '🇳🇵', color: 'bg-indigo-500' },
    { id: 'Nature', label: 'Nature & Landscape', icon: '🏔️', color: 'bg-green-500' },
    { id: 'Religion', label: 'Religion & Temples', icon: '🛕', color: 'bg-yellow-500' },
    { id: 'Culture', label: 'Culture & Festivals', icon: '🎉', color: 'bg-red-500' },
    { id: 'Regions', label: 'Cities & Regions', icon: '🏙️', color: 'bg-blue-500' }
];

export const GeoSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<GeoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const country = LANGUAGES.find(l => l.code === language)?.country || 'Nepal';

  // Update Symbols Icon based on language
  const currentFlag = LANGUAGES.find(l => l.code === language)?.flag || '🏳️';
  CATEGORIES[0].icon = currentFlag;

  // Reset if language changes while viewing
  useEffect(() => {
    setSelectedCategory(null);
    setItems([]);
  }, [language]);

  const handleCategorySelect = async (catId: string) => {
      setSelectedCategory(catId);
      setLoading(true);
      setItems([]);
      try {
          const newItems = await fetchGeographyItems(language, catId, 0);
          setItems(newItems);
      } catch(e) { console.error(e) }
      finally { setLoading(false); }
  };

  const loadMore = async () => {
      if(!selectedCategory) return;
      setLoadingMore(true);
      try {
          const newItems = await fetchGeographyItems(language, selectedCategory, items.length);
          setItems(prev => [...prev, ...newItems]);
      } catch(e) { console.error(e) }
      finally { setLoadingMore(false); }
  }

  const handleRead = (item: GeoItem) => {
      // If Translation is ON, read English. If OFF (Immersion), read Native.
      const textToRead = showTranslation ? item.descriptionEn : item.descriptionNative;
      speakText(textToRead, userProfile.voice);
      addXp(2);
  };

  const goBack = () => {
      setSelectedCategory(null);
      setItems([]);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">
            Explore {country}
        </h2>
        
        {!selectedCategory ? (
            // Category Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-fadeIn pb-20">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`${cat.color} hover:brightness-110 text-white p-8 rounded-3xl shadow-lg transform hover:-translate-y-2 transition flex items-center justify-between group`}
                    >
                         <div className="text-left">
                            <h3 className="text-2xl font-bold">{cat.label}</h3>
                            <p className="opacity-80 text-sm mt-2 font-medium group-hover:underline">
                                Tap to explore
                            </p>
                        </div>
                        <span className="text-6xl drop-shadow-md">{cat.icon}</span>
                    </button>
                ))}
            </div>
        ) : (
            // Detail List View
            <div className="w-full max-w-5xl mx-auto animate-fadeIn pb-20">
                <div className="flex justify-between items-center mb-4">
                     <button 
                        onClick={goBack}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700"
                    >
                        ← Back
                    </button>
                    <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold">
                        {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                         <div className="text-6xl animate-bounce mb-4">📸</div>
                         <p className="font-bold text-orange-500 text-xl">
                            Developing photos...
                         </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition flex flex-col">
                                    <div className="aspect-[4/3] bg-gray-100 relative group">
                                        {item.imageBase64 ? (
                                            <img 
                                                src={`data:image/png;base64,${item.imageBase64}`} 
                                                alt={item.titleEn} 
                                                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌍</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleRead(item); }}
                                            className="absolute bottom-3 right-3 bg-white/95 text-orange-600 p-3 rounded-full shadow-md hover:scale-110 transition z-10 flex items-center gap-2 border border-orange-100"
                                        >
                                            <span>📢</span>
                                            <span className="text-xs font-bold uppercase hidden md:inline">Read</span>
                                        </button>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Dynamic Title Display based on Translation Mode */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {item.titleNative}
                                        </h3>
                                        <h4 className={`text-sm font-bold text-orange-500 mb-3 transition-all ${showTranslation ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                            {item.titleEn}
                                        </h4>
                                        
                                        <div className="prose prose-sm text-gray-600 mb-4 flex-1">
                                            <p className={`transition-all ${showTranslation ? '' : 'blur-[3px] hover:blur-0 cursor-help'}`}>
                                                {showTranslation ? item.descriptionEn : item.descriptionNative}
                                            </p>
                                        </div>
                                        
                                        {item.mapLink && (
                                            <a 
                                                href={item.mapLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-auto block text-center bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition border border-blue-100"
                                            >
                                                View on Map 🗺️
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hide See More for Symbols since it's a fixed set */}
                        {selectedCategory !== 'Symbols' && (
                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <span>➕</span> See More
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}
    </div>
  );
};
