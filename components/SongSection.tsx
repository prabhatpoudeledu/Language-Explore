import React, { useState, useEffect } from 'react';
import { fetchSongsByCategory, speakText } from '../services/geminiService';
import { LanguageCode, SongData, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
}

const CATEGORIES = [
    { id: 'National', label: 'National Songs', icon: '🏳️', color: 'bg-red-500' },
    { id: 'Cultural', label: 'Cultural Songs', icon: '🎭', color: 'bg-purple-500' },
    { id: 'Religious', label: 'Religious Chants', icon: '🙏', color: 'bg-yellow-500' },
    { id: 'Folk', label: 'Folk Songs', icon: '🪕', color: 'bg-green-500' }
];

export const SongSection: React.FC<Props> = ({ language, userProfile, showTranslation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset if language changes
    setSelectedCategory(null);
    setSongs([]);
  }, [language]);

  const handleCategorySelect = async (catId: string) => {
      setSelectedCategory(catId);
      setLoading(true);
      setSongs([]); 
      try {
          const data = await fetchSongsByCategory(language, catId);
          setSongs(data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
  };

  const handlePlay = (song: SongData) => {
      speakText(`${song.title}. ${song.lyricsOriginal}`, userProfile.voice);
  };

  const goBack = () => {
      setSelectedCategory(null);
      setSongs([]);
  }

  return (
    <div className="p-4 h-full flex flex-col">
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-600">
            Songs & Culture
        </h2>
        
        {!selectedCategory ? (
            // Category Selection View
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-fadeIn">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`${cat.color} hover:brightness-110 text-white p-8 rounded-3xl shadow-lg transform hover:-translate-y-2 transition flex items-center justify-between group`}
                    >
                        <div className="text-left">
                            <h3 className="text-2xl font-bold">{cat.label}</h3>
                            <p className="opacity-80 text-sm mt-2 font-medium group-hover:underline">
                                Tap to listen
                            </p>
                        </div>
                        <span className="text-6xl drop-shadow-md">{cat.icon}</span>
                    </button>
                ))}
            </div>
        ) : (
            // Song List View
            <div className="flex flex-col h-full animate-fadeIn">
                <button 
                    onClick={goBack}
                    className="self-start mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700"
                >
                    ← Back to Categories
                </button>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4 animate-bounce">🥁</div>
                        <p className="font-bold text-pink-500 text-xl">Finding Songs...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full pb-20">
                        {songs.map((song, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border-l-8 border-pink-400 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{song.category}</span>
                                    <button 
                                        onClick={() => handlePlay(song)}
                                        className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-pink-600 shadow-md transition transform hover:scale-110"
                                    >
                                        ▶
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{song.titleNative}</h3>
                                <p className={`text-sm text-pink-500 font-bold mb-2 transition-all ${showTranslation ? '' : 'blur-sm hover:blur-0'}`}>{song.title}</p>
                                
                                <p className={`text-gray-500 text-sm mb-4 transition-all ${showTranslation ? '' : 'blur-sm hover:blur-0'}`}>
                                    {song.descriptionEn}
                                </p>
                                
                                <div className="bg-gray-50 p-4 rounded-xl mt-auto border border-gray-100">
                                    <p className="font-serif text-lg text-gray-800 italic mb-2 leading-relaxed">"{song.lyricsOriginal}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};