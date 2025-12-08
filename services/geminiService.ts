import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterData, SongData, GeoItem, WordChallenge, LanguageCode, LANGUAGES } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Caching Variables (Keyed by Language) ---
const alphabetCache: Record<string, LetterData[]> = {};
const songCache: Record<string, SongData[]> = {}; // Key: lang-category
const geoCache: Record<string, GeoItem[]> = {}; // Key: lang-category
const wordCache: Record<string, WordChallenge[]> = {}; // Key: lang (for initial batch)

const getCountry = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.country || 'Nepal';
const getLangName = (lang: LanguageCode) => LANGUAGES.find(l => l.code === lang)?.name || 'Nepali';

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

export const playAudio = async (base64Audio: string) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    const buffer = await decodeAudioData(base64Audio, audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

// --- Helper for Image Generation ---
const generateImage = async (prompt: string): Promise<string | undefined> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    } catch (e) {
        console.error("Image gen failed", e);
        return undefined;
    }
    return undefined;
};

// --- Content Generation ---

export const fetchAlphabet = async (lang: LanguageCode): Promise<LetterData[]> => {
  if (alphabetCache[lang]) return alphabetCache[lang];

  const langName = getLangName(lang);
  const countPrompt = lang === 'zh' ? "30 basic characters" : "complete alphabet";
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a JSON list of the ${countPrompt} for the ${langName} language. 
    For each, provide a simple example word for a child.`,
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
  
  const data = JSON.parse(response.text || "[]");
  if (data.length > 0) alphabetCache[lang] = data;
  return data;
};

export const fetchWordBatch = async (lang: LanguageCode, count: number = 10): Promise<WordChallenge[]> => {
    // Check cache for first batch only
    if (wordCache[lang] && count === 10) {
        const cached = wordCache[lang];
        delete wordCache[lang]; // Consume cache
        return cached;
    }

    const langName = getLangName(lang);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create ${count} simple, unique, common ${langName} words for kids to learn. 
        Return JSON. The "scrambled" array must contain the letters/characters needed to form the word, shuffled.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        english: { type: Type.STRING },
                        scrambled: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["word", "english", "scrambled"]
                }
            }
        }
    });
    
    return JSON.parse(response.text || "[]");
}

export const fetchSongsByCategory = async (lang: LanguageCode, category: string): Promise<SongData[]> => {
  const cacheKey = `${lang}-${category}`;
  if (songCache[cacheKey]) return songCache[cacheKey];

  const langName = getLangName(lang);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `List 3 popular ${langName} ${category} songs or chants suitable for kids.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            titleNative: { type: Type.STRING, description: `Title in ${langName} script` },
            category: { type: Type.STRING },
            description: { type: Type.STRING, description: "Short description in English" },
            descriptionNative: { type: Type.STRING, description: `Short description in ${langName}` },
            lyricsOriginal: { type: Type.STRING, description: `First 4 lines in ${langName}` },
          },
          required: ["title", "titleNative", "category", "description", "descriptionNative", "lyricsOriginal"]
        },
      },
    },
  });

  const data = JSON.parse(response.text || "[]");
  if (data.length > 0) songCache[cacheKey] = data;
  return data;
};

export const fetchGeographyItems = async (lang: LanguageCode, category: string, existingCount: number = 0): Promise<GeoItem[]> => {
  const cacheKey = `${lang}-${category}`;
  // Only use cache if it's the first load (offset 0)
  if (existingCount === 0 && geoCache[cacheKey]) return geoCache[cacheKey];

  const country = getCountry(lang);
  
  // Step 1: Fetch Text Content
  const prompt = `List 3 distinct, kid-friendly famous places or facts about "${category}" in ${country}. 
  Provide detailed, interesting facts for kids.
  Skip any that are likely already known if this is a follow-up request (offset: ${existingCount}).
  Return JSON.`;

  const textResponse = await ai.models.generateContent({
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

  const items: GeoItem[] = JSON.parse(textResponse.text || "[]");

  // Step 2: Generate Images & Maps in Parallel
  const enhancedItems = await Promise.all(items.map(async (item) => {
    // Generate Image - Updated Prompt for Realism
    const imagePromise = generateImage(`A photorealistic, 4k high-resolution travel photography shot of ${item.searchTerm} in ${country}. Beautiful lighting, scenic view, real life style.`);
    
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.searchTerm + " " + country)}`;
    
    const [img] = await Promise.all([imagePromise]);
    
    return {
        ...item,
        imageBase64: img,
        mapLink
    };
  }));

  // Cache only the first batch
  if (existingCount === 0 && enhancedItems.length > 0) {
      geoCache[cacheKey] = enhancedItems;
  }

  return enhancedItems;
};

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  try {
    const response = await ai.models.generateContent({
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
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playAudio(base64Audio);
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- SESSION INITIALIZATION ---
// This acts as a blocking pre-loader. 
// It ensures that key content is in cache before the UI renders the main app.
export const initializeLanguageSession = async (lang: LanguageCode): Promise<void> => {
    console.log(`Initializing session for ${lang}...`);
    
    // We launch these in parallel. 
    // We do NOT await strict completion of ALL if we want to be faster, 
    // but the user requested "load contents and store in cache".
    // We will await the most critical ones to ensure "instant" feel.
    
    const promises = [
        fetchAlphabet(lang),
        
        // Fetch words and store in cache
        fetchWordBatch(lang).then(data => {
             if(data.length > 0) wordCache[lang] = data;
        }),

        // Pre-fetch National songs
        fetchSongsByCategory(lang, 'National'),
        
        // Pre-fetch Nature section
        fetchGeographyItems(lang, 'Nature', 0)
    ];

    await Promise.allSettled(promises);
    console.log(`Session initialized for ${lang}`);
};