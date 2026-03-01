
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, VOICES, LetterData, WordChallenge, PhraseData, LanguageCode, LANGUAGES, WordOfTheDayData, AccountData, SongData, NumberData, VocabularyCategory } from '../types';
import { STATIC_ALPHABET, STATIC_WORDS, STATIC_PHRASES, STATIC_NUMBERS, STATIC_VOCABULARY } from '../constants';

const ENV = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? (import.meta as any).env
    : {};
const GEMINI_API_KEY = String(ENV.VITE_GEMINI_API_KEY || '');
const GEMINI_PROXY_URL = String(ENV.VITE_GEMINI_PROXY_URL || '');
const GEMINI_PROXY_TOKEN = String(ENV.VITE_GEMINI_PROXY_TOKEN || '');
const CONTENT_BASE_URL = String(ENV.VITE_CONTENT_BASE_URL || '');
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getLangName = (code: LanguageCode): string => {
    return LANGUAGES.find(l => l.code === code)?.name || "the language";
};

const CACHE_VERSION = 'v16';
const AI_COOLDOWN_MS = 3000;
const AI_GUARD_EVENT = 'ai-guard';
const CLIENT_ID_KEY = 'ai_client_id_v1';
let aiLastCall = 0;
let aiInFlight = 0;

const notifyAiGuard = (message: string) => {
    if (typeof window === 'undefined') return;
    try {
        window.dispatchEvent(new CustomEvent(AI_GUARD_EVENT, { detail: { message } }));
    } catch (e) {
        console.warn('[AI] guard notify failed');
    }
};

const getClientId = (): string => {
    try {
        let clientId = localStorage.getItem(CLIENT_ID_KEY);
        if (!clientId) {
            clientId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                ? crypto.randomUUID()
                : `cid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            localStorage.setItem(CLIENT_ID_KEY, clientId);
        }
        return clientId;
    } catch (e) {
        return 'cid_unknown';
    }
};

const guardAiCall = (): (() => void) => {
    const now = Date.now();
    if (aiInFlight > 0) {
        notifyAiGuard('AI is already working. Please wait.');
        throw new Error('AI request in progress');
    }
    if (now - aiLastCall < AI_COOLDOWN_MS) {
        notifyAiGuard('Please wait a moment before trying again.');
        throw new Error('AI cooldown');
    }
    aiLastCall = now;
    aiInFlight += 1;
    return () => {
        aiInFlight = Math.max(0, aiInFlight - 1);
    };
};

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

const buildAudioKey = (text: string, voice: string) => `${voice}__${text}`;

const saveToAudioVault = (key: string, base64: string) => {
    const vault = getAudioVault();
    vault[key] = base64;
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

    public async play(base64Audio: string): Promise<boolean> {
        if (!base64Audio || base64Audio.length < 100) return false;
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
            return await new Promise<boolean>((resolve) => {
                const timeout = window.setTimeout(() => {
                    if (this.currentSource === source) {
                        try { source.stop(); } catch (e) {}
                        this.currentSource = null;
                    }
                    this.isBusy = false;
                    console.log('[TTS] audio play timeout');
                    resolve(false);
                }, 4000);

                source.onended = () => { 
                    window.clearTimeout(timeout);
                    if (this.currentSource === source) this.currentSource = null; 
                    this.isBusy = false;
                    resolve(true); 
                };
                try {
                    source.start(0);
                } catch (e) {
                    window.clearTimeout(timeout);
                    this.isBusy = false;
                    console.log('[TTS] audio start failed');
                    resolve(false);
                }
            });
        } catch (e) { 
            this.isBusy = false;
            console.error("Audio playback error", e); 
            return false;
        }
    }
}

const audioManager = new AudioManager();
const activeHtmlAudios = new Set<HTMLAudioElement>();

export const registerHtmlAudio = (audio: HTMLAudioElement) => {
    activeHtmlAudios.add(audio);
};

export const unregisterHtmlAudio = (audio: HTMLAudioElement) => {
    activeHtmlAudios.delete(audio);
};

const stopHtmlAudio = () => {
    activeHtmlAudios.forEach(audio => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (e) {}
    });
    activeHtmlAudios.clear();
};

export const stopAllAudio = () => {
    stopHtmlAudio();
    audioManager.stop();
};
let soundEnabled = true;
export const setSoundEnabled = (enabled: boolean) => {
    soundEnabled = enabled;
    if (!enabled) stopAllAudio();
};
export const isSoundEnabled = () => soundEnabled;
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

const FLASH_15 = "models/gemini-2.5-flash";
const DEFAULT_TEXT_MODEL = FLASH_15;
const FLASH_15_CANDIDATES = [
    ENV.VITE_GEMINI_FLASH_MODEL,
    "models/gemini-2.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-001"
].filter(Boolean) as string[];
const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter(v => typeof v === 'string' && v.trim().length > 0);
};

const buildContentUrl = (path: string) => {
    if (!CONTENT_BASE_URL) return path;
    if (CONTENT_BASE_URL.endsWith('/') && path.startsWith('/')) return `${CONTENT_BASE_URL.slice(0, -1)}${path}`;
    if (!CONTENT_BASE_URL.endsWith('/') && !path.startsWith('/')) return `${CONTENT_BASE_URL}/${path}`;
    return `${CONTENT_BASE_URL}${path}`;
};

const fetchContentJson = async <T>(path: string, cacheKey: string, ttlSeconds: number = 604800): Promise<T | null> => {
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const url = buildContentUrl(path);
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        const data = (await response.json()) as T;
        appCache.set(cacheKey, data, ttlSeconds);
        return data;
    } catch (e) {
        return null;
    }
};

const getNepaliBarahkhari = (consonant: string, baseTrans: string) => [
    { char: consonant + 'ा', sound: baseTrans + 'aa' },
    { char: consonant + 'ि', sound: baseTrans + 'i' },
    { char: consonant + 'ी', sound: baseTrans + 'ee' },
    { char: consonant + 'ु', sound: baseTrans + 'u' },
    { char: consonant + 'ू', sound: baseTrans + 'oo' },
    { char: consonant + 'े', sound: baseTrans + 'e' },
    { char: consonant + 'ै', sound: baseTrans + 'ai' },
    { char: consonant + 'ो', sound: baseTrans + 'o' },
    { char: consonant + 'ौ', sound: baseTrans + 'au' },
    { char: consonant + 'ं', sound: baseTrans + 'am' },
    { char: consonant + 'ः', sound: baseTrans + 'ah' }
];

const getBaseTransliteration = (char: string, transliteration: string) => {
    const special: Record<string, string> = {
        'ञ': 'yn',
        'क्ष': 'ksh',
        'त्र': 'tr',
        'ज्ञ': 'gy'
    };
    if (special[char]) return special[char];
    if (transliteration.endsWith('a')) return transliteration.slice(0, -1);
    return transliteration;
};

const generateJsonWithCache = async <T>(
    cacheKey: string,
    prompt: string,
    schema: any,
    ttlSeconds: number = 3600,
    model: string = FLASH_15
): Promise<T> => {
    if (!GEMINI_API_KEY && !GEMINI_PROXY_URL) {
        console.error('[Gemini] Missing API key and proxy. Set GEMINI_API_KEY or VITE_GEMINI_PROXY_URL.');
        throw new Error('Missing GEMINI_API_KEY');
    }
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    const modelsToTry = model ? [model, ...FLASH_15_CANDIDATES] : [...FLASH_15_CANDIDATES];
    let lastError: any = null;
    for (const candidate of modelsToTry) {
        try {
            const response = await generateContentWithRetry({
                model: candidate,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
            const data = extractJSON(response.text) as T;
            appCache.set(cacheKey, data, ttlSeconds);
            return data;
        } catch (error: any) {
            lastError = error;
            const message = error?.message || '';
            const notFound = message.includes('not found') || message.includes('NOT_FOUND') || error?.status === 404;
            console.error('[Gemini] generateJsonWithCache failed', {
                cacheKey,
                model: candidate,
                message: message || 'unknown'
            });
            if (!notFound) break;
        }
    }
    throw lastError;
};

const normalizeGeminiResponse = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    if (!data.text) {
        const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => typeof p?.text === 'string');
        if (textPart?.text) data.text = textPart.text;
    }
    return data;
};

const callGeminiProxy = async (params: any): Promise<any> => {
    if (!GEMINI_PROXY_URL) throw new Error('Missing VITE_GEMINI_PROXY_URL');
    const clientId = getClientId();
    const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': clientId,
            ...(GEMINI_PROXY_TOKEN ? { 'X-Gemini-Proxy-Token': GEMINI_PROXY_TOKEN } : {})
        },
        body: JSON.stringify(params)
    });
    if (!response.ok) {
        const text = await response.text();
        const error = new Error(text || `Proxy error ${response.status}`) as any;
        error.status = response.status;
        throw error;
    }
    const data = await response.json();
    return normalizeGeminiResponse(data);
};

const generateContentWithRetry = async (params: any, retries = 0): Promise<any> => {
    const useProxy = !GEMINI_API_KEY && Boolean(GEMINI_PROXY_URL);
    const releaseGuard = guardAiCall();
    try { 
        const response = useProxy ? await callGeminiProxy(params) : await ai.models.generateContent(params);
        audioManager.isRateLimited = false;
        return response;
    } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes('429')) {
            audioManager.isRateLimited = true;
            setTimeout(() => { audioManager.isRateLimited = false; }, 45000);
        }
        throw error;
    } finally {
        releaseGuard();
    }
};

const browserSpeak = (text: string): Promise<void> => {
    if (!window.speechSynthesis) return Promise.resolve();
    return new Promise(resolve => {
        const utterance = new SpeechSynthesisUtterance(text);
        const isNepali = Boolean(text.match(/[\u0900-\u097F]/));
        utterance.lang = isNepali ? 'ne-NP' : 'en-US';

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const nepaliVoice = voices.find(v => v.lang.toLowerCase().startsWith('ne'))
                || voices.find(v => v.name.toLowerCase().includes('nepali'));
            const hindiVoice = voices.find(v => v.lang.toLowerCase() === 'hi-in');
            const fallbackVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
            const chosenVoice = isNepali
                ? (nepaliVoice || hindiVoice || fallbackVoice)
                : fallbackVoice;
            if (chosenVoice) utterance.voice = chosenVoice;
        }

        utterance.rate = isNepali ? 0.6 : 0.7;
        utterance.pitch = isNepali ? 0.9 : 0.95;
        console.log('[TTS] browserSpeak start', JSON.stringify({ lang: utterance.lang, voice: utterance.voice?.name }));
        utterance.onend = () => {
            console.log('[TTS] browserSpeak end');
            resolve();
        };
        utterance.onerror = (e) => {
            console.log('[TTS] browserSpeak error', JSON.stringify({ error: (e as any)?.error || 'unknown' }));
            resolve();
        };
        window.speechSynthesis.speak(utterance);
    });
};

const SOUND_BASE_PATH = '/assets/voices/sound';

const detectAudioMime = (bytes: Uint8Array): 'audio/wav' | 'audio/mpeg' | null => {
    if (bytes.length < 4) return null;
    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (header === 'RIFF') return 'audio/wav';
    if (header === 'ID3') return 'audio/mpeg';
    if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'audio/mpeg';
    return null;
};

const pcmToWav = (pcmBytes: Uint8Array, sampleRate: number, numChannels: number): Uint8Array => {
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmBytes.byteLength;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    new Uint8Array(buffer, 44).set(pcmBytes);
    return new Uint8Array(buffer);
};

const tryPlayBase64HtmlAudio = async (base64Audio: string): Promise<boolean> => {
    try {
        const bytes = decode(base64Audio);
        let audioBytes: Uint8Array = bytes as Uint8Array;
        let mime = detectAudioMime(bytes);
        if (!mime) {
            console.log('[TTS] html audio mime fallback to pcm');
            audioBytes = pcmToWav(new Uint8Array(bytes), 24000, 1) as Uint8Array;
            mime = 'audio/wav';
        }
        console.log('[TTS] html audio mime', JSON.stringify({ mime }));

        return await new Promise<boolean>((resolve) => {
            const audioBuffer = audioBytes.buffer.slice(audioBytes.byteOffset, audioBytes.byteOffset + audioBytes.byteLength) as ArrayBuffer;
            const blob = new Blob([audioBuffer], { type: mime });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            registerHtmlAudio(audio);

            const cleanup = (result: boolean) => {
                try { URL.revokeObjectURL(url); } catch (e) {}
                unregisterHtmlAudio(audio);
                resolve(result);
            };

            const timeout = window.setTimeout(() => {
                console.log('[TTS] html audio timeout');
                cleanup(false);
            }, 4000);

            audio.onended = () => {
                window.clearTimeout(timeout);
                cleanup(true);
            };
            audio.onerror = () => {
                window.clearTimeout(timeout);
                console.log('[TTS] html audio error');
                cleanup(false);
            };

            audio.oncanplaythrough = () => {
                audio.play().catch(() => {
                    window.clearTimeout(timeout);
                    console.log('[TTS] html audio play failed');
                    cleanup(false);
                });
            };

            audio.load();
        });
    } catch (e) {
        return false;
    }
};

const playWithTimeout = async (base64Audio: string, label: string): Promise<boolean> => {
    const timeoutMs = 4500;
    const timeoutPromise = new Promise<boolean>((resolve) => {
        window.setTimeout(() => {
            console.log('[TTS] play timeout', JSON.stringify({ label }));
            resolve(false);
        }, timeoutMs);
    });

    const playPromise = audioManager.play(base64Audio)
        .then(result => {
            console.log('[TTS] play result', JSON.stringify({ label, result }));
            return result;
        })
        .catch(() => {
            console.log('[TTS] play threw', JSON.stringify({ label }));
            return false;
        });

    return await Promise.race([playPromise, timeoutPromise]);
};

const getVoiceGender = (voiceName: string) => {
    return VOICES.find(v => v.id === voiceName)?.gender || 'female';
};

const slugifySoundName = (text: string) => {
    const cleaned = text
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    return cleaned;
};

const tryPlayLocalSoundBySlug = (rawSlug: string, voiceName: string, preferEnglishVariant: boolean): Promise<boolean> => {
    const slug = slugifySoundName(rawSlug);
    if (!slug) return Promise.resolve(false);

    const gender = getVoiceGender(voiceName);
    const candidates = preferEnglishVariant
        ? [`${slug}_english_${gender}.mp3`, `${slug}_${gender}.mp3`]
        : [`${slug}_${gender}.mp3`, `${slug}_english_${gender}.mp3`];

    return new Promise(resolve => {
        let index = 0;
        let finished = false;

        const attempt = () => {
            if (index >= candidates.length || finished) return resolve(false);
            const url = `${SOUND_BASE_PATH}/${candidates[index++]}`;
            const audio = new Audio(url);
            registerHtmlAudio(audio);

            const fail = () => {
                if (finished) return;
                attempt();
            };

            const finishSuccess = () => {
                if (finished) return;
                finished = true;
                unregisterHtmlAudio(audio);
                resolve(true);
            };

            audio.oncanplaythrough = () => {
                if (finished) return;
                audio.play().catch(() => {
                    if (finished) return;
                    finished = true;
                    unregisterHtmlAudio(audio);
                    resolve(false);
                });
            };
            audio.onended = finishSuccess;
            audio.onerror = () => {
                unregisterHtmlAudio(audio);
                fail();
            };
            audio.load();
        };

        attempt();
    });
};

export const tryPlayLocalSound = (text: string, voiceName: string): Promise<boolean> => {
    const isNepali = /[\u0900-\u097F]/.test(text);
    return tryPlayLocalSoundBySlug(text, voiceName, !isNepali);
};

export const tryPlayLocalSoundWithTransliteration = (transliteration: string, voiceName: string, preferEnglishVariant: boolean): Promise<boolean> => {
    return tryPlayLocalSoundBySlug(transliteration, voiceName, preferEnglishVariant);
};

const VOICE_PAIR_MAP: Record<string, string> = {
    Puck: 'Kore',
    Kore: 'Puck'
};

export const resolveVoiceId = (): string => {
    return 'Kore';
};

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
    if (!soundEnabled) return;

    // Always try to wake context first
    await audioManager.unlock();

    if (!text || text.trim().length === 0) return;

        console.log('[TTS] speakText request', JSON.stringify({ text, voiceName }));
    const audioKey = buildAudioKey(text, voiceName);
  
  const vault = getAudioVault();
    if (vault[audioKey] && vault[audioKey].length > 100) {
        console.log('[TTS] cache hit', JSON.stringify({ audioKey, size: vault[audioKey].length }));
        const htmlPlayed = await tryPlayBase64HtmlAudio(vault[audioKey]);
        if (htmlPlayed) {
            console.log('[TTS] html audio played');
            return;
        }
        const played = await playWithTimeout(vault[audioKey], 'cache');
        if (played) return;
        console.log('[TTS] cache play failed, clearing cache', JSON.stringify({ audioKey }));
        delete vault[audioKey];
        try { localStorage.setItem(AUDIO_VAULT_KEY, JSON.stringify(vault)); } catch (e) {}
    }
    if (audioManager.isRateLimited) {
        console.log('[TTS] rate-limited, trying local audio first');
        const playedLocal = await tryPlayLocalSound(text, voiceName);
        if (playedLocal) {
            console.log('[TTS] local audio played');
            return;
        }
        await browserSpeak(text);
        return;
    }

    stopAllAudio();
    try {
        const isNepali = /[\u0900-\u097F]/.test(text);
        const prompt = isNepali
            ? `Speak like a warm adult teacher. Pronounce slowly and clearly in Nepali with gentle syllable breaks: ${text}`
            : `Speak like a warm adult teacher. Pronounce slowly and clearly in English with gentle syllable breaks: ${text}`;

        console.log('[TTS] API call start', JSON.stringify({ model: "models/gemini-2.5-flash-preview-tts" }));
        const response = await generateContentWithRetry({
            model: "models/gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
            },
        });
        console.log('[TTS] API call done', JSON.stringify({ hasAudio: Boolean(response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) }));
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) { 
            saveToAudioVault(audioKey, base64Audio);
            console.log('[TTS] cached audio', JSON.stringify({ audioKey, size: base64Audio.length }));
            const htmlPlayed = await tryPlayBase64HtmlAudio(base64Audio);
            if (htmlPlayed) {
                console.log('[TTS] html audio played');
                return;
            }
            const played = await playWithTimeout(base64Audio, 'api');
            if (played) return;
        }
        console.log('[TTS] API audio missing/failed, trying local audio');
        const playedLocal = await tryPlayLocalSound(text, voiceName);
        if (playedLocal) return;
        console.log('[TTS] local audio failed, fallback to browserSpeak');
        await browserSpeak(text);
    } catch (error: any) {
        console.log('[TTS] API call failed', JSON.stringify({ message: error?.message, status: error?.status, name: error?.name }));
        const playedLocal = await tryPlayLocalSound(text, voiceName);
        if (playedLocal) return;
        await browserSpeak(text);
    }
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

const downloadTextSound = async (text: string, voice: string, prompt: string): Promise<boolean> => {
    const vault = getAudioVault();
    const audioKey = buildAudioKey(text, voice);
    if (vault[audioKey]) return true;

    try {
        const response = await generateContentWithRetry({
            model: "models/gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            saveToAudioVault(audioKey, base64Audio);
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};

export const downloadLetterSound = async (letter: string, voice: string): Promise<boolean> => {
    return downloadTextSound(letter, voice, `Pronounce the Nepali letter sound: ${letter}`);
};

const downloadPhraseSound = async (phrase: string, voice: string): Promise<boolean> => {
    const isNepali = /[\u0900-\u097F]/.test(phrase);
    const prompt = isNepali
        ? `Pronounce clearly in Nepali: ${phrase}`
        : `Pronounce clearly in English: ${phrase}`;
    return downloadTextSound(phrase, voice, prompt);
};

let downloadQueue: { text: string; voice: string; type: 'letter' | 'phrase' }[] = [];
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
            const success = task.type === 'letter'
                ? await downloadLetterSound(task.text, task.voice)
                : await downloadPhraseSound(task.text, task.voice);
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
    const missing = alphabet
        .filter(l => !vault[buildAudioKey(l.char, voice)])
        .map(l => ({ text: l.char, voice, type: 'letter' as const }));
    downloadQueue = [...missing, ...downloadQueue];
    if (!isProcessingQueue) processDownloadQueue();
};

export const preCachePhrases = (lang: LanguageCode, voice: string, limit: number = 10) => {
    const phrases = STATIC_PHRASES[lang] || [];
    const vault = getAudioVault();
    const missing = phrases
        .slice(0, limit)
        .filter(p => !vault[buildAudioKey(p.native, voice)])
        .map(p => ({ text: p.native, voice, type: 'phrase' as const }));
    downloadQueue = [...missing, ...downloadQueue];
    if (!isProcessingQueue) processDownloadQueue();
};

export const initializeLanguageSession = async (lang: LanguageCode, voice: string, onProgress: (msg: string, p: number) => void): Promise<void> => {
    onProgress("Awakening the sounds...", 30);
    await audioManager.unlock();
    await wait(400);
    onProgress("Setting up the Cabin...", 60);
    await wait(300);
    preCacheAlphabet(lang, voice);
    preCachePhrases(lang, voice);
    onProgress("Ready for takeoff!", 100);
    await wait(200);
};

export const fetchWordOfTheDay = async (lang: LanguageCode): Promise<WordOfTheDayData | null> => {
    const cacheKey = `${lang}_wotd`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const response = await generateContentWithRetry({
            model: DEFAULT_TEXT_MODEL,
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

export const fetchFunFact = async (lang: LanguageCode, outputLang: 'en' | 'np'): Promise<string> => {
    const cacheKey = `${lang}_funfact_${outputLang}`;
    const cached = appCache.get(cacheKey);
    if (cached) return cached;
    try {
        const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
        const response = await generateContentWithRetry({
            model: DEFAULT_TEXT_MODEL,
            contents: `One short, cool fact about Nepal for kids. Respond in ${responseLang}.`
        });
        const fact = response.text || "Discovery is magic!";
        appCache.set(cacheKey, fact, 3600); 
        return fact;
    } catch (e) { return "Discovery is magic!"; }
};

export interface TutorReply {
    answer: string;
    romanized?: string;
    syllables?: string[];
    examples?: string[];
    followUp?: string;
}

export const askTutorFlash = async (message: string, lang: LanguageCode, outputLang: 'en' | 'np'): Promise<TutorReply> => {
    if (!message.trim()) return { answer: '' };
    const langName = getLangName(lang);
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `You are a friendly ${langName} tutor for kids aged 6-12. Respond in ${responseLang}. Keep it short and cheerful. If the user asks for pronunciation, include romanized and syllables. JSON only.\nUser: ${message}`;
    const data = await generateJsonWithCache<TutorReply>(
        `tutor_${lang}_${outputLang}_${message}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                answer: { type: Type.STRING },
                romanized: { type: Type.STRING },
                syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                followUp: { type: Type.STRING }
            },
            required: ["answer"]
        },
        1800
    );
    return {
        answer: data.answer || (outputLang === 'np' ? 'फेरि सोध्नुस्।' : 'Ask me again.'),
        romanized: data.romanized,
        syllables: normalizeStringArray(data.syllables),
        examples: normalizeStringArray(data.examples),
        followUp: data.followUp
    };
};

export interface ExampleItem {
    native: string;
    romanized: string;
    english: string;
}

export const generateExampleWords = async (letter: string, lang: LanguageCode, outputLang: 'en' | 'np', count: number = 5): Promise<ExampleItem[]> => {
    const langName = getLangName(lang);
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Create ${count} kid-friendly example words in ${langName} that start with the letter '${letter}'. Return JSON: {"items":[{"native":"","romanized":"","english":""}]}. Also keep explanations in ${responseLang}.`;
    const data = await generateJsonWithCache<{ items: ExampleItem[] }>(
        `examples_${lang}_${outputLang}_${letter}_${count}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            native: { type: Type.STRING },
                            romanized: { type: Type.STRING },
                            english: { type: Type.STRING }
                        },
                        required: ["native", "romanized", "english"]
                    }
                }
            },
            required: ["items"]
        },
        86400
    );
    return Array.isArray(data.items) ? data.items : [];
};

export interface SentenceItem {
    native: string;
    romanized: string;
    english: string;
}

export const generateExampleSentences = async (word: string, lang: LanguageCode, outputLang: 'en' | 'np', count: number = 3): Promise<SentenceItem[]> => {
    const langName = getLangName(lang);
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Create ${count} short, kid-friendly sentences in ${langName} using the word '${word}'. Return JSON: {"items":[{"native":"","romanized":"","english":""}]}. Keep explanations in ${responseLang}.`;
    const data = await generateJsonWithCache<{ items: SentenceItem[] }>(
        `sentences_${lang}_${outputLang}_${word}_${count}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            native: { type: Type.STRING },
                            romanized: { type: Type.STRING },
                            english: { type: Type.STRING }
                        },
                        required: ["native", "romanized", "english"]
                    }
                }
            },
            required: ["items"]
        },
        86400
    );
    return Array.isArray(data.items) ? data.items : [];
};

export interface StoryResult {
    story: string;
    title?: string;
}

export const generateSimpleStory = async (words: string[], lang: LanguageCode, outputLang: 'en' | 'np'): Promise<StoryResult> => {
    const langName = getLangName(lang);
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Write a 4-5 sentence, kid-friendly story in ${langName} using these words: ${words.join(', ')}. Respond in ${responseLang}. Return JSON: {"title":"","story":""}.`;
    const data = await generateJsonWithCache<StoryResult>(
        `story_${lang}_${outputLang}_${words.join('_')}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                story: { type: Type.STRING }
            },
            required: ["story"]
        },
        86400
    );
    return data;
};

export interface CultureExplainResult {
    text: string;
}

export const generateCultureExplanation = async (topic: string, lang: LanguageCode, outputLang: 'en' | 'np'): Promise<CultureExplainResult> => {
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Explain ${topic} in simple, kid-friendly language about Nepal. Respond in ${responseLang}. Return JSON: {"text":""}.`;
    const data = await generateJsonWithCache<CultureExplainResult>(
        `culture_${lang}_${outputLang}_${topic}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: { text: { type: Type.STRING } },
            required: ["text"]
        },
        86400
    );
    return data;
};

export interface TraceStepResult {
    char: string;
    steps: { step: number; instruction: string }[];
    tip?: string;
}

export const generateTracingSteps = async (char: string, lang: LanguageCode, outputLang: 'en' | 'np'): Promise<TraceStepResult> => {
    const langName = getLangName(lang);
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Give step-by-step writing guidance for '${char}' in ${langName}. Respond in ${responseLang}. Return JSON: {"char":"","steps":[{"step":1,"instruction":""}],"tip":""}.`;
    const data = await generateJsonWithCache<TraceStepResult>(
        `trace_steps_${lang}_${outputLang}_${char}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                char: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.NUMBER },
                            instruction: { type: Type.STRING }
                        },
                        required: ["step", "instruction"]
                    }
                },
                tip: { type: Type.STRING }
            },
            required: ["char", "steps"]
        },
        86400
    );
    return data;
};

export interface QuizItem {
    questionNative: string;
    questionEn: string;
    optionsNative: string[];
    optionsEn: string[];
    correctIndex: number;
    factNative: string;
    factEn: string;
}

export const generateQuizQuestions = async (lang: LanguageCode, count: number = 5): Promise<QuizItem[]> => {
    const prompt = `Create ${count} kid-friendly trivia questions about Nepal. Return JSON: {"questions":[{"questionNative":"","questionEn":"","optionsNative":[""],"optionsEn":[""],"correctIndex":0,"factNative":"","factEn":""}]}.`;
    const data = await generateJsonWithCache<{ questions: QuizItem[] }>(
        `quiz_${lang}_${count}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            questionNative: { type: Type.STRING },
                            questionEn: { type: Type.STRING },
                            optionsNative: { type: Type.ARRAY, items: { type: Type.STRING } },
                            optionsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.NUMBER },
                            factNative: { type: Type.STRING },
                            factEn: { type: Type.STRING }
                        },
                        required: ["questionNative", "questionEn", "optionsNative", "optionsEn", "correctIndex", "factNative", "factEn"]
                    }
                }
            },
            required: ["questions"]
        },
        86400
    );
    return Array.isArray(data.questions) ? data.questions : [];
};

export interface ScrambleItem {
    scrambled: string;
    answer: string;
    english: string;
    hint: string;
    hintEn: string;
}

export const generateWordScrambles = async (lang: LanguageCode, count: number = 5): Promise<ScrambleItem[]> => {
    const langName = getLangName(lang);
    const prompt = `Create ${count} kid-friendly word scramble items in ${langName}. Return JSON: {"items":[{"scrambled":"","answer":"","english":"","hint":"","hintEn":""}]}. Keep answers in ${langName}.`;
    const data = await generateJsonWithCache<{ items: ScrambleItem[] }>(
        `scramble_${lang}_${count}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scrambled: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            english: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            hintEn: { type: Type.STRING }
                        },
                        required: ["scrambled", "answer", "english", "hint", "hintEn"]
                    }
                }
            },
            required: ["items"]
        },
        86400
    );
    return Array.isArray(data.items) ? data.items : [];
};

export interface PronunciationHintResult {
    romanized: string;
    syllables: string[];
    hint: string;
}

export const generatePronunciationHints = async (text: string, lang: LanguageCode, outputLang: 'en' | 'np'): Promise<PronunciationHintResult> => {
    const responseLang = outputLang === 'np' ? 'Nepali (Devanagari)' : 'English';
    const prompt = `Give pronunciation hints for '${text}'. Respond in ${responseLang}. Return JSON: {"romanized":"","syllables":[""],"hint":""}.`;
    const data = await generateJsonWithCache<PronunciationHintResult>(
        `pronounce_${lang}_${outputLang}_${text}`,
        prompt,
        {
            type: Type.OBJECT,
            properties: {
                romanized: { type: Type.STRING },
                syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                hint: { type: Type.STRING }
            },
            required: ["romanized", "syllables", "hint"]
        },
        86400
    );
    return {
        romanized: data.romanized || '',
        syllables: normalizeStringArray(data.syllables),
        hint: data.hint || ''
    };
};

export const evaluateSpeechPronunciation = async (
    base64Audio: string,
    text: string,
    english: string
): Promise<{ score: number; comment: string }> => {
    const prompt = `A child is learning Nepali. They said "${text}" (${english}). Rate their pronunciation 1-100 and provide a tiny encouraging 3-word comment. JSON: {"score": number, "comment": string}`;
    const response = await generateContentWithRetry({
        model: DEFAULT_TEXT_MODEL,
        contents: [
            {
                parts: [
                    { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
                    { text: prompt }
                ]
            }
        ],
        config: { responseMimeType: "application/json" }
    });

    const parsed = extractJSON(response.text || '{}') || {};
    const rawScore = Number(parsed.score);
    return {
        score: Number.isFinite(rawScore) ? rawScore : 85,
        comment: typeof parsed.comment === 'string' ? parsed.comment : 'Good job!'
    };
};

const normalizeSoundPath = (path?: string | null) => {
    if (!path) return path || '';
    return path.replace(/^\/assets\/voice\//, '/assets/voices/');
};

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
    const remote = await fetchContentJson<LetterData[]>(`/content/${lang}/alphabet.json`, `content_${lang}_alphabet`);
    const alphabet = remote || STATIC_ALPHABET[lang] || [];
    return alphabet.map(letter => ({
        ...letter,
        letterNepaliAudio: normalizeSoundPath(letter.letterNepaliAudio),
        letterEnglishAudio: normalizeSoundPath(letter.letterEnglishAudio),
        examples: (letter.examples || []).map(example => ({
            ...example,
            nepaliAudio: normalizeSoundPath(example.nepaliAudio),
            englishAudio: normalizeSoundPath(example.englishAudio)
        }))
    }));
};

export const fetchNumbers = async (lang: LanguageCode): Promise<NumberData[]> => {
    const remote = await fetchContentJson<NumberData[]>(`/content/${lang}/numbers.json`, `content_${lang}_numbers`);
    return remote || STATIC_NUMBERS[lang] || [];
};

export const fetchVocabulary = async (lang: LanguageCode): Promise<VocabularyCategory[]> => {
    const remote = await fetchContentJson<VocabularyCategory[]>(`/content/${lang}/vocabulary.json`, `content_${lang}_vocabulary`);
    return remote || STATIC_VOCABULARY[lang] || [];
};

export interface QuizContentItem {
    id: number;
    question: string;
    questionEn: string;
    options: string[];
    optionsEn: string[];
    correctAnswer: number;
    fact: string;
    factEn: string;
}

export const fetchQuizContent = async (lang: LanguageCode): Promise<QuizContentItem[] | null> => {
    return await fetchContentJson<QuizContentItem[]>(`/content/${lang}/quiz.json`, `content_${lang}_quiz`);
};

export const translatePhrase = async (
    text: string,
    lang: LanguageCode,
    direction: 'toNative' | 'toEnglish' = 'toNative'
): Promise<PhraseData | null> => {
    try {
        const prompt = direction === 'toNative'
            ? `Translate "${text}" into ${getLangName(lang)} for a child. Provide a practical, commonly used phrase. Return JSON with native (in ${getLangName(lang)}), transliteration (romanized), english (in English), and category.`
            : `Translate "${text}" from ${getLangName(lang)} to English for a child. Return JSON with native (original ${getLangName(lang)} phrase), transliteration (romanized), english (in English), and category.`;

        const response = await generateContentWithRetry({
            model: DEFAULT_TEXT_MODEL,
            contents: prompt,
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

export const askKidAssistant = async (message: string, lang: LanguageCode): Promise<string> => {
    if (!message.trim()) return '';
    try {
        const response = await generateContentWithRetry({
            model: DEFAULT_TEXT_MODEL,
            contents: `You are a cheerful Nepali assistant for kids. Respond in simple Nepali, short sentences, and be friendly. Answer: "${message}"`,
            config: {
                responseMimeType: "text/plain"
            }
        });
        return response.text || 'म यहाँ छु! फेरि प्रयास गरौँ।';
    } catch (e) {
        return 'माफ गर्नुहोस्, अहिले म व्यस्त छु। फेरि प्रयास गरौँ।';
    }
};

export const validateHandwriting = async (base64: string, char: string, lang: LanguageCode): Promise<boolean> => {
    try {
        const response = await generateContentWithRetry({
            model: DEFAULT_TEXT_MODEL,
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
