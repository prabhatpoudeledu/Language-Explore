
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterData, SongData, GeoItem, WordChallenge, PhraseData, LanguageCode, LANGUAGES, WordOfTheDayData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Caching Variables (Memory) ---
const alphabetCache: Record<string, LetterData[]> = {};
const songCache: Record<string, SongData[]> = {}; 
const geoCache: Record<string, GeoItem[]> = {}; 
const wordCache: Record<string, WordChallenge[]> = {}; 
const phraseCache: Record<string, PhraseData[]> = {};
const audioCache: Record<string, string> = {}; 
const wotdCache: Record<string, WordOfTheDayData> = {};

const getCountry = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.country || 'Nepal';
const getLangName = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.name || 'Nepali';

// --- Haptic Feedback Utility ---
export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

// --- Local Storage Helpers with Quota Management ---

// Helper to remove items matching a condition
const cleanStorage = (predicate: (key: string) => boolean) => {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && predicate(key)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        console.log(`Cleaned ${keysToRemove.length} items from storage.`);
    } catch (e) {
        console.warn("Error cleaning storage", e);
    }
};

const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn("LocalStorage quota exceeded. Attempting cleanup...");
            
            // Priority 1: Clear any cached audio (if we were saving it, though currently we keep it in memory mostly)
            cleanStorage(k => k.startsWith('audio_'));

            // Priority 2: Clear old WOTD entries
            cleanStorage(k => k.startsWith('wotd_'));

            // Priority 3: Clear Geo items (they contain heavy images)
            cleanStorage(k => k.includes('_geo_'));

            try {
                // Try saving again after cleanup
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e2) {
                console.warn("Still unable to save to LocalStorage after cleanup.");
                
                // Priority 4: Smart Degradation for Geo Items
                // If we are trying to save Geo items with images, strip the images and save text only.
                if (key.includes('_geo_') && Array.isArray(data)) {
                    console.log("Attempting to save text-only version of content...");
                    const textOnlyData = data.map((item: any) => {
                        const { imageBase64, ...rest } = item;
                        return rest; // Return object without imageBase64
                    });
                    try {
                        localStorage.setItem(key, JSON.stringify(textOnlyData));
                        console.log("Saved text-only version successfully.");
                    } catch (e3) {
                        console.error("Critical: Cannot save even text data.", e3);
                    }
                }
            }
        } else {
            console.warn("LocalStorage error", e);
        }
    }
};

const getFromStorage = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

// --- Utilities ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractJSON = (text: string): any => {
    try {
        return JSON.parse(text);
    } catch (e) {
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try { return JSON.parse(arrayMatch[0]); } catch (e2) {}
        }
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
             try { return JSON.parse(objectMatch[0]); } catch (e3) {}
        }
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try { return JSON.parse(cleaned); } catch (e4) {}
        throw new Error("Could not extract JSON from response");
    }
};

const generateContentWithRetry = async (params: any, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            const isRateLimit = 
                error?.status === 429 || 
                error?.code === 429 || 
                error?.status === 503 || 
                (error?.message && error.message.includes('429')) ||
                (error?.message && error.message.includes('quota'));

            if (isRateLimit) {
                console.warn(`API Rate Limit hit (Attempt ${i+1}/${retries}). Retrying in ${Math.pow(2, i + 1)}s...`);
                await wait(1500 * Math.pow(2, i + 1)); 
                continue;
            }
            throw error; 
        }
    }
    throw new Error("Max retries exceeded for Gemini API");
};

// --- Helper for Audio Decoding ---
const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const pcmData = new Int16Array(bytes.buffer);
  const channels = 1;
  const sampleRate = 24000;
  const buffer = audioContext.createBuffer(channels, pcmData.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0;
  }
  return buffer;
};

export const playAudio = async (base64Audio: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 24000 });
      const buffer = await decodeAudioData(base64Audio, audioContext);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => {
          resolve();
          try { audioContext.close(); } catch(e) {}
      };
      source.start();
    } catch (e) {
      console.error("Audio playback failed", e);
      resolve(); 
    }
  });
};

const generateImage = async (prompt: string): Promise<string | undefined> => {
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        }, 1); 

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return part.inlineData.data;
        }
    } catch (e) {
        console.warn("Image gen skipped");
        return undefined;
    }
    return undefined;
};

const scrambleWord = (word: string, lang: string): string[] => {
    let segments: string[] = [];
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        try {
            const segmenter = new (Intl as any).Segmenter(lang, { granularity: 'grapheme' });
            segments = [...segmenter.segment(word)].map((s: any) => s.segment);
        } catch (e) { segments = word.split(''); }
    } else { segments = word.split(''); }

    for (let i = segments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segments[i], segments[j]] = [segments[j], segments[i]];
    }
    return segments;
};

// --- FALLBACKS ---
const FALLBACK_ALPHABET: LetterData[] = [
    { char: 'अ', type: 'Vowel', transliteration: 'a', exampleWord: 'Amala', exampleWordTransliteration: 'Amala', exampleWordEnglish: 'Gooseberry' },
    { char: 'A', type: 'Vowel', transliteration: 'a', exampleWord: 'Apple', exampleWordTransliteration: 'Apple', exampleWordEnglish: 'Apple' },
];
const FALLBACK_WORDS: WordChallenge[] = [
    { word: "नमस्ते", english: "Hello", scrambled: ["न","म","स्","ते"] },
    { word: "Book", english: "Book", scrambled: ["B","o","o","k"] }
];
const FALLBACK_PHRASES: PhraseData[] = [
    { native: "नमस्ते", transliteration: "Namaste", english: "Hello", category: "Greeting" }
];

// --- Content Generation with Persistence ---

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
  const cacheKey = `cache_${lang}_alphabet`;
  
  if (alphabetCache[lang]) return alphabetCache[lang];
  
  const stored = getFromStorage<LetterData[]>(cacheKey);
  if (stored) {
      alphabetCache[lang] = stored;
      return stored;
  }

  const langName = getLangName(lang);
  let promptText = `Generate a JSON list of the alphabet for the ${langName} language. For each letter, provide a simple example word for a child.`;
  if (lang === 'np' || lang === 'hi') {
      promptText = `Generate a COMPLETE JSON list of the ${langName} Varnamala. You MUST include ALL Vowels (Swar) and ALL Consonants (Vyanjan). Do not skip any letters. List them in traditional order.`;
  } else if (lang === 'zh') {
      promptText = `Generate a list of 20 basic/common Chinese characters for beginners.`;
  }

  try {
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                char: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Vowel", "Consonant", "Character"] },
                transliteration: { type: Type.STRING },
                exampleWord: { type: Type.STRING },
                exampleWordTransliteration: { type: Type.STRING },
                exampleWordEnglish: { type: Type.STRING },
              },
              required: ["char", "type", "transliteration", "exampleWord", "exampleWordTransliteration", "exampleWordEnglish"],
            },
          },
        },
      });
      
      const data = extractJSON(response.text || "[]");
      if (data.length > 0) {
          alphabetCache[lang] = data;
          saveToStorage(cacheKey, data);
          return data;
      }
      throw new Error("Empty alphabet response");
  } catch (e) {
      console.warn("Fetch alphabet failed, using fallback.", e);
      alphabetCache[lang] = FALLBACK_ALPHABET;
      return FALLBACK_ALPHABET;
  }
};

export const fetchWordBatch = async (lang: LanguageCode, count: number = 10): Promise<WordChallenge[]> => {
    // Only persistent cache the initial batch to ensure fresh content later
    const cacheKey = `cache_${lang}_words_initial`;

    if (wordCache[lang] && count === 10) {
        const cached = wordCache[lang];
        delete wordCache[lang]; 
        return cached;
    }

    if (count === 10) {
        const stored = getFromStorage<WordChallenge[]>(cacheKey);
        if (stored) {
            return stored;
        }
    }

    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Create ${count} simple, unique, common ${langName} words for kids to learn. Return JSON with the word and its English translation.`,
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
        const processed = rawData.map((item: any) => ({
            word: item.word,
            english: item.english,
            scrambled: scrambleWord(item.word, lang)
        }));

        if (count === 10 && processed.length > 0) {
            saveToStorage(cacheKey, processed);
        }

        return processed;
    } catch (e) {
        return FALLBACK_WORDS;
    }
}

export const fetchSongsByCategory = async (lang: LanguageCode, category: string): Promise<SongData[]> => {
  const cacheKey = `cache_${lang}_songs_${category}`;
  if (songCache[cacheKey]) return songCache[cacheKey];
  
  const stored = getFromStorage<SongData[]>(cacheKey);
  if (stored) {
      songCache[cacheKey] = stored;
      return stored;
  }

  const langName = getLangName(lang);
  try {
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: `Find 3 popular ${langName} ${category} songs for kids. Use Google Search tool to find YouTube videos. Extract YouTube ID. OUTPUT JSON ARRAY.`,
        config: { tools: [{googleSearch: {}}] },
      });

      let text = response.text || "[]";
      const data = extractJSON(text);
      if (Array.isArray(data) && data.length > 0) {
          songCache[cacheKey] = data;
          saveToStorage(cacheKey, data);
          return data;
      }
      return [];
  } catch (e) {
      return [];
  }
};

export const fetchPhrases = async (lang: LanguageCode): Promise<PhraseData[]> => {
    const cacheKey = `cache_${lang}_phrases`;
    if (phraseCache[lang]) return phraseCache[lang];

    const stored = getFromStorage<PhraseData[]>(cacheKey);
    if (stored) {
        phraseCache[lang] = stored;
        return stored;
    }

    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Create a list of 15 common ${langName} phrases for kids.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
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
            }
        });

        const data = extractJSON(response.text || "[]");
        if (data.length > 0) {
            phraseCache[lang] = data;
            saveToStorage(cacheKey, data);
            return data;
        }
        throw new Error("Empty phrases");
    } catch (e) {
        return FALLBACK_PHRASES;
    }
};

export const translatePhrase = async (text: string, lang: LanguageCode): Promise<PhraseData | null> => {
    // Translations are on-demand, usually not cached persistently unless we build a dict
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Translate English phrase "${text}" to ${langName}. Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        native: { type: Type.STRING },
                        transliteration: { type: Type.STRING },
                        english: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ["Daily"] }
                    },
                    required: ["native", "transliteration", "english"]
                }
            }
        }, 1);
        return extractJSON(response.text || "{}");
    } catch (e) {
        return null;
    }
};

export const isGeoCategoryCached = (lang: LanguageCode, category: string): boolean => {
    const cacheKey = `cache_${lang}_geo_${category}`;
    return !!geoCache[cacheKey] || !!localStorage.getItem(cacheKey);
}

export const fetchGeographyItems = async (lang: LanguageCode, category: string, existingCount: number = 0): Promise<GeoItem[]> => {
  const cacheKey = `cache_${lang}_geo_${category}`;
  
  if (existingCount === 0) {
      if (geoCache[cacheKey]) return geoCache[cacheKey];
      const stored = getFromStorage<GeoItem[]>(cacheKey);
      if (stored) {
          geoCache[cacheKey] = stored;
          return stored;
      }
  }

  const country = getCountry(lang);
  let prompt = "";
  if (category === 'Symbols') {
      prompt = `List the National Flag, National Bird, National Animal, and National Sport (or Flower) of ${country}. Return 4 items. Return JSON.`;
  } else {
      prompt = `List 3 distinct, kid-friendly famous places or facts about "${category}" in ${country}. Return JSON.`;
  }

  try {
      const textResponse = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                titleEn: { type: Type.STRING },
                titleNative: { type: Type.STRING },
                descriptionEn: { type: Type.STRING },
                descriptionNative: { type: Type.STRING },
                searchTerm: { type: Type.STRING },
              },
              required: ["id", "titleEn", "titleNative", "descriptionEn", "descriptionNative", "searchTerm"]
            }
          }
        },
      });

      const items: GeoItem[] = extractJSON(textResponse.text || "[]");
      const enhancedItems = [];
      for (const item of items) {
          const imagePrompt = category === 'Symbols' 
            ? `A high quality, clear image of the ${item.titleEn} of ${country}, isolated.`
            : `A photorealistic, 4k high-resolution travel photography shot of ${item.searchTerm} in ${country}.`;

          const img = await generateImage(imagePrompt);
          const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.searchTerm + " " + country)}`;
          
          enhancedItems.push({
            ...item,
            imageBase64: img,
            mapLink
          });
          await wait(500);
      }

      if (existingCount === 0 && enhancedItems.length > 0) {
          geoCache[cacheKey] = enhancedItems;
          saveToStorage(cacheKey, enhancedItems);
      }
      return enhancedItems;
  } catch (e) {
      return [];
  }
};

export const fetchWordOfTheDay = async (lang: LanguageCode): Promise<WordOfTheDayData | null> => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `wotd_${lang}_${today}`;
    
    // Check Memory
    if (wotdCache[cacheKey]) return wotdCache[cacheKey];

    // Check Storage
    const stored = getFromStorage<WordOfTheDayData>(cacheKey);
    if (stored && stored.date === today) {
        wotdCache[cacheKey] = stored;
        return stored;
    }

    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Generate a random, fun Word of the Day for a child learning ${langName}. Include a simple example sentence. JSON output.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        transliteration: { type: Type.STRING },
                        english: { type: Type.STRING },
                        sentence: { type: Type.STRING },
                    },
                    required: ["word", "transliteration", "english", "sentence"]
                }
            }
        });
        
        const data = extractJSON(response.text || "{}");
        const wotd: WordOfTheDayData = { ...data, date: today };
        
        wotdCache[cacheKey] = wotd;
        saveToStorage(cacheKey, wotd);
        return wotd;
    } catch (e) {
        return null;
    }
};


const speakWithBrowser = (text: string): Promise<void> => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) { resolve(); return; }
        const runSpeak = () => {
             window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(text);
            const isDevanagari = /[\u0900-\u097F]/.test(text);
            const isChinese = /[\u4E00-\u9FFF]/.test(text);
            const isSpanish = /[áéíóúñ]/.test(text);
            const voices = window.speechSynthesis.getVoices();
            if (isDevanagari) {
                 const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('ne') || v.lang.includes('in'));
                 if (hindiVoice) utterance.voice = hindiVoice;
                 utterance.lang = 'hi-IN'; 
            } else if (isChinese) {
                utterance.lang = 'zh-CN';
            } else if (isSpanish) {
                utterance.lang = 'es-ES';
            } else {
                utterance.lang = 'en-US';
            }
            utterance.rate = 0.9;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length === 0) {
             const voiceHandler = () => {
                 runSpeak();
                 window.speechSynthesis.removeEventListener('voiceschanged', voiceHandler);
             };
             window.speechSynthesis.addEventListener('voiceschanged', voiceHandler);
             setTimeout(runSpeak, 500);
        } else {
            runSpeak();
        }
    });
}

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  const cacheKey = `audio_${text.substring(0,20)}_${voiceName}`;
  if (audioCache[cacheKey]) return await playAudio(audioCache[cacheKey]);

  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
      },
    }, 2); 

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      audioCache[cacheKey] = base64Audio;
      return await playAudio(base64Audio);
    }
  } catch (error) {
    await speakWithBrowser(text);
  }
};

export const validateHandwriting = async (imageBase64: string, targetChar: string, lang: LanguageCode): Promise<boolean> => {
    try {
        const langName = getLangName(lang);
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/png", data: imageBase64 } },
                    { text: `Is this a legible ${langName} character "${targetChar}"? Return JSON: { "match": boolean }` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { match: { type: Type.BOOLEAN } },
                    required: ["match"]
                }
            }
        });
        const result = extractJSON(response.text || "{}");
        return result.match === true;
    } catch (e) {
        return false; 
    }
};

export const initializeLanguageSession = async (lang: LanguageCode): Promise<void> => {
    // If we have persistent data, we don't need to force wait as much, but sequential check is good.
    try {
        await fetchAlphabet(lang);
        await wait(500); 
        await fetchWordBatch(lang);
        if(getFromStorage(`cache_${lang}_words_initial`)) wordCache[lang] = getFromStorage(`cache_${lang}_words_initial`)!;
        await wait(500);
        await fetchPhrases(lang);
        await wait(500);
        await fetchGeographyItems(lang, 'Symbols', 0);
        await wait(500);
        await fetchWordOfTheDay(lang); // Fetch WOTD in background
    } catch (e) {
        console.warn("Init failed");
    }
};
