
import React, { useState, useEffect, useRef } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { CultureHub } from './components/CultureHub';
import { PhrasebookSection } from './components/PhrasebookSection';
import { VoicePractice } from './components/VoicePractice';
import { initializeLanguageSession, fetchWordOfTheDay, fetchFunFact, speakText, triggerHaptic, stopAllAudio, generateTravelImage, isVoiceLimited, subscribeToBakery, BakeryStatus, unlockAudio, getAudioState } from './services/geminiService';

const SoundBakery: React.FC = () => {
    const [status, setStatus] = useState<BakeryStatus>('idle');

    useEffect(() => {
        return subscribeToBakery(setStatus);
    }, []);

    if (status === 'ready' || status === 'idle') return null;

    return (
        <div className="fixed bottom-20 right-4 z-[100] p-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl flex items-center gap-2 transition-all animate-bounce border border-yellow-100">
            <span className="text-xl">👨‍🍳</span>
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-yellow-600">Bakery Open</span>
                <span className="text-[7px] font-bold text-slate-400">Making Sounds...</span>
            </div>
        </div>
    );
};

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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('np');
  const [account, setAccount] = useState<AccountData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authStage, setAuthStage] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingP, setLoadingP] = useState(0);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [showTranslation, setShowTranslation] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wotd, setWotd] = useState<WordOfTheDayData | null>(null);
  const [wotdImage, setWotdImage] = useState<string | null>(null);
  const [funFact, setFunFact] = useState<string>('Tap for a fun fact!');
  const [factLoading, setFactLoading] = useState(false);

  const [tempName, setTempName] = useState('');
  const [tempAccountName, setTempAccountName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  const [tempVoice, setTempVoice] = useState(VOICES[0].id);
  const [tempGender, setTempGender] = useState<'male' | 'female'>('male');
  
  const [audioUnlocked, setAudioUnlocked] = useState(false);

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
  }, []);

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
      const fact = await fetchFunFact(currentLang);
      setFunFact(fact);
      setFactLoading(false);
  };

  const handleUnlockAudio = async () => {
      const success = await unlockAudio();
      if (success) setAudioUnlocked(true);
      triggerHaptic(10);
  };

  const handleEmailAuth = async () => {
    setAuthError('');
    if (!emailInput || !passwordInput) {
        setAuthError("Please fill in all fields.");
        return;
    }
    
    handleUnlockAudio();
    
    setIsAuthLoading(true);
    triggerHaptic(10);
    await new Promise(r => setTimeout(r, 1000));
    
    const db = getDb();
    if (authMode === 'login') {
        const found = db.find(a => a.email.toLowerCase() === emailInput.toLowerCase() && a.password === passwordInput);
        if (found) {
            setAccount(found);
            setState(AppState.PROFILE_SELECT);
        } else {
            setAuthError("Incorrect email or password.");
        }
    } else {
        const exists = db.find(a => a.email.toLowerCase() === emailInput.toLowerCase());
        if (exists) {
            setAuthError("Email already in use.");
        } else {
            const newAcc: AccountData = {
                email: emailInput,
                password: passwordInput,
                name: accountNameInput || emailInput.split('@')[0],
                profiles: []
            };
            db.push(newAcc);
            saveDb(db);
            setAccount(newAcc);
            setState(AppState.PROFILE_CREATE);
        }
    }
    setIsAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    handleUnlockAudio();
    
    setIsAuthLoading(true);
    setAuthStage('verifying');
    triggerHaptic(15);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const mockEmail = "explorer.kid@gmail.com";
    const fetchedNameFromGoogle = "Google Explorer";
    
    const db = getDb();
    let found = db.find(a => a.email.toLowerCase() === mockEmail.toLowerCase());
    
    if (!found) { 
        found = { 
            email: mockEmail, 
            googleId: "12345", 
            name: fetchedNameFromGoogle, 
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
  };

  const handleProfileSelect = async (p: UserProfile) => {
    handleUnlockAudio();
    setUserProfile(p);
    // Force Nepali directly to jump into the app fast
    setCurrentLang('np');
    setIsLoading(true);
    setLoadingP(0);
    await initializeLanguageSession('np', p.voice || 'Kore', (msg, p) => { setLoadingMsg(msg); setLoadingP(p); });
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
      p = { ...userProfile, name: tempName, avatar: tempAvatar, voice: tempVoice, gender: tempGender };
      updatedAccount.profiles = updatedAccount.profiles.map(old => old.id === userProfile.id ? p : old);
    } else {
      p = { id: Date.now().toString(), name: tempName, avatar: tempAvatar, voice: tempVoice, gender: tempGender, autoPlaySound: true, xp: 0, completedWords: [] };
      updatedAccount.profiles = [...updatedAccount.profiles, p];
    }
    
    setAccount(updatedAccount);
    handleProfileSelect(p);
  };

  const handleLogout = () => {
      localStorage.removeItem('current_account_v12');
      setAccount(null);
      setUserProfile(null);
      setEmailInput('');
      setPasswordInput('');
      setAuthMode('login');
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
        <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-float">🏔️</div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Nepali Explorer</h1>
            <p className="text-red-500 text-sm font-bold">Start your magic journey!</p>
        </div>
        
        <div className="space-y-3 mb-4">
            {authMode === 'signup' && (
                <input type="text" value={accountNameInput} onChange={e => setAccountNameInput(e.target.value)} placeholder="Your Name" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-base focus:border-red-400 transition" />
            )}
            <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Email Address" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-base focus:border-red-400 transition" />
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-base focus:border-red-400 transition" />
            
            {authError && <p className="text-rose-500 font-black text-center text-xs animate-shake">{authError}</p>}
            
            <button onClick={handleEmailAuth} disabled={isAuthLoading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:translate-y-1 border-b-4 border-red-800 transition">
                {isAuthLoading ? '...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
        </div>

        <button 
            onClick={handleGoogleLogin} 
            disabled={isAuthLoading} 
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-black shadow-md border border-slate-100 ${authStage === 'verifying' ? 'bg-amber-100 border-amber-300' : authStage === 'success' ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-white hover:border-red-500'} transition`}
        >
          {authStage === 'verifying' ? 'Verifying...' : authStage === 'success' ? '✅ Welcome!' : 'Google Login'}
        </button>

        <p className="mt-6 text-center text-slate-400 text-sm font-bold">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-red-500 hover:underline">
                {authMode === 'login' ? "New here? Join us!" : "Already an explorer?"}
            </button>
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
      <button onClick={handleLogout} className="mt-12 text-slate-300 text-sm font-bold hover:text-slate-500 transition underline">Switch Account</button>
    </div>
  );

  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
    // Fix: Corrected variable initialization to avoid double assignment and Temporal Dead Zone error.
    const edit = state === AppState.PROFILE_MANAGE;
    if (edit && !tempAccountName && account) {
        setTempAccountName(account.name || '');
        setTempName(userProfile?.name || '');
        setTempAvatar(userProfile?.avatar || AVATARS[0]);
        setTempVoice(userProfile?.voice || VOICES[0].id);
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

            <div className="flex gap-3 pt-2">
              <button onClick={() => { stopAllAudio(); setState(edit ? AppState.HOME : AppState.PROFILE_SELECT); }} className="flex-1 py-3 bg-white border border-slate-100 text-gray-400 rounded-xl font-black text-sm transition">Cancel</button>
              <button onClick={() => handleSaveProfile(edit)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg border-b-4 border-red-800 transition">Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NOTE: state === AppState.LANGUAGE_SELECT is now unreachable via normal UI flow to keep focus on Nepali Explorer.

  const voiceBusy = isVoiceLimited();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Fredoka']">
      <SoundBakery />
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
            <span className="text-sm animate-bounce">🍭</span>
            <span className={`text-[10px] font-bold text-gray-500 italic truncate ${factLoading ? 'opacity-30' : ''}`}>{funFact}</span>
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
                 <h2 className="text-3xl md:text-5xl font-black mb-8 text-center text-gray-800 tracking-tighter">
                    {showTranslation ? currentLangConfig.name : 'नेपाली'} <span className="text-red-600">{showTranslation ? 'Explorer!' : 'अन्वेषक!'}</span>
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 w-full px-2">
                    {[
                        { s: AppState.ALPHABET, i: '🌈', t: showTranslation ? currentLangConfig.menu.alphabetEn : currentLangConfig.menu.alphabet, c: 'indigo' },
                        { s: AppState.WORDS, i: '🧩', t: showTranslation ? currentLangConfig.menu.wordsEn : currentLangConfig.menu.words, c: 'emerald' },
                        { s: AppState.PHRASES, i: '🧁', t: showTranslation ? currentLangConfig.menu.phrasesEn : currentLangConfig.menu.phrases, c: 'rose' },
                        { s: AppState.PRACTICE, i: '🎙️', t: showTranslation ? currentLangConfig.menu.practiceEn : currentLangConfig.menu.practice, c: 'blue' },
                        { s: AppState.DISCOVERY, i: '🔭', t: showTranslation ? currentLangConfig.menu.discoveryEn : currentLangConfig.menu.discovery, c: 'amber' }
                    ].map((btn, i) => (
                        <button 
                            key={i} 
                            onClick={() => { handleUnlockAudio(); setState(btn.s); }} 
                            className={`bg-white p-4 md:p-6 shadow-sm transition border-b-4 border-${btn.c}-500 text-center flex flex-col items-center justify-center rounded-3xl active:translate-y-1 active:border-b-0 group`}
                        >
                            <div className="text-4xl md:text-5xl group-hover:scale-110 transition">{btn.i}</div>
                            <h3 className="text-sm md:text-base font-black text-gray-800 mt-2 tracking-tight">{btn.t}</h3>
                        </button>
                    ))}
                 </div>

                 {wotd && (
                     <div className={`mt-10 w-full bg-white rounded-[40px] p-6 shadow-xl border border-white relative overflow-hidden group flex flex-col md:flex-row items-center gap-6 border-b-[10px] ${theme.headerBorder.replace('border-', 'border-b-')}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-[0.98]`}></div>
                        <div className="relative z-10 w-full md:w-1/2 flex flex-col text-white">
                            <span className="bg-yellow-400 text-yellow-900 self-start px-4 py-1 rounded-full font-black text-[8px] uppercase tracking-widest mb-4">Magic Word 💎</span>
                            <div className="mb-4">
                                <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{wotd.word}</span>
                                <span className="text-lg opacity-80 block italic">({wotd.transliteration})</span>
                            </div>
                            <p className={`text-3xl font-black text-yellow-300 mb-4 tracking-tighter ${showTranslation ? '' : 'hidden'}`}>{wotd.english}</p>
                            <button onClick={() => speakText(wotd.word, userProfile?.voice)} disabled={voiceBusy} className="self-start flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-[20px] font-black shadow-lg text-sm active:translate-y-1 transition border-b-4 border-indigo-100 disabled:opacity-50">
                                🔊 Hear Sound
                            </button>
                        </div>
                        <div className="relative z-10 w-full md:w-1/2 h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white/20">
                            {wotdImage ? (
                                <img src={wotdImage} alt={wotd.word} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-indigo-900/60 flex items-center justify-center text-4xl animate-pulse">🎨</div>
                            )}
                        </div>
                     </div>
                 )}
            </div>
        )}
        <div className={state === AppState.HOME ? 'hidden' : 'block'}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} completeWord={completeWord} />}
            {state === AppState.DISCOVERY && <CultureHub language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PHRASES && <PhrasebookSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PRACTICE && <VoicePractice language={currentLang} userProfile={userProfile!} addXp={addXp} />}
        </div>
      </main>
    </div>
  );
};

export default App;
