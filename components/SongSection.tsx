
import React, { useState, useEffect } from 'react';
import { fetchSongsByCategory, speakText } from '../services/geminiService';
import { LanguageCode, SongData, UserProfile } from '../types';

interface Props {
    language: LanguageCode;
    userProfile: UserProfile;
    showTranslation: boolean;
    addXp: (amount: number) => void;
    googleCredential?: string | null;
}

const CATEGORIES = [
    { id: 'National', label: 'National Songs', icon: '🏳️', color: 'bg-red-500' },
    { id: 'Cultural', label: 'Cultural Songs', icon: '🎭', color: 'bg-purple-500' },
    { id: 'Religious', label: 'Religious Chants', icon: '🙏', color: 'bg-yellow-500' },
    { id: 'Folk', label: 'Folk Songs', icon: '🪕', color: 'bg-green-500' }
];

export const SongSection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp, googleCredential }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const handleReadLyrics = (song: SongData) => {
      // Manual trigger for reading lyrics
      speakText(song.lyricsOriginal || '', userProfile.voice);
      addXp(2);
  };

  const goBack = () => {
      setSelectedCategory(null);
      setSongs([]);
  }

  return (
    <div className="p-4 h-full flex flex-col">
        <h2 className="text-3xl font-bold text-center mb-10 text-pink-600">
            Songs & Rhythms 🎵
        </h2>
        
        {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full animate-fadeIn pb-20">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`${cat.color} hover:brightness-110 text-white p-10 rounded-[40px] shadow-lg transform hover:-translate-y-2 transition flex items-center justify-between group`}
                    >
                        <div className="text-left">
                            <h3 className="text-2xl font-bold">{cat.label}</h3>
                            <p className="opacity-80 text-sm mt-2 font-medium">Tap to explore</p>
                        </div>
                        <span className="text-7xl drop-shadow-md">{cat.icon}</span>
                    </button>
                ))}
            </div>
        ) : (
            <div className="flex flex-col h-full animate-fadeIn">
                <button onClick={goBack} className="self-start mb-8 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-700 transition">
                    ← Back to Categories
                </button>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20">
                        <div className="text-6xl mb-4 animate-bounce">🎻</div>
                        <p className="font-bold text-pink-500 text-2xl">Finding Music...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full pb-20">
                        {songs.map((song, i) => (
                            <div key={i} className="bg-white rounded-[50px] overflow-hidden shadow-2xl border border-pink-50 flex flex-col hover:shadow-pink-100 transition">
                                <div className="aspect-video bg-black relative group">
                                    {song.youtubeId && song.youtubeId !== 'SEARCH_ONLY' ? (
                                        <div className="relative">
                                            <iframe 
                                                width="100%" height="100%" 
                                                src={`https://www.youtube.com/embed/${song.youtubeId}?enablejsapi=1&origin=${window.location.origin}&modestbranding=1&rel=0`} 
                                                title={song.title} frameBorder="0" 
                                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                                                allowFullScreen className="w-full h-full"
                                            ></iframe>
                                            {googleCredential && (
                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span>🔗</span> Using your Google account
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white flex-col bg-gray-900">
                                            <span className="text-5xl mb-3">🎹</span>
                                            <span className="text-sm opacity-50 font-bold uppercase tracking-widest">Listen on YouTube</span>
                                            <a 
                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.titleNative + " " + language + " song")}`}
                                                target="_blank" rel="noreferrer"
                                                className="mt-4 bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold"
                                            >
                                                Open Search
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">{song.category}</span>
                                        <button 
                                            onClick={() => handleReadLyrics(song)}
                                            className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-100 transition flex items-center gap-2"
                                        >
                                            <span>🗣️</span> Speak Lyrics
                                        </button>
                                    </div>

                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{song.titleNative}</h3>
                                    <p className={`text-base text-pink-400 font-bold mb-6 italic transition-all ${showTranslation ? '' : 'invisible h-0'}`}>{song.title}</p>
                                    
                                    <div className="bg-slate-50 p-6 rounded-[30px] mt-auto border border-slate-100 relative">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Poetry / Lyrics</h4>
                                        <p className="font-serif text-lg text-gray-800 italic leading-relaxed whitespace-pre-line">
                                            {song.lyricsOriginal}
                                        </p>
                                    </div>
                                    
                                    <p className={`mt-6 text-gray-400 text-xs leading-relaxed transition-all ${showTranslation ? '' : 'invisible h-0'}`}>
                                        {song.description}
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
