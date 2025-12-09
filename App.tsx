
import React, { useState, useEffect } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { SongSection } from './components/SongSection';
import { GeoSection } from './components/GeoSection';
import { PhrasebookSection } from './components/PhrasebookSection';
import { initializeLanguageSession, fetchWordOfTheDay, speakText, triggerHaptic } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LOGIN);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('np');
  
  // Account & Profile State
  const [account, setAccount] = useState<AccountData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Auth Form State
  const [isSignup, setIsSignup] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPwd, setAuthPwd] = useState('');
  const [authError, setAuthError] = useState('');

  // Profile Form State
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  const [tempVoice, setTempVoice] = useState(VOICES[1].id);
  const [tempAutoPlay, setTempAutoPlay] = useState(true);

  // Gamification Display State
  const LEVEL_THRESHOLD = 100;
  const xp = userProfile?.xp || 0;
  const currentLevel = Math.floor(xp / LEVEL_THRESHOLD) + 1;
  const progressPercent = (xp % LEVEL_THRESHOLD) / LEVEL_THRESHOLD * 100;

  // App Settings
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Word of the Day
  const [wotd, setWotd] = useState<WordOfTheDayData | null>(null);

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const theme = currentLangConfig.theme;

  useEffect(() => {
    if (state === AppState.HOME && userProfile) {
        fetchWordOfTheDay(currentLang).then(setWotd);
    }
  }, [state, currentLang, userProfile]);

  // --- PERSISTENCE HELPER ---
  const saveDb = (accounts: AccountData[]) => {
      localStorage.setItem('app_db', JSON.stringify(accounts));
  };

  const getDb = (): AccountData[] => {
      const stored = localStorage.getItem('app_db');
      if (stored) return JSON.parse(stored);
      
      // Seed default test user if empty
      const defaultUser: AccountData = {
          email: 'test@gmail.com',
          password: '1234',
          profiles: []
      };
      saveDb([defaultUser]);
      return [defaultUser];
  };

  // --- ACTIONS ---

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      triggerHaptic(5);
      setAuthError('');
      
      const db = getDb();
      const found = db.find(a => a.email.toLowerCase() === authEmail.toLowerCase() && a.password === authPwd);
      
      if (found) {
          setAccount(found);
          setState(AppState.PROFILE_SELECT);
      } else {
          setAuthError('Invalid email or password.');
          triggerHaptic([50, 50, 50]);
      }
  };

  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      triggerHaptic(5);
      setAuthError('');

      if (!authEmail.includes('@') || authPwd.length < 3) {
          setAuthError('Please enter a valid email and password (min 3 chars).');
          triggerHaptic([50, 50, 50]);
          return;
      }

      const db = getDb();
      if (db.some(a => a.email.toLowerCase() === authEmail.toLowerCase())) {
          setAuthError('Account already exists. Please log in.');
          triggerHaptic([50, 50, 50]);
          return;
      }

      const newAccount: AccountData = {
          email: authEmail,
          password: authPwd,
          profiles: []
      };

      const newDb = [...db, newAccount];
      saveDb(newDb);
      setAccount(newAccount);
      setState(AppState.PROFILE_CREATE); // Go strictly to create profile
  };

  const handleLogout = () => {
      triggerHaptic(5);
      setAccount(null);
      setUserProfile(null);
      setAuthEmail('');
      setAuthPwd('');
      setShowProfileMenu(false);
      setState(AppState.LOGIN);
  };

  const handleProfileSelect = async (profile: UserProfile) => {
      triggerHaptic(10);
      setUserProfile(profile);
      setState(AppState.HOME);
      setShowProfileMenu(false);
      // Re-init session for default lang
      setIsLoading(true);
      await initializeLanguageSession(currentLang);
      setIsLoading(false);
  };

  const handleCreateProfile = () => {
      triggerHaptic(5);
      setTempName('');
      setTempAvatar(AVATARS[0]);
      setTempVoice(VOICES[1].id);
      setTempAutoPlay(true);
      setState(AppState.PROFILE_CREATE);
  };

  const handleEditProfile = () => {
      triggerHaptic(5);
      if(!userProfile) return;
      setTempName(userProfile.name);
      setTempAvatar(userProfile.avatar);
      setTempVoice(userProfile.voice);
      setTempAutoPlay(userProfile.autoPlaySound);
      setShowProfileMenu(false);
      setState(AppState.PROFILE_MANAGE);
  };

  const handleSaveProfile = async (isEdit: boolean) => {
      triggerHaptic(10);
      if (!tempName.trim() || !account) return;
      
      const db = getDb();
      const accountIdx = db.findIndex(a => a.email === account.email);
      if (accountIdx === -1) return;

      let updatedProfile: UserProfile;

      if (isEdit && userProfile) {
           updatedProfile = {
              ...userProfile,
              name: tempName,
              avatar: tempAvatar,
              voice: tempVoice,
              autoPlaySound: tempAutoPlay
          };
          const updatedProfiles = account.profiles.map(p => p.id === userProfile.id ? updatedProfile : p);
          db[accountIdx].profiles = updatedProfiles;
      } else {
          updatedProfile = {
              id: Date.now().toString(),
              name: tempName,
              avatar: tempAvatar,
              voice: tempVoice,
              autoPlaySound: tempAutoPlay,
              xp: 0
          };
          db[accountIdx].profiles.push(updatedProfile);
      }
      
      saveDb(db);
      setAccount(db[accountIdx]); 
      
      await handleProfileSelect(updatedProfile);
  };

  const handleSwitchProfile = () => {
      triggerHaptic(5);
      setShowProfileMenu(false);
      setState(AppState.PROFILE_SELECT);
  };

  const addXp = (amount: number) => {
      if (!userProfile || !account) return;
      
      const newXp = (userProfile.xp || 0) + amount;
      const updatedProfile = { ...userProfile, xp: newXp };
      setUserProfile(updatedProfile);
      // Trigger success haptic
      if (amount >= 10) triggerHaptic([10, 30, 10]);

      const db = getDb();
      const accIdx = db.findIndex(a => a.email === account.email);
      if (accIdx > -1) {
          const pIdx = db[accIdx].profiles.findIndex(p => p.id === userProfile.id);
          if (pIdx > -1) {
              db[accIdx].profiles[pIdx] = updatedProfile;
              saveDb(db);
              setAccount(db[accIdx]); 
          }
      }
  };

  const NavButton = ({ label, icon, targetState, colorClass }: { label: string, icon: string, targetState: AppState, colorClass: string }) => (
    <button
      onClick={() => { triggerHaptic(10); setState(targetState); }}
      className={`${colorClass} w-full h-40 md:h-52 rounded-3xl shadow-lg 
                  transform transition-all duration-300 ease-out 
                  hover:scale-105 hover:-translate-y-2 hover:shadow-2xl 
                  active:scale-95 active:bg-opacity-90
                  flex flex-col items-center justify-center gap-4 text-white p-4 text-center border-4 border-white/20`}
    >
      <span className="text-6xl drop-shadow-md animate-float">{icon}</span>
      <span className="text-xl md:text-2xl font-bold tracking-wide drop-shadow-sm leading-tight">{label}</span>
    </button>
  );

  // --- VIEWS ---

  if (isLoading) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex flex-col items-center justify-center p-8 text-center font-sans">
              <div className="text-9xl mb-8 animate-bounce">{currentLangConfig.flag}</div>
              <h2 className={`text-3xl md:text-5xl font-bold ${theme.headerText} mb-4 animate-pulse`}>
                  Preparing your Adventure...
              </h2>
              <p className="text-xl text-gray-500 mb-8 max-w-md">
                  We are packing your bags with <span className="font-bold">{currentLangConfig.name}</span> words, songs, and maps!
              </p>
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${theme.gradient} animate-[width_2s_ease-in-out_infinite]`} style={{ width: '50%' }}></div>
              </div>
          </div>
      );
  }

  // LOGIN / SIGNUP SCREEN
  if (state === AppState.LOGIN) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-md w-full border border-gray-100 transition-all">
                  <div className="text-center mb-8">
                      <h1 className="text-4xl font-bold text-indigo-600 mb-2">
                          {isSignup ? "Start Journey! 🚀" : "Welcome Back! 👋"}
                      </h1>
                      <p className="text-gray-400">
                          {isSignup ? "Create an account to track progress" : "Log in to continue learning"}
                      </p>
                  </div>
                  
                  <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1 ml-1 uppercase text-xs tracking-wide">Email Address</label>
                          <input 
                            type="email" 
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition font-medium"
                            placeholder="parent@email.com"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1 ml-1 uppercase text-xs tracking-wide">Password</label>
                          <input 
                            type="password" 
                            value={authPwd}
                            onChange={(e) => setAuthPwd(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition font-medium"
                            placeholder="••••••"
                          />
                      </div>
                      
                      {authError && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</p>}
                      
                      <button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition text-lg"
                      >
                          {isSignup ? "Sign Up" : "Log In"}
                      </button>
                  </form>
                  
                  <div className="mt-8 text-center">
                      <button 
                        onClick={() => { triggerHaptic(5); setIsSignup(!isSignup); setAuthError(''); }}
                        className="text-indigo-500 font-bold hover:text-indigo-700 hover:underline transition"
                      >
                          {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                      </button>
                  </div>

                  {!isSignup && (
                    <div className="mt-4 text-center text-xs text-gray-300">
                        Demo: test@gmail.com / 1234
                    </div>
                  )}
              </div>
          </div>
      )
  }

  // PROFILE SELECT SCREEN
  if (state === AppState.PROFILE_SELECT) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-indigo-50/50">
               <h1 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-12 animate-fadeIn">Who is learning today?</h1>
               
               <div className="flex flex-wrap justify-center gap-8 animate-popIn">
                   {account?.profiles.map(p => (
                       <button 
                        key={p.id}
                        onClick={() => handleProfileSelect(p)}
                        className="group flex flex-col items-center gap-4 transition hover:scale-105"
                       >
                           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center text-6xl shadow-md group-hover:ring-4 ring-indigo-300 transition border-4 border-indigo-100 relative">
                               {p.avatar}
                               <div className="absolute -bottom-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                                   Lvl {Math.floor((p.xp || 0) / 100) + 1}
                               </div>
                           </div>
                           <span className="text-xl font-bold text-gray-600 group-hover:text-indigo-600">{p.name}</span>
                       </button>
                   ))}

                   <button 
                        onClick={handleCreateProfile}
                        className="group flex flex-col items-center gap-4 transition hover:scale-105"
                   >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-400 shadow-inner group-hover:bg-gray-300 transition border-4 border-white/50">
                            +
                        </div>
                        <span className="text-xl font-bold text-gray-500 group-hover:text-gray-700">Add Profile</span>
                   </button>
               </div>
               
               <button onClick={handleLogout} className="mt-16 text-gray-400 hover:text-red-500 font-bold">
                   Log Out
               </button>
          </div>
      )
  }

  // PROFILE CREATE / MANAGE SCREEN
  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
      const isEdit = state === AppState.PROFILE_MANAGE;
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full animate-fadeIn">
                  <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
                      {isEdit ? "Edit Profile" : "New Explorer Profile"}
                  </h2>
                  <div className="space-y-6">
                      <div>
                        <label className="block text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Name</label>
                        <input 
                            type="text" 
                            placeholder="Child's Name" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-lg focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Choose Avatar</label>
                        <div className="flex gap-2 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                            {AVATARS.map(av => (
                                <button 
                                    key={av} 
                                    onClick={() => { triggerHaptic(5); setTempAvatar(av); }}
                                    className={`text-5xl p-4 rounded-full transition transform hover:scale-110 flex-shrink-0 border-2 ${tempAvatar === av ? 'bg-indigo-50 border-indigo-500 scale-110' : 'bg-transparent border-transparent hover:bg-gray-50'}`}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Voice Buddy</label>
                            <div className="grid grid-cols-1 gap-2">
                                {VOICES.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => { triggerHaptic(5); setTempVoice(v.id); }}
                                        className={`px-4 py-3 rounded-xl font-bold text-sm border-2 transition text-left flex justify-between items-center ${tempVoice === v.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                                    >
                                        {v.label}
                                        {tempVoice === v.id && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="block text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Settings</label>
                             <div 
                                onClick={() => { triggerHaptic(5); setTempAutoPlay(!tempAutoPlay); }}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${tempAutoPlay ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                             >
                                <div className={`w-6 h-6 rounded border flex items-center justify-center ${tempAutoPlay ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}>
                                    {tempAutoPlay && '✓'}
                                </div>
                                <label className="text-gray-700 font-bold cursor-pointer select-none text-sm">
                                    Auto-play sounds on hover
                                </label>
                            </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
                          <button 
                            onClick={() => { triggerHaptic(5); isEdit ? setState(AppState.HOME) : setState(AppState.PROFILE_SELECT); }}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveProfile(isEdit)}
                            disabled={!tempName}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition transform active:scale-95"
                          >
                              {isEdit ? "Save Changes" : "Create Profile"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- MAIN APP (HOME + SECTIONS) ---
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      {/* Header with Dynamic Theme */}
      <header className={`${theme.headerBg} backdrop-blur-md p-3 shadow-sm sticky top-0 z-50 border-b ${theme.headerBorder} transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            {/* Left: Home & Branding */}
            <div className="flex items-center gap-4">
                 {state !== AppState.HOME && (
                     <button 
                        onClick={() => { triggerHaptic(5); setState(AppState.HOME); }}
                        className={`bg-white/50 hover:bg-white ${theme.headerText} p-3 rounded-xl transition shadow-sm active:scale-95 border border-white/20`}
                        title="Go Home"
                     >
                         🏠
                     </button>
                 )}
                 <h1 className={`text-xl md:text-2xl font-bold ${theme.headerText} flex items-center gap-2 select-none`}>
                    <span className="text-3xl drop-shadow-sm">{currentLangConfig.flag}</span>
                    <span className="hidden sm:inline">{currentLangConfig.name} Explorer</span>
                 </h1>
                 
                 {/* Language Switcher */}
                 {state === AppState.HOME && (
                     <div className="hidden md:flex gap-1 ml-4 bg-white/50 p-1 rounded-xl">
                         {LANGUAGES.map(l => (
                             <button
                                key={l.code}
                                onClick={async () => {
                                    triggerHaptic(5);
                                    setCurrentLang(l.code);
                                    setIsLoading(true);
                                    await initializeLanguageSession(l.code);
                                    setIsLoading(false);
                                }}
                                className={`px-2 py-1 rounded-lg text-lg transition ${currentLang === l.code ? 'bg-white shadow scale-110' : 'opacity-50 hover:opacity-100'}`}
                                title={`Switch to ${l.name}`}
                             >
                                 {l.flag}
                             </button>
                         ))}
                     </div>
                 )}
            </div>
            
            {/* Right: Controls & Profile */}
            <div className="flex items-center gap-3 relative">
                
                {/* Level Progress */}
                <div className="hidden md:flex flex-col w-32 items-end">
                    <div className={`flex justify-between w-full text-xs font-bold ${theme.headerText} mb-1 opacity-70`}>
                        <span>Lvl {currentLevel}</span>
                        <span>{Math.floor(xp)} XP</span>
                    </div>
                    <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-yellow-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Translation Toggle */}
                <button
                    onClick={() => { triggerHaptic(5); setShowTranslation(!showTranslation); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-xs transition border transform active:scale-95 bg-white ${theme.headerText} border-white/40`}
                    title={showTranslation ? "Translation ON" : "Immersion Mode"}
                >
                    <span>{showTranslation ? '🇬🇧 EN' : '🚫 EN'}</span>
                </button>

                {/* Profile Badge & Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => { triggerHaptic(5); setShowProfileMenu(!showProfileMenu); }}
                        className={`flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-white/40 cursor-pointer hover:bg-white transition active:scale-95`}
                    >
                        <span className="text-xl">{userProfile?.avatar}</span>
                        <div className="flex flex-col leading-tight text-left">
                            <span className={`font-bold ${theme.headerText} text-sm`}>{userProfile?.name}</span>
                        </div>
                        <span className={`${theme.headerText} opacity-50 text-xs`}>▼</span>
                    </button>

                    {/* Profile Menu Dropdown */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48 animate-popIn z-50 text-gray-800">
                            <button 
                                onClick={handleEditProfile}
                                className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center gap-2"
                            >
                                ✏️ Edit Profile
                            </button>
                            <button 
                                onClick={handleSwitchProfile}
                                className="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm flex items-center gap-2"
                            >
                                👥 Switch Profile
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium text-sm flex items-center gap-2"
                            >
                                🚪 Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        {state === AppState.HOME && (
            <div className="flex flex-col h-full justify-center pb-10">
                 <h2 className="text-3xl text-center font-bold text-gray-700 mb-8 animate-fadeIn">
                     Where do you want to go, {userProfile?.name}?
                 </h2>
                 
                 {/* WORD OF THE DAY */}
                 {wotd && (
                     <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-lg p-6 mb-8 border border-yellow-200 animate-popIn relative overflow-hidden group">
                         <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">WORD OF THE DAY</div>
                         <div className="flex flex-col items-center text-center">
                             <div className="text-4xl font-bold text-indigo-600 mb-1">{wotd.word}</div>
                             <div className="text-gray-500 font-medium italic mb-2">{wotd.transliteration}</div>
                             <div className="text-lg font-bold text-gray-800 mb-3">{showTranslation ? wotd.english : '???'}</div>
                             <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 italic border border-gray-100 w-full">
                                 "{wotd.sentence}"
                             </div>
                             <button 
                                onClick={() => { triggerHaptic(5); speakText(`${wotd.word}. ${wotd.sentence}`, userProfile?.voice); }}
                                className="mt-4 bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-200 transition"
                             >
                                 🔊
                             </button>
                         </div>
                     </div>
                 )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 animate-popIn max-w-4xl mx-auto">
                    <NavButton 
                        label="Alphabet" 
                        icon={currentLangConfig.icons.alphabet} 
                        targetState={AppState.ALPHABET} 
                        colorClass={`bg-gradient-to-br from-indigo-400 to-indigo-600 hover:to-indigo-700`} 
                    />
                    <NavButton 
                        label="Word Builder" 
                        icon={currentLangConfig.icons.words} 
                        targetState={AppState.WORDS} 
                        colorClass={`bg-gradient-to-br from-emerald-400 to-emerald-600 hover:to-emerald-700`} 
                    />
                    <NavButton 
                        label="Common Phrases" 
                        icon={currentLangConfig.icons.phrases} 
                        targetState={AppState.PHRASES} 
                        colorClass={`bg-gradient-to-br from-teal-400 to-teal-600 hover:to-teal-700`} 
                    />
                    <NavButton 
                        label={`Explore ${currentLangConfig.country}`} 
                        icon="🌍" 
                        targetState={AppState.GEO} 
                        colorClass={`bg-gradient-to-br from-orange-400 to-orange-600 hover:to-orange-700`} 
                    />
                </div>
            </div>
        )}

        <div className={`h-full ${state === AppState.HOME ? 'hidden' : 'block animate-fadeIn'}`}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.SONGS && <SongSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.GEO && <GeoSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PHRASES && <PhrasebookSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
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
