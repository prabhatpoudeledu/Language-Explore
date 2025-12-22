
import React, { useState, useEffect, useRef } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, VOICES, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { CultureHub } from './components/CultureHub';
import { PhrasebookSection } from './components/PhrasebookSection';
import { initializeLanguageSession, fetchWordOfTheDay, fetchFunFact, speakText, triggerHaptic, performCloudSync, pushToCloud, stopAllAudio } from './services/geminiService';

const LoadingGame: React.FC<{ items: string[] }> = ({ items }) => {
    const [score, setScore] = useState(0);
    const [targets, setTargets] = useState<{ id: number, x: number, y: number, icon: string }[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const newItem = { 
                id: nextId.current++, 
                x: Math.random() * 80 + 10, 
                y: -10, 
                icon: items[Math.floor(Math.random() * items.length)] 
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
        <div className="relative w-full max-w-md h-[400px] bg-white rounded-[60px] shadow-2xl border-4 border-dashed border-indigo-100 overflow-hidden touch-none select-none">
            <div className="absolute top-8 right-10 text-3xl font-bold text-indigo-400 z-50 pointer-events-none">Score: {score}</div>
            <div className="absolute top-8 left-10 text-[12px] font-bold text-indigo-200 uppercase tracking-[0.3em] z-50 pointer-events-none">Tap falling icons!</div>
            
            <div className="absolute inset-0 z-10">
                {targets.map(t => (
                    <button 
                        key={t.id} 
                        onPointerDown={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            handleCatch(t.id); 
                        }} 
                        style={{ left: `${t.x}%`, top: `${t.y}%` }} 
                        className="absolute text-7xl transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-150 cursor-pointer drop-shadow-lg p-4"
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
            
            {score === 0 && <div className="absolute inset-0 flex items-center justify-center text-indigo-100 font-bold text-center px-16 text-sm pointer-events-none">Waiting for adventure... Catch the icons!</div>}
        </div>
    );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LOGIN);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('np');
  const [account, setAccount] = useState<AccountData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingP, setLoadingP] = useState(0);
  const [loadingFact, setLoadingFact] = useState('');

  const [showTranslation, setShowTranslation] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wotd, setWotd] = useState<WordOfTheDayData | null>(null);
  const [funFact, setFunFact] = useState<string>('Tap for a fun fact!');
  const [factLoading, setFactLoading] = useState(false);

  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  const [tempVoice, setTempVoice] = useState(VOICES[0].id);
  const [tempGender, setTempGender] = useState<'male' | 'female'>('male');

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const theme = currentLangConfig.theme;

  const getDb = (): AccountData[] => JSON.parse(localStorage.getItem('app_db_v3') || '[]');
  const saveDb = (db: AccountData[]) => localStorage.setItem('app_db_v3', JSON.stringify(db));

  useEffect(() => {
    if (state === AppState.HOME && userProfile) {
        fetchWordOfTheDay(currentLang).then(setWotd);
    }
  }, [state, currentLang, userProfile]);

  useEffect(() => {
    if (isLoading) {
      let i = 0;
      setLoadingFact(currentLangConfig.facts[0]);
      const int = setInterval(() => {
        i = (i + 1) % currentLangConfig.facts.length;
        setLoadingFact(currentLangConfig.facts[i]);
      }, 4000);
      return () => clearInterval(int);
    }
  }, [isLoading, currentLangConfig]);

  const refreshFunFact = async () => {
      setFactLoading(true);
      const fact = await fetchFunFact(currentLang);
      setFunFact(fact);
      setFactLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    triggerHaptic(15);
    await new Promise(r => setTimeout(r, 1500));
    
    const mockEmail = "explorer@google.com";
    const mockName = "Google Explorer";
    const mockId = "G-KID-EXPLORER";

    const db = getDb();
    let found = db.find(a => a.email.toLowerCase() === mockEmail.toLowerCase());
    
    if (!found) {
        found = { email: mockEmail, googleId: mockId, name: mockName, profiles: [] };
        db.push(found);
    }
    
    const synced = await performCloudSync(mockEmail, found);
    if (synced) {
        found = synced;
        const idx = db.findIndex(a => a.email === found?.email);
        if (idx > -1) db[idx] = found;
    }
    
    saveDb(db);
    setAccount(found);
    setIsAuthLoading(false);
    
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
    await initializeLanguageSession(lang, (msg, p) => { setLoadingMsg(msg); setLoadingP(p); });
    setIsLoading(false);
    setState(AppState.HOME);
    setFunFact('Tap me for a cool fact!');
  };

  const handleSaveProfile = async (isEdit: boolean) => {
    if (!tempName.trim() || !account) return;
    const db = getDb();
    const accIdx = db.findIndex(a => a.email === account.email);
    if (accIdx === -1) return;
    let p: UserProfile;
    if (isEdit && userProfile) {
      p = { ...userProfile, name: tempName, avatar: tempAvatar, voice: tempVoice, gender: tempGender };
      db[accIdx].profiles = account.profiles.map(old => old.id === userProfile.id ? p : old);
    } else {
      p = { 
        id: Date.now().toString(), 
        name: tempName, 
        avatar: tempAvatar, 
        voice: tempVoice, 
        gender: tempGender, 
        autoPlaySound: true, 
        xp: 0,
        completedWords: []
      };
      db[accIdx].profiles.push(p);
    }
    saveDb(db);
    setAccount(db[accIdx]);
    pushToCloud(db[accIdx]);
    handleProfileSelect(p);
  };

  const addXp = (amt: number) => {
    if (!userProfile || !account) return;
    const updated = { ...userProfile, xp: userProfile.xp + amt };
    setUserProfile(updated);
    const db = getDb();
    const aIdx = db.findIndex(a => a.email === account.email);
    if (aIdx > -1) {
      const pIdx = db[aIdx].profiles.findIndex(pr => pr.id === userProfile.id);
      if (pIdx > -1) { db[aIdx].profiles[pIdx] = updated; saveDb(db); setAccount(db[aIdx]); pushToCloud(db[aIdx]); }
    }
  };

  const completeWord = (word: string) => {
    if (!userProfile || !account) return;
    if (userProfile.completedWords.includes(word)) return;
    const updated = { ...userProfile, completedWords: [...userProfile.completedWords, word] };
    setUserProfile(updated);
    const db = getDb();
    const aIdx = db.findIndex(a => a.email === account.email);
    if (aIdx > -1) {
      const pIdx = db[aIdx].profiles.findIndex(pr => pr.id === userProfile.id);
      if (pIdx > -1) { db[aIdx].profiles[pIdx] = updated; saveDb(db); setAccount(db[aIdx]); pushToCloud(db[aIdx]); }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row items-center justify-center p-8 gap-12 animate-fadeIn">
      <div className="flex-1 flex flex-col items-center text-center max-w-lg">
        <div className="text-[160px] mb-8 animate-float drop-shadow-2xl">{currentLangConfig.flag}</div>
        <h2 className="text-5xl font-bold mb-4 text-gray-800">{loadingMsg}</h2>
        <div className="w-full h-6 bg-slate-50 rounded-full overflow-hidden mb-10 shadow-inner border-4 border-white">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000" style={{ width: `${loadingP}%` }}></div>
        </div>
        <div className="bg-white p-10 rounded-[50px] w-full border-b-[12px] border-slate-50 shadow-2xl">
          <p className="text-[12px] font-bold text-indigo-300 uppercase tracking-[0.4em] mb-4">Did you know?</p>
          <p className="text-2xl font-medium text-gray-700 italic leading-relaxed">"{loadingFact}"</p>
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col items-center">
        <LoadingGame items={currentLangConfig.gameItems} />
      </div>
    </div>
  );

  if (state === AppState.LOGIN) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50">
      <div className="bg-white p-20 rounded-[80px] shadow-2xl max-w-lg w-full border-t-[12px] border-indigo-500 animate-popIn text-center relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] text-9xl opacity-5">🌏</div>
        <div className="text-[100px] mb-10">🚀</div>
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Language Explorer</h1>
        <p className="text-gray-400 mb-16 text-xl font-medium leading-relaxed px-6">Learn, play, and discover new worlds with AI!</p>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={isAuthLoading}
          className="w-full flex items-center justify-center gap-5 bg-white border-2 border-slate-100 hover:border-indigo-500 p-8 rounded-[40px] font-bold shadow-xl transition transform active:scale-95 disabled:opacity-50"
        >
          {isAuthLoading ? (
            <span className="animate-spin text-4xl">⏳</span>
          ) : (
            <>
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-12 h-12" alt="Google" />
              <span className="text-2xl text-gray-700">Login with Google</span>
            </>
          )}
        </button>
        <p className="mt-12 text-[11px] text-gray-300 font-bold uppercase tracking-[0.2em]">Verified Secure Explorer Sign-In</p>
      </div>
    </div>
  );

  if (state === AppState.PROFILE_SELECT) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-purple-50 animate-fadeIn">
      <h1 className="text-6xl font-bold mb-20 text-gray-800">Welcome back! 👋</h1>
      <div className="flex flex-wrap justify-center gap-16">
        {account?.profiles.map(p => (
          <button key={p.id} onClick={() => handleProfileSelect(p)} className="flex flex-col items-center gap-8 group">
            <div className="w-56 h-56 rounded-[65px] bg-white border-8 border-white shadow-2xl flex items-center justify-center text-[100px] group-hover:scale-110 group-hover:border-indigo-500 transition-all transform group-hover:rotate-3">
              {p.avatar}
            </div>
            <span className="font-bold text-3xl text-gray-700">{p.name}</span>
          </button>
        ))}
        <button onClick={() => { setTempName(''); setState(AppState.PROFILE_CREATE); }} className="flex flex-col items-center gap-8 group">
          <div className="w-56 h-56 rounded-[65px] bg-indigo-50 border-8 border-dashed border-indigo-200 flex items-center justify-center text-8xl text-indigo-200 group-hover:bg-indigo-100 transition-all transform hover:scale-105">+</div >
          <span className="font-bold text-3xl text-indigo-300">New Learner</span>
        </button>
      </div>
    </div>
  );

  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
    const edit = state === AppState.PROFILE_MANAGE;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50">
        <div className="bg-white p-16 rounded-[70px] shadow-2xl max-w-2xl w-full border-t-[12px] border-indigo-600 animate-popIn">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-800">{edit ? 'Update Explorer' : 'Who are you?'}</h2>
          <div className="space-y-10">
            <input 
                type="text" 
                value={tempName} 
                onChange={e => setTempName(e.target.value)} 
                className="w-full p-8 bg-slate-50 border-4 border-slate-100 rounded-[40px] focus:ring-8 focus:ring-indigo-50 outline-none font-bold text-2xl text-center placeholder-indigo-200" 
                placeholder="Type your name here..." 
            />
            <div className="flex gap-6 overflow-x-auto py-6 scrollbar-hide px-2">
              {AVATARS.map(av => (
                <button key={av} onClick={() => setTempAvatar(av)} className={`text-7xl p-6 rounded-[35px] transition transform hover:scale-110 ${tempAvatar === av ? 'bg-indigo-600 shadow-2xl scale-125' : 'bg-slate-50 hover:bg-slate-100'}`}>{av}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VOICES.map(v => (
                <button key={v.id} onClick={() => { setTempVoice(v.id); setTempGender(v.gender); }} className={`p-8 rounded-[40px] border-4 flex items-center gap-6 transition ${tempVoice === v.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 hover:bg-slate-50'}`}>
                  <span className="text-5xl">{v.icon}</span>
                  <div className="text-left"><p className="font-bold text-xl text-gray-700">{v.label}</p><p className="text-[12px] text-gray-300 font-bold uppercase tracking-[0.2em]">{v.gender}</p></div>
                </button>
              ))}
            </div>
            <div className="flex gap-8 pt-8">
              <button onClick={() => setState(edit ? AppState.HOME : AppState.PROFILE_SELECT)} className="flex-1 p-8 bg-slate-100 rounded-[40px] font-bold text-xl text-gray-400 hover:bg-slate-200 transition">Back</button>
              <button onClick={() => handleSaveProfile(edit)} className="flex-1 p-8 bg-indigo-600 text-white rounded-[40px] font-bold text-xl shadow-2xl hover:bg-indigo-700 transition active:scale-95">Save Explorer</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === AppState.LANGUAGE_SELECT) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white animate-fadeIn">
      <h1 className="text-7xl font-bold mb-24 text-center leading-tight">Pick a country<br/>to discover! 🌎</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-7xl px-8">
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => handleLanguageSelect(l.code)} className="bg-white p-16 rounded-[80px] shadow-2xl hover:-translate-y-6 transition-all border-b-[20px] border-slate-50 text-center group relative">
            <div className="text-[170px] mb-12 group-hover:scale-110 transition drop-shadow-2xl">{l.flag}</div>
            <h3 className="text-6xl font-bold mb-4 text-gray-800">{l.name}</h3>
            <p className="text-indigo-500 font-bold text-3xl italic mb-3">"{l.greeting}!"</p>
            <p className="text-gray-300 text-[12px] font-bold uppercase tracking-[0.5em]">{l.country}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Fredoka']">
      <header className={`${theme.headerBg} p-8 border-b-4 ${theme.headerBorder} flex justify-between items-center sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95`}>
          <div className="flex items-center gap-10">
            <button onClick={() => { stopAllAudio(); setState(AppState.HOME); }} className="text-5xl hover:scale-125 transition active:scale-95 drop-shadow-md">🏠</button>
            <div className="hidden lg:flex flex-col">
                <span className={`font-bold text-3xl leading-tight ${theme.headerText} flex items-center gap-4`}>
                    <span className="text-4xl drop-shadow-sm">{currentLangConfig.flag}</span> {currentLangConfig.name}
                </span>
                <span className="text-[12px] uppercase font-bold text-gray-400 tracking-[0.4em]">{currentLangConfig.menu.home}</span>
            </div>
          </div>

          <button 
            onClick={refreshFunFact} 
            disabled={factLoading}
            className="flex-1 max-w-xl mx-8 bg-white px-10 py-4 rounded-[30px] shadow-inner border-2 border-slate-50 flex items-center gap-5 hover:bg-slate-50 transition overflow-hidden group"
          >
            <span className="text-3xl animate-pulse">💡</span>
            <span className={`text-lg font-medium text-gray-600 italic transition-all ${factLoading ? 'opacity-30 blur-sm' : ''}`}>
                {funFact}
            </span>
          </button>

          <div className="flex items-center gap-8">
            <button onClick={() => setShowTranslation(!showTranslation)} className={`px-8 py-4 rounded-[25px] text-xs font-bold border-4 transition-all shadow-xl active:scale-90 ${showTranslation ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-300 border-slate-100'}`}>
                {showTranslation ? 'ENGLISH ON' : 'NATIVE ONLY'}
            </button>
            <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-20 h-20 rounded-[30px] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-5xl overflow-hidden transform hover:rotate-3 transition active:scale-90">{userProfile?.avatar}</button>
                {showProfileMenu && (
                    <div className="absolute right-0 top-24 bg-white border-4 rounded-[50px] shadow-2xl p-8 w-80 animate-popIn z-[60] border-slate-50">
                        <div className="p-8 border-b-4 border-slate-50 mb-6 text-center">
                            <p className="font-bold text-3xl text-gray-800">{userProfile?.name}</p>
                            <div className="bg-indigo-50 inline-block px-6 py-2 rounded-full mt-4">
                                <p className="text-[12px] text-indigo-500 font-bold uppercase tracking-widest">{userProfile?.xp} XP Points</p>
                            </div>
                        </div>
                        <button onClick={() => setState(AppState.PROFILE_MANAGE)} className="w-full p-5 text-left hover:bg-slate-50 rounded-[25px] flex items-center gap-5 transition font-bold text-gray-600 text-xl"><span>⚙️</span> Settings</button>
                        <button onClick={() => setState(AppState.PROFILE_SELECT)} className="w-full p-5 text-left hover:bg-slate-50 rounded-[25px] flex items-center gap-5 transition font-bold text-gray-600 text-xl"><span>👥</span> Change User</button>
                        <button onClick={() => setState(AppState.LANGUAGE_SELECT)} className="w-full p-5 text-left hover:bg-indigo-50 rounded-[25px] flex items-center gap-5 transition font-bold text-indigo-600 text-xl"><span>✈️</span> Language</button>
                        <button onClick={() => { setState(AppState.LOGIN); setUserProfile(null); }} className="w-full p-5 text-left hover:bg-red-50 rounded-[25px] flex items-center gap-5 transition font-bold text-red-400 mt-4 text-xl"><span>🚪</span> Exit</button>
                    </div>
                )}
            </div>
          </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-10 pb-32">
        {state === AppState.HOME && (
            <div className="flex flex-col items-center py-16 animate-fadeIn">
                 <h2 className="text-7xl font-bold mb-24 text-center leading-tight">Ready for adventure,<br/>{userProfile?.name}? 🗺️</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full px-8">
                    {[
                        { s: AppState.ALPHABET, i: '🔤', t: 'Alphabet', n: currentLangConfig.menu.alphabet, c: 'indigo' },
                        { s: AppState.WORDS, i: '🧱', t: 'Words', n: currentLangConfig.menu.words, c: 'emerald' },
                        { s: AppState.PHRASES, i: '💬', t: 'Phrases', n: currentLangConfig.menu.phrases, c: 'teal' },
                        { s: AppState.DISCOVERY, i: '🎭', t: 'Discover', n: currentLangConfig.menu.discovery, c: 'orange' }
                    ].map((btn, i) => (
                        <button key={i} onClick={() => setState(btn.s)} className={`group bg-white p-12 rounded-[60px] shadow-2xl hover:-translate-y-5 transition-all border-b-[18px] border-${btn.c}-500 text-center flex flex-col items-center justify-center aspect-[1/1.1]`}>
                            <div className={`w-32 h-32 bg-${btn.c}-50 rounded-[40px] mb-10 flex items-center justify-center text-6xl group-hover:rotate-12 transition transform`}>{btn.i}</div>
                            <h3 className="text-3xl font-bold mb-2 text-gray-700">{btn.t}</h3>
                            <p className={`text-[12px] font-bold text-${btn.c}-500 uppercase tracking-[0.3em]`}>{btn.n}</p>
                        </button>
                    ))}
                 </div>
                 {wotd && (
                     <div className={`mt-32 w-full max-w-5xl bg-gradient-to-br ${theme.gradient} rounded-[80px] p-20 text-white shadow-2xl relative overflow-hidden group border-8 border-white`}>
                        <div className="absolute top-[-80px] right-[-80px] text-[350px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-[2s]">🌟</div>
                        <h4 className="text-[14px] font-bold uppercase tracking-[0.5em] opacity-80 mb-12">Mystery Word of the Day</h4>
                        <div className="flex flex-col md:flex-row items-baseline gap-10 mb-8">
                            <span className="text-[120px] font-bold drop-shadow-2xl leading-none">{wotd.word}</span>
                            <span className="text-4xl opacity-80 italic font-light">({wotd.transliteration})</span>
                        </div>
                        <p className={`text-6xl font-bold text-yellow-300 mb-12 transition-all ${showTranslation ? 'visible' : 'invisible h-0'}`}>{wotd.english}</p>
                        <div className="bg-white/10 p-12 rounded-[50px] backdrop-blur-2xl border-4 border-white/20 shadow-inner">
                            <p className="text-3xl italic leading-relaxed font-light">"{wotd.sentence}"</p>
                        </div>
                        <button onClick={() => speakText(wotd.word, userProfile?.voice)} className="mt-16 flex items-center gap-8 bg-white text-indigo-600 px-16 py-8 rounded-full font-bold hover:scale-110 transition shadow-2xl text-2xl active:scale-95"><span>🔊</span> Listen Now</button>
                     </div>
                 )}
            </div>
        )}
        <div className={state === AppState.HOME ? 'hidden' : 'block'}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} completeWord={completeWord} />}
            {state === AppState.DISCOVERY && <CultureHub language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PHRASES && <PhrasebookSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
        </div>
      </main>
    </div>
  );
};

export default App;
