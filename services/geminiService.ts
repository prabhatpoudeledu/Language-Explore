
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterData, WordChallenge, PhraseData, LanguageCode, LANGUAGES, WordOfTheDayData, AccountData, UserProfile, SongData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

class AudioManager {
    private context: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;

    private getContext(): AudioContext {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.context = new AudioContextClass({ sampleRate: 24000 });
        }
        return this.context;
    }

    public stop() {
        if (this.currentSource) {
            try { this.currentSource.stop(); this.currentSource.disconnect(); } catch (e) {}
            this.currentSource = null;
        }
    }

    public async play(base64Audio: string): Promise<void> {
        this.stop(); 
        const ctx = this.getContext();
        try {
            const bytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            this.currentSource = source;
            return new Promise((resolve) => {
                source.onended = () => { if (this.currentSource === source) this.currentSource = null; resolve(); };
                source.start();
            });
        } catch (e) { console.error("Audio playback error", e); }
    }
}

const audioManager = new AudioManager();
export const stopAllAudio = () => audioManager.stop();

// --- Cache Core ---
const setStorage = (key: string, val: any) => localStorage.setItem(`explorer_v3_${key}`, JSON.stringify(val));
const getStorage = (key: string) => {
    const stored = localStorage.getItem(`explorer_v3_${key}`);
    return stored ? JSON.parse(stored) : null;
};

const getLangName = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.name || 'Nepali';

export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
};

export const performCloudSync = async (email: string, localAccount: AccountData | null): Promise<AccountData | null> => {
    const cloudStorage = localStorage.getItem('cloud_db_mock_v3');
    let cloudAccounts: AccountData[] = cloudStorage ? JSON.parse(cloudStorage) : [];
    const cloudAccount = cloudAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (!localAccount && !cloudAccount) return null;
    if (localAccount && !cloudAccount) {
        cloudAccounts.push(localAccount);
        localStorage.setItem('cloud_db_mock_v3', JSON.stringify(cloudAccounts));
        return localAccount;
    }
    if (!localAccount && cloudAccount) return cloudAccount;
    
    if (localAccount && cloudAccount) {
        const mergedProfiles = [...cloudAccount.profiles];
        localAccount.profiles.forEach(localP => {
            const idx = mergedProfiles.findIndex(p => p.id === localP.id);
            if (idx === -1) mergedProfiles.push(localP);
            else if (localP.xp > mergedProfiles[idx].xp) mergedProfiles[idx] = localP;
        });
        const mergedAccount = { ...cloudAccount, profiles: mergedProfiles };
        localStorage.setItem('cloud_db_mock_v3', JSON.stringify(cloudAccounts.map(a => a.email === email ? mergedAccount : a)));
        return mergedAccount;
    }
    return null;
};

export const pushToCloud = async (account: AccountData): Promise<boolean> => {
    try {
        const cloudStorage = localStorage.getItem('cloud_db_mock_v3');
        let cloudAccounts: AccountData[] = cloudStorage ? JSON.parse(cloudStorage) : [];
        const idx = cloudAccounts.findIndex(a => a.email === account.email);
        if (idx > -1) cloudAccounts[idx] = account; else cloudAccounts.push(account);
        localStorage.setItem('cloud_db_mock_v3', JSON.stringify(cloudAccounts));
        return true;
    } catch (e) { return false; }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractJSON = (text: string): any => {
    try { return JSON.parse(text); } catch (e) {
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) try { return JSON.parse(arrayMatch[0]); } catch (e2) {}
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) try { return JSON.parse(objectMatch[0]); } catch (e3) {}
        throw new Error("JSON Extract Failed");
    }
};

const generateContentWithRetry = async (params: any, retries = 2): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try { return await ai.models.generateContent(params); } catch (error: any) {
            const isRetryable = error?.status === 429 || error?.status === 503;
            if (isRetryable && i < retries - 1) { await wait(1000 * Math.pow(2, i)); continue; }
            throw error;
        }
    }
};

export const fetchFunFact = async (lang: LanguageCode): Promise<string> => {
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Tell me one unique, fun, kid-friendly fact about the ${langName} language or culture in 15 words or less. Make it exciting!`
        });
        return response.text || "Languages are magical!";
    } catch (e) { return "Discovery is fun!"; }
};

export const generateTravelImage = async (place: string, country: string): Promise<string | null> => {
    const cacheKey = `img_${place}_${country}`;
    const cached = getStorage(cacheKey);
    if (cached) return cached;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `A vibrant, friendly, 3D animated style children's book illustration of ${place} in ${country}. Colorful and clean.` }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const data = `data:image/png;base64,${part.inlineData.data}`;
                setStorage(cacheKey, data);
                return data;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  stopAllAudio();
  const cacheKey = `audio_${text.substring(0,30)}_${voiceName}`;
  const cached = getStorage(cacheKey);
  if (cached) return await audioManager.play(cached);
  
  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) { 
        setStorage(cacheKey, base64Audio);
        return await audioManager.play(base64Audio); 
    }
  } catch (error) { 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = text.match(/[\u0900-\u097F]/) ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
  }
};

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
  const cached = getStorage(`${lang}_alphabet`);
  if (cached) return cached;
  const langName = getLangName(lang);
  try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Generate a COMPLETE JSON list of the ${langName} Alphabet for kids. For Consonants, include a "combos" array of the primary 12 vowel combinations (e.g. Ka, Kaa, Ki, Kee in Nepali).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                char: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Vowel", "Consonant"] },
                transliteration: { type: Type.STRING },
                exampleWord: { type: Type.STRING },
                exampleWordTransliteration: { type: Type.STRING },
                exampleWordEnglish: { type: Type.STRING },
                combos: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { char: { type: Type.STRING }, sound: { type: Type.STRING } },
                        required: ["char", "sound"]
                    }
                }
              },
              required: ["char", "type", "transliteration", "exampleWord", "exampleWordTransliteration", "exampleWordEnglish"],
            },
          },
        },
      });
      const data = extractJSON(response.text || "[]");
      if (data.length > 0) setStorage(`${lang}_alphabet`, data);
      return data;
  } catch (e) { return []; }
};

export const fetchPhrases = async (lang: LanguageCode, forceNew: boolean = false): Promise<PhraseData[]> => {
    const cached = getStorage(`${lang}_phrases`) || [];
    if (cached.length > 0 && !forceNew) return cached;
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Create 10 common ${langName} phrases for kids.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { native: { type: Type.STRING }, transliteration: { type: Type.STRING }, english: { type: Type.STRING }, category: { type: Type.STRING, enum: ["Greeting", "Food", "Daily"] } },
                        required: ["native", "transliteration", "english", "category"]
                    }
                }
            }
        });
        const newData = extractJSON(response.text || "[]");
        const merged = [...cached, ...newData];
        const unique = Array.from(new Set(merged.map(m => m.native))).map(n => merged.find(m => m.native === n));
        setStorage(`${lang}_phrases`, unique);
        return unique as PhraseData[];
    } catch (e) { return cached; }
};

export const fetchWordBatch = async (lang: LanguageCode, forceNew: boolean = false): Promise<WordChallenge[]> => {
    const cached = getStorage(`${lang}_words`) || [];
    if (cached.length > 0 && !forceNew) return cached;
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Create 10 simple ${langName} words for kids.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { word: { type: Type.STRING }, english: { type: Type.STRING } },
                        required: ["word", "english"]
                    }
                }
            }
        });
        const rawData = extractJSON(response.text || "[]");
        const newData = rawData.map((item: any) => ({
            word: item.word,
            english: item.english,
            scrambled: item.word.split('').sort(() => Math.random() - 0.5)
        }));
        const merged = [...cached, ...newData];
        const unique = Array.from(new Set(merged.map(m => m.word))).map(n => merged.find(m => m.word === n));
        setStorage(`${lang}_words`, unique);
        return unique as WordChallenge[];
    } catch (e) { return cached; }
};

export const fetchWordOfTheDay = async (lang: LanguageCode): Promise<WordOfTheDayData | null> => {
    const today = new Date().toISOString().split('T')[0];
    const cached = getStorage(`${lang}_wotd`);
    if (cached && cached.date === today) return cached;
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Fun Word of the Day for kids learning ${getLangName(lang)}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, transliteration: { type: Type.STRING }, english: { type: Type.STRING }, sentence: { type: Type.STRING } },
                    required: ["word", "transliteration", "english", "sentence"]
                }
            }
        });
        const data = { ...extractJSON(response.text || "{}"), date: today };
        setStorage(`${lang}_wotd`, data);
        return data;
    } catch (e) { return cached; }
};

export const fetchSongsByCategory = async (lang: LanguageCode, category: string): Promise<SongData[]> => {
    const cached = getStorage(`${lang}_songs_${category}`);
    if (cached) return cached;
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Generate a list of 4 ${category} songs/chants/poems in ${langName} for kids. Include YouTube IDs if known (otherwise use 'SEARCH_ONLY').`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            titleNative: { type: Type.STRING },
                            category: { type: Type.STRING },
                            description: { type: Type.STRING },
                            descriptionNative: { type: Type.STRING },
                            lyricsOriginal: { type: Type.STRING },
                            youtubeId: { type: Type.STRING }
                        },
                        required: ["title", "titleNative", "category", "description", "descriptionNative", "lyricsOriginal"]
                    }
                }
            }
        });
        const data = extractJSON(response.text || "[]");
        if (data.length > 0) setStorage(`${lang}_songs_${category}`, data);
        return data;
    } catch (e) { return []; }
};

export const validateHandwriting = async (base64Image: string, char: string, lang: LanguageCode): Promise<boolean> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [
                { inlineData: { mimeType: "image/png", data: base64Image } }, 
                { text: `The image provided is a drawing by a child. Does it clearly represent the character "${char}" in the context of the ${getLangName(lang)} script? Return JSON: {"match": true/false}` }
            ] },
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { type: Type.OBJECT, properties: { match: { type: Type.BOOLEAN } }, required: ["match"] } 
            }
        });
        return !!extractJSON(response.text || "{}").match;
    } catch (e) { 
        console.error("Validation error", e);
        return false; 
    }
};

export const translatePhrase = async (text: string, lang: LanguageCode): Promise<PhraseData | null> => {
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Translate "${text}" into ${getLangName(lang)} for kids.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { native: { type: Type.STRING }, transliteration: { type: Type.STRING }, english: { type: Type.STRING }, category: { type: Type.STRING } },
                    required: ["native", "transliteration", "english", "category"]
                }
            }
        });
        return extractJSON(response.text || "{}");
    } catch (e) { return null; }
};

export const initializeLanguageSession = async (lang: LanguageCode, onProgress: (msg: string, p: number) => void): Promise<void> => {
    const config = LANGUAGES.find(l => l.code === lang)!;
    
    onProgress("Syncing Passport...", 10);
    await wait(300);
    
    onProgress("Unpacking Alphabet...", 30);
    await fetchAlphabet(lang);
    
    onProgress("Gathering Words...", 50);
    await fetchWordBatch(lang);
    
    onProgress("Preparing Culture Hub...", 70);
    const imagePromises = config.travelDiscoveries.map(item => generateTravelImage(item.titleEn, config.country));
    await Promise.all(imagePromises);
    
    onProgress("Finalizing Adventure...", 100);
    await wait(200);
};
