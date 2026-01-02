
import React, { useState, useEffect, useRef } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { CultureHub } from './components/CultureHub';
import { PhrasebookSection } from './components/PhrasebookSection';
import { VoicePractice } from './components/VoicePractice';
import { initializeLanguageSession, fetchWordOfTheDay, fetchFunFact, speakText, triggerHaptic, stopAllAudio, generateTravelImage, isVoiceLimited, subscribeToBakery, BakeryStatus } from './services/geminiService';

const SoundBakery: React.FC = () => {
    const [status, setStatus] = useState<BakeryStatus>('idle');

    useEffect(() => {
        return subscribeToBakery(setStatus);
    }, []);

    if (status === 'ready' || status === 'idle') return null;

    return (
        <div className="fixed bottom-24 right-6 z-[100] p-3 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-2 transition-all animate-bounce border-2 border-yellow-100">
            <span className="text-2xl">👨‍🍳</span>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600">Bakery Open</span>
                <span className="text-[8px] font-bold text-slate-400">Making Sounds...</span>
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
        <div className="relative w-full h-[220px] md:h-[300px] bg-white rounded-[40px] shadow-2xl border-4 border-dashed border-indigo-50 overflow-hidden touch-none select-none">
            <div className="absolute top-4 right-6 text-xl font-bold text-indigo-400 z-50">Score: {score}</div>
            <div className="absolute inset-0 z-10">
                {targets.map(t => (
                    <button key={t.id} onPointerDown={() => handleCatch(t.id)} style={{ left: `${t.x}%`, top: `${t.y}%` }} className={`absolute text-4xl md:text-5xl transform -translate-x-1/2 -translate-y-1/2 transition-all active:scale-150 cursor-pointer drop-shadow-md p-2 rounded-full ${t.color}`}>{t.icon}</button>
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

  const handleEmailAuth = async () => {
    setAuthError('');
    if (!emailInput || !passwordInput) {
        setAuthError("Please fill in all fields.");
        return;
    }
    
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

  const handleProfileSelect = (p: UserProfile) => {
    setUserProfile(p);
    setState(AppState.LANGUAGE_SELECT);
    setShowProfileMenu(false);
    triggerHaptic(5);
  };

  const handleLanguageSelect = async (lang: LanguageCode) => {
    setCurrentLang(lang);
    setIsLoading(true);
    setLoadingP(0);
    await initializeLanguageSession(lang, userProfile?.voice || 'Kore', (msg, p) => { setLoadingMsg(msg); setLoadingP(p); });
    setIsLoading(false);
    setState(AppState.HOME);
    setFunFact('Tap for a cool fact!');
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
        <div className="w-24 h-24 bg-red-500 rounded-[35px] animate-bounce mb-6 shadow-2xl flex items-center justify-center text-4xl">🇳🇵</div>
        <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-800 tracking-tight">{loadingMsg}</h2>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-50 mb-10 shadow-inner">
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingP}%` }}></div>
        </div>
        <p className="text-blue-500 font-black text-lg mb-8 animate-pulse">Buckle up! We're almost there...</p>
        <LoadingGame items={currentLangConfig.gameItems} />
      </div>
    </div>
  );

  if (state === AppState.LOGIN) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50 font-['Fredoka']">
      <div className="bg-white p-8 md:p-12 rounded-[50px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] max-w-lg w-full border-b-[15px] border-indigo-100 animate-popIn overflow-hidden">
        <div className="text-center mb-8">
            <div className="text-[80px] mb-4 animate-float">🏔️</div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Nepali Explorer</h1>
            <p className="text-red-500 text-lg font-bold">Learn Nepali through magic!</p>
        </div>
        
        <div className="space-y-4 mb-6">
            {authMode === 'signup' && (
                <input type="text" value={accountNameInput} onChange={e => setAccountNameInput(e.target.value)} placeholder="Your Name" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[25px] outline-none font-bold text-lg focus:ring-4 focus:ring-indigo-50 transition" />
            )}
            <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Email Address" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[25px] outline-none font-bold text-lg focus:ring-4 focus:ring-indigo-50 transition" />
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[25px] outline-none font-bold text-lg focus:ring-4 focus:ring-indigo-50 transition" />
            
            {authError && <p className="text-rose-500 font-black text-center text-sm animate-shake">{authError}</p>}
            
            <button onClick={handleEmailAuth} disabled={isAuthLoading} className="w-full bg-red-600 text-white py-5 rounded-[25px] font-black text-xl shadow-2xl hover:scale-105 transition active:translate-y-1 border-b-[8px] border-red-800">
                {isAuthLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In 🚀' : 'Create Account ✨'}
            </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-300 font-bold text-xs">OR</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button 
            onClick={handleGoogleLogin} 
            disabled={isAuthLoading} 
            className={`w-full flex items-center justify-center gap-3 p-5 rounded-[25px] font-black shadow-xl transition-all active:translate-y-1 border-b-[6px] ${authStage === 'verifying' ? 'bg-amber-100 border-amber-300' : authStage === 'success' ? 'bg-emerald-500 border-emerald-700 text-white' : 'bg-white border-slate-100 hover:border-red-500'}`}
        >
          {authStage === 'verifying' ? (
             <div className="flex items-center gap-2">
                 <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-lg text-amber-700">Verifying...</span>
             </div>
          ) : authStage === 'success' ? (
             <span className="text-xl animate-popIn">✅ Verified!</span>
          ) : (
            <>
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-8 h-8" alt="G" />
                <span className="text-lg text-gray-700">Google Login</span>
            </>
          )}
        </button>

        <p className="mt-8 text-center text-slate-400 font-bold">
            {authMode === 'login' ? "New here?" : "Already an explorer?"}{' '}
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-red-500 hover:underline">
                {authMode === 'login' ? "Join" : "Log in"}
            </button>
        </p>
      </div>
    </div>
  );

  if (state === AppState.PROFILE_SELECT) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-amber-50 animate-fadeIn font-['Fredoka']">
      <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-gray-800 tracking-tighter">Welcome, {account?.name}!</h1>
          <p className="text-red-600 font-bold text-xl md:text-2xl">Who is learning today? 🇳🇵</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {account?.profiles.map(p => (
          <button key={p.id} onClick={() => handleProfileSelect(p)} className="flex flex-col items-center gap-4 group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] md:rounded-[50px] bg-white border-b-[10px] border-amber-100 shadow-2xl flex items-center justify-center text-6xl md:text-[100px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 transform">{p.avatar}</div>
            <span className="font-black text-2xl md:text-3xl text-gray-700 tracking-tight">{p.name}</span>
          </button>
        ))}
        <button onClick={() => { setTempName(''); setState(AppState.PROFILE_CREATE); }} className="flex flex-col items-center gap-4 group">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] md:rounded-[50px] bg-white border-4 border-dashed border-amber-200 flex items-center justify-center text-6xl text-amber-200 hover:bg-amber-100 hover:border-amber-400 transition-all duration-300 transform">+</div>
          <span className="font-black text-2xl md:text-3xl text-amber-300">Add</span>
        </button>
      </div>
      <button onClick={handleLogout} className="mt-16 text-slate-300 font-bold text-lg hover:text-slate-500 transition">Log out</button>
    </div>
  );

  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
    const edit = state === AppState.PROFILE_MANAGE;
    if (edit && !tempAccountName && account) {
        setTempAccountName(account.name || '');
        setTempName(userProfile?.name || '');
        setTempAvatar(userProfile?.avatar || AVATARS[0]);
        setTempVoice(userProfile?.voice || VOICES[0].id);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50 overflow-y-auto font-['Fredoka']">
        <div className="bg-white p-8 md:p-10 rounded-[50px] md:rounded-[60px] shadow-[0_30px_80px_rgba(0,0,0,0.1)] max-w-xl w-full animate-popIn my-8 border-b-[15px] border-indigo-100">
          <h2 className="text-4xl font-black mb-8 text-center text-gray-800 tracking-tighter">{edit ? 'Settings' : 'New Profile'}</h2>
          
          <div className="space-y-6">
            {edit && (
                <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-400 uppercase tracking-widest px-4">Parent Name</label>
                    <input type="text" value={tempAccountName} onChange={e => setTempAccountName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[25px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-lg text-center" />
                </div>
            )}
            
            <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest px-4">Kid's Name</label>
                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[25px] focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-lg text-center" />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest px-4">Select Avatar</label>
                <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                    {AVATARS.map(av => (
                        <button key={av} onClick={() => setTempAvatar(av)} className={`text-4xl p-4 rounded-[25px] transition-all duration-300 transform ${tempAvatar === av ? 'bg-red-600 shadow-2xl scale-110 -rotate-3 text-white' : 'bg-slate-50 border-2 border-slate-100 hover:bg-white active:scale-95'}`}>{av}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest px-4">Voice Style</label>
                <div className="grid grid-cols-2 gap-4">
                    {VOICES.map(v => (
                        <button key={v.id} onClick={() => { setTempVoice(v.id); setTempGender(v.gender); }} className={`p-4 rounded-[30px] border-2 flex flex-col items-center gap-1 transition-all duration-300 transform ${tempVoice === v.id ? 'border-red-600 bg-red-50 shadow-lg scale-105' : 'border-slate-50 bg-slate-50 grayscale opacity-40 hover:opacity-100 active:scale-95'}`}>
                            <span className="text-4xl">{v.icon}</span>
                            <span className="font-black text-xs text-gray-700">{v.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => { stopAllAudio(); setState(edit ? AppState.HOME : AppState.PROFILE_SELECT); }} className="flex-1 py-4 bg-slate-100 rounded-[30px] font-black text-lg text-gray-400 active:translate-y-1 transition-transform">Cancel</button>
              <button onClick={() => handleSaveProfile(edit)} className="flex-1 py-4 bg-red-600 text-white rounded-[30px] font-black text-lg shadow-2xl border-b-[8px] border-red-800 active:translate-y-1 active:border-b-0 transition-transform">Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === AppState.LANGUAGE_SELECT) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white animate-fadeIn font-['Fredoka']">
      <h1 className="text-5xl md:text-7xl font-black mb-16 md:mb-24 text-center text-gray-800 leading-none tracking-tighter">Pick a country! 🚀</h1>
      <div className="flex justify-center w-full max-w-7xl px-4">
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => handleLanguageSelect(l.code)} className="bg-white p-10 md:p-14 rounded-[70px] md:rounded-[80px] shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-500 border-b-[20px] border-slate-50 text-center group relative overflow-hidden active:translate-y-2 active:border-b-0">
            <div className="text-[120px] md:text-[180px] mb-8 group-hover:scale-110 group-hover:rotate-6 transition duration-500 transform drop-shadow-2xl">{l.flag}</div>
            <h3 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter">{l.name}</h3>
            <p className="text-red-500 font-black text-2xl md:text-3xl italic mt-4 tracking-tight">"{l.greeting}!"</p>
          </button>
        ))}
      </div>
    </div>
  );

  const voiceBusy = isVoiceLimited();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Fredoka']">
      <SoundBakery />
      <header className={`${theme.headerBg} p-3 md:p-4 border-b-4 ${theme.headerBorder} flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-xl backdrop-blur-2xl bg-opacity-95 gap-3`}>
          <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => { stopAllAudio(); setState(AppState.HOME); }} className="text-3xl md:text-4xl hover:scale-110 transition active:scale-95 drop-shadow-lg transform">🏠</button>
                <div className="flex flex-col">
                    <span className={`font-black text-lg md:text-xl leading-none ${theme.headerText} flex items-center gap-2 mb-1`}>
                        <span className="text-2xl md:text-3xl drop-shadow-sm">{currentLangConfig.flag}</span> 
                        <span className="hidden sm:inline uppercase tracking-tighter">{currentLangConfig.name}</span>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-red-500/80">Hi {userProfile?.name}!</span>
                </div>
            </div>
          </div>

          <button onClick={refreshFunFact} disabled={factLoading} className="flex-1 max-w-sm mx-2 bg-white px-5 py-2 rounded-full shadow-inner border-2 border-slate-50 flex items-center gap-3 hover:bg-slate-50 transition active:scale-95 w-full md:w-auto overflow-hidden group">
            <span className="text-2xl animate-bounce flex-shrink-0 group-hover:rotate-12 transition-transform">🍭</span>
            <span className={`text-xs md:text-sm font-bold text-gray-500 italic truncate tracking-tight ${factLoading ? 'opacity-30' : ''}`}>{funFact}</span>
          </button>

          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            <button onClick={() => setShowTranslation(!showTranslation)} className={`px-4 py-2 rounded-2xl text-[10px] font-black border-2 transition-all shadow-md active:translate-y-1 border-b-[4px] ${showTranslation ? 'bg-red-600 text-white border-red-800' : 'bg-white text-gray-300 border-slate-100'}`}>
                {showTranslation ? 'EN' : 'NP'}
            </button>
            <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-12 h-12 md:w-14 md:h-14 rounded-[18px] bg-white border-2 border-white shadow-xl flex items-center justify-center text-3xl transform hover:rotate-6 transition active:scale-90">{userProfile?.avatar}</button>
                {showProfileMenu && (
                    <div className="absolute right-0 top-16 bg-white border-b-[10px] border-slate-100 rounded-[35px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] p-6 w-64 animate-popIn z-[60]">
                        <div className="text-center mb-6">
                            <p className="font-black text-2xl text-gray-800 leading-none mb-1 tracking-tight">{userProfile?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{account?.name || account?.email}</p>
                        </div>
                        <div className="space-y-2">
                            <button onClick={() => { setShowProfileMenu(false); setState(AppState.PROFILE_MANAGE); }} className="w-full p-4 text-left hover:bg-red-50 rounded-2xl flex items-center gap-4 transition font-black text-gray-600 text-sm group">
                                <span className="text-xl group-hover:rotate-45 transition-transform">⚙️</span> Settings
                            </button>
                            <button onClick={() => { setShowProfileMenu(false); setState(AppState.PROFILE_SELECT); }} className="w-full p-4 text-left hover:bg-amber-50 rounded-2xl flex items-center gap-4 transition font-black text-amber-500 text-sm group">
                                <span className="text-xl group-hover:scale-125 transition-transform">👤</span> Switch User
                            </button>
                            <button onClick={handleLogout} className="w-full p-4 text-left hover:bg-rose-50 rounded-2xl flex items-center gap-4 transition font-black text-rose-400 mt-2 text-sm border-t-2 border-slate-50 pt-6 group">
                                <span className="text-xl group-hover:-translate-x-1 transition-transform">🚪</span> Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 pb-32 overflow-x-hidden relative">
        {/* Decorative background clouds */}
        <div className="absolute top-10 left-5 text-6xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-40 right-10 text-5xl opacity-5 animate-float pointer-events-none" style={{ animationDelay: '3s' }}>☁️</div>

        {state === AppState.HOME && (
            <div className="flex flex-col items-center py-6 animate-fadeIn">
                 <h2 className="text-5xl md:text-7xl font-black mb-12 text-center leading-none text-gray-800 px-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.05)] tracking-tighter">
                    Nepali <span className="text-red-600 block sm:inline">Explorer!</span>
                 </h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8 w-full px-4 md:px-8">
                    {[
                        { s: AppState.ALPHABET, i: '🌈', t: 'Letter Land', n: currentLangConfig.menu.alphabet, c: 'indigo', rot: '-rotate-2', blob: 'rounded-[40px] md:rounded-[50px]' },
                        { s: AppState.WORDS, i: '🧩', t: 'Word Factory', n: currentLangConfig.menu.words, c: 'emerald', rot: 'rotate-2', blob: 'rounded-[40px] md:rounded-[50px]' },
                        { s: AppState.PHRASES, i: '🧁', t: 'Chatty Club', n: currentLangConfig.menu.phrases, c: 'rose', rot: '-rotate-1', blob: 'rounded-[40px] md:rounded-[50px]' },
                        { s: AppState.PRACTICE, i: '🎙️', t: 'Voice Lab', n: currentLangConfig.menu.practice, c: 'blue', rot: 'rotate-1', blob: 'rounded-[40px] md:rounded-[50px]' },
                        { s: AppState.DISCOVERY, i: '🔭', t: 'Wonder World', n: currentLangConfig.menu.discovery, c: 'amber', rot: 'rotate-2', blob: 'rounded-[40px] md:rounded-[50px]' }
                    ].map((btn, i) => (
                        <button 
                            key={i} 
                            onClick={() => setState(btn.s)} 
                            className={`group relative bg-white p-10 md:p-12 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] transition-all border-b-[15px] border-${btn.c}-500 text-center flex flex-col items-center justify-center overflow-hidden active:translate-y-4 active:border-b-4 hover:scale-105 ${btn.rot} animate-float ${btn.blob}`}
                            style={{ animationDelay: `${i * 0.4}s`, animationDuration: '6s' }}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${btn.c}-50 rounded-bl-full opacity-40 group-hover:scale-150 transition-transform duration-1000 transform`}></div>
                            <div className={`w-24 h-24 md:w-28 md:h-28 bg-${btn.c}-50 rounded-[35px] mb-6 flex items-center justify-center text-5xl md:text-6xl group-hover:rotate-12 group-hover:scale-110 transition transform drop-shadow-xl`}>
                                {btn.i}
                            </div>
                            <h3 className="text-3xl md:text-3xl font-black text-gray-800 tracking-tighter leading-none mb-3">{btn.t}</h3>
                            <p className={`text-[10px] md:text-xs font-black text-${btn.c}-500 uppercase tracking-[0.4em]`}>{btn.n}</p>
                        </button>
                    ))}
                 </div>

                 {wotd && (
                     <div className={`mt-20 md:mt-24 w-full max-w-5xl bg-white rounded-[70px] md:rounded-[90px] p-10 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-[10px] border-white mx-4 relative overflow-hidden group flex flex-col lg:flex-row items-center gap-12 border-b-[25px] ${theme.headerBorder.replace('border-', 'border-b-')}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-[0.98] group-hover:scale-125 transition duration-[10s] transform`}></div>
                        
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/20 rounded-full blur-[80px] animate-pulse"></div>

                        <div className="relative z-10 w-full lg:w-1/2 flex flex-col text-white">
                            <span className="bg-yellow-400 text-yellow-900 self-start px-8 py-2 rounded-full font-black text-xs uppercase tracking-[0.4em] mb-8 shadow-xl animate-bounce">Daily Secret 💎</span>
                            <div className="flex flex-col gap-3 mb-8">
                                <span className="text-6xl md:text-8xl font-black drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] tracking-tighter leading-none transform">{wotd.word}</span>
                                <span className="text-2xl md:text-3xl opacity-80 font-bold italic tracking-tighter">({wotd.transliteration})</span>
                            </div>
                            <p className={`text-4xl md:text-6xl font-black text-yellow-300 mb-8 drop-shadow-xl tracking-tighter ${showTranslation ? 'visible' : 'invisible h-0 overflow-hidden'}`}>{wotd.english}</p>
                            <div className="bg-white/10 p-8 md:p-10 rounded-[45px] backdrop-blur-3xl border-2 border-white/20 shadow-inner">
                                <p className="text-xl md:text-2xl italic font-bold leading-relaxed tracking-tight">"{wotd.sentence}"</p>
                            </div>
                            <button onClick={() => speakText(wotd.word, userProfile?.voice)} disabled={voiceBusy} className="mt-10 self-start flex items-center gap-4 bg-white text-indigo-600 px-12 py-5 rounded-[35px] font-black hover:scale-110 transition shadow-2xl text-xl md:text-2xl active:translate-y-4 border-b-[10px] border-indigo-100 disabled:opacity-50 group transform">
                                <span className="group-hover:rotate-12 transition transform">{voiceBusy ? '😴' : '🔊'}</span> Magic Sound
                            </button>
                        </div>
                        <div className="relative z-10 w-full lg:w-1/2 h-[400px] md:h-[500px] rounded-[70px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-[12px] border-white/20 rotate-2 group-hover:-rotate-2 transition-all duration-[3s] transform">
                            {wotdImage ? (
                                <img src={wotdImage} alt={wotd.word} className="w-full h-full object-cover animate-fadeIn hover:scale-150 transition duration-[15s] transform" />
                            ) : (
                                <div className="w-full h-full bg-indigo-900/60 flex flex-col items-center justify-center text-8xl animate-pulse">
                                    <span className="transform animate-bounce">🎨</span>
                                    <p className="text-lg font-black text-white/50 uppercase tracking-[1em] mt-6">Painting...</p>
                                </div>
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
