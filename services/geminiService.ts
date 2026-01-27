
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterData, WordChallenge, PhraseData, LanguageCode, LANGUAGES, WordOfTheDayData, AccountData, UserProfile, SongData } from '../types';
import { STATIC_ALPHABET, STATIC_WORDS, STATIC_PHRASES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLangName = (code: LanguageCode): string => {
    return LANGUAGES.find(l => l.code === code)?.name || "the language";
};

const CACHE_VERSION = 'v16';

class CacheManager {
    private prefix = `explorer_${CACHE_VERSION}_`;

    set(key: string, value: any, ttlSeconds: number = 86400) {
        const expiry = Date.now() + (ttlSeconds * 1000);
        const data = { value, expiry };
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
        } catch (e) {
            this.purgeOldest(); 
            try { localStorage.setItem(this.prefix + key, JSON.stringify(data)); } catch (err) {}
        }
    }

    get(key: string): any | null {
        const stored = localStorage.getItem(this.prefix + key);
        if (!stored) return null;
        try {
            const { value, expiry } = JSON.parse(stored);
            if (Date.now() > expiry) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }
            return value;
        } catch (e) { return null; }
    }

    private purgeOldest() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
        keys.sort().slice(0, 5).forEach(k => localStorage.removeItem(k));
    }
}

const appCache = new CacheManager();

const AUDIO_VAULT_KEY = `offline_audio_vault_${CACHE_VERSION}`;
export const getAudioVault = () => {
    try {
        return JSON.parse(localStorage.getItem(AUDIO_VAULT_KEY) || '{}');
    } catch(e) { return {}; }
};

const saveToAudioVault = (text: string, base64: string) => {
    const vault = getAudioVault();
    vault[text] = base64;
    try {
        localStorage.setItem(AUDIO_VAULT_KEY, JSON.stringify(vault));
    } catch (e) {
        const entries = Object.entries(vault);
        if (entries.length > 100) {
            const pruned = Object.fromEntries(entries.slice(-50));
            localStorage.setItem(AUDIO_VAULT_KEY, JSON.stringify(pruned));
        }
    }
};

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
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
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
    public isBusy = false;
    public isRateLimited = false;

    public getContext(): AudioContext {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.context = new AudioContextClass({ sampleRate: 24000 });
        }
        return this.context;
    }

    /**
     * Standardised awakening for mobile devices.
     * Must be called inside a user-gesture handler (click, touchend).
     */
    public async unlock(): Promise<boolean> {
        const ctx = this.getContext();
        try {
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            // Standard "silence" buffer to kickstart the hardware
            const buffer = ctx.createBuffer(1, 1, 24000);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
            return true;
        } catch (e) {
            console.error("Audio unlock failed", e);
            return false;
        }
    }

    public stop() {
        if (this.currentSource) {
            try { 
                this.currentSource.stop(); 
                this.currentSource.disconnect(); 
            } catch (e) {}
            this.currentSource = null;
        }
        this.isBusy = false;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    public async play(base64Audio: string): Promise<void> {
        if (!base64Audio || base64Audio.length < 100) return;
        this.stop(); 
        this.isBusy = true;
        const ctx = this.getContext();
        
        // Critical for mobile: resume context before every attempt to play.
        if (ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (e) { console.error("Context resume failed", e); }
        }

        try {
            const bytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            this.currentSource = source;
            return new Promise((resolve) => {
                source.onended = () => { 
                    if (this.currentSource === source) this.currentSource = null; 
                    this.isBusy = false;
                    resolve(); 
                };
                source.start(0);
            });
        } catch (e) { 
            this.isBusy = false;
            console.error("Audio playback error", e); 
        }
    }
}

const audioManager = new AudioManager();
export const stopAllAudio = () => audioManager.stop();
export const isAudioBusy = () => audioManager.isBusy;
export const isVoiceLimited = () => audioManager.isRateLimited;
export const unlockAudio = () => audioManager.unlock();
export const getAudioState = () => audioManager.getContext().state;

export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) {}
    }
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

const generateContentWithRetry = async (params: any, retries = 0): Promise<any> => {
    try { 
        const response = await ai.models.generateContent(params);
        audioManager.isRateLimited = false;
        return response;
    } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes('429')) {
            audioManager.isRateLimited = true;
            setTimeout(() => { audioManager.isRateLimited = false; }, 45000);
        }
        throw error;
    }
};

const browserSpeak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (text.match(/[\u0900-\u097F]/)) utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
};

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  // Always try to wake context first
  await audioManager.unlock();
  
  const vault = getAudioVault();
  if (vault[text] && vault[text].length > 100) return await audioManager.play(vault[text]);
  if (audioManager.isRateLimited) { browserSpeak(text); return; }

  stopAllAudio();
  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) { 
        saveToAudioVault(text, base64Audio); 
        return await audioManager.play(base64Audio); 
    }
  } catch (error: any) { browserSpeak(text); }
};

export type BakeryStatus = 'idle' | 'baking' | 'ready';
let currentBakeryStatus: BakeryStatus = 'idle';
const bakeryListeners: ((status: BakeryStatus) => void)[] = [];

const updateBakeryStatus = (status: BakeryStatus) => {
    currentBakeryStatus = status;
    bakeryListeners.forEach(l => l(status));
};

export const subscribeToBakery = (callback: (status: BakeryStatus) => void) => {
    bakeryListeners.push(callback);
    callback(currentBakeryStatus);
    return () => {
        const idx = bakeryListeners.indexOf(callback);
        if (idx > -1) bakeryListeners.splice(idx, 1);
    };
};

export const downloadLetterSound = async (letter: string, voice: string): Promise<boolean> => {
    const vault = getAudioVault();
    if (vault[letter]) return true; 
    try {
        const response = await generateContentWithRetry({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `The phonic sound of letter ${letter}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) { saveToAudioVault(letter, base64Audio); return true; }
    } catch (e) { return false; }
    return false;
};

let downloadQueue: { letter: string; voice: string }[] = [];
let isProcessingQueue = false;

const processDownloadQueue = async () => {
    if (isProcessingQueue || downloadQueue.length === 0) return;
    if (audioManager.isRateLimited) { await wait(15000); processDownloadQueue(); return; }
    isProcessingQueue = true;
    updateBakeryStatus('baking');
    while (downloadQueue.length > 0) {
        if (audioManager.isRateLimited) break;
        const task = downloadQueue[0];
        try {
            const success = await downloadLetterSound(task.letter, task.voice);
            if (success) downloadQueue.shift();
            else await wait(5000);
        } catch (e) { await wait(10000); }
        await wait(3500);
    }
    isProcessingQueue = false;
    if (downloadQueue.length === 0) updateBakeryStatus('ready');
};

export const preCacheAlphabet = (lang: LanguageCode, voice: string) => {
    const alphabet = STATIC_ALPHABET[lang] || [];
    const vault = getAudioVault();
    const missing = alphabet.filter(l => !vault[l.char]).map(l => ({ letter: l.char, voice }));
    downloadQueue = [...missing];
    if (!isProcessingQueue) processDownloadQueue();
};

export const initializeLanguageSession = async (lang: LanguageCode, voice: string, onProgress: (msg: string, p: number) => void): Promise<void> => {
    onProgress("Awakening the sounds...", 30);
    await audioManager.unlock();
    await wait(400);
    onProgress("Setting up the Cabin...", 60);
    await wait(300);
    preCacheAlphabet(lang, voice);
    onProgress("Ready for takeoff!", 100);
    await wait(200);
};

export const fetchWordOfTheDay = async (lang: LanguageCode): Promise<WordOfTheDayData | null> => {
    const cacheKey = `${lang}_wotd`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Simple Word of the Day for kids learning ${getLangName(lang)}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, transliteration: { type: Type.STRING }, english: { type: Type.STRING }, sentence: { type: Type.STRING } },
                    required: ["word", "transliteration", "english", "sentence"]
                }
            }
        });
        const data = extractJSON(response.text);
        appCache.set(cacheKey, data, 43200); 
        return data;
    } catch (e) { return null; }
};

export const generateTravelImage = async (title: string, country: string): Promise<string | null> => {
    const cacheKey = `img_high_landscape_${title}_${country}`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `A professional, breathtaking landscape photograph of ${title} in ${country}. 8k resolution, cinematic lighting, national geographic style, ultra-realistic, vibrant and crisp details.` }]
            }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const url = `data:image/png;base64,${part.inlineData.data}`;
                appCache.set(cacheKey, url, 604800); 
                return url;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const generateItemImage = async (itemName: string): Promise<string | null> => {
    const cacheKey = `img_item_isolated_${itemName}`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `A professional studio photograph of a single ${itemName}, centered, high resolution, realistic textures, vibrant colors, soft lighting, clean solid neutral background. No landscape, just the isolated object.` }]
            }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const url = `data:image/png;base64,${part.inlineData.data}`;
                appCache.set(cacheKey, url, 604800); 
                return url;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const fetchFunFact = async (lang: LanguageCode): Promise<string> => {
    const cacheKey = `${lang}_funfact`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `One short fact about ${getLangName(lang)} for kids.`
        });
        const fact = response.text || "Discovery is magic!";
        appCache.set(cacheKey, fact, 3600); 
        return fact;
    } catch (e) { return "Discovery is magic!"; }
};

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
    return STATIC_ALPHABET[lang] || [];
};

export const translatePhrase = async (text: string, lang: LanguageCode): Promise<PhraseData | null> => {
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: `Translate "${text}" into ${getLangName(lang)} for a child. Provide a practical, commonly used phrase.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { 
                        native: { type: Type.STRING }, 
                        transliteration: { type: Type.STRING }, 
                        english: { type: Type.STRING }, 
                        category: { type: Type.STRING, enum: ["Greeting", "Food", "Daily"] }
                    },
                    required: ["native", "transliteration", "english", "category"]
                }
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const fetchPhrases = async (lang: LanguageCode, forceNew: boolean = false): Promise<PhraseData[]> => {
    return STATIC_PHRASES[lang] || [];
};

export const fetchWordBatch = async (lang: LanguageCode, forceNew: boolean = false): Promise<WordChallenge[]> => {
    return STATIC_WORDS[lang] || [];
};

export const validateHandwriting = async (base64: string, char: string, lang: LanguageCode): Promise<boolean> => {
    try {
        const response = await generateContentWithRetry({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ inlineData: { mimeType: "image/png", data: base64 } }, { text: `Is this '${char}' in ${getLangName(lang)}? JSON: {"isCorrect": boolean}` }] },
            config: { responseMimeType: "application/json" }
        });
        return extractJSON(response.text)?.isCorrect === true;
    } catch (e) { return false; }
};

export const fetchSongsByCategory = async (lang: LanguageCode, category: string): Promise<SongData[]> => {
    // For now, return static data. In the future, this could fetch from an API or database
    if (lang === 'np') {
        if (category === 'National') {
            return [
                {
                    title: "We are Hundreds of Flowers",
                    titleNative: "सयौं थुंगा फूलका हामी",
                    category: "National",
                    description: "The national anthem of Nepal, symbolizing unity and diversity of the Nepali people.",
                    descriptionNative: "नेपालको राष्ट्रिय गान, नेपाली जनताको एकता र विविधतालाई प्रतिबिम्बित गर्ने।",
                    lyricsOriginal: `सयौ थुङ्गा फूलका हामी एउटै माला नेपाली
सार्वभौम  भै फैलिएका मेची-महाकाली
सयौ  थुङ्गा फूलका हामी एउटै माला नेपाली
सार्वभौम भै फैलिएका मेची-महाकाली

प्रकृतिका कोटी-कोटी सम्पदाको आंचल
बिरहरूका  रगतले स्वतन्त्र र अटल
ज्ञान  भुमी, शान्ति भुमी, तराई, पहाड, हिमाल
अखण्ड यो प्यारो हाम्रो मातृ भुमी नेपाल
बहुल  जाति भाषाधर्म सस्कृति छन् विशाल
अग्रगामी राष्ट्र हाम्रो जय-जय नेपाल`,
                    youtubeId: "F0GYEj_jhWY" // Official Nepali national anthem video
                }
            ];
        } else if (category === 'Cultural') {
            return [
                {
                    title: "Sindoor Jasma",
                    titleNative: "सिन्दूर जस्मा",
                    category: "Cultural",
                    description: "A traditional Nepali wedding song celebrating the beauty and grace of Nepali brides in traditional attire.",
                    descriptionNative: "परम्परागत पोशाकमा नेपाली दुलहीहरूको सुन्दरता र कृपा मनाउने परम्परागत नेपाली विवाह गीत।",
                    lyricsOriginal: `सिन्दूर जस्मा सिन्दूर
मेरो प्रीतमको रुप
सिन्दूर जस्मा सिन्दूर

निलो आकाशको तारा
जूनको जूनकी रानी
सिन्दूर जस्मा सिन्दूर

मेरो प्रीतमको रुप
सुनको फूल जस्तै
सिन्दूर जस्मा सिन्दूर`,
                    youtubeId: "rbBMwI0ef3w" // Traditional Nepali cultural song
                }
            ];
        } else if (category === 'Religious') {
            return [
                {
                    title: "Bhajan",
                    titleNative: "भजन",
                    category: "Religious",
                    description: "Sacred Nepali devotional songs (Bhajans) sung during religious ceremonies and festivals.",
                    descriptionNative: "धार्मिक समारोह र चाडपर्वहरूमा गाइने पवित्र नेपाली भक्ति गीतहरू (भजन)।",
                    lyricsOriginal: `राधे कृष्णा राधे कृष्णा
कृष्णा कृष्णा हरे हरे
हरे राम हरे राम
राम राम हरे हरे

गोविन्दा गोपाला
देवकी नन्दन
गोविन्दा गोपाला
देवकी नन्दन`,
                    youtubeId: "9eY93xAilfw" // Traditional Nepali devotional song - Bhajan
                }
            ];
        } else if (category === 'Folk') {
            return [
                {
                    title: "Resham Firiri",
                    titleNative: "रेशम फिरिरी",
                    category: "Folk",
                    description: "A beloved Nepali folk song expressing love, longing, and the beauty of rural life in Nepal.",
                    descriptionNative: "नेपालको ग्रामीण जीवनको सुन्दरता, प्रेम र विरह व्यक्त गर्ने प्रिय नेपाली लोक गीत।",
                    lyricsOriginal: `रेशम  फिरिरी रेशम  फिरिरी
उडेर जाउँ कि डाँडामा भन्ज्यांग,
रेशम  फिरिरी

कुकुरलाई कुती कुती, बिरालोलाई सुरी
तिम्रो हाम्रो माया प्रिती दोबाटोमा कुरी
एकनाले बन्दुक  दुइनाले बन्दुक, मिर्गलाई ताकेको
मिर्गलाई मैले ताकेको होइन, मायालाई डाकेको
आकाशमा जहाज  सडकमा मोटर नभए गाडा छ
यो मन जस्तो त्यो मन भए तागत गाढा छ
सानोमा सानो गाईको बाच्छो भिरैमा राम  राम
छोडेर जान सकिन मैले, बरु माया संगै जाउँ`,
                    youtubeId: "Z5YPAZotbNI" // Traditional Nepali folk song - Resham Firiri
                }
            ];
        }
    }

    // Return empty array for other languages or categories
    return [];
};
export const performCloudSync = async (email: string, account: AccountData | null) => account;
export const pushToCloud = async (account: AccountData) => true;
export const geminiService = {
  generateImage: async (prompt: string) => {
    // Your Gemini image generation logic
    // Return URL or base64
  },
  generateAudio: async (text: string, lang: string) => {
    // Your Gemini TTS logic
    // Return audio URL
  },
  // Add other methods like generateWordAudio, etc.
};
