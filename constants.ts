
import { LetterData, WordChallenge, PhraseData, LanguageCode } from './types';

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

/**
 * PRE_BAKED_AUDIO_VAULT: Maps specific characters to base64 audio strings.
 * We'll rely on the dynamic pre-fetching in geminiService to fill this up 
 * in the user's local storage (offline_audio_vault) for better performance.
 */
export const PRE_BAKED_AUDIO_VAULT: Record<string, string> = {};

export const STATIC_ALPHABET: Record<LanguageCode, LetterData[]> = {
  np: [
    { char: 'अ', type: 'Vowel', transliteration: 'a', exampleWord: 'अम्बा', exampleWordTransliteration: 'Amba', exampleWordEnglish: 'Guava' },
    { char: 'आ', type: 'Vowel', transliteration: 'aa', exampleWord: 'आँप', exampleWordTransliteration: 'Aamp', exampleWordEnglish: 'Mango' },
    { char: 'इ', type: 'Vowel', transliteration: 'i', exampleWord: 'इनामक', exampleWordTransliteration: 'Inamak', exampleWordEnglish: 'Enamel' },
    { char: 'ई', type: 'Vowel', transliteration: 'ee', exampleWord: 'ईश्वर', exampleWordTransliteration: 'Ishwor', exampleWordEnglish: 'God' },
    { char: 'उ', type: 'Vowel', transliteration: 'u', exampleWord: 'उखु', exampleWordTransliteration: 'Ukhu', exampleWordEnglish: 'Sugarcane' },
    { char: 'ऊ', type: 'Vowel', transliteration: 'oo', exampleWord: 'ऊन', exampleWordTransliteration: 'Oon', exampleWordEnglish: 'Wool' },
    { char: 'ऋ', type: 'Vowel', transliteration: 'ri', exampleWord: 'ऋषि', exampleWordTransliteration: 'Rishi', exampleWordEnglish: 'Sage' },
    { char: 'ए', type: 'Vowel', transliteration: 'e', exampleWord: 'एक', exampleWordTransliteration: 'Ek', exampleWordEnglish: 'One' },
    { char: 'ऐ', type: 'Vowel', transliteration: 'ai', exampleWord: 'ऐना', exampleWordTransliteration: 'Aina', exampleWordEnglish: 'Mirror' },
    { char: 'ओ', type: 'Vowel', transliteration: 'o', exampleWord: 'ओखल', exampleWordTransliteration: 'Okhal', exampleWordEnglish: 'Mortar' },
    { char: 'औ', type: 'Vowel', transliteration: 'au', exampleWord: 'औजार', exampleWordTransliteration: 'Aujar', exampleWordEnglish: 'Tool' },
    { char: 'अं', type: 'Vowel', transliteration: 'am', exampleWord: 'अङ्गुर', exampleWordTransliteration: 'Angur', exampleWordEnglish: 'Grape' },
    { char: 'अः', type: 'Vowel', transliteration: 'ah', exampleWord: 'दुःख', exampleWordTransliteration: 'Dukha', exampleWordEnglish: 'Sad' },
    { char: 'क', type: 'Consonant', transliteration: 'ka', exampleWord: 'कलम', exampleWordTransliteration: 'Kalam', exampleWordEnglish: 'Pen', combos: getNepaliBarahkhari('क', 'k') },
    { char: 'ख', type: 'Consonant', transliteration: 'kha', exampleWord: 'खरायो', exampleWordTransliteration: 'Kharayo', exampleWordEnglish: 'Rabbit', combos: getNepaliBarahkhari('ख', 'kh') },
    { char: 'ग', type: 'Consonant', transliteration: 'ga', exampleWord: 'गाई', exampleWordTransliteration: 'Gaai', exampleWordEnglish: 'Cow', combos: getNepaliBarahkhari('ग', 'g') },
    { char: 'घ', type: 'Consonant', transliteration: 'gha', exampleWord: 'घर', exampleWordTransliteration: 'Ghar', exampleWordEnglish: 'House', combos: getNepaliBarahkhari('घ', 'gh') },
    { char: 'ङ', type: 'Consonant', transliteration: 'nga', exampleWord: 'ङा', exampleWordTransliteration: 'Nga', exampleWordEnglish: 'Fish', combos: getNepaliBarahkhari('ङ', 'ng') },
    { char: 'च', type: 'Consonant', transliteration: 'cha', exampleWord: 'चरा', exampleWordTransliteration: 'Chara', exampleWordEnglish: 'Bird', combos: getNepaliBarahkhari('च', 'ch') },
    { char: 'छ', type: 'Consonant', transliteration: 'chha', exampleWord: 'छाता', exampleWordTransliteration: 'Chhaata', exampleWordEnglish: 'Umbrella', combos: getNepaliBarahkhari('छ', 'chh') },
    { char: 'ज', type: 'Consonant', transliteration: 'ja', exampleWord: 'जुत्ता', exampleWordTransliteration: 'Jutta', exampleWordEnglish: 'Shoe', combos: getNepaliBarahkhari('ज', 'j') },
    { char: 'झ', type: 'Consonant', transliteration: 'jha', exampleWord: 'झण्डा', exampleWordTransliteration: 'Jhanda', exampleWordEnglish: 'Flag', combos: getNepaliBarahkhari('झ', 'jh') },
    { char: 'ट', type: 'Consonant', transliteration: 'ta', exampleWord: 'टपरी', exampleWordTransliteration: 'Tapari', exampleWordEnglish: 'Leaf Plate', combos: getNepaliBarahkhari('ट', 't') },
    { char: 'ठ', type: 'Consonant', transliteration: 'tha', exampleWord: 'ठूलो', exampleWordTransliteration: 'Thulo', exampleWordEnglish: 'Big', combos: getNepaliBarahkhari('ठ', 'th') },
    { char: 'ड', type: 'Consonant', transliteration: 'da', exampleWord: 'डमरु', exampleWordTransliteration: 'Damaru', exampleWordEnglish: 'Drum', combos: getNepaliBarahkhari('ड', 'd') },
    { char: 'ढ', type: 'Consonant', transliteration: 'dha', exampleWord: 'ढकनी', exampleWordTransliteration: 'Dhakani', exampleWordEnglish: 'Lid', combos: getNepaliBarahkhari('ढ', 'dh') },
    { char: 'ण', type: 'Consonant', transliteration: 'na', exampleWord: 'बाण', exampleWordTransliteration: 'Baan', exampleWordEnglish: 'Arrow', combos: getNepaliBarahkhari('ण', 'n') },
    { char: 'त', type: 'Consonant', transliteration: 'ta', exampleWord: 'तराजु', exampleWordTransliteration: 'Taraju', exampleWordEnglish: 'Scale', combos: getNepaliBarahkhari('त', 't') },
    { char: 'थ', type: 'Consonant', transliteration: 'tha', exampleWord: 'थैली', exampleWordTransliteration: 'Thaili', exampleWordEnglish: 'Bag', combos: getNepaliBarahkhari('थ', 'th') },
    { char: 'द', type: 'Consonant', transliteration: 'da', exampleWord: 'दराज', exampleWordTransliteration: 'Daraj', exampleWordEnglish: 'Cupboard', combos: getNepaliBarahkhari('द', 'd') },
    { char: 'ध', type: 'Consonant', transliteration: 'dha', exampleWord: 'धनुष', exampleWordTransliteration: 'Dhanush', exampleWordEnglish: 'Bow', combos: getNepaliBarahkhari('ध', 'dh') },
    { char: 'न', type: 'Consonant', transliteration: 'na', exampleWord: 'नदी', exampleWordTransliteration: 'Nadi', exampleWordEnglish: 'River', combos: getNepaliBarahkhari('न', 'n') },
    { char: 'प', type: 'Consonant', transliteration: 'pa', exampleWord: 'पन्जा', exampleWordTransliteration: 'Panja', exampleWordEnglish: 'Glove', combos: getNepaliBarahkhari('प', 'p') },
    { char: 'फ', type: 'Consonant', transliteration: 'pha', exampleWord: 'फलफूल', exampleWordTransliteration: 'Phalphool', exampleWordEnglish: 'Fruit', combos: getNepaliBarahkhari('फ', 'ph') },
    { char: 'ब', type: 'Consonant', transliteration: 'ba', exampleWord: 'बाघ', exampleWordTransliteration: 'Baagh', exampleWordEnglish: 'Tiger', combos: getNepaliBarahkhari('ब', 'b') },
    { char: 'भ', type: 'Consonant', transliteration: 'bha', exampleWord: 'भालु', exampleWordTransliteration: 'Bhalu', exampleWordEnglish: 'Bear', combos: getNepaliBarahkhari('भ', 'bh') },
    { char: 'म', type: 'Consonant', transliteration: 'ma', exampleWord: 'माछा', exampleWordTransliteration: 'Maachha', exampleWordEnglish: 'Fish', combos: getNepaliBarahkhari('म', 'm') },
    { char: 'य', type: 'Consonant', transliteration: 'ya', exampleWord: 'यन्त्र', exampleWordTransliteration: 'Yantra', exampleWordEnglish: 'Machine', combos: getNepaliBarahkhari('य', 'y') },
    { char: 'र', type: 'Consonant', transliteration: 'ra', exampleWord: 'रथ', exampleWordTransliteration: 'Rath', exampleWordEnglish: 'Chariot', combos: getNepaliBarahkhari('र', 'r') },
    { char: 'ल', type: 'Consonant', transliteration: 'la', exampleWord: 'लठ्ठी', exampleWordTransliteration: 'Latthi', exampleWordEnglish: 'Stick', combos: getNepaliBarahkhari('ल', 'l') },
    { char: 'व', type: 'Consonant', transliteration: 'va', exampleWord: 'वन', exampleWordTransliteration: 'Van', exampleWordEnglish: 'Forest', combos: getNepaliBarahkhari('व', 'v') },
    { char: 'श', type: 'Consonant', transliteration: 'sha', exampleWord: 'शंख', exampleWordTransliteration: 'Shankha', exampleWordEnglish: 'Conch', combos: getNepaliBarahkhari('श', 'sh') },
    { char: 'ष', type: 'Consonant', transliteration: 'sha', exampleWord: 'षट्कोण', exampleWordTransliteration: 'Shatkon', exampleWordEnglish: 'Hexagon', combos: getNepaliBarahkhari('ष', 'sh') },
    { char: 'स', type: 'Consonant', transliteration: 'sa', exampleWord: 'सगरमाथा', exampleWordTransliteration: 'Sagarmatha', exampleWordEnglish: 'Mt. Everest', combos: getNepaliBarahkhari('स', 's') },
    { char: 'ह', type: 'Consonant', transliteration: 'ha', exampleWord: 'हात्ती', exampleWordTransliteration: 'Haatti', exampleWordEnglish: 'Elephant', combos: getNepaliBarahkhari('ह', 'h') },
    { char: 'क्ष', type: 'Consonant', transliteration: 'ksha', exampleWord: 'क्षत्री', exampleWordTransliteration: 'Kshatri', exampleWordEnglish: 'Warrior', combos: getNepaliBarahkhari('क्ष', 'ksh') },
    { char: 'त्र', type: 'Consonant', transliteration: 'tra', exampleWord: 'त्रिशूल', exampleWordTransliteration: 'Trishool', exampleWordEnglish: 'Trident', combos: getNepaliBarahkhari('त्र', 'tr') },
    { char: 'ज्ञ', type: 'Consonant', transliteration: 'gya', exampleWord: 'ज्ञानी', exampleWordTransliteration: 'Gyani', exampleWordEnglish: 'Wise', combos: getNepaliBarahkhari('ज्ञ', 'gy') }
  ],
  es: [
    { char: 'A', type: 'Vowel', transliteration: 'a', exampleWord: 'Agua', exampleWordTransliteration: 'Agua', exampleWordEnglish: 'Water' },
    { char: 'B', type: 'Consonant', transliteration: 'be', exampleWord: 'Bota', exampleWordTransliteration: 'Bota', exampleWordEnglish: 'Boot', combos: [{ char: 'Ba', sound: 'ba' }, { char: 'Be', sound: 'be' }, { char: 'Bi', sound: 'bi' }, { char: 'Bo', sound: 'bo' }, { char: 'Bu', sound: 'bu' }] },
    { char: 'C', type: 'Consonant', transliteration: 'ce', exampleWord: 'Casa', exampleWordTransliteration: 'Casa', exampleWordEnglish: 'House', combos: [{ char: 'Ca', sound: 'ka' }, { char: 'Ce', sound: 'se' }, { char: 'Ci', sound: 'si' }, { char: 'Co', sound: 'ko' }, { char: 'Cu', sound: 'ku' }] },
    { char: 'E', type: 'Vowel', transliteration: 'e', exampleWord: 'Elefante', exampleWordTransliteration: 'Elefante', exampleWordEnglish: 'Elephant' },
    { char: 'I', type: 'Vowel', transliteration: 'i', exampleWord: 'Isla', exampleWordTransliteration: 'Isla', exampleWordEnglish: 'Island' },
    { char: 'O', type: 'Vowel', transliteration: 'o', exampleWord: 'Ojo', exampleWordTransliteration: 'Ojo', exampleWordEnglish: 'Eye' },
    { char: 'U', type: 'Vowel', transliteration: 'u', exampleWord: 'Uva', exampleWordTransliteration: 'Uva', exampleWordEnglish: 'Grape' }
  ],
  zh: [
    { char: 'ā', type: 'Vowel', transliteration: 'a', exampleWord: '妈妈', exampleWordTransliteration: 'Māma', exampleWordEnglish: 'Mother' },
    { char: 'ō', type: 'Vowel', transliteration: 'o', exampleWord: '我', exampleWordTransliteration: 'Wǒ', exampleWordEnglish: 'I/Me' },
    { char: 'ē', type: 'Vowel', transliteration: 'e', exampleWord: '鹅', exampleWordTransliteration: 'É', exampleWordEnglish: 'Goose' },
    { char: 'ī', type: 'Vowel', transliteration: 'i', exampleWord: '衣', exampleWordTransliteration: 'Yī', exampleWordEnglish: 'Clothes' },
    { char: 'ū', type: 'Vowel', transliteration: 'u', exampleWord: '五', exampleWordTransliteration: 'Wǔ', exampleWordEnglish: 'Five' },
    { char: 'ǖ', type: 'Vowel', transliteration: 'ü', exampleWord: '鱼', exampleWordTransliteration: 'Yú', exampleWordEnglish: 'Fish' }
  ]
};

export const STATIC_WORDS: Record<LanguageCode, WordChallenge[]> = {
  np: [
    { word: 'पानी', english: 'Water', scrambled: ['नी', 'पा'] },
    { word: 'घर', english: 'House', scrambled: ['र', 'घ'] },
    { word: 'कलम', english: 'Pen', scrambled: ['म', 'ल', 'क'] },
    { word: 'नमस्ते', english: 'Hello', scrambled: ['ते', 'स', 'म', 'न'] },
    { word: 'आमा', english: 'Mother', scrambled: ['मा', 'आ'] },
    { word: 'बुबा', english: 'Father', scrambled: ['बा', 'बु'] },
    { word: 'फूल', english: 'Flower', scrambled: ['ल', 'फू'] },
    { word: 'फलफूल', english: 'Fruit', scrambled: ['ल', 'फू', 'ल', 'फ'] },
    { word: 'सगरमाथा', english: 'Mt. Everest', scrambled: ['था', 'मा', 'र', 'ग', 'स'] },
    { word: 'हात्ती', english: 'Elephant', scrambled: ['त्ती', 'हा'] }
  ],
  es: [
    { word: 'Hola', english: 'Hello', scrambled: ['a', 'l', 'o', 'H'] },
    { word: 'Agua', english: 'Water', scrambled: ['a', 'u', 'g', 'A'] },
    { word: 'Casa', english: 'House', scrambled: ['a', 's', 'a', 'C'] },
    { word: 'Perro', english: 'Dog', scrambled: ['o', 'r', 'r', 'e', 'P'] },
    { word: 'Gato', english: 'Cat', scrambled: ['o', 't', 'a', 'G'] }
  ],
  zh: [
    { word: '你好', english: 'Hello', scrambled: ['好', '你'] },
    { word: '谢谢', english: 'Thank you', scrambled: ['谢', '谢'] },
    { word: '妈妈', english: 'Mother', scrambled: ['妈', '妈'] },
    { word: '爸爸', english: 'Father', scrambled: ['爸', '爸'] },
    { word: '水', english: 'Water', scrambled: ['水'] }
  ]
};

export const STATIC_PHRASES: Record<LanguageCode, PhraseData[]> = {
  np: [
    { native: 'नमस्ते', transliteration: 'Namaste', english: 'Hello', category: 'Greeting' },
    { native: 'शुभ प्रभात', transliteration: 'Shuva prabhat', english: 'Good morning', category: 'Greeting' },
    { native: 'धन्यवाद', transliteration: 'Dhanyabaad', english: 'Thank you', category: 'Daily' },
    { native: 'तपाईंलाई कस्तो छ?', transliteration: 'Tapailai kasto cha?', english: 'How are you?', category: 'Greeting' },
    { native: 'मलाई भोक लाग्यो', transliteration: 'Malai bhok laagyo', english: 'I am hungry', category: 'Daily' },
    { native: 'मलाई तिर्खा लाग्यो', transliteration: 'Malai tirkha laagyo', english: 'I am thirsty', category: 'Daily' },
    { native: 'शुभ रात्री', transliteration: 'Shuva raatri', english: 'Good night', category: 'Daily' },
    { native: 'माफ गर्नुहोस्', transliteration: 'Maaf garnuhos', english: 'Excuse me / Sorry', category: 'Daily' },
    { native: 'फेरि भेटौंला', transliteration: 'Pheri vetaula', english: 'See you again', category: 'Daily' },
    { native: 'यसको मूल्य कति हो?', transliteration: 'Yasako mulya kati ho?', english: 'How much is this?', category: 'Daily' }
  ],
  es: [
    { native: '¡Hola!', transliteration: 'Hola', english: 'Hello!', category: 'Greeting' },
    { native: 'Gracias', transliteration: 'Gracias', english: 'Thank you', category: 'Daily' }
  ],
  zh: [
    { native: '你好', transliteration: 'Nǐ hǎo', english: 'Hello', category: 'Greeting' },
    { native: '谢谢', transliteration: 'Xièxiè', english: 'Thank you', category: 'Daily' }
  ]
};
