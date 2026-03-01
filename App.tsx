
import React, { useState, useEffect, useRef } from 'react';
import { AppState, LanguageCode, LANGUAGES, UserProfile, AVATARS, AccountData, WordOfTheDayData } from './types';
import { AlphabetSection } from './components/AlphabetSection';
import { WordBuilder } from './components/WordBuilder';
import { CultureHub } from './components/CultureHub';
import { PhrasebookSection } from './components/PhrasebookSection';
import { TracingPracticeSection } from './components/TracingPracticeSection';
import { NumberSection } from './components/NumberSection';
import { VocabularySection } from './components/VocabularySection';
import { VoicePractice } from './components/VoicePractice';
import { AssistantWidget } from './components/AssistantWidget';
import { initializeLanguageSession, fetchWordOfTheDay, fetchFunFact, speakText, triggerHaptic, stopAllAudio, generateTravelImage, isVoiceLimited, unlockAudio, getAudioState, resolveVoiceId, setSoundEnabled } from './services/geminiService';

const APP_INFO = {
  name: 'Bolai',
  nameEn: 'Bolai',
  tagline: 'मिठो बोल, स्पष्ट सुन!',
  taglineEn: 'Speak sweetly, listen clearly!',
  version: '0.0.0',
  buildDate: 'Feb 24, 2026'
};

const CONTACT_EMAIL = 'support@bolai.io';
const CONTACT_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;
const CONTACT_LAST_SENT_KEY = 'bolai_contact_last_sent';

const AppInfoHeader: React.FC<{
  showControls?: boolean;
  avatar?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  onAvatarClick?: () => void;
  blend?: boolean;
  onLogout?: () => void;
}> = ({ showControls = false, avatar, soundEnabled, onToggleSound, showTranslation, onToggleTranslation, onAvatarClick, blend = false, onLogout }) => (
  <div className={`w-full px-3 py-1.5 ${blend ? 'bg-transparent' : 'bg-gradient-to-r from-red-600 via-red-500 to-blue-700 border-b-2 border-blue-800'}`}>
    <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
      <div className="flex-1 flex items-center justify-center gap-2 text-center leading-tight">
        <div className="w-9 h-9 rounded-2xl bg-white shadow-md flex items-center justify-center">
          <img
            src="/assets/images/namaste-kids.png"
            alt="Kids doing namaste"
            className="w-7 h-7 object-contain"
          />
        </div>
        <div>
          <div className="text-base font-black text-white tracking-tight">{APP_INFO.name}</div>
          <div className="text-[9px] font-black text-white/90 uppercase tracking-widest">
            {showTranslation ? APP_INFO.taglineEn : APP_INFO.tagline}
          </div>
        </div>
      </div>
      {showControls ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTranslation}
            className="px-2.5 py-1 rounded-xl text-[9px] font-black border border-white/60 bg-white/90 text-red-600 shadow-sm"
          >
            {showTranslation ? 'EN' : 'NP'}
          </button>
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-2xl bg-white/90 border border-white/60 shadow-sm flex items-center justify-center text-base"
            aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/60 bg-white/90 text-blue-700 shadow-sm"
            >
              Log out
            </button>
          )}
          <button
            onClick={onAvatarClick}
            className="w-9 h-9 rounded-2xl bg-white/90 border border-white/60 shadow-sm flex items-center justify-center text-xl"
            aria-label="Profile"
          >
            {avatar || '🙂'}
          </button>
        </div>
      ) : null}
    </div>
  </div>
);

const AppInfoFooter: React.FC<{ showTranslation?: boolean }> = ({ showTranslation = true }) => (
  <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-blue-700 border-t-2 border-blue-800 px-4 py-2">
    <div className="max-w-6xl mx-auto text-center">
      <div className="text-[11px] font-black text-white tracking-tight">{showTranslation ? APP_INFO.nameEn : APP_INFO.name}</div>
      <div className="text-[9px] font-black text-white/90 uppercase tracking-widest">
        {showTranslation ? APP_INFO.taglineEn : APP_INFO.tagline}
      </div>
    </div>
  </div>
);

const BottomNav: React.FC<{
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}> = ({ currentState, onNavigate }) => {
  const items = [
    { state: AppState.HOME, label: 'Home', icon: '🏠' },
    { state: AppState.VOCABULARY, label: 'Learn', icon: '📚' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t-2 border-blue-800 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-around">
        {items.map(item => {
          const isActive = currentState === item.state;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.state)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition ${isActive ? 'bg-red-100 text-red-700' : 'text-slate-400'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
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
  const [wotd, setWotd] = useState<WordOfTheDayData | null>(null);
  const [wotdImage, setWotdImage] = useState<string | null>(null);
  type FactLang = 'en' | 'np';
  const [funFact, setFunFact] = useState<string>('Tap for a cool fact!');
  const [factLoading, setFactLoading] = useState(false);
  const [preloadedFacts, setPreloadedFacts] = useState<Record<FactLang, string[]>>({ en: [], np: [] });
  const [wotdKidsImage, setWotdKidsImage] = useState<string | null>(null);

  const [tempName, setTempName] = useState('');
  const [tempAccountName, setTempAccountName] = useState('');
  const [tempAvatar, setTempAvatar] = useState(AVATARS[0]);
  const [tempGender, setTempGender] = useState<'male' | 'female'>('male');
  const [tempAssistantPersist, setTempAssistantPersist] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [aiGuardMessage, setAiGuardMessage] = useState('');
  const [showAiGuard, setShowAiGuard] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactError, setContactError] = useState('');
  const aiGuardTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    const handleAiGuard = (event: any) => {
      const message = event?.detail?.message || 'Please wait a moment.';
      setAiGuardMessage(message);
      setShowAiGuard(true);
      if (aiGuardTimerRef.current) window.clearTimeout(aiGuardTimerRef.current);
      aiGuardTimerRef.current = window.setTimeout(() => {
        setShowAiGuard(false);
      }, 2200);
    };

    window.addEventListener('ai-guard', handleAiGuard);
    return () => {
      window.removeEventListener('ai-guard', handleAiGuard);
      if (aiGuardTimerRef.current) window.clearTimeout(aiGuardTimerRef.current);
    };
  }, []);

  const currentLangConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const theme = currentLangConfig.theme;

  const getDb = (): AccountData[] => {
    const saved = localStorage.getItem('app_db_v12');
    if (saved) return JSON.parse(saved);
    const defaultDb = [{ 
      email: 'parent@example.com', 
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
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

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

    const factLang: FactLang = showTranslation ? 'en' : 'np';
    const funFactPlaceholder = showTranslation ? 'Tap for a cool fact!' : 'रमाइलो तथ्यका लागि ट्याप गर्नुहोस्!';

    const consumePreloadedFact = (langKey: FactLang): string | null => {
      let nextFact: string | null = null;
      setPreloadedFacts(prev => {
        const list = prev[langKey];
        if (list.length === 0) return prev;
        nextFact = list[0];
        return { ...prev, [langKey]: list.slice(1) };
      });
      return nextFact;
    };

    const refreshFunFact = async () => {
      setFactLoading(true);

      // Use preloaded fact if available
        const cachedFact = consumePreloadedFact(factLang);
        if (cachedFact) {
          setFunFact(cachedFact);
          setFactLoading(false);
          // Start preloading a new fact in background
          preloadNextFact(factLang);
          return;
        }

      // Fallback to direct fetch
        const fact = await fetchFunFact(currentLang, factLang);
      setFunFact(fact);
      setFactLoading(false);
      // Start preloading facts in background
        preloadNextFact(factLang);
  };

      const preloadNextFact = async (langKey: FactLang) => {
      try {
          const fact = await fetchFunFact(currentLang, langKey);
          setPreloadedFacts(prev => ({ ...prev, [langKey]: [...prev[langKey], fact] }));
      } catch (e) {
          // Silently fail for background preloading
      }
  };

    const handlePlayWotd = async () => {
      if (!wotd || !userProfile) return;
      await handleUnlockAudio();
      speakText(wotd.word, resolveVoiceId());
      triggerHaptic(5);
    };

  // Preload facts when component mounts or language changes
    useEffect(() => {
      if (userProfile && currentLang) {
        // Preload 3 facts in background for both EN and NP
        setTimeout(() => {
          preloadNextFact('en');
          preloadNextFact('np');
          setTimeout(() => {
            preloadNextFact('en');
            preloadNextFact('np');
          }, 1000);
          setTimeout(() => {
            preloadNextFact('en');
            preloadNextFact('np');
          }, 2000);
        }, 2000);
      }
    }, [currentLang, userProfile]);

    useEffect(() => {
      if (!userProfile || !currentLang) return;
      setFunFact(funFactPlaceholder);
      const cachedFact = consumePreloadedFact(factLang);
      if (cachedFact) {
        setFunFact(cachedFact);
        preloadNextFact(factLang);
        return;
      }
      fetchFunFact(currentLang, factLang).then(setFunFact);
    }, [showTranslation, currentLang, userProfile]);

  const handleUnlockAudio = async () => {
      const success = await unlockAudio();
      if (success) {
        setAudioUnlocked(true);
      }
      triggerHaptic(10);
  };

  const toggleSound = () => {
    setSoundEnabledState(prev => !prev);
    triggerHaptic(8);
  };

  const getContactLastSent = () => {
    const raw = localStorage.getItem(CONTACT_LAST_SENT_KEY);
    if (!raw) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const isContactLocked = () => Date.now() - getContactLastSent() < CONTACT_LIMIT_MS;
  const getContactNextDate = () => new Date(getContactLastSent() + CONTACT_LIMIT_MS);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (isContactLocked()) {
      setContactStatus('error');
      setContactError('You can send one message per week. Please try again later.');
      return;
    }

    if (!contactSubject.trim() || !contactMessage.trim()) {
      setContactStatus('error');
      setContactError('Please fill in both subject and message.');
      return;
    }

    try {
      setContactStatus('sending');
      const subject = encodeURIComponent(contactSubject.trim());
      const body = encodeURIComponent(contactMessage.trim());
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      localStorage.setItem(CONTACT_LAST_SENT_KEY, Date.now().toString());
      setContactStatus('sent');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      setContactStatus('error');
      setContactError('Sorry, the message could not be opened.');
    }
  };

  const menuItems = [
    { state: AppState.ALPHABET, label: 'Alphabet', icon: '🌈' },
    { state: AppState.WORDS, label: 'Words', icon: '🧩' },
    { state: AppState.VOCABULARY, label: 'Learn', icon: '📚' },
    { state: AppState.NUMBERS, label: 'Numbers', icon: '🔢' },
    { state: AppState.PHRASES, label: 'Phrases', icon: '🧁' },
    { state: AppState.TRACING, label: 'Tracing', icon: '✍️' },
    { state: AppState.PRACTICE, label: 'Practice', icon: '🎙️' },
    { state: AppState.DISCOVERY, label: 'Discovery', icon: '🔭' }
  ];

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
    await initializeLanguageSession('np', resolveVoiceId(), (msg, p) => { setLoadingMsg(msg); setLoadingP(p); });
    setIsLoading(false);
    setState(AppState.HOME);
    setFunFact('Tap for a cool fact!');
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
      p = { ...userProfile, name: tempName, avatar: tempAvatar, voice: 'Kore', gender: tempGender, assistantPersist: tempAssistantPersist };
      updatedAccount.profiles = updatedAccount.profiles.map(old => old.id === userProfile.id ? p : old);
    } else {
      p = { id: Date.now().toString(), name: tempName, avatar: tempAvatar, voice: 'Kore', gender: tempGender, autoPlaySound: true, assistantPersist: true, xp: 0, completedWords: [] };
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

    const handleSwitchAccount = () => {
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
    <div className="min-h-screen bg-white flex flex-col animate-fadeIn overflow-hidden">
      <AppInfoHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
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
      <AppInfoFooter showTranslation={showTranslation} />
    </div>
  );

  if (state === AppState.LOGIN) return (
    <div className="min-h-screen flex flex-col bg-white font-['Fredoka']">
      <AppInfoHeader />
      <div className="flex-1 flex items-center justify-center p-4">
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
      <AppInfoFooter />
    </div>
  );

  if (state === AppState.PROFILE_SELECT) return (
    <div className="min-h-screen flex flex-col bg-amber-50 animate-fadeIn font-['Fredoka']">
      <AppInfoHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!audioUnlocked && (
          <button
            onClick={handleUnlockAudio}
            onPointerUp={handleUnlockAudio}
            className="mb-6 px-5 py-3 rounded-2xl bg-white border-2 border-dashed border-red-200 text-red-600 font-black text-xs uppercase tracking-[0.2em] shadow-sm"
          >
            Tap to Enable Sound
          </button>
        )}
        <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-1 text-gray-800 tracking-tighter">Hi, {account?.name}!</h1>
            <p className="text-red-600 font-bold text-lg">Pick your learner ✨</p>
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
        <button onClick={handleSwitchAccount} className="mt-12 text-slate-300 text-sm font-bold hover:text-slate-500 transition underline">Switch Account</button>
      </div>
      <AppInfoFooter />
    </div>
  );

  if (state === AppState.PROFILE_CREATE || state === AppState.PROFILE_MANAGE) {
    const edit = state === AppState.PROFILE_MANAGE;
    if (edit && !tempAccountName && account) {
        setTempAccountName(account.name || '');
        setTempName(userProfile?.name || '');
        setTempAvatar(userProfile?.avatar || AVATARS[0]);
      setTempAssistantPersist(userProfile?.assistantPersist ?? true);
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-['Fredoka']">
        <AppInfoHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl max-w-sm w-full border border-slate-100">
            <h2 className="text-2xl font-black mb-6 text-center text-gray-800 tracking-tighter">{edit ? 'Settings' : 'New Hero'}</h2>

            {!audioUnlocked && (
              <button
                onClick={handleUnlockAudio}
                onPointerUp={handleUnlockAudio}
                className="mb-5 w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-dashed border-red-200 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm"
              >
                Tap to Enable Sound
              </button>
            )}
            
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
              {edit && (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-500 font-black text-sm shadow-sm transition"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
        <AppInfoFooter />
      </div>
    );
  }

  const voiceBusy = isVoiceLimited();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EF] font-['Fredoka']">
      {showAiGuard && (
        <div className="fixed top-4 left-1/2 z-[1100] -translate-x-1/2 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-black shadow-lg">
          {aiGuardMessage}
        </div>
      )}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-blue-700 border-b-2 border-blue-800">
        <AppInfoHeader
          showControls
          avatar={userProfile?.avatar}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          showTranslation={showTranslation}
          onToggleTranslation={() => setShowTranslation(!showTranslation)}
          onAvatarClick={() => setState(AppState.PROFILE_MANAGE)}
          blend
        />
        <div className="hidden lg:block">
          <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center justify-between">
            <button
              onClick={() => { stopAllAudio(); setState(AppState.HOME); setShowMenuDropdown(false); }}
              className="px-4 py-2 rounded-2xl bg-white/90 text-red-600 font-black text-sm shadow-sm"
            >
              🏠 Home
            </button>
            {state !== AppState.HOME && (
              <div className="relative">
                <button
                  onClick={() => setShowMenuDropdown(prev => !prev)}
                  className="px-4 py-2 rounded-2xl bg-white/90 border-2 border-white/70 text-blue-700 font-black text-sm shadow-sm"
                >
                  📚 Menu
                </button>
                {showMenuDropdown && (
                  <div className="absolute left-0 mt-2 w-56 bg-gradient-to-br from-white via-red-50 to-blue-50 border-2 border-blue-800 rounded-3xl shadow-xl p-2 z-50">
                    {menuItems.map(item => (
                      <button
                        key={item.label}
                        onClick={() => {
                          stopAllAudio();
                          setState(item.state);
                          setShowMenuDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-2xl hover:bg-red-100 font-black text-sm text-slate-700 flex items-center gap-2"
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 pb-20 relative overflow-x-hidden">
        {state === AppState.HOME && (
            <div className="flex flex-col items-center py-4 animate-fadeIn">
                 {/* Greeting */}
                 <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">
                       {userProfile?.avatar || '🙂'}
                     </div>
                     <div>
                       <div className="text-base md:text-lg font-black text-slate-800">
                         {showTranslation ? `Namaste, ${userProfile?.name || 'Learner'}!` : `नमस्ते, ${userProfile?.name || 'विद्यार्थी'}!`}
                       </div>
                       <div className="text-xs md:text-sm font-bold text-slate-500">
                         {showTranslation ? 'What shall we learn today?' : 'आज के सिक्ने?'}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Today's Word */}
                 {wotd && (
                   <div className="w-full max-w-4xl bg-emerald-500 text-white rounded-[28px] p-5 md:p-6 shadow-md mb-6 relative overflow-hidden">
                     <div className="absolute right-4 top-4 opacity-30 text-4xl">📚</div>
                     <div className="text-[10px] uppercase tracking-widest font-black opacity-90">Today's word</div>
                     <div className="text-3xl md:text-4xl font-black mt-1">{wotd.word}</div>
                     <div className="text-sm font-black opacity-90 mt-1">{wotd.english}</div>
                     <div className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {wotd.transliteration}
                     </div>
                     <button
                       onClick={handlePlayWotd}
                       className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                       aria-label="Play word"
                     >
                       🔊
                     </button>
                   </div>
                 )}

                 {/* Mobile Fun Fact Button */}
                 <div className="md:hidden w-full max-w-sm mb-6">
                     <button onClick={refreshFunFact} disabled={factLoading} className="w-full bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100 items-center gap-3 hover:bg-slate-50 transition flex">
                        <span className={`text-lg ${factLoading ? 'animate-spin' : 'animate-bounce'}`}>{factLoading ? '⏳' : preloadedFacts[factLang].length > 0 ? '🍭' : '🔄'}</span>
                        <div className="flex-1 text-left">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fun Fact</div>
                            <div className={`text-sm font-bold text-gray-600 whitespace-normal break-words leading-snug ${factLoading ? 'opacity-30' : ''}`}>{funFact}</div>
                        </div>
                        {preloadedFacts[factLang].length > 0 && !factLoading && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-black">{preloadedFacts[factLang].length}</span>
                        )}
                     </button>
                 </div>

                 <div className="w-full max-w-4xl">
                   <div className="text-lg font-black text-slate-800 mb-3">Learning Areas</div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 w-full px-2">
                    {[
                        { s: AppState.ALPHABET, i: '✍️', labelEn: currentLangConfig.menu.alphabetEn, labelNp: currentLangConfig.menu.alphabet, bg: 'bg-[#FDE1DF]' },
                        { s: AppState.NUMBERS, i: '🔢', labelEn: currentLangConfig.menu.numbersEn, labelNp: currentLangConfig.menu.numbers, bg: 'bg-[#DDF4F1]' },
                        { s: AppState.VOCABULARY, i: '📚', labelEn: currentLangConfig.menu.vocabularyEn, labelNp: currentLangConfig.menu.vocabulary, bg: 'bg-[#E6E1FA]' },
                        { s: AppState.PHRASES, i: '💬', labelEn: currentLangConfig.menu.phrasesEn, labelNp: currentLangConfig.menu.phrases, bg: 'bg-[#DFF1FF]' },
                        { s: AppState.WORDS, i: '🧩', labelEn: currentLangConfig.menu.wordsEn, labelNp: currentLangConfig.menu.words, bg: 'bg-[#FFE9CC]' },
                        { s: AppState.TRACING, i: '✏️', labelEn: currentLangConfig.menu.tracingEn, labelNp: currentLangConfig.menu.tracing, bg: 'bg-[#FFDCE6]' },
                        { s: AppState.PRACTICE, i: '🎙️', labelEn: currentLangConfig.menu.practiceEn, labelNp: currentLangConfig.menu.practice, bg: 'bg-[#DFF7E8]' },
                        { s: AppState.DISCOVERY, i: '🏔️', labelEn: currentLangConfig.menu.discoveryEn, labelNp: currentLangConfig.menu.discovery, bg: 'bg-[#FFE0D1]' }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={async () => { await handleUnlockAudio(); setState(btn.s); }}
                            className={`${btn.bg} p-4 md:p-5 shadow-sm transition text-left flex flex-col justify-between rounded-[26px] active:translate-y-0.5 group min-h-[120px]`}
                        >
                            <div className="w-9 h-9 rounded-2xl bg-white/70 flex items-center justify-center text-xl">
                              {btn.i}
                            </div>
                            <div className="mt-3">
                              <div className="text-sm font-black text-slate-800">{btn.labelEn}</div>
                              <div className="text-[10px] font-black text-slate-500">{btn.labelNp}</div>
                            </div>
                        </button>
                    ))}
                 </div>

                 <div className={`hidden lg:block mt-10 w-full bg-white rounded-[40px] shadow-xl border border-white relative overflow-hidden group border-b-[10px] h-[60vh] md:h-[70vh] min-h-[320px] ${theme.headerBorder.replace('border-', 'border-b-')}`}>
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

                 <div className="mt-10 w-full grid gap-4 md:grid-cols-2">
                   <div className="bg-white rounded-[32px] shadow-xl border border-white p-6">
                     <div className="text-xs font-black text-red-500 uppercase tracking-widest">
                       {showTranslation ? 'About Us' : 'हाम्रो बारेमा'}
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mt-2">बोलाई</h3>
                     <p className="text-sm font-bold text-slate-500 mt-3 leading-relaxed">
                       {showTranslation
                         ? 'Bolai is a playful Nepali learning space for kids. It blends letters, numbers, tracing, vocabulary, songs, and voice practice into bite-sized adventures that build confidence in speaking and listening. The app supports Nepali kids by reinforcing language fundamentals at home, celebrating culture, and making everyday practice fun.'
                         : 'बोलाई बच्चाहरूका लागि रमाइलो नेपाली सिकाइको ठाउँ हो। यसले अक्षर, अंक, ट्रेसिङ, शब्दावली, गीतहरू र बोली अभ्यासलाई स-साना रमाइला साहसिक कार्यहरूमा मिसाएर बोल्ने र सुन्ने आत्मविश्वास बढाउँछ। यो एपले घरमै नेपाली बच्चाहरूलाई भाषाको आधारभूत कुराहरू मजबुत बनाउँदै संस्कृति मनाउँछ र दैनिक अभ्यासलाई पूर्ण रमाइलो बनाउँछ।'}
                     </p>
                   </div>
                   <div className="bg-white rounded-[32px] shadow-xl border border-white p-6">
                     <div className="text-xs font-black text-blue-600 uppercase tracking-widest">Contact Us</div>
                     <h3 className="text-2xl font-black text-slate-800 mt-2">Stay Connected</h3>
                     <p className="text-sm font-bold text-slate-500 mt-3 leading-relaxed">
                       Send us feedback or ideas. Your message goes straight to our team.
                     </p>

                     <button
                       type="button"
                       onClick={() => setContactOpen(prev => !prev)}
                       className="mt-4 px-4 py-2 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-sm"
                     >
                       {contactOpen ? 'Close' : 'Contact us'}
                     </button>

                     {contactOpen && (
                       <form className="mt-4 space-y-3" onSubmit={handleContactSubmit}>
                         <input
                           type="text"
                           value={contactSubject}
                           onChange={e => setContactSubject(e.target.value)}
                           placeholder="Subject"
                           className="w-full p-3 rounded-2xl border border-slate-100 bg-white font-bold text-sm"
                         />
                         <textarea
                           value={contactMessage}
                           onChange={e => setContactMessage(e.target.value)}
                           placeholder="Message"
                           rows={4}
                           className="w-full p-3 rounded-2xl border border-slate-100 bg-white font-bold text-sm resize-none"
                         />
                         <div className="flex items-center justify-between gap-3">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             One message per week
                           </div>
                           <button
                             type="submit"
                             disabled={contactStatus === 'sending' || isContactLocked()}
                             className="px-4 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-sm disabled:opacity-40"
                           >
                             {contactStatus === 'sending' ? 'Opening mail...' : 'Send'}
                           </button>
                         </div>
                         {isContactLocked() && (
                           <div className="text-[10px] font-black text-amber-500">
                             Next message available on {getContactNextDate().toLocaleDateString()}.
                           </div>
                         )}
                         {contactStatus === 'sent' && (
                           <div className="text-[10px] font-black text-emerald-500">Message sent. Thank you!</div>
                         )}
                         {contactStatus === 'error' && contactError && (
                           <div className="text-[10px] font-black text-rose-500">{contactError}</div>
                         )}
                       </form>
                     )}
                   </div>
                 </div>
            </div>
        )}
        <div className={state === AppState.HOME ? 'hidden' : 'block'}>
            {state === AppState.ALPHABET && <AlphabetSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.WORDS && <WordBuilder language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} completeWord={completeWord} />}
            {state === AppState.NUMBERS && <NumberSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.VOCABULARY && <VocabularySection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.DISCOVERY && <CultureHub language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} googleCredential={googleCredential} />}
            {state === AppState.PHRASES && <PhrasebookSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.TRACING && <TracingPracticeSection language={currentLang} userProfile={userProfile!} showTranslation={showTranslation} addXp={addXp} />}
            {state === AppState.PRACTICE && <VoicePractice language={currentLang} userProfile={userProfile!} addXp={addXp} />}
        </div>
      </main>
      <BottomNav
        currentState={state}
        onNavigate={(next) => {
          stopAllAudio();
          setShowMenuDropdown(false);
          setState(next);
        }}
      />
      {userProfile && <AssistantWidget language={currentLang} userProfile={userProfile} showTranslation={showTranslation} />}
    </div>
  );
};

export default App;
