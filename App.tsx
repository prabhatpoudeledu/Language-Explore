import React, { useState } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { SongSection } from './components/SongSection';
import { GeoSection } from './components/GeoSection';
import { initializeLanguageSession } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('np');
  
  // Profile State
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[2]);
  const [tempVoice, setTempVoice] = useState(VOICES[1].id);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // App Settings
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleStartAdventure = async () => {
      if(!tempName.trim()) return;
      
      setUserProfile({
          name: tempName,
          avatar: tempAvatar,
          voice: tempVoice
      });
      
      setIsLoading(true);
      try {
        await initializeLanguageSession(currentLang);
      } catch (e) {
        console.error("Initialization failed", e);
      } finally {
        setIsLoading(false);
        setState(AppState.HOME);
      }
  };

  const NavButton = ({ label, icon, targetState, colorClass }: { label: string, icon: string, targetState: AppState, colorClass: string }) => (
    <button
      onClick={() => setState(targetState)}
      className={`${colorClass} w-full h-40 md:h-56 rounded-3xl shadow-lg transform transition hover:scale-105 flex flex-col items-center justify-center gap-4 text-white p-4 text-center border-4 border-white/20`}
    >
      <span className="text-6xl drop-shadow-md">{icon}</span>
      <span className="text-2xl font-bold tracking-wide drop-shadow-sm">{label}</span>
    </button>
  );

  // --- LOADING SCREEN ---
  if (isLoading) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex flex-col items-center justify-center p-8 text-center font-sans">
              <div className="text-9xl mb-8 animate-bounce">{currentLangConfig.flag}</div>
              <h2 className="text-3xl md:text-5xl font-bold text-indigo-600 mb-4 animate-pulse">
                  Preparing your Adventure...
              </h2>
              <p className="text-xl text-gray-500 mb-8 max-w-md">
                  We are packing your bags with {currentLangConfig.name} words, songs, and maps!
              </p>
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-[width_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
              </div>
          </div>
      );
  }

  // --- LANDING / PROFILE SETUP PAGE ---
  if (state === AppState.LANDING) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4 font-sans py-10">
              <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-xl max-w-4xl w-full text-center border border-white">
                  <h1 className="text-4xl md:text-6xl font-bold text-indigo-600 mb-2">
                      Language Explorer
                  </h1>
                  <p className="text-xl text-gray-400 mb-8">Create your profile to start!</p>

                  <div className="space-y-8 text-left max-w-2xl mx-auto">
                      
                      {/* Step 1: Language */}
                      <div>
                        <label className="block text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">1. Choose a Language</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {LANGUAGES.map(lang => (
                                <button 
                                    key={lang.code}
                                    onClick={() => setCurrentLang(lang.code)}
                                    className={`p-4 rounded-2xl border-2 transition flex flex-col items-center ${currentLang === lang.code ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-200'}`}
                                >
                                    <span className="text-4xl mb-2">{lang.flag}</span>
                                    <span className="font-bold text-gray-700">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                      </div>

                      {/* Step 2: Avatar & Name */}
                      <div>
                        <label className="block text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">2. Who are you?</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                             <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="flex-1 w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-xl focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {AVATARS.map(av => (
                                <button 
                                    key={av} 
                                    onClick={() => setTempAvatar(av)}
                                    className={`text-4xl p-3 rounded-full transition transform hover:scale-110 ${tempAvatar === av ? 'bg-yellow-200 shadow-inner scale-110' : 'bg-transparent'}`}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>
                      </div>

                      {/* Step 3: Voice */}
                      <div>
                        <label className="block text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">3. Choose your Guide's Voice</label>
                        <div className="grid grid-cols-2 gap-3">
                            {VOICES.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setTempVoice(v.id)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm border-2 transition ${tempVoice === v.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                      </div>

                      <button 
                        onClick={handleStartAdventure}
                        disabled={!tempName}
                        className="w-full mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Start Adventure 🚀
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm p-3 shadow-sm sticky top-0 z-50 border-b border-indigo-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            {/* Left: Home & Branding */}
            <div className="flex items-center gap-4">
                 {state !== AppState.HOME && (
                     <button 
                        onClick={() => setState(AppState.HOME)}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-3 rounded-xl transition shadow-sm"
                        title="Go Home"
                     >
                         🏠
                     </button>
                 )}
                 <h1 className="text-xl md:text-2xl font-bold text-indigo-600 flex items-center gap-2">
                    <span className="text-3xl drop-shadow-sm">{currentLangConfig.flag}</span>
                    <span className="hidden sm:inline">{currentLangConfig.name} Explorer</span>
                 </h1>
            </div>
            
            {/* Right: Controls & Profile */}
            <div className="flex items-center gap-3">
                
                {/* Translation Toggle */}
                <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-xs transition border ${showTranslation ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                    title={showTranslation ? "Translation ON" : "Immersion Mode"}
                >
                    <span>{showTranslation ? '🇬🇧 EN' : '🚫 EN'}</span>
                </button>

                {/* Profile Badge */}
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 cursor-pointer" onClick={() => setState(AppState.LANDING)} title="Change Profile">
                    <span className="text-xl">{userProfile?.avatar}</span>
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold text-indigo-800 text-sm">{userProfile?.name}</span>
                        <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">{VOICES.find(v => v.id === userProfile?.voice)?.id}</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        {state === AppState.HOME && (
            <div className="flex flex-col h-full justify-center">
                 <h2 className="text-3xl text-center font-bold text-gray-700 mb-8 animate-fadeIn">
                     Where do you want to go, {userProfile?.name}?
                 </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-popIn">
                    <NavButton label="Alphabet" icon="🔤" targetState={AppState.ALPHABET} colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600 hover:to-indigo-700" />
                    <NavButton label="Word Builder" icon="🧩" targetState={AppState.WORDS} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 hover:to-emerald-700" />
                    <NavButton label="Songs & Culture" icon="🎵" targetState={AppState.SONGS} colorClass="bg-gradient-to-br from-pink-400 to-pink-600 hover:to-pink-700" />
                    <NavButton label={`Explore ${currentLangConfig.country}`} icon="🌍" targetState={AppState.GEO} colorClass="bg-gradient-to-br from-orange-400 to-orange-600 hover:to-orange-700" />
                </div>
            </div>
        )}

        <div className={`h-full ${state === AppState.HOME ? 'hidden' : 'block animate-fadeIn'}`}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} />}
            {state === AppState.SONGS && <SongSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} />}
            {state === AppState.GEO && <GeoSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 text-sm font-medium">
        Powered by Google Gemini • Built with ❤️ for Kids
      </footer>
    </div>
  );
};

export default App;