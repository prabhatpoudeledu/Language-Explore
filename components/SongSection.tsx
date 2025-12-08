
import React, { useState, useEffect } from 'react';
import { fetchSongsByCategory, speakText } from '../services/geminiService';
import { LanguageCode, SongData, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
}

const CATEGORIES = [
    { id: 'National', label: 'National Songs', icon: '🏳️', color: 'bg-red-500' },
    { id: 'Cultural', label: 'Cultural Songs', icon: '🎭', color: 'bg-purple-500' },
    { id: 'Religious', label: 'Religious Chants', icon: '🙏', color: 'bg-yellow-500' },
    { id: 'Folk', label: 'Folk Songs', icon: '🪕', color: 'bg-green-500' }
];

export const SongSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
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
      addXp(5);
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
                            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-100 flex flex-col">
                                {/* YouTube Player or Placeholder */}
                                <div className="aspect-video bg-black relative group">
                                    {song.youtubeId && song.youtubeId !== 'SEARCH_ONLY' ? (
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={`https://www.youtube.com/embed/${song.youtubeId}`} 
                                            title={song.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white flex-col bg-gray-900">
                                            <span className="text-4xl mb-2">🎵</span>
                                            <span className="text-sm opacity-70">Video Preview Unavailable</span>
                                        </div>
                                    )}
                                    
                                    {/* Fallback Link Overlay (Always available in case Embed is blocked) */}
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none group-hover:pointer-events-auto">
                                        <a 
                                            href={song.youtubeId && song.youtubeId !== 'SEARCH_ONLY' ? `https://www.youtube.com/watch?v=${song.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.titleNative + " song")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition flex items-center gap-2"
                                        >
                                            <span>▶️</span> Watch on YouTube
                                        </a>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{song.category}</span>
                                        <button 
                                            onClick={() => handlePlay(song)}
                                            className="bg-pink-100 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-200 transition"
                                            title="Read description & lyrics"
                                        >
                                            🗣️
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{song.titleNative}</h3>
                                    <p className={`text-sm text-pink-500 font-bold mb-4 transition-all ${showTranslation ? '' : 'blur-sm hover:blur-0'}`}>{song.title}</p>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl mt-auto border border-gray-100 relative overflow-hidden">
                                        <div className="absolute top-2 right-2 opacity-10 text-4xl">🎼</div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Lyrics</h4>
                                        <p className="font-serif text-lg text-gray-800 italic leading-relaxed whitespace-pre-line">
                                            {song.lyricsOriginal}
                                        </p>
                                    </div>
                                    
                                    <p className={`mt-4 text-gray-500 text-xs transition-all ${showTranslation ? '' : 'blur-sm hover:blur-0'}`}>
                                        {song.descriptionEn}
                                    </p>
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
