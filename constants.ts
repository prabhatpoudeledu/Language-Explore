
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

export const STATIC_ALPHABET: Record<LanguageCode, LetterData[]> = {
  np: [
    // VOWELS (12)
    { 
      char: 'अ', type: 'Vowel', transliteration: 'a', 
      examples: [
        { word: 'अचार', transliteration: 'Achar', english: 'Pickle', imageUrl: 'https://images.unsplash.com/photo-1589135393572-118fb43827ad?auto=format&fit=crop&w=400&q=80' },
        { word: 'अनार', transliteration: 'Anaar', english: 'Pomegranate', imageUrl: 'https://images.unsplash.com/photo-1615485243333-4f2471851ef8?auto=format&fit=crop&w=400&q=80' },
        { word: 'अम्बा', transliteration: 'Amba', english: 'Guava', imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80' },
        { word: 'अमिलो', transliteration: 'Amilo', english: 'Sour', imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a9961345e2?auto=format&fit=crop&w=400&q=80' },
        { word: 'अङ्गुर', transliteration: 'Anggur', english: 'Grapes', imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369b41e8f?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'आ', type: 'Vowel', transliteration: 'aa', 
      examples: [
        { word: 'आमा', transliteration: 'Aama', english: 'Mother', imageUrl: 'https://images.unsplash.com/photo-1594911770006-6d3572e67a31?auto=format&fit=crop&w=400&q=80' },
        { word: 'आकाश', transliteration: 'Aakash', english: 'Sky', imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'आँखा', transliteration: 'Aankha', english: 'Eye', imageUrl: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=400&q=80' },
        { word: 'आलु', transliteration: 'Aalu', english: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=400&q=80' },
        { word: 'आँप', transliteration: 'Aanp', english: 'Mango', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'इ', type: 'Vowel', transliteration: 'i', 
      examples: [
        { word: 'इच्छा', transliteration: 'Ichchha', english: 'Wish', imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a67e0621?auto=format&fit=crop&w=400&q=80' },
        { word: 'इतिहास', transliteration: 'Itihas', english: 'History', imageUrl: 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?auto=format&fit=crop&w=400&q=80' },
        { word: 'इनायत', transliteration: 'Inayat', english: 'Grace', imageUrl: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=400&q=80' },
        { word: 'इन्जिन', transliteration: 'Injin', english: 'Engine', imageUrl: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=400&q=80' },
        { word: 'इँट्टा', transliteration: 'Itta', english: 'Brick', imageUrl: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ई', type: 'Vowel', transliteration: 'ee', 
      examples: [
        { word: 'ईश्वर', transliteration: 'Eeshwor', english: 'God', imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=400&q=80' },
        { word: 'ईमानदार', transliteration: 'Eemandar', english: 'Honest', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' },
        { word: 'ईमेल', transliteration: 'Eemel', english: 'Email', imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80' },
        { word: 'ईर्ष्या', transliteration: 'Eershya', english: 'Envy', imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01d95cfc?auto=format&fit=crop&w=400&q=80' },
        { word: 'ईलाम', transliteration: 'Eelam', english: 'Ilam', imageUrl: 'https://images.unsplash.com/photo-1544377193-33bcaf1f688a?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'उ', type: 'Vowel', transliteration: 'u', 
      examples: [
        { word: 'उज्यालो', transliteration: 'Ujyalo', english: 'Bright', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80' },
        { word: 'उकालो', transliteration: 'Ukalo', english: 'Uphill', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
        { word: 'उपहार', transliteration: 'Upahar', english: 'Gift', imageUrl: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c474c?auto=format&fit=crop&w=400&q=80' },
        { word: 'उमेर', transliteration: 'Umer', english: 'Age', imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=400&q=80' },
        { word: 'उखु', transliteration: 'Ukhu', english: 'Sugarcane', imageUrl: 'https://images.unsplash.com/photo-1616616086701-447a96078d6b?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ऊ', type: 'Vowel', transliteration: 'oo', 
      examples: [
        { word: 'ऊन', transliteration: 'Oon', english: 'Wool', imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऊँट', transliteration: 'Oont', english: 'Camel', imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7f8fc347c18?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऊर्जा', transliteration: 'Oorja', english: 'Energy', imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऊँचा', transliteration: 'Ooncha', english: 'High', imageUrl: 'https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऊँ', transliteration: 'Oon', english: 'Yes', imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ऋ', type: 'Vowel', transliteration: 'ri', 
      examples: [
        { word: 'ऋषि', transliteration: 'Rishi', english: 'Sage', imageUrl: 'https://images.unsplash.com/photo-1518464335559-001099d0c655?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऋण', transliteration: 'Rin', english: 'Loan', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऋतु', transliteration: 'Ritu', english: 'Season', imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऋचा', transliteration: 'Richa', english: 'Verse', imageUrl: 'https://images.unsplash.com/photo-1544648181-3bf4356673ba?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऋणी', transliteration: 'Rini', english: 'Debtor', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ए', type: 'Vowel', transliteration: 'e', 
      examples: [
        { word: 'एक', transliteration: 'Ek', english: 'One', imageUrl: 'https://images.unsplash.com/photo-1544377193-33bcaf1f688a?auto=format&fit=crop&w=400&q=80' },
        { word: 'एक्लै', transliteration: 'Eklai', english: 'Alone', imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80' },
        { word: 'एघार', transliteration: 'Eghaar', english: 'Eleven', imageUrl: 'https://images.unsplash.com/photo-1544377193-33bcaf1f688a?auto=format&fit=crop&w=400&q=80' },
        { word: 'एम्बुलेन्स', transliteration: 'Ambulance', english: 'Ambulance', imageUrl: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&w=400&q=80' },
        { word: 'एशिया', transliteration: 'Asia', english: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ऐ', type: 'Vowel', transliteration: 'ai', 
      examples: [
        { word: 'ऐना', transliteration: 'Aina', english: 'Mirror', imageUrl: 'https://images.unsplash.com/photo-1515405299443-8b0bb401ec83?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऐश्वर्य', transliteration: 'Aiswarya', english: 'Wealth', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऐतिहासिक', transliteration: 'Aitihasik', english: 'History', imageUrl: 'https://images.unsplash.com/photo-1503917988258-f19178c1f307?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऐँसेलु', transliteration: 'Ainselu', english: 'Raspberry', imageUrl: 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऐंठन', transliteration: 'Ainthan', english: 'Nightmare', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'ओ', type: 'Vowel', transliteration: 'o', 
      examples: [
        { word: 'ओखती', transliteration: 'Okhati', english: 'Medicine', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
        { word: 'ओछ्यान', transliteration: 'Ochhyan', english: 'Bed', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80' },
        { word: 'ओखर', transliteration: 'Okhar', english: 'Walnut', imageUrl: 'https://images.unsplash.com/photo-1534444398305-680481024e03?auto=format&fit=crop&w=400&q=80' },
        { word: 'ओरालो', transliteration: 'Oralo', english: 'Downhill', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
        { word: 'ओठ', transliteration: 'Oth', english: 'Lip', imageUrl: 'https://images.unsplash.com/photo-1520113112170-4eeb02e5051e?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'औ', type: 'Vowel', transliteration: 'au', 
      examples: [
        { word: 'औषधि', transliteration: 'Aushadhi', english: 'Medicine', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80' },
        { word: 'औजार', transliteration: 'Aujar', english: 'Tool', imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80' },
        { word: 'औँला', transliteration: 'Aunla', english: 'Finger', imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=400&q=80' },
        { word: 'औपचारिक', transliteration: 'Aupacharik', english: 'Formal', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
        { word: 'औँसी', transliteration: 'Aunsi', english: 'Moon', imageUrl: 'https://images.unsplash.com/photo-1476108621677-3c620901b5e7?auto=format&fit=crop&w=400&q=80' }
      ]
    },
    { 
      char: 'अं', type: 'Vowel', transliteration: 'am', 
      examples: [
        { word: 'अंक', transliteration: 'Anka', english: 'Number', imageUrl: 'https://images.unsplash.com/photo-1587141744123-653df120288c?auto=format&fit=crop&w=400&q=80' },
        { word: 'अंकमाल', transliteration: 'Ankamal', english: 'Hug', imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80' },
        { word: 'अंश', transliteration: 'Ansha', english: 'Part', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
        { word: 'अन्डा', transliteration: 'Anda', english: 'Egg', imageUrl: 'https://images.unsplash.com/photo-1587486912202-3f44f74c31bc?auto=format&fit=crop&w=400&q=80' },
        { word: 'अन्तिम', transliteration: 'Antim', english: 'Final', imageUrl: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=400&q=80' }
      ]
    },

    // CONSONANTS (36)
    { 
      char: 'क', type: 'Consonant', transliteration: 'ka', 
      examples: [
        { word: 'कलम', transliteration: 'Kalam', english: 'Pen', imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80' },
        { word: 'कपाल', transliteration: 'Kapal', english: 'Hair', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=80' },
        { word: 'कमिलो', transliteration: 'Kamilo', english: 'Ant', imageUrl: 'https://images.unsplash.com/photo-1558500113-0d9cc3fa2503?auto=format&fit=crop&w=400&q=80' },
        { word: 'कागत', transliteration: 'Kagat', english: 'Paper', imageUrl: 'https://images.unsplash.com/photo-1531685229751-783f11bc85df?auto=format&fit=crop&w=400&q=80' },
        { word: 'कठिन', transliteration: 'Kathin', english: 'Difficult', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('क', 'k') 
    },
    { 
      char: 'ख', type: 'Consonant', transliteration: 'kha', 
      examples: [
        { word: 'खरायो', transliteration: 'Kharayo', english: 'Rabbit', imageUrl: 'https://images.unsplash.com/photo-1585110396054-c8112c607ee7?auto=format&fit=crop&w=400&q=80' },
        { word: 'खल्ती', transliteration: 'Khalti', english: 'Pocket', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80' },
        { word: 'खर्च', transliteration: 'Kharcha', english: 'Expense', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80' },
        { word: 'खुकुरी', transliteration: 'Khukuri', english: 'Knife', imageUrl: 'https://images.unsplash.com/photo-1614064548237-096f735f344f?auto=format&fit=crop&w=400&q=80' },
        { word: 'खोला', transliteration: 'Khola', english: 'River', imageUrl: 'https://images.unsplash.com/photo-1437482012496-05201fd9f739?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ख', 'kh') 
    },
    { 
      char: 'ग', type: 'Consonant', transliteration: 'ga', 
      examples: [
        { word: 'गाई', transliteration: 'Gai', english: 'Cow', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80' },
        { word: 'गमला', transliteration: 'Gamala', english: 'Flowerpot', imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d446?auto=format&fit=crop&w=400&q=80' },
        { word: 'गरम', transliteration: 'Garam', english: 'Hot', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80' },
        { word: 'गिटार', transliteration: 'Gitar', english: 'Guitar', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80' },
        { word: 'गुलाफ', transliteration: 'Gulaf', english: 'Rose', imageUrl: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ग', 'g') 
    },
    { 
      char: 'घ', type: 'Consonant', transliteration: 'gha', 
      examples: [
        { word: 'घर', transliteration: 'Ghar', english: 'House', imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80' },
        { word: 'घडी', transliteration: 'Ghadi', english: 'Watch', imageUrl: 'https://images.unsplash.com/photo-1524592091214-8c97af7c4a31?auto=format&fit=crop&w=400&q=80' },
        { word: 'घाम', transliteration: 'Gham', english: 'Sunshine', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80' },
        { word: 'घ्यू', transliteration: 'Ghyu', english: 'Ghee', imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=80' },
        { word: 'घोडा', transliteration: 'Ghoda', english: 'Horse', imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('घ', 'gh') 
    },
    { 
      char: 'ङ', type: 'Consonant', transliteration: 'nga', 
      examples: [
        { word: 'राँगा', transliteration: 'Raanga', english: 'Buffalo', imageUrl: 'https://images.unsplash.com/photo-1549405616-52f6f484f29a?auto=format&fit=crop&w=400&q=80' },
        { word: 'बाङो', transliteration: 'Baango', english: 'Bent', imageUrl: 'https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&w=400&q=80' },
        { word: 'आङ', transliteration: 'Aang', english: 'Body', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
        { word: 'नाङ्लो', transliteration: 'Naanglo', english: 'Tray', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80' },
        { word: 'साङ्लो', transliteration: 'Saanglo', english: 'Chain', imageUrl: 'https://images.unsplash.com/photo-1506466010722-395ee2bef877?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ङ', 'ng') 
    },
    { 
      char: 'च', type: 'Consonant', transliteration: 'cha', 
      examples: [
        { word: 'चिया', transliteration: 'Chiya', english: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1544787210-2211d44b565a?auto=format&fit=crop&w=400&q=80' },
        { word: 'चरा', transliteration: 'Chara', english: 'Bird', imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=400&q=80' },
        { word: 'चामल', transliteration: 'Chamal', english: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
        { word: 'चम्चा', transliteration: 'Chamcha', english: 'Spoon', imageUrl: 'https://images.unsplash.com/photo-1589307734186-aa61dc86976e?auto=format&fit=crop&w=400&q=80' },
        { word: 'चिसो', transliteration: 'Chiso', english: 'Cold', imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('च', 'ch') 
    },
    { 
      char: 'छ', type: 'Consonant', transliteration: 'chha', 
      examples: [
        { word: 'छोरा', transliteration: 'Chhora', english: 'Son', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80' },
        { word: 'छोरी', transliteration: 'Chhori', english: 'Daughter', imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80' },
        { word: 'छिटो', transliteration: 'Chhito', english: 'Fast', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80' },
        { word: 'छाता', transliteration: 'Chhata', english: 'Umbrella', imageUrl: 'https://images.unsplash.com/photo-1528652614526-896895b6c934?auto=format&fit=crop&w=400&q=80' },
        { word: 'छेपारो', transliteration: 'Chheparo', english: 'Lizard', imageUrl: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('छ', 'chh') 
    },
    { 
      char: 'ज', type: 'Consonant', transliteration: 'ja', 
      examples: [
        { word: 'जुत्ता', transliteration: 'Jutta', english: 'Shoes', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
        { word: 'जल', transliteration: 'Jal', english: 'Water', imageUrl: 'https://images.unsplash.com/photo-1548843204-62024b17906d?auto=format&fit=crop&w=400&q=80' },
        { word: 'जहाज', transliteration: 'Jahaj', english: 'Ship', imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80' },
        { word: 'जमीन', transliteration: 'Jamin', english: 'Land', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' },
        { word: 'जुन', transliteration: 'Jun', english: 'Moon', imageUrl: 'https://images.unsplash.com/photo-1476108621677-3c620901b5e7?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ज', 'j') 
    },
    { 
      char: 'झ', type: 'Consonant', transliteration: 'jha', 
      examples: [
        { word: 'झ्याल', transliteration: 'Jhyal', english: 'Window', imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=400&q=80' },
        { word: 'झोला', transliteration: 'Jhola', english: 'Bag', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80' },
        { word: 'झार', transliteration: 'Jhaar', english: 'Grass', imageUrl: 'https://images.unsplash.com/photo-1533467647142-3e280e736761?auto=format&fit=crop&w=400&q=80' },
        { word: 'झिँगा', transliteration: 'Jhinga', english: 'Fly', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80' },
        { word: 'झुटो', transliteration: 'Jhuto', english: 'Lie', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('झ', 'jh') 
    },
    { 
      char: 'ञ', type: 'Consonant', transliteration: 'nya', 
      examples: [
        { word: 'पाँच', transliteration: 'Paanch', english: 'Five', imageUrl: 'https://images.unsplash.com/photo-1544377193-33bcaf1f688a?auto=format&fit=crop&w=400&q=80' },
        { word: 'व्यञ्जन', transliteration: 'Vyanjan', english: 'Consonant', imageUrl: 'https://images.unsplash.com/photo-1563823251941-b9989d1e219a?auto=format&fit=crop&w=400&q=80' },
        { word: 'चञ्चल', transliteration: 'Chanchal', english: 'Restless', imageUrl: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=400&q=80' },
        { word: 'कञ्जुस', transliteration: 'Kanjus', english: 'Stingy', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'मञ्जु', transliteration: 'Manju', english: 'Beautiful', imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a67e0621?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ञ', 'yn') 
    },
    { 
      char: 'ट', type: 'Consonant', transliteration: 'ta', 
      examples: [
        { word: 'टाउको', transliteration: 'Tauko', english: 'Head', imageUrl: 'https://images.unsplash.com/photo-1512138411100-2c7356c5392d?auto=format&fit=crop&w=400&q=80' },
        { word: 'टपरी', transliteration: 'Tapari', english: 'Leaf plate', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80' },
        { word: 'टिलिक', transliteration: 'Tilik', english: 'Shiny', imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=400&q=80' },
        { word: 'टिक्का', transliteration: 'Tikka', english: 'Mark', imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=400&q=80' },
        { word: 'टोपी', transliteration: 'Topi', english: 'Hat', imageUrl: 'https://images.unsplash.com/photo-1588850567047-18397c5f58bc?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ट', 't') 
    },
    { 
      char: 'ठ', type: 'Consonant', transliteration: 'tha', 
      examples: [
        { word: 'ठूलो', transliteration: 'Thulo', english: 'Big', imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80' },
        { word: 'ठिक', transliteration: 'Thik', english: 'Right', imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=400&q=80' },
        { word: 'ठट्टा', transliteration: 'Thatta', english: 'Joke', imageUrl: 'https://images.unsplash.com/photo-1527524852191-740ee2fd28ac?auto=format&fit=crop&w=400&q=80' },
        { word: 'ठेगाना', transliteration: 'Thegana', english: 'Address', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' },
        { word: 'ठाम', transliteration: 'Thaam', english: 'Place', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ठ', 'th') 
    },
    { 
      char: 'ड', type: 'Consonant', transliteration: 'da', 
      examples: [
        { word: 'डोरी', transliteration: 'Dori', english: 'Rope', imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=400&q=80' },
        { word: 'डर', transliteration: 'Dar', english: 'Fear', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'डण्डा', transliteration: 'Danda', english: 'Stick', imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80' },
        { word: 'डल्ले', transliteration: 'Dalle', english: 'Round', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=400&q=80' },
        { word: 'डालो', transliteration: 'Dalo', english: 'Basket', imageUrl: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ड', 'd') 
    },
    { 
      char: 'ढ', type: 'Consonant', transliteration: 'dha', 
      examples: [
        { word: 'ढोका', transliteration: 'Dhoka', english: 'Door', imageUrl: 'https://images.unsplash.com/photo-1517646281694-2216114fa0f4?auto=format&fit=crop&w=400&q=80' },
        { word: 'ढुङ्गा', transliteration: 'Dhungga', english: 'Stone', imageUrl: 'https://images.unsplash.com/photo-1525857597365-5f6dbff2e36e?auto=format&fit=crop&w=400&q=80' },
        { word: 'ढिँडो', transliteration: 'Dhindo', english: 'Porridge', imageUrl: 'https://images.unsplash.com/photo-1589307734186-aa61dc86976e?auto=format&fit=crop&w=400&q=80' },
        { word: 'ढोग', transliteration: 'Dhog', english: 'Greeting', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' },
        { word: 'ढिलो', transliteration: 'Dhilo', english: 'Late', imageUrl: 'https://images.unsplash.com/photo-1524592091214-8c97af7c4a31?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ढ', 'dh') 
    },
    { 
      char: 'ण', type: 'Consonant', transliteration: 'na', 
      examples: [
        { word: 'गुण', transliteration: 'Gun', english: 'Quality', imageUrl: 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=400&q=80' },
        { word: 'बाण', transliteration: 'Baan', english: 'Arrow', imageUrl: 'https://images.unsplash.com/photo-1511909525232-61113c912358?auto=format&fit=crop&w=400&q=80' },
        { word: 'ऋण', transliteration: 'Rin', english: 'Loan', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80' },
        { word: 'मणि', transliteration: 'Mani', english: 'Gem', imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=400&q=80' },
        { word: 'काण्ड', transliteration: 'Kanda', english: 'Chapter', imageUrl: 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ण', 'n') 
    },
    { 
      char: 'त', type: 'Consonant', transliteration: 'ta', 
      examples: [
        { word: 'तरकारी', transliteration: 'Tarkari', english: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a000c1267c4?auto=format&fit=crop&w=400&q=80' },
        { word: 'तारा', transliteration: 'Tara', english: 'Star', imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=400&q=80' },
        { word: 'ताला', transliteration: 'Tala', english: 'Lock', imageUrl: 'https://images.unsplash.com/photo-1516733990000-dc4821ec5661?auto=format&fit=crop&w=400&q=80' },
        { word: 'तास', transliteration: 'Taas', english: 'Cards', imageUrl: 'https://images.unsplash.com/photo-1520112338927-466333333333?auto=format&fit=crop&w=400&q=80' },
        { word: 'तकिया', transliteration: 'Takiya', english: 'Pillow', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('त', 't') 
    },
    { 
      char: 'थ', type: 'Consonant', transliteration: 'tha', 
      examples: [
        { word: 'थोरै', transliteration: 'Thorai', english: 'Few', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=400&q=80' },
        { word: 'थुप्रै', transliteration: 'Thuprai', english: 'Many', imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80' },
        { word: 'थाली', transliteration: 'Thali', english: 'Plate', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80' },
        { word: 'थलो', transliteration: 'Thalo', english: 'Place', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' },
        { word: 'थुन्नु', transliteration: 'Thunnu', english: 'Block', imageUrl: 'https://images.unsplash.com/photo-1517646281694-2216114fa0f4?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('थ', 'th') 
    },
    { 
      char: 'द', type: 'Consonant', transliteration: 'da', 
      examples: [
        { word: 'दाँत', transliteration: 'Daant', english: 'Tooth', imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80' },
        { word: 'दाल', transliteration: 'Daal', english: 'Lentils', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
        { word: 'दिन', transliteration: 'Din', english: 'Day', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80' },
        { word: 'दौरा', transliteration: 'Daura', english: 'Shirt', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80' },
        { word: 'दही', transliteration: 'Dahi', english: 'Yogurt', imageUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('द', 'd') 
    },
    { 
      char: 'ध', type: 'Consonant', transliteration: 'dha', 
      examples: [
        { word: 'धनी', transliteration: 'Dhani', english: 'Rich', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' },
        { word: 'धूलो', transliteration: 'Dhulo', english: 'Dust', imageUrl: 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?auto=format&fit=crop&w=400&q=80' },
        { word: 'धन्यवाद', transliteration: 'Dhanyabaad', english: 'Thanks', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' },
        { word: 'धारा', transliteration: 'Dhara', english: 'Tap', imageUrl: 'https://images.unsplash.com/photo-1515444744559-7be63e1600de?auto=format&fit=crop&w=400&q=80' },
        { word: 'धैर्य', transliteration: 'Dhairya', english: 'Patience', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ध', 'dh') 
    },
    { 
      char: 'न', type: 'Consonant', transliteration: 'na', 
      examples: [
        { word: 'नदी', transliteration: 'Nadi', english: 'River', imageUrl: 'https://images.unsplash.com/photo-1437482012496-05201fd9f739?auto=format&fit=crop&w=400&q=80' },
        { word: 'नाम', transliteration: 'Naam', english: 'Name', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'नयाँ', transliteration: 'Naya', english: 'New', imageUrl: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c474c?auto=format&fit=crop&w=400&q=80' },
        { word: 'नुहाउनु', transliteration: 'Nuhaunu', english: 'Bathe', imageUrl: 'https://images.unsplash.com/photo-1548843204-62024b17906d?auto=format&fit=crop&w=400&q=80' },
        { word: 'निद्रा', transliteration: 'Nidra', english: 'Sleep', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('न', 'n') 
    },
    { 
      char: 'प', type: 'Consonant', transliteration: 'pa', 
      examples: [
        { word: 'पानी', transliteration: 'Paani', english: 'Water', imageUrl: 'https://images.unsplash.com/photo-1548843204-62024b17906d?auto=format&fit=crop&w=400&q=80' },
        { word: 'पिठो', transliteration: 'Pitho', english: 'Flour', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
        { word: 'पैसा', transliteration: 'Paisa', english: 'Money', imageUrl: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=400&q=80' },
        { word: 'पखेरा', transliteration: 'Pakhera', english: 'Hillside', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
        { word: 'पशु', transliteration: 'Pashu', english: 'Animal', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('प', 'p') 
    },
    { 
      char: 'फ', type: 'Consonant', transliteration: 'pha', 
      examples: [
        { word: 'फलफूल', transliteration: 'Phalphul', english: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80' },
        { word: 'फरक', transliteration: 'Pharak', english: 'Difference', imageUrl: 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=400&q=80' },
        { word: 'फोहोर', transliteration: 'Phohor', english: 'Dirty', imageUrl: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=400&q=80' },
        { word: 'फलाम', transliteration: 'Phalam', english: 'Iron', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80' },
        { word: 'फुर्सद', transliteration: 'Phursad', english: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('फ', 'ph') 
    },
    { 
      char: 'ब', type: 'Consonant', transliteration: 'ba', 
      examples: [
        { word: 'बाबु', transliteration: 'Babu', english: 'Father', imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80' },
        { word: 'बालक', transliteration: 'Baalak', english: 'Child', imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80' },
        { word: 'बाल्टी', transliteration: 'Baalti', english: 'Bucket', imageUrl: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=400&q=80' },
        { word: 'बजार', transliteration: 'Bajar', english: 'Market', imageUrl: 'https://images.unsplash.com/photo-1501516069922-a9982bd6f3bd?auto=format&fit=crop&w=400&q=80' },
        { word: 'बिस्तारै', transliteration: 'Bistarai', english: 'Slowly', imageUrl: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ब', 'b') 
    },
    { 
      char: 'भ', type: 'Consonant', transliteration: 'bha', 
      examples: [
        { word: 'भोक', transliteration: 'Bhok', english: 'Hunger', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'भाइ', transliteration: 'Bhai', english: 'Brother', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80' },
        { word: 'भान्सा', transliteration: 'Bhansa', english: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80' },
        { word: 'भालु', transliteration: 'Bhalu', english: 'Bear', imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80' },
        { word: 'भेट्नु', transliteration: 'Bhetnu', english: 'Meet', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('भ', 'bha') 
    },
    { 
      char: 'म', type: 'Consonant', transliteration: 'ma', 
      examples: [
        { word: 'माया', transliteration: 'Maya', english: 'Love', imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80' },
        { word: 'मन', transliteration: 'Man', english: 'Mind', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
        { word: 'मानिस', transliteration: 'Manis', english: 'Human', imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80' },
        { word: 'मकै', transliteration: 'Makai', english: 'Maize', imageUrl: 'https://images.unsplash.com/photo-1616616086701-447a96078d6b?auto=format&fit=crop&w=400&q=80' },
        { word: 'मासु', transliteration: 'Masu', english: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('म', 'm') 
    },
    { 
      char: 'य', type: 'Consonant', transliteration: 'ya', 
      examples: [
        { word: 'यहाँ', transliteration: 'Yahan', english: 'Here', imageUrl: 'https://images.unsplash.com/photo-1520412099521-6aca08a9709d?auto=format&fit=crop&w=400&q=80' },
        { word: 'यता', transliteration: 'Yata', english: 'This way', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
        { word: 'यन्त्र', transliteration: 'Yantra', english: 'Machine', imageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=400&q=80' },
        { word: 'योजना', transliteration: 'Yojana', english: 'Plan', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' },
        { word: 'यमराज', transliteration: 'Yamraj', english: 'God of Death', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('य', 'y') 
    },
    { 
      char: 'र', type: 'Consonant', transliteration: 'ra', 
      examples: [
        { word: 'राम्रो', transliteration: 'Ramro', english: 'Good', imageUrl: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=400&q=80' },
        { word: 'रङ', transliteration: 'Rang', english: 'Color', imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&w=400&q=80' },
        { word: 'रोटी', transliteration: 'Roti', english: 'Bread', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
        { word: 'रगत', transliteration: 'Ragat', english: 'Blood', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80' },
        { word: 'रमाइलो', transliteration: 'Ramailo', english: 'Fun', imageUrl: 'https://images.unsplash.com/photo-1472552947727-b5929d99c75f?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('र', 'r') 
    },
    { 
      char: 'ल', type: 'Consonant', transliteration: 'la', 
      examples: [
        { word: 'लुगा', transliteration: 'Luga', english: 'Clothes', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80' },
        { word: 'लामो', transliteration: 'Lamo', english: 'Long', imageUrl: 'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=400&q=80' },
        { word: 'लौरी', transliteration: 'Lauri', english: 'Stick', imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80' },
        { word: 'लसुन', transliteration: 'Lasun', english: 'Garlic', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80' },
        { word: 'लज्जा', transliteration: 'Lajja', english: 'Shame', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ल', 'l') 
    },
    { 
      char: 'व', type: 'Consonant', transliteration: 'wa', 
      examples: [
        { word: 'वन', transliteration: 'Wan', english: 'Forest', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80' },
        { word: 'वकील', transliteration: 'Wakil', english: 'Lawyer', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80' },
        { word: 'वचन', transliteration: 'Wachan', english: 'Promise', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' },
        { word: 'वातावरण', transliteration: 'Watabaran', english: 'Environment', imageUrl: 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=400&q=80' },
        { word: 'बाहेक', transliteration: 'Bahek', english: 'Except', imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('व', 'v') 
    },
    { 
      char: 'श', type: 'Consonant', transliteration: 'sha', 
      examples: [
        { word: 'शहर', transliteration: 'Shahar', english: 'City', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80' },
        { word: 'शब्द', transliteration: 'Shabda', english: 'Word', imageUrl: 'https://images.unsplash.com/photo-1563823251941-b9989d1e219a?auto=format&fit=crop&w=400&q=80' },
        { word: 'शरीर', transliteration: 'Sharir', english: 'Body', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
        { word: 'शान्त', transliteration: 'Shanta', english: 'Quiet', imageUrl: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=400&q=80' },
        { word: 'शत्रु', transliteration: 'Shatru', english: 'Enemy', imageUrl: 'https://images.unsplash.com/photo-1531685229751-783f11bc85df?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('श', 'sh') 
    },
    { 
      char: 'ष', type: 'Consonant', transliteration: 'sha', 
      examples: [
        { word: 'कोष', transliteration: 'Kosh', english: 'Fund', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80' },
        { word: 'सन्तोष', transliteration: 'Santosh', english: 'Satisfaction', imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=400&q=80' },
        { word: 'विष', transliteration: 'Bish', english: 'Poison', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80' },
        { word: 'दोष', transliteration: 'Dosh', english: 'Blame', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'कृषि', transliteration: 'Krishi', english: 'Agriculture', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ष', 'sh') 
    },
    { 
      char: 'स', type: 'Consonant', transliteration: 'sa', 
      examples: [
        { word: 'साथी', transliteration: 'Sathi', english: 'Friend', imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80' },
        { word: 'सफा', transliteration: 'Sapha', english: 'Clean', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' },
        { word: 'सानो', transliteration: 'Sano', english: 'Small', imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80' },
        { word: 'सय', transliteration: 'Saya', english: 'Hundred', imageUrl: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=400&q=80' },
        { word: 'सजिलो', transliteration: 'Sajilo', english: 'Easy', imageUrl: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('स', 's') 
    },
    { 
      char: 'ह', type: 'Consonant', transliteration: 'ha', 
      examples: [
        { word: 'हजुर', transliteration: 'Hajur', english: 'Yes', imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7f8fc347c18?auto=format&fit=crop&w=400&q=80' },
        { word: 'हात', transliteration: 'Haat', english: 'Hand', imageUrl: 'https://images.unsplash.com/photo-1511225070737-5af5ac9a690d?auto=format&fit=crop&w=400&q=80' },
        { word: 'हाल', transliteration: 'Haal', english: 'Status', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' },
        { word: 'हाम्रो', transliteration: 'Hamro', english: 'Our', imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80' },
        { word: 'हावा', transliteration: 'Hawa', english: 'Air', imageUrl: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ह', 'h') 
    },
    { 
      char: 'क्ष', type: 'Consonant', transliteration: 'kshya', 
      examples: [
        { word: 'क्षमा', transliteration: 'Kshama', english: 'Forgiveness', imageUrl: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&w=400&q=80' },
        { word: 'क्षेत्र', transliteration: 'Kshetra', english: 'Area', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' },
        { word: 'क्षमता', transliteration: 'Kshamata', english: 'Ability', imageUrl: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=400&q=80' },
        { word: 'क्षय', transliteration: 'Kshaya', english: 'Decay', imageUrl: 'https://images.unsplash.com/photo-1525857597365-5f6dbff2e36e?auto=format&fit=crop&w=400&q=80' },
        { word: 'क्षण', transliteration: 'Kshan', english: 'Moment', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('क्ष', 'ksh') 
    },
    { 
      char: 'त्र', type: 'Consonant', transliteration: 'tra', 
      examples: [
        { word: 'त्रिशूल', transliteration: 'Trishul', english: 'Trident', imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=400&q=80' },
        { word: 'त्रास', transliteration: 'Traas', english: 'Terror', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80' },
        { word: 'त्रिभुवन', transliteration: 'Tribhuvan', english: 'Name', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
        { word: 'त्रुटि', transliteration: 'Truti', english: 'Error', imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=400&q=80' },
        { word: 'त्रिकोण', transliteration: 'Trikon', english: 'Triangle', imageUrl: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('त्र', 'tr') 
    },
    { 
      char: 'ज्ञ', type: 'Consonant', transliteration: 'gya', 
      examples: [
        { word: 'ज्ञान', transliteration: 'Gyan', english: 'Knowledge', imageUrl: 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?auto=format&fit=crop&w=400&q=80' },
        { word: 'ज्ञानी', transliteration: 'Gyani', english: 'Wise', imageUrl: 'https://images.unsplash.com/photo-1518464335559-001099d0c655?auto=format&fit=crop&w=400&q=80' },
        { word: 'विज्ञान', transliteration: 'Bigyan', english: 'Science', imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80' },
        { word: 'अज्ञात', transliteration: 'Agyat', english: 'Unknown', imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=400&q=80' },
        { word: 'प्रतिज्ञा', transliteration: 'Pratigya', english: 'Promise', imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2959210?auto=format&fit=crop&w=400&q=80' }
      ], 
      combos: getNepaliBarahkhari('ज्ञ', 'gy') 
    }
  ],
  es: [],
  zh: []
};

export const STATIC_WORDS: Record<LanguageCode, WordChallenge[]> = {
  np: [
    { word: 'पानी', english: 'Water', scrambled: ['नी', 'पा'] },
    { word: 'घर', english: 'House', scrambled: ['र', 'घ'] },
    { word: 'कलम', english: 'Pen', scrambled: ['म', 'ल', 'क'] },
    { word: 'नमस्ते', english: 'Hello', scrambled: ['न', 'म', 'स्ते'] },
    { word: 'आमा', english: 'Mother', scrambled: ['मा', 'आ'] },
    { word: 'बुबा', english: 'Father', scrambled: ['बा', 'बु'] },
    { word: 'फूल', english: 'Flower', scrambled: ['ल', 'फू'] },
    { word: 'फलफूल', english: 'Fruit', scrambled: ['ल', 'फू', 'ल', 'फ'] },
    { word: 'सगरमाथा', english: 'Mt. Everest', scrambled: ['था', 'मा', 'र', 'ग', 'स'] },
    { word: 'हात्ती', english: 'Elephant', scrambled: ['त्ती', 'हा'] }
  ],
  es: [],
  zh: []
};

export const STATIC_PHRASES: Record<LanguageCode, PhraseData[]> = {
  np: [
    { native: 'नमस्ते', transliteration: 'Namaste', english: 'Hello', category: 'Greeting' },
    { native: 'धन्यवाद', transliteration: 'Dhanyabaad', english: 'Thank you', category: 'Daily' },
    { native: 'शुभ रात्री', transliteration: 'Shuva raatri', english: 'Good night', category: 'Daily' }
  ],
  es: [],
  zh: []
};
