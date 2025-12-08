
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterData, SongData, GeoItem, WordChallenge, PhraseData, LanguageCode, LANGUAGES } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Caching Variables (Keyed by Language) ---
const alphabetCache: Record<string, LetterData[]> = {};
const songCache: Record<string, SongData[]> = {}; // Key: lang-category
const geoCache: Record<string, GeoItem[]> = {}; // Key: lang-category
const wordCache: Record<string, WordChallenge[]> = {}; // Key: lang (for initial batch)
const phraseCache: Record<string, PhraseData[]> = {};
const audioCache: Record<string, string> = {}; // Key: text-voice, Value: base64 string

const getCountry = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.country || 'Nepal';
const getLangName = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.name || 'Nepali';

// --- Utilities ---

// Wait function for backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to extract JSON from potentially conversational response
const extractJSON = (text: string): any => {
    try {
        // 1. Try direct parse
        return JSON.parse(text);
    } catch (e) {
        // 2. Try extracting [ ... ] or { ... }
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try { return JSON.parse(arrayMatch[0]); } catch (e2) {}
        }
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
             try { return JSON.parse(objectMatch[0]); } catch (e3) {}
        }
        
        // 3. Last ditch: clean markdown
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try { return JSON.parse(cleaned); } catch (e4) {}
        
        throw new Error("Could not extract JSON from response");
    }
};

// Wrapper for API calls with Retry Logic (Handling 429s)
const generateContentWithRetry = async (params: any, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            // Check for 429 or 503 (Quota or Server Overload) or string matching
            const isRateLimit = 
                error?.status === 429 || 
                error?.code === 429 || 
                error?.status === 503 || 
                (error?.message && error.message.includes('429')) ||
                (error?.message && error.message.includes('quota'));

            if (isRateLimit) {
                console.warn(`API Rate Limit hit (Attempt ${i+1}/${retries}). Retrying in ${Math.pow(2, i + 1)}s...`);
                await wait(1500 * Math.pow(2, i + 1)); // Aggressive backoff: 3s, 6s, 12s
                continue;
            }
            throw error; // Throw other errors immediately
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

// Returns a promise that resolves when audio finishes playing
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
      resolve(); // Resolve anyway to continue flow
    }
  });
};

// --- Helper for Image Generation ---
const generateImage = async (prompt: string): Promise<string | undefined> => {
    try {
        // We use the retry wrapper here too, but catch errors silently to just return undefined image
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        }, 1); // Only retry once for images to save time

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    } catch (e) {
        console.warn("Image gen skipped due to load/error");
        return undefined;
    }
    return undefined;
};

// --- Helper for Scrambling ---
const scrambleWord = (word: string, lang: string): string[] => {
    // Use Intl.Segmenter for correct grapheme splitting (crucial for Indic languages)
    let segments: string[] = [];
    if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
        try {
            const segmenter = new (Intl as any).Segmenter(lang, { granularity: 'grapheme' });
            segments = [...segmenter.segment(word)].map((s: any) => s.segment);
        } catch (e) {
             segments = word.split('');
        }
    } else {
        segments = word.split('');
    }

    // Fisher-Yates Shuffle
    for (let i = segments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segments[i], segments[j]] = [segments[j], segments[i]];
    }
    return segments;
};

// --- FALLBACK DATA (For Offline/Quota Exceeded) ---
const FALLBACK_ALPHABET: LetterData[] = [
    { char: 'अ', type: 'Vowel', transliteration: 'a', exampleWord: 'Amala', exampleWordTransliteration: 'Amala', exampleWordEnglish: 'Gooseberry' },
    { char: 'आ', type: 'Vowel', transliteration: 'aa', exampleWord: 'Aama', exampleWordTransliteration: 'Aama', exampleWordEnglish: 'Mother' },
    { char: 'इ', type: 'Vowel', transliteration: 'i', exampleWord: 'Inar', exampleWordTransliteration: 'Inar', exampleWordEnglish: 'Well' },
    { char: 'क', type: 'Consonant', transliteration: 'ka', exampleWord: 'Kamala', exampleWordTransliteration: 'Kamala', exampleWordEnglish: 'Lotus' },
    { char: 'ख', type: 'Consonant', transliteration: 'kha', exampleWord: 'Khasi', exampleWordTransliteration: 'Khasi', exampleWordEnglish: 'Goat' },
    { char: 'ग', type: 'Consonant', transliteration: 'ga', exampleWord: 'Gamala', exampleWordTransliteration: 'Gamala', exampleWordEnglish: 'Flower Pot' },
    { char: 'घ', type: 'Consonant', transliteration: 'gha', exampleWord: 'Ghar', exampleWordTransliteration: 'Ghar', exampleWordEnglish: 'House' },
    { char: 'A', type: 'Vowel', transliteration: 'a', exampleWord: 'Apple', exampleWordTransliteration: 'Apple', exampleWordEnglish: 'Apple' },
    { char: 'B', type: 'Consonant', transliteration: 'b', exampleWord: 'Ball', exampleWordTransliteration: 'Ball', exampleWordEnglish: 'Ball' },
];

const FALLBACK_WORDS: WordChallenge[] = [
    { word: "नमस्ते", english: "Hello", scrambled: ["न","म","स्","ते"] },
    { word: "घर", english: "House", scrambled: ["घ","र"] },
    { word: "पानी", english: "Water", scrambled: ["पा","नी"] },
    { word: "Book", english: "Book", scrambled: ["B","o","o","k"] }
];

const FALLBACK_PHRASES: PhraseData[] = [
    { native: "नमस्ते", transliteration: "Namaste", english: "Hello", category: "Greeting" },
    { native: "धन्यवाद", transliteration: "Dhanyabad", english: "Thank you", category: "Daily" },
    { native: "पानी", transliteration: "Paani", english: "Water", category: "Food" },
    { native: "खाना", transliteration: "Khana", english: "Food", category: "Food" }
];

// --- Content Generation ---

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
  if (alphabetCache[lang]) return alphabetCache[lang];

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
          return data;
      }
      throw new Error("Empty alphabet response");
  } catch (e) {
      console.warn("Fetch alphabet failed, using fallback.", e);
      // Return Fallback if API fails so app is usable
      const fb = FALLBACK_ALPHABET.filter(l => lang === 'np' || lang === 'hi' ? l.transliteration !== 'NA' : l.char.match(/[A-Za-z]/));
      alphabetCache[lang] = fb;
      return fb;
  }
};

export const fetchWordBatch = async (lang: LanguageCode, count: number = 10): Promise<WordChallenge[]> => {
    // Check cache for first batch only
    if (wordCache[lang] && count === 10) {
        const cached = wordCache[lang];
        delete wordCache[lang]; // Consume cache
        return cached;
    }

    const langName = getLangName(lang);
    
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Create ${count} simple, unique, common ${langName} words for kids to learn. 
            Return JSON with the word and its English translation. Do not include complex sentences, just single words.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            english: { type: Type.STRING },
                        },
                        required: ["word", "english"]
                    }
                }
            }
        });
        
        const rawData = extractJSON(response.text || "[]");

        // Process scrambling locally to ensure 100% accuracy
        return rawData.map((item: any) => ({
            word: item.word,
            english: item.english,
            scrambled: scrambleWord(item.word, lang)
        }));
    } catch (e) {
        console.warn("Fetch words failed, using fallback", e);
        return FALLBACK_WORDS;
    }
}

export const fetchSongsByCategory = async (lang: LanguageCode, category: string): Promise<SongData[]> => {
  const cacheKey = `${lang}-${category}`;
  if (songCache[cacheKey]) return songCache[cacheKey];

  const langName = getLangName(lang);
  
  try {
      const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: `Find 3 popular ${langName} ${category} songs for kids. 
        Use the Google Search tool to find actual YouTube videos for these songs.
        
        IMPORTANT: Extract the YouTube Video ID (11 chars) from search results.
        
        OUTPUT FORMAT:
        Strictly output a JSON Array. Do NOT output conversational text like "Here are the songs".
        Start with [ and end with ].
        
        Structure:
        [
          {
            "title": "Title in English",
            "titleNative": "Title in ${langName}",
            "category": "${category}",
            "description": "Short description in English",
            "descriptionNative": "Short description in ${langName}",
            "lyricsOriginal": "Chorus/Main lyrics in ${langName}",
            "youtubeId": "VideoID"
          }
        ]`,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      let text = response.text || "[]";
      const data = extractJSON(text);
      
      if (Array.isArray(data) && data.length > 0) {
          songCache[cacheKey] = data;
          return data;
      }
      return [];
  } catch (e) {
      console.error("Failed to fetch songs", e);
      return [];
  }
};

export const fetchPhrases = async (lang: LanguageCode): Promise<PhraseData[]> => {
    if (phraseCache[lang]) return phraseCache[lang];

    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Create a list of 15 common ${langName} phrases for kids including Greetings, Food items, and Daily communication words.`,
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
            return data;
        }
        throw new Error("Empty phrases");
    } catch (e) {
        console.error("Fetch phrases failed", e);
        phraseCache[lang] = FALLBACK_PHRASES;
        return FALLBACK_PHRASES;
    }
};

export const translatePhrase = async (text: string, lang: LanguageCode): Promise<PhraseData | null> => {
    const langName = getLangName(lang);
    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: `Translate the following English phrase to ${langName} for a child to learn: "${text}".
            Return JSON.`,
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
        console.error("Translation failed", e);
        return null;
    }
};

export const isGeoCategoryCached = (lang: LanguageCode, category: string): boolean => {
    const cacheKey = `${lang}-${category}`;
    return !!geoCache[cacheKey];
}

export const fetchGeographyItems = async (lang: LanguageCode, category: string, existingCount: number = 0): Promise<GeoItem[]> => {
  const cacheKey = `${lang}-${category}`;
  if (existingCount === 0 && geoCache[cacheKey]) return geoCache[cacheKey];

  const country = getCountry(lang);
  let prompt = "";
  
  if (category === 'Symbols') {
      prompt = `List the National Flag, National Bird, National Animal, and National Sport (or Flower) of ${country}. Return 4 items. Return JSON.`;
  } else {
      prompt = `List 3 distinct, kid-friendly famous places or facts about "${category}" in ${country}. 
      Provide detailed, interesting facts for kids.
      Skip any that are likely already known if this is a follow-up request (offset: ${existingCount}).
      Return JSON.`;
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
                descriptionEn: { type: Type.STRING, description: "Detailed 2-3 sentence description in English" },
                descriptionNative: { type: Type.STRING, description: `Detailed 2-3 sentence description in ${getLangName(lang)}` },
                searchTerm: { type: Type.STRING, description: "Search term for map/image" },
              },
              required: ["id", "titleEn", "titleNative", "descriptionEn", "descriptionNative", "searchTerm"]
            }
          }
        },
      });

      const items: GeoItem[] = extractJSON(textResponse.text || "[]");

      // Generate images sequentially to avoid rate limits
      const enhancedItems = [];
      for (const item of items) {
          const imagePrompt = category === 'Symbols' 
            ? `A high quality, clear image of the ${item.titleEn} of ${country}, isolated or in natural setting.`
            : `A photorealistic, 4k high-resolution travel photography shot of ${item.searchTerm} in ${country}. Beautiful lighting, scenic view, real life style.`;

          const img = await generateImage(imagePrompt);
          const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.searchTerm + " " + country)}`;
          
          enhancedItems.push({
            ...item,
            imageBase64: img,
            mapLink
          });
          
          // Small delay between images
          await wait(500);
      }

      if (existingCount === 0 && enhancedItems.length > 0) {
          geoCache[cacheKey] = enhancedItems;
      }

      return enhancedItems;
  } catch (e) {
      console.error("Fetch geo failed", e);
      return [];
  }
};

// --- Fallback Browser TTS ---
const speakWithBrowser = (text: string): Promise<void> => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.warn("Browser does not support speech synthesis");
            resolve();
            return;
        }

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
            utterance.onerror = (e) => {
                // Ignore these benign errors
                if (e.error === 'canceled' || e.error === 'interrupted') {
                    resolve();
                    return;
                }
                console.warn(`Browser TTS failed with error: ${e.error}`);
                resolve();
            };
            
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
             const voiceHandler = () => {
                 runSpeak();
                 window.speechSynthesis.removeEventListener('voiceschanged', voiceHandler);
             };
             window.speechSynthesis.addEventListener('voiceschanged', voiceHandler);
             setTimeout(() => {
                 window.speechSynthesis.removeEventListener('voiceschanged', voiceHandler);
                 runSpeak();
             }, 500);
        } else {
            runSpeak();
        }
    });
}

export const speakText = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  const cacheKey = `${text}-${voiceName}`;
  if (audioCache[cacheKey]) {
      return await playAudio(audioCache[cacheKey]);
  }

  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    }, 2); // Less retries for audio to fail fast to browser

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      audioCache[cacheKey] = base64Audio;
      return await playAudio(base64Audio);
    }
  } catch (error) {
    // Silent fallback
    await speakWithBrowser(text);
  }
};

// --- HANDWRITING VALIDATION ---
export const validateHandwriting = async (imageBase64: string, targetChar: string, lang: LanguageCode): Promise<boolean> => {
    try {
        const langName = getLangName(lang);
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/png",
                            data: imageBase64
                        }
                    },
                    {
                        text: `Look at this handwritten image. Is this a legible attempt at writing the ${langName} character "${targetChar}"? 
                        Be lenient as it is written by a child. Return JSON: { "match": boolean }`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        match: { type: Type.BOOLEAN }
                    },
                    required: ["match"]
                }
            }
        });

        const result = extractJSON(response.text || "{}");
        return result.match === true;
    } catch (e) {
        console.error("Handwriting validation failed", e);
        return false; // Default to false if error, or true if we want to be nice? False is safer to prevent bugs.
    }
};

// --- SESSION INITIALIZATION ---
export const initializeLanguageSession = async (lang: LanguageCode): Promise<void> => {
    console.log(`Initializing session for ${lang}...`);
    
    // CRITICAL FIX: Run sequentially to prevent 429 Rate Limits on Free Tier
    try {
        await fetchAlphabet(lang);
        await wait(1000); // 1s cooldown

        const words = await fetchWordBatch(lang);
        if(words.length > 0) wordCache[lang] = words;
        await wait(1000);

        await fetchPhrases(lang);
        await wait(1000);

        // Fetch just symbols initially as it's lighter than searching 3 random places
        await fetchGeographyItems(lang, 'Symbols', 0);
    } catch (e) {
        console.warn("Some initialization steps failed. App will use fallbacks.");
    }

    console.log(`Session initialized for ${lang}`);
};
