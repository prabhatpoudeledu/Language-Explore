import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const constantsPath = path.resolve(__dirname, '../.tmp-export/constants.js');
const { STATIC_ALPHABET, STATIC_NUMBERS, STATIC_VOCABULARY } = await import(pathToFileURL(constantsPath).href);

const outDir = path.resolve(__dirname, '../public/content/np');
fs.mkdirSync(outDir, { recursive: true });

const writeJson = (name, data) => {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

writeJson('alphabet.json', STATIC_ALPHABET.np || []);
writeJson('numbers.json', STATIC_NUMBERS.np || []);
writeJson('vocabulary.json', STATIC_VOCABULARY.np || []);

const quiz = [
  {
    id: 1,
    question: 'सगरमाथा कहाँ अवस्थित छ?',
    questionEn: 'Where is Mount Everest located?',
    options: ['नेपालमा', 'भारतमा', 'चीनमा', 'तिब्बतमा'],
    optionsEn: ['In Nepal', 'In India', 'In China', 'In Tibet'],
    correctAnswer: 0,
    fact: 'सगरमाथा नेपाल र चीनको सीमामा अवस्थित विश्वको सर्वोच्च शिखर हो!',
    factEn: 'Mount Everest, located on the border of Nepal and China, is the highest peak in the world!'
  },
  {
    id: 2,
    question: 'नेपालको राजधानी कुन हो?',
    questionEn: 'What is the capital of Nepal?',
    options: ['पोखरा', 'लुम्बिनी', 'काठमाडौं', 'भक्तपुर'],
    optionsEn: ['Pokhara', 'Lumbini', 'Kathmandu', 'Bhaktapur'],
    correctAnswer: 2,
    fact: 'काठमाडौं नेपालको राजधानी हो जहाँ हजारौं मन्दिरहरू छन्!',
    factEn: 'Kathmandu is Nepal\'s capital city with thousands of temples!'
  },
  {
    id: 3,
    question: 'भगवान बुद्धको जन्मस्थल कहाँ हो?',
    questionEn: 'Where was Lord Buddha born?',
    options: ['काठमाडौं', 'पोखरा', 'लुम्बिनी', 'जनकपुर'],
    optionsEn: ['Kathmandu', 'Pokhara', 'Lumbini', 'Janakpur'],
    correctAnswer: 2,
    fact: 'लुम्बिनीमा भगवान बुद्धको जन्म भएको थियो र यो विश्व सम्पदा स्थल हो!',
    factEn: 'Lord Buddha was born in Lumbini, which is a UNESCO World Heritage Site!'
  },
  {
    id: 4,
    question: 'नेपालको सबैभन्दा ठूलो ताल कुन हो?',
    questionEn: 'What is Nepal\'s largest lake?',
    options: ['फेवा ताल', 'रारा ताल', 'बेगनास ताल', 'तिलिचो ताल'],
    optionsEn: ['Phewa Lake', 'Rara Lake', 'Begnas Lake', 'Tilicho Lake'],
    correctAnswer: 1,
    fact: 'रारा ताल नेपालको सबैभन्दा ठूलो ताल हो र यो सुन्दर हिमालयी क्षेत्रमा अवस्थित छ!',
    factEn: 'Rara Lake is Nepal\'s largest lake and is located in a beautiful Himalayan region!'
  },
  {
    id: 5,
    question: 'नेपालको राष्ट्रिय जनावर कुन हो?',
    questionEn: 'What is Nepal\'s national animal?',
    options: ['हात्ती', 'गैंडा', 'गाई', 'बाघ'],
    optionsEn: ['Elephant', 'Rhino', 'Cow', 'Tiger'],
    correctAnswer: 1,
    fact: 'एकसिंगे गैंडा नेपालको राष्ट्रिय जनावर हो र चितवन राष्ट्रिय निकुञ्जमा पाइन्छ!',
    factEn: 'The one-horned rhinoceros is Nepal\'s national animal and can be found in Chitwan National Park!'
  }
];

writeJson('quiz.json', quiz);

console.log('Content exported to public/content/np');
