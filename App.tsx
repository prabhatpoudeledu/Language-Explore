
import React, { useState, useEffect, useRef } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { CultureHub } from './components/CultureHub';
import { PhrasebookSection } from './components/PhrasebookSection';
import { TracingPracticeSection } from './components/TracingPracticeSection';
import { VoicePractice } from './components/VoicePractice';
import { AssistantWidget } from './components/AssistantWidget';
import { initializeLanguageSession, fetchWordOfTheDay, fetchFunFact, speakText, triggerHaptic, stopAllAudio, generateTravelImage, isVoiceLimited, unlockAudio, getAudioState, resolveVoiceId } from './services/geminiService';


const LoadingGame: React.FC<{ items: string[] }> = ({ items }) => {
    const [score, setScore] = useState(0);
    const [targets, setTargets] = useState<{ id: number, x: number, y: number, icon: string, color?: string }[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];
            const newItem = { 
                id: nextId.current++, 
                x: Math.random() * 80 + 10, 
                y: -10, 
                icon: items[Math.floor(Math.random() * items.length)],
                color: colors[Math.floor(Math.random() * colors.length)]
            };
            setTargets(prev => [...prev, newItem]);
        }, 800);
        const moveInterval = setInterval(() => {
            setTargets(prev => prev.map(t => ({ ...t, y: t.y + 1.2 })).filter(t => t.y < 110));
        }, 30);
        return () => { clearInterval(interval); clearInterval(moveInterval); };
    }, [items]);

    const handleCatch = (id: number) => {
        triggerHaptic(10);
        setScore(s => s + 1);
        setTargets(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="relative w-full h-[180px] bg-white rounded-[30px] shadow-inner border-2 border-dashed border-indigo-50 overflow-hidden touch-none select-none">
            <div className="absolute top-2 right-4 text-sm font-bold text-indigo-300 z-50">Score: {score}</div>
            <div className="absolute inset-0 z-10">
                {targets.map(t => (
                    <button key={t.id} onPointerDown={() => handleCatch(t.id)} style={{ left: `${t.x}%`, top: `${t.y}%` }} className={`absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 transition-all active:scale-150 cursor-pointer drop-shadow-md p-2 rounded-full ${t.color}`}>{t.icon}</button>
                ))}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LOGIN);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('np');
  const [account, setAccount] = useState<AccountData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authStage, setAuthStage] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingP, setLoadingP] = useState(0);

  const [authError, setAuthError] = useState('');

  const [showTranslation, setShowTranslation] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wotd, setWotd] = useState<WordOfTheDayData | null>(null);
  const [wotdImage, setWotdImage] = useState<string | null>(null);
  const [funFact, setFunFact] = useState<string>('Tap for a cool fact!');
  const [factLoading, setFactLoading] = useState(false);
  const [preloadedFacts, setPreloadedFacts] = useState<string[]>([]);
  const [wotdKidsImage, setWotdKidsImage] = useState<string | null>(null);

  const [tempName, setTempName] = useState('');
  const [tempAccountName, setTempAccountName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  const [tempVoice, setTempVoice] = useState(VOICES[0].id);
  const [tempGender, setTempGender] = useState<'male' | 'female'>('male');
  const [tempAssistantPersist, setTempAssistantPersist] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  // Listen for Google Sign-In events
  useEffect(() => {
    const handleGoogleSignIn = (event: any) => {
      setGoogleCredential(event.detail.credential);
    };

    window.addEventListener('googleSignIn', handleGoogleSignIn);
    return () => window.removeEventListener('googleSignIn', handleGoogleSignIn);
  }, []);

  // Automatically process Google Sign-In when credential is received
  useEffect(() => {
    if (googleCredential && state === AppState.LOGIN) {
      handleGoogleLogin(googleCredential);
    }
  }, [googleCredential, state]);

  // Render Google Sign-In button when login state is active
  useEffect(() => {
    if (state === AppState.LOGIN) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if ((window as any).renderGoogleSignInButton) {
          (window as any).renderGoogleSignInButton();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const theme = currentLangConfig.theme;

  const getDb = (): AccountData[] => {
    const saved = localStorage.getItem('app_db_v12');
    if (saved) return JSON.parse(saved);
    const defaultDb = [{ 
        email: 'test@gmail.com', 
        password: '1234', 
        name: 'Test Parent', 
        profiles: [] 
    }];
    saveDb(defaultDb);
    return defaultDb;
  };
  const saveDb = (db: AccountData[]) => localStorage.setItem('app_db_v12', JSON.stringify(db));

  useEffect(() => {
    if (account) {
        localStorage.setItem('current_account_v12', JSON.stringify(account));
        const db = getDb();
        const idx = db.findIndex(a => a.email === account.email);
        if (idx > -1) {
            db[idx] = account;
            saveDb(db);
        }
    }
  }, [account]);

  useEffect(() => {
    const saved = localStorage.getItem('current_account_v12');
    if (saved) {
        setAccount(JSON.parse(saved));
        setState(AppState.PROFILE_SELECT);
    }
    getDb();
    
    // Check audio state
    if (getAudioState() === 'running') setAudioUnlocked(true);
  }, []); // Only run once on mount

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopAllAudio();
    };

    const handlePageHide = () => stopAllAudio();
    const handleBeforeUnload = () => stopAllAudio();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    stopAllAudio();
  }, [state]);

  useEffect(() => {
    if (state === AppState.HOME && userProfile) {
        fetchWordOfTheDay(currentLang).then(data => {
            setWotd(data);
            if (data) {
                generateTravelImage(data.english, currentLangConfig.country).then(setWotdImage);
            }
        });
    }
  }, [state, currentLang, userProfile]);

  const refreshFunFact = async () => {
      setFactLoading(true);

      // Use preloaded fact if available
      if (preloadedFacts.length > 0) {
          const fact = preloadedFacts.shift()!;
          setFunFact(fact);
          setFactLoading(false);
          // Start preloading a new fact in background
          preloadNextFact();
          return;
      }

      // Fallback to direct fetch
      const fact = await fetchFunFact(currentLang);
      setFunFact(fact);
      setFactLoading(false);
      // Start preloading facts in background
      preloadNextFact();
  };

  const preloadNextFact = async () => {
      try {
          const fact = await fetchFunFact(currentLang);
          setPreloadedFacts(prev => [...prev, fact]);
      } catch (e) {
          // Silently fail for background preloading
      }
  };

  // Preload facts when component mounts or language changes
  useEffect(() => {
      if (userProfile && currentLang) {
          // Preload 3 facts in background
          setTimeout(() => {
              preloadNextFact();
              setTimeout(() => preloadNextFact(), 1000);
              setTimeout(() => preloadNextFact(), 2000);
          }, 2000);
      }
  }, [currentLang, userProfile]);

  const handleUnlockAudio = async () => {
      const success = await unlockAudio();
      if (success) setAudioUnlocked(true);
      triggerHaptic(10);
  };

  const decodeGoogleJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  };

  const handleGoogleLogin = async (credential?: string) => {
    setAuthError('');
    await handleUnlockAudio();

    setIsAuthLoading(true);
    setAuthStage('verifying');
    triggerHaptic(15);

    // Check if we have a Google credential
    const token = credential || googleCredential;

    if (!token) {
      // This shouldn't happen since this function is called when credential is set
      setAuthError('Google Sign-In failed. Please try again.');
      setIsAuthLoading(false);
      return;
    }

    try {
      // Decode the JWT token to get user information
      const payload = decodeGoogleJwt(token);
      const googleEmail = payload.email;
      const googleName = payload.name;
      const googleId = payload.sub;
      const googlePicture = payload.picture;

      if (!googleEmail || !googleId) {
        throw new Error('Missing required profile info from Google token.');
      }

      const db = getDb();
      let found = db.find(a => a.googleId === googleId);

      if (!found) {
        found = {
          email: googleEmail,
          googleId: googleId,
          name: googleName,
          picture: googlePicture,
          profiles: []
        };
        db.push(found);
        saveDb(db);
      }

      setAccount(found);
      setAuthStage('success');
      await new Promise(r => setTimeout(r, 800));

      setIsAuthLoading(false);
      setAuthStage('idle');

      if (found.profiles.length === 0) setState(AppState.PROFILE_CREATE);
      else setState(AppState.PROFILE_SELECT);
    } catch (error) {
      console.error('Error processing Google Sign-In:', error);
      setAuthError('Failed to sign in with Google. Please try again.');
      setIsAuthLoading(false);
      setAuthStage('idle');
    }
  };

  const handleProfileSelect = async (p: UserProfile) => {
    await handleUnlockAudio();
    setUserProfile(p);
    setCurrentLang('np');
    setIsLoading(true);
    setLoadingP(0);
    await initializeLanguageSession('np', resolveVoiceId(p), (msg, p) => { setLoadingMsg(msg); setLoadingP(p); });
    setIsLoading(false);
    setState(AppState.HOME);
    setFunFact('Tap for a cool fact!');
    setShowProfileMenu(false);
    triggerHaptic(5);
  };

  const handleSaveProfile = async (isEdit: boolean) => {
    if (!tempName.trim() || !account) return;
    
    let updatedAccount = { ...account };
    
    if (isEdit && tempAccountName.trim()) {
        updatedAccount.name = tempAccountName;
    }

    let p: UserProfile;
    if (isEdit && userProfile) {
      p = { ...userProfile, name: tempName, avatar: tempAvatar, voice: tempVoice, gender: tempGender, assistantPersist: tempAssistantPersist };
      updatedAccount.profiles = updatedAccount.profiles.map(old => old.id === userProfile.id ? p : old);
    } else {
      p = { id: Date.now().toString(), name: tempName, avatar: tempAvatar, voice: tempVoice, gender: tempGender, autoPlaySound: true, assistantPersist: true, xp: 0, completedWords: [] };
      updatedAccount.profiles = [...updatedAccount.profiles, p];
    }
    
    setAccount(updatedAccount);
    handleProfileSelect(p);
  };

  const handleLogout = () => {
      localStorage.removeItem('current_account_v12');
      setAccount(null);
      setUserProfile(null);
      setState(AppState.LOGIN);
  };

  const addXp = (amount: number) => {
    if (!userProfile || !account) return;
    const updatedProfile = { ...userProfile, xp: (userProfile.xp || 0) + amount };
    const updatedAccount = { ...account };
    updatedAccount.profiles = updatedAccount.profiles.map(p => p.id === userProfile.id ? updatedProfile : p);
    setAccount(updatedAccount);
    setUserProfile(updatedProfile);
  };

  const completeWord = (word: string) => {
    if (!userProfile || !account) return;
    if (userProfile.completedWords.includes(word)) return;
    const updatedProfile = { ...userProfile, completedWords: [...userProfile.completedWords, word] };
    const updatedAccount = { ...account };
    updatedAccount.profiles = updatedAccount.profiles.map(p => p.id === userProfile.id ? updatedProfile : p);
    setAccount(updatedAccount);
    setUserProfile(updatedProfile);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-6 animate-fadeIn overflow-hidden">
      <div className="flex flex-col items-center w-full max-w-md text-center">
        <div className="w-20 h-20 bg-red-500 rounded-3xl animate-bounce mb-6 shadow-xl flex items-center justify-center text-3xl">🇳🇵</div>
        <h2 className="text-xl md:text-2xl font-black mb-3 text-gray-800 tracking-tight">{loadingMsg}</h2>
        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-8 shadow-inner">
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingP}%` }}></div>
        </div>
        <p className="text-blue-500 font-black text-sm mb-6 animate-pulse uppercase tracking-[0.2em]">Almost there!</p>
        <LoadingGame items={currentLangConfig.gameItems} />
      </div>
    </div>
  );

  if (state === AppState.LOGIN) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-['Fredoka']">
      <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl max-w-sm w-full border border-slate-100 animate-popIn">
        <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float">🏔️</div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Nepali Explorer</h1>
            <p className="text-red-500 text-sm font-bold">Start your magic journey!</p>
        </div>

        {authError && <p className="text-rose-500 font-black text-center text-xs animate-shake mb-4">{authError}</p>}

        <div 
            id="google-signin-button"
            className="w-full"
        ></div>

        <p className="mt-6 text-center text-slate-400 text-sm font-bold">
            Sign in with your Google account to continue
        </p>
      </div>
    </div>
  );

  if (!audioUnlocked && (state === AppState.PROFILE_SELECT || state === AppState.HOME)) {
      return (
          <div className="fixed inset-0 bg-white z-[1000] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="text-8xl mb-8 animate-bounce">🔈</div>
              <h2 className="text-3xl font-black text-gray-800 mb-4">Magic Sound Check!</h2>
              <p className="text-lg text-gray-400 font-bold mb-8 max-w-sm">Tap the big button below to wake up the voices on your phone!</p>
              <button 
                onClick={handleUnlockAudio}
                onPointerUp={handleUnlockAudio}
                className="bg-red-600 text-white px-12 py-5 rounded-[30px] font-black text-xl shadow-2xl border-b-8 border-red-800 active:translate-y-2 active:border-b-0 transition-all"
              >
                  ✨ Start Learning!
              </button>
          </div>
      );
  }

  if (state === AppState.PROFILE_SELECT) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-amber-50 animate-fadeIn font-['Fredoka']">
      <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-1 text-gray-800 tracking-tighter">Hi, {account?.name}!</h1>
          <p className="text-red-600 font-bold text-lg">Who is learning today? 🇳🇵</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {account?.profiles.map(p => (
          <button key={p.id} onClick={() => handleProfileSelect(p)} className="flex flex-col items-center gap-3 group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-b-8 border-amber-100 shadow-xl flex items-center justify-center text-5xl md:text-7xl group-hover:scale-110 transition duration-300 transform">{p.avatar}</div>
            <span className="font-black text-xl text-gray-700">{p.name}</span>
          </button>
        ))}
        <button onClick={() => { setTempName(''); setState(AppState.PROFILE_CREATE); }} className="flex flex-col items-center gap-3 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-2 border-dashed border-amber-200 flex items-center justify-center text-4xl text-amber-200 group-hover:bg-amber-100 transition duration-300 transform">+</div>
          <span className="font-black text-xl text-amber-300">Add</span>
        </button>
      </div>
      <button onClick={() => setState(AppState.PROFILE_SELECT)} className="mt-12 text-slate-300 text-sm font-bold hover:text-slate-500 transition underline">Switch Account</button>
    </div>
  );

  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
    const edit = state === AppState.PROFILE_MANAGE;
    if (edit && !tempAccountName && account) {
        setTempAccountName(account.name || '');
        setTempName(userProfile?.name || '');
        setTempAvatar(userProfile?.avatar || AVATARS[0]);
        setTempVoice(userProfile?.voice || VOICES[0].id);
      setTempAssistantPersist(userProfile?.assistantPersist ?? true);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-['Fredoka']">
        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl max-w-sm w-full border border-slate-100">
          <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-tighter">{edit ? 'Settings' : 'New Hero'}</h2>
          
          <div className="space-y-4">
            <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Kid's Name" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-base focus:border-red-400 transition" />

            <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Avatar</label>
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                    {AVATARS.map(av => (
                        <button key={av} onClick={() => setTempAvatar(av)} className={`text-3xl p-3 rounded-2xl transition-all ${tempAvatar === av ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-slate-50 hover:bg-white'}`}>{av}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Voice Style</label>
                <div className="grid grid-cols-2 gap-2">
                    {VOICES.map(v => (
                        <button key={v.id} onClick={() => { setTempVoice(v.id); setTempGender(v.gender); }} className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${tempVoice === v.id ? 'border-red-500 bg-red-50' : 'border-slate-100 grayscale opacity-60'}`}>
                            <span className="text-2xl">{v.icon}</span>
                            <span className="font-black text-[10px]">{v.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Assistant Memory</label>
              <button
                onClick={() => setTempAssistantPersist(prev => !prev)}
                className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${tempAssistantPersist ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 text-slate-400'}`}
              >
                <span className="font-black text-xs">{tempAssistantPersist ? 'Remember chats for 30 days' : 'Don\'t remember chats'}</span>
                <span className="text-lg">{tempAssistantPersist ? '✅' : '🚫'}</span>
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { stopAllAudio(); setState(edit ? AppState.HOME : AppState.PROFILE_SELECT); }} className="flex-1 py-3 bg-white border border-slate-100 text-gray-400 rounded-xl font-black text-sm transition">Cancel</button>
              <button onClick={() => handleSaveProfile(edit)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg border-b-4 border-red-800 transition">Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const voiceBusy = isVoiceLimited();

  return (
    
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Fredoka']">
      <header className={`${theme.headerBg} p-2 md:p-3 border-b-2 ${theme.headerBorder} flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-opacity-95`}>
          <div className="flex items-center gap-3">
              <button onClick={() => { stopAllAudio(); setState(AppState.HOME); }} className="text-2xl md:text-3xl hover:scale-110 transition active:scale-95">🏠</button>
              <div className="flex flex-col leading-none">
                  <span className={`font-black text-xs md:text-sm ${theme.headerText} flex items-center gap-1`}>
                      <span className="text-lg">{currentLangConfig.flag}</span> 
                      <span className="uppercase tracking-tight">{currentLangConfig.name}</span>
                  </span>
                  <span className="text-[9px] font-bold text-red-400">Hi {userProfile?.name}!</span>
              </div>
          </div>

          <button onClick={refreshFunFact} disabled={factLoading} className="hidden md:flex flex-1 max-w-xs mx-4 bg-white px-4 py-1.5 rounded-full shadow-inner border border-slate-100 items-center gap-2 hover:bg-slate-50 transition group">
            <span className={`text-sm ${factLoading ? 'animate-spin' : 'animate-bounce'}`}>{factLoading ? '⏳' : preloadedFacts.length > 0 ? '🍭' : '🔄'}</span>
            <span className={`text-[10px] font-bold text-gray-500 italic truncate ${factLoading ? 'opacity-30' : ''}`}>{funFact}</span>
            {preloadedFacts.length > 0 && !factLoading && (
                <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-black">{preloadedFacts.length}</span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowTranslation(!showTranslation)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all shadow-sm active:translate-y-0.5 border-b-2 ${showTranslation ? 'bg-red-600 text-white border-red-800' : 'bg-white text-gray-300 border-slate-100'}`}>
                {showTranslation ? 'EN' : 'NP'}
            </button>
            <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-xl bg-white border border-white shadow-md flex items-center justify-center text-2xl hover:rotate-6 transition">{userProfile?.avatar}</button>
                {showProfileMenu && (
                    <div className="absolute right-0 top-12 bg-white border-b-8 border-slate-100 rounded-3xl shadow-2xl p-4 w-48 animate-popIn z-[60]">
                        <button onClick={() => { setShowProfileMenu(false); setState(AppState.PROFILE_MANAGE); }} className="w-full p-2.5 text-left hover:bg-red-50 rounded-xl flex items-center gap-3 transition font-black text-gray-600 text-xs group">
                            ⚙️ Settings
                        </button>
                        <button onClick={() => { setShowProfileMenu(false); setState(AppState.PROFILE_SELECT); }} className="w-full p-2.5 text-left hover:bg-amber-50 rounded-xl flex items-center gap-3 transition font-black text-amber-500 text-xs group">
                            👤 Switch
                        </button>
                        <button onClick={handleLogout} className="w-full p-2.5 text-left hover:bg-rose-50 rounded-xl flex items-center gap-3 transition font-black text-rose-400 mt-1 text-xs border-t border-slate-50 pt-3">
                            🚪 Log out
                        </button>
                    </div>
                )}
            </div>
          </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 pb-20 relative overflow-x-hidden">
        {state === AppState.HOME && (
            <div className="flex flex-col items-center py-4 animate-fadeIn">
                 {/* Mobile Fun Fact Button */}
                 <div className="md:hidden w-full max-w-sm mb-6">
                     <button onClick={refreshFunFact} disabled={factLoading} className="w-full bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100 items-center gap-3 hover:bg-slate-50 transition flex">
                        <span className={`text-lg ${factLoading ? 'animate-spin' : 'animate-bounce'}`}>{factLoading ? '⏳' : preloadedFacts.length > 0 ? '🍭' : '🔄'}</span>
                        <div className="flex-1 text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fun Fact</div>
                            <div className={`text-sm font-bold text-gray-600 truncate ${factLoading ? 'opacity-30' : ''}`}>{funFact}</div>
                        </div>
                        {preloadedFacts.length > 0 && !factLoading && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-black">{preloadedFacts.length}</span>
                        )}
                     </button>
                 </div>

                 <h2 className="text-3xl md:text-5xl font-black mb-8 text-center text-gray-800 tracking-tighter">
                    {showTranslation ? currentLangConfig.name : 'नेपाली'} <span className="text-red-600">{showTranslation ? 'Explorer!' : 'अन्वेषक!'}</span>
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 w-full px-2">
                    {[
                        { s: AppState.ALPHABET, i: '🌈', t: showTranslation ? currentLangConfig.menu.alphabetEn : currentLangConfig.menu.alphabet, c: 'indigo' },
                        { s: AppState.WORDS, i: '🧩', t: showTranslation ? currentLangConfig.menu.wordsEn : currentLangConfig.menu.words, c: 'emerald' },
                        { s: AppState.PHRASES, i: '🧁', t: showTranslation ? currentLangConfig.menu.phrasesEn : currentLangConfig.menu.phrases, c: 'rose' },
                    { s: AppState.TRACING, i: '✍️', t: showTranslation ? currentLangConfig.menu.tracingEn : currentLangConfig.menu.tracing, c: 'purple' },
                        { s: AppState.PRACTICE, i: '🎙️', t: showTranslation ? currentLangConfig.menu.practiceEn : currentLangConfig.menu.practice, c: 'blue' },
                        { s: AppState.DISCOVERY, i: '🔭', t: showTranslation ? currentLangConfig.menu.discoveryEn : currentLangConfig.menu.discovery, c: 'amber' }
                    ].map((btn, i) => (
                        <button 
                            key={i} 
                            onClick={async () => { await handleUnlockAudio(); setState(btn.s); }} 
                            className={`bg-white p-4 md:p-6 shadow-sm transition border-b-4 border-${btn.c}-500 text-center flex flex-col items-center justify-center rounded-3xl active:translate-y-1 active:border-b-0 group`}
                        >
                            <div className="text-4xl md:text-5xl group-hover:scale-110 transition">{btn.i}</div>
                            <h3 className="text-sm md:text-base font-black text-gray-800 mt-2 tracking-tight">{btn.t}</h3>
                        </button>
                    ))}
                 </div>

                 {wotd && (
                   <div className={`mt-10 w-full bg-white rounded-[40px] shadow-xl border border-white relative overflow-hidden group border-b-[10px] h-[60vh] md:h-[70vh] min-h-[320px] ${theme.headerBorder.replace('border-', 'border-b-')}`}>
                    {/* Homepage Image - Full Canvas */}
                    <img
                      src="/assets/images/Homepage.webp"
                      alt="Nepali Kids in Traditional Dress"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    {/* Text Overlay */}
                    <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-white">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest mb-2">Welcome to Nepal 🏔️</span>
                      <p className="text-xs text-white/80 font-bold">Beautiful Nepal</p>
                    </div>
                   </div>
                 )}
            </div>
        )}
        <div className={state === AppState.HOME ? 'hidden' : 'block'}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} completeWord={completeWord} />}
            {state === AppState.DISCOVERY && <CultureHub language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} googleCredential={googleCredential} />}
            {state === AppState.PHRASES && <PhrasebookSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.TRACING && <TracingPracticeSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PRACTICE && <VoicePractice language={currentLang} userProfile={userProfile!} addXp={addXp} />}
        </div>
      </main>
      {userProfile && <AssistantWidget language={currentLang} userProfile={userProfile} />}
    </div>
  );
};

export default App;
