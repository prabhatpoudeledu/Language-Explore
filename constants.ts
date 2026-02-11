
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
      letterNepaliAudio: '/assets/voice/sound/letter_a_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_a_english.mp3',
      examples: [
        { word: 'अचार', transliteration: 'achar', english: 'Pickle', imageUrl: '/assets/images/achar.webp', nepaliAudio: '/assets/voice/sound/achar_nepali.mp3', englishAudio: '/assets/voice/sound/achar_english.mp3' },
        { word: 'अनार', transliteration: 'anaar', english: 'Pomegranate', imageUrl: '/assets/images/anaar.webp', nepaliAudio: '/assets/voice/sound/anaar_nepali.mp3', englishAudio: '/assets/voice/sound/anaar_english.mp3' },
        { word: 'अम्बा', transliteration: 'amba', english: 'Guava', imageUrl: '/assets/images/amba.webp', nepaliAudio: '/assets/voice/sound/amba_nepali.mp3', englishAudio: '/assets/voice/sound/amba_english.mp3' },
        { word: 'अमिलो', transliteration: 'amilo', english: 'Sour (Lemon)', imageUrl: '/assets/images/amilo.webp', nepaliAudio: '/assets/voice/sound/amilo_nepali.mp3', englishAudio: '/assets/voice/sound/amilo_english.mp3' },
        { word: 'अङ्गुर', transliteration: 'anggur', english: 'Grapes', imageUrl: '/assets/images/anggur.webp', nepaliAudio: '/assets/voice/sound/anggur_nepali.mp3', englishAudio: '/assets/voice/sound/anggur_english.mp3' }
      ]
    },
    { 
      char: 'आ', type: 'Vowel', transliteration: 'aa',
      letterNepaliAudio: '/assets/voice/sound/letter_aa_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_aa_english.mp3',
      examples: [
        { word: 'आमा', transliteration: 'aama', english: 'Mother', imageUrl: '/assets/images/aama.webp', nepaliAudio: '/assets/voice/sound/aama_nepali.mp3', englishAudio: '/assets/voice/sound/aama_english.mp3' },
        { word: 'आकाश', transliteration: 'aakash', english: 'Sky', imageUrl: '/assets/images/aakash.webp', nepaliAudio: '/assets/voice/sound/aakash_nepali.mp3', englishAudio: '/assets/voice/sound/aakash_english.mp3' },
        { word: 'आँखा', transliteration: 'aankha', english: 'Eye', imageUrl: '/assets/images/aankha.webp', nepaliAudio: '/assets/voice/sound/aankha_nepali.mp3', englishAudio: '/assets/voice/sound/aankha_english.mp3' },
        { word: 'आलु', transliteration: 'aalu', english: 'Potato', imageUrl: '/assets/images/aalu.webp', nepaliAudio: '/assets/voice/sound/aalu_nepali.mp3', englishAudio: '/assets/voice/sound/aalu_english.mp3' },
        { word: 'आँप', transliteration: 'aanp', english: 'Mango', imageUrl: '/assets/images/aanp.webp', nepaliAudio: '/assets/voice/sound/aanp_nepali.mp3', englishAudio: '/assets/voice/sound/aanp_english.mp3' }
      ]
    },
    { 
      char: 'इ', type: 'Vowel', transliteration: 'i',
      letterNepaliAudio: '/assets/voice/sound/letter_i_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_i_english.mp3',
      examples: [
        { word: 'इच्छा', transliteration: 'ichchha', english: 'Wish', imageUrl: '/assets/images/ichchha.webp', nepaliAudio: '/assets/voice/sound/ichchha_nepali.mp3', englishAudio: '/assets/voice/sound/ichchha_english.mp3' },
        { word: 'इतिहास', transliteration: 'itihas', english: 'History', imageUrl: '/assets/images/itihas.webp', nepaliAudio: '/assets/voice/sound/itihas_nepali.mp3', englishAudio: '/assets/voice/sound/itihas_english.mp3' },
        { word: 'इनायत', transliteration: 'inayat', english: 'Grace', imageUrl: '/assets/images/inayat.webp', nepaliAudio: '/assets/voice/sound/inayat_nepali.mp3', englishAudio: '/assets/voice/sound/inayat_english.mp3' },
        { word: 'इन्जिन', transliteration: 'injin', english: 'Engine', imageUrl: '/assets/images/injin.webp', nepaliAudio: '/assets/voice/sound/injin_nepali.mp3', englishAudio: '/assets/voice/sound/injin_english.mp3' },
        { word: 'इँट्टा', transliteration: 'itta', english: 'Brick', imageUrl: '/assets/images/itta.webp', nepaliAudio: '/assets/voice/sound/itta_nepali.mp3', englishAudio: '/assets/voice/sound/itta_english.mp3' }
      ]
    },
    { 
      char: 'ई', type: 'Vowel', transliteration: 'ee',
      letterNepaliAudio: '/assets/voice/sound/letter_ee_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ee_english.mp3',
      examples: [
        { word: 'ईश्वर', transliteration: 'eeshwor', english: 'God', imageUrl: '/assets/images/eeshwor.webp', nepaliAudio: '/assets/voice/sound/eeshwor_nepali.mp3', englishAudio: '/assets/voice/sound/eeshwor_english.mp3' },
        { word: 'ईमानदार', transliteration: 'eemandar', english: 'Honest', imageUrl: '/assets/images/eemandar.webp', nepaliAudio: '/assets/voice/sound/eemandar_nepali.mp3', englishAudio: '/assets/voice/sound/eemandar_english.mp3' },
        { word: 'ईमेल', transliteration: 'eemel', english: 'Email', imageUrl: '/assets/images/eemel.webp', nepaliAudio: '/assets/voice/sound/eemel_nepali.mp3', englishAudio: '/assets/voice/sound/eemel_english.mp3' },
        { word: 'ईर्ष्या', transliteration: 'eershya', english: 'Envy', imageUrl: '/assets/images/eershya.webp', nepaliAudio: '/assets/voice/sound/eershya_nepali.mp3', englishAudio: '/assets/voice/sound/eershya_english.mp3' },
        { word: 'ईलाम', transliteration: 'eelam', english: 'Ilam (Tea Garden)', imageUrl: '/assets/images/eelam.webp', nepaliAudio: '/assets/voice/sound/eelam_nepali.mp3', englishAudio: '/assets/voice/sound/eelam_english.mp3' }
      ]
    },
    { 
      char: 'उ', type: 'Vowel', transliteration: 'u',
      letterNepaliAudio: '/assets/voice/sound/letter_u_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_u_english.mp3',
      examples: [
        { word: 'उज्यालो', transliteration: 'ujyalo', english: 'Bright', imageUrl: '/assets/images/ujyalo.webp', nepaliAudio: '/assets/voice/sound/ujyalo_nepali.mp3', englishAudio: '/assets/voice/sound/ujyalo_english.mp3' },
        { word: 'उकालो', transliteration: 'ukalo', english: 'Uphill', imageUrl: '/assets/images/ukalo.webp', nepaliAudio: '/assets/voice/sound/ukalo_nepali.mp3', englishAudio: '/assets/voice/sound/ukalo_english.mp3' },
        { word: 'उपहार', transliteration: 'upahar', english: 'Gift', imageUrl: '/assets/images/upahar.webp', nepaliAudio: '/assets/voice/sound/upahar_nepali.mp3', englishAudio: '/assets/voice/sound/upahar_english.mp3' },
        { word: 'उमेर', transliteration: 'umer', english: 'Age (Cake)', imageUrl: '/assets/images/umer.webp', nepaliAudio: '/assets/voice/sound/umer_nepali.mp3', englishAudio: '/assets/voice/sound/umer_english.mp3' },
        { word: 'उखु', transliteration: 'ukhu', english: 'Sugarcane', imageUrl: '/assets/images/ukhu.webp', nepaliAudio: '/assets/voice/sound/ukhu_nepali.mp3', englishAudio: '/assets/voice/sound/ukhu_english.mp3' }
      ]
    },
    { 
      char: 'ऊ', type: 'Vowel', transliteration: 'oo',
      letterNepaliAudio: '/assets/voice/sound/letter_oo_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_oo_english.mp3',
      examples: [
        { word: 'ऊन', transliteration: 'oon', english: 'Wool', imageUrl: '/assets/images/oon.webp', nepaliAudio: '/assets/voice/sound/oon_nepali.mp3', englishAudio: '/assets/voice/sound/oon_english.mp3' },
        { word: 'ऊँट', transliteration: 'oont', english: 'Camel', imageUrl: '/assets/images/oont.webp', nepaliAudio: '/assets/voice/sound/oont_nepali.mp3', englishAudio: '/assets/voice/sound/oont_english.mp3' },
        { word: 'ऊर्जा', transliteration: 'oorja', english: 'Energy', imageUrl: '/assets/images/oorja.webp', nepaliAudio: '/assets/voice/sound/oorja_nepali.mp3', englishAudio: '/assets/voice/sound/oorja_english.mp3' },
        { word: 'ऊँचा', transliteration: 'ooncha', english: 'High (Mountain)', imageUrl: '/assets/images/ooncha.webp', nepaliAudio: '/assets/voice/sound/ooncha_nepali.mp3', englishAudio: '/assets/voice/sound/ooncha_english.mp3' },
        { word: 'ऊँ', transliteration: 'oon_yes', english: 'Yes (Confirm)', imageUrl: '/assets/images/oon_yes.webp', nepaliAudio: '/assets/voice/sound/oon_yes_nepali.mp3', englishAudio: '/assets/voice/sound/oon_yes_english.mp3' }  // Renamed to avoid duplicate
      ]
    },
    { 
      char: 'ऋ', type: 'Vowel', transliteration: 'ri',
      letterNepaliAudio: '/assets/voice/sound/letter_ri_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ri_english.mp3',
      examples: [
        { word: 'ऋषि', transliteration: 'rishi', english: 'Sage', imageUrl: '/assets/images/rishi.webp', nepaliAudio: '/assets/voice/sound/rishi_nepali.mp3', englishAudio: '/assets/voice/sound/rishi_english.mp3' },
        { word: 'ऋण', transliteration: 'rin', english: 'Loan (Money)', imageUrl: '/assets/images/rin.webp', nepaliAudio: '/assets/voice/sound/rin_nepali.mp3', englishAudio: '/assets/voice/sound/rin_english.mp3' },
        { word: 'ऋतु', transliteration: 'ritu', english: 'Season', imageUrl: '/assets/images/ritu.webp', nepaliAudio: '/assets/voice/sound/ritu_nepali.mp3', englishAudio: '/assets/voice/sound/ritu_english.mp3' },
        { word: 'ऋचा', transliteration: 'richa', english: 'Verse', imageUrl: '/assets/images/richa.webp', nepaliAudio: '/assets/voice/sound/richa_nepali.mp3', englishAudio: '/assets/voice/sound/richa_english.mp3' },
        { word: 'ऋणी', transliteration: 'rini', english: 'Debtor', imageUrl: '/assets/images/rini.webp', nepaliAudio: '/assets/voice/sound/rini_nepali.mp3', englishAudio: '/assets/voice/sound/rini_english.mp3' }
      ]
    },
    { 
      char: 'ए', type: 'Vowel', transliteration: 'e',
      letterNepaliAudio: '/assets/voice/sound/letter_e_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_e_english.mp3',
      examples: [
        { word: 'एक', transliteration: 'ek', english: 'One', imageUrl: '/assets/images/ek.webp', nepaliAudio: '/assets/voice/sound/ek_nepali.mp3', englishAudio: '/assets/voice/sound/ek_english.mp3' },
        { word: 'एक्लै', transliteration: 'eklai', english: 'Alone', imageUrl: '/assets/images/eklai.webp', nepaliAudio: '/assets/voice/sound/eklai_nepali.mp3', englishAudio: '/assets/voice/sound/eklai_english.mp3' },
        { word: 'एघार', transliteration: 'eghaar', english: 'Eleven', imageUrl: '/assets/images/eghaar.webp', nepaliAudio: '/assets/voice/sound/eghaar_nepali.mp3', englishAudio: '/assets/voice/sound/eghaar_english.mp3' },
        { word: 'एम्बुलेन्स', transliteration: 'ambulance', english: 'Ambulance', imageUrl: '/assets/images/ambulance.webp', nepaliAudio: '/assets/voice/sound/ambulance_nepali.mp3', englishAudio: '/assets/voice/sound/ambulance_english.mp3' },
        { word: 'एशिया', transliteration: 'asia', english: 'Asia (Map)', imageUrl: '/assets/images/asia.webp', nepaliAudio: '/assets/voice/sound/asia_nepali.mp3', englishAudio: '/assets/voice/sound/asia_english.mp3' }
      ]
    },
    { 
      char: 'ऐ', type: 'Vowel', transliteration: 'ai',
      letterNepaliAudio: '/assets/voice/sound/letter_ai_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ai_english.mp3',
      examples: [
        { word: 'ऐना', transliteration: 'aina', english: 'Mirror', imageUrl: '/assets/images/aina.webp', nepaliAudio: '/assets/voice/sound/aina_nepali.mp3', englishAudio: '/assets/voice/sound/aina_english.mp3' },
        { word: 'ऐश्वर्य', transliteration: 'aiswarya', english: 'Wealth (Gold)', imageUrl: '/assets/images/aiswarya.webp', nepaliAudio: '/assets/voice/sound/aiswarya_nepali.mp3', englishAudio: '/assets/voice/sound/aiswarya_english.mp3' },
        { word: 'ऐतिहासिक', transliteration: 'aitihasik', english: 'History', imageUrl: '/assets/images/aitihasik.webp', nepaliAudio: '/assets/voice/sound/aitihasik_nepali.mp3', englishAudio: '/assets/voice/sound/aitihasik_english.mp3' },
        { word: 'ऐँसेलु', transliteration: 'ainselu', english: 'Raspberry', imageUrl: '/assets/images/ainselu.webp', nepaliAudio: '/assets/voice/sound/ainselu_nepali.mp3', englishAudio: '/assets/voice/sound/ainselu_english.mp3' },
        { word: 'ऐंठन', transliteration: 'ainthan', english: 'Nightmare', imageUrl: '/assets/images/ainthan.webp', nepaliAudio: '/assets/voice/sound/ainthan_nepali.mp3', englishAudio: '/assets/voice/sound/ainthan_english.mp3' }
      ]
    },
    { 
      char: 'ओ', type: 'Vowel', transliteration: 'o',
      letterNepaliAudio: '/assets/voice/sound/letter_o_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_o_english.mp3',
      examples: [
        { word: 'ओखती', transliteration: 'okhati', english: 'Medicine', imageUrl: '/assets/images/okhati.webp', nepaliAudio: '/assets/voice/sound/okhati_nepali.mp3', englishAudio: '/assets/voice/sound/okhati_english.mp3' },
        { word: 'ओछ्यान', transliteration: 'ochhyan', english: 'Bed', imageUrl: '/assets/images/ochhyan.webp', nepaliAudio: '/assets/voice/sound/ochhyan_nepali.mp3', englishAudio: '/assets/voice/sound/ochhyan_english.mp3' },
        { word: 'ओखर', transliteration: 'okhar', english: 'Walnut', imageUrl: '/assets/images/okhar.webp', nepaliAudio: '/assets/voice/sound/okhar_nepali.mp3', englishAudio: '/assets/voice/sound/okhar_english.mp3' },
        { word: 'ओरालो', transliteration: 'oralo', english: 'Downhill', imageUrl: '/assets/images/oralo.webp', nepaliAudio: '/assets/voice/sound/oralo_nepali.mp3', englishAudio: '/assets/voice/sound/oralo_english.mp3' },
        { word: 'ओठ', transliteration: 'oth', english: 'Lip', imageUrl: '/assets/images/oth.webp', nepaliAudio: '/assets/voice/sound/oth_nepali.mp3', englishAudio: '/assets/voice/sound/oth_english.mp3' }
      ]
    },
    { 
      char: 'औ', type: 'Vowel', transliteration: 'au',
      letterNepaliAudio: '/assets/voice/sound/letter_au_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_au_english.mp3',
      examples: [
        { word: 'औषधि', transliteration: 'aushadhi', english: 'Medicine', imageUrl: '/assets/images/aushadhi.webp', nepaliAudio: '/assets/voice/sound/aushadhi_nepali.mp3', englishAudio: '/assets/voice/sound/aushadhi_english.mp3' },
        { word: 'औजार', transliteration: 'aujar', english: 'Tool', imageUrl: '/assets/images/aujar.webp', nepaliAudio: '/assets/voice/sound/aujar_nepali.mp3', englishAudio: '/assets/voice/sound/aujar_english.mp3' },
        { word: 'औँला', transliteration: 'aunla', english: 'Finger', imageUrl: '/assets/images/aunla.webp', nepaliAudio: '/assets/voice/sound/aunla_nepali.mp3', englishAudio: '/assets/voice/sound/aunla_english.mp3' },
        { word: 'औपचारिक', transliteration: 'aupacharik', english: 'Formal (Suit)', imageUrl: '/assets/images/aupacharik.webp', nepaliAudio: '/assets/voice/sound/aupacharik_nepali.mp3', englishAudio: '/assets/voice/sound/aupacharik_english.mp3' },
        { word: 'औँसी', transliteration: 'aunsi', english: 'New Moon', imageUrl: '/assets/images/aunsi.webp', nepaliAudio: '/assets/voice/sound/aunsi_nepali.mp3', englishAudio: '/assets/voice/sound/aunsi_english.mp3' }
      ]
    },
    { 
      char: 'अं', type: 'Vowel', transliteration: 'am',
      letterNepaliAudio: '/assets/voice/sound/letter_am_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_am_english.mp3',
      examples: [
        { word: 'अंक', transliteration: 'anka', english: 'Number', imageUrl: '/assets/images/anka.webp', nepaliAudio: '/assets/voice/sound/anka_nepali.mp3', englishAudio: '/assets/voice/sound/anka_english.mp3' },
        { word: 'अंकमाल', transliteration: 'ankamal', english: 'Hug', imageUrl: '/assets/images/ankamal.webp', nepaliAudio: '/assets/voice/sound/ankamal_nepali.mp3', englishAudio: '/assets/voice/sound/ankamal_english.mp3' },
        { word: 'अंश', transliteration: 'ansha', english: 'Part', imageUrl: '/assets/images/ansha.webp', nepaliAudio: '/assets/voice/sound/ansha_nepali.mp3', englishAudio: '/assets/voice/sound/ansha_english.mp3' },
        { word: 'अन्डा', transliteration: 'anda', english: 'Egg', imageUrl: '/assets/images/anda.webp', nepaliAudio: '/assets/voice/sound/anda_nepali.mp3', englishAudio: '/assets/voice/sound/anda_english.mp3' },
        { word: 'अन्तिम', transliteration: 'antim', english: 'Final (Finish)', imageUrl: '/assets/images/antim.webp', nepaliAudio: '/assets/voice/sound/antim_nepali.mp3', englishAudio: '/assets/voice/sound/antim_english.mp3' }
      ]
    },
    { 
      char: 'अः', type: 'Vowel', transliteration: 'ah',
      letterNepaliAudio: '/assets/voice/sound/letter_ah_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ah_english.mp3',
      examples: [
        { word: 'अतः', transliteration: 'atah', english: 'Therefore', imageUrl: '/assets/images/atah.webp', nepaliAudio: '/assets/voice/sound/atah_nepali.mp3', englishAudio: '/assets/voice/sound/atah_english.mp3' },
        { word: 'प्रातः', transliteration: 'pratah', english: 'Morning', imageUrl: '/assets/images/pratah.webp', nepaliAudio: '/assets/voice/sound/pratah_nepali.mp3', englishAudio: '/assets/voice/sound/pratah_english.mp3' },
        { word: 'नमः', transliteration: 'namah', english: 'Salutation', imageUrl: '/assets/images/namah.webp', nepaliAudio: '/assets/voice/sound/namah_nepali.mp3', englishAudio: '/assets/voice/sound/namah_english.mp3' },
        { word: 'फलतः', transliteration: 'phalatah', english: 'As a result', imageUrl: '/assets/images/phalatah.webp', nepaliAudio: '/assets/voice/sound/phalatah_nepali.mp3', englishAudio: '/assets/voice/sound/phalatah_english.mp3' },
        { word: 'स्वतः', transliteration: 'swatah', english: 'By oneself', imageUrl: '/assets/images/swatah.webp', nepaliAudio: '/assets/voice/sound/swatah_nepali.mp3', englishAudio: '/assets/voice/sound/swatah_english.mp3' }
      ]
    },
    { 
      char: 'ॠ', type: 'Vowel', transliteration: 'rri',
      letterNepaliAudio: '/assets/voice/sound/letter_rri_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_rri_english.mp3',
      examples: [
        { word: 'ऋषि', transliteration: 'rishi', english: 'Sage', imageUrl: '/assets/images/rishi.webp', nepaliAudio: '/assets/voice/sound/rishi_nepali.mp3', englishAudio: '/assets/voice/sound/rishi_english.mp3' },
        { word: 'ऋतु', transliteration: 'ritu', english: 'Season', imageUrl: '/assets/images/ritu.webp', nepaliAudio: '/assets/voice/sound/ritu_nepali.mp3', englishAudio: '/assets/voice/sound/ritu_english.mp3' }
      ]
    },

    // CONSONANTS (36)
    { 
      char: 'क', type: 'Consonant', transliteration: 'ka',
      letterNepaliAudio: '/assets/voice/sound/letter_ka_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ka_english.mp3',
      examples: [
        { word: 'कलम', transliteration: 'kalam', english: 'Pen', imageUrl: '/assets/images/kalam.webp', nepaliAudio: '/assets/voice/sound/kalam_nepali.mp3', englishAudio: '/assets/voice/sound/kalam_english.mp3' },
        { word: 'कपाल', transliteration: 'kapal', english: 'Hair', imageUrl: '/assets/images/kapal.webp', nepaliAudio: '/assets/voice/sound/kapal_nepali.mp3', englishAudio: '/assets/voice/sound/kapal_english.mp3' },
        { word: 'कमिलो', transliteration: 'kamilo', english: 'Ant', imageUrl: '/assets/images/kamilo.webp', nepaliAudio: '/assets/voice/sound/kamilo_nepali.mp3', englishAudio: '/assets/voice/sound/kamilo_english.mp3' },
        { word: 'कागज', transliteration: 'kagaj', english: 'Paper', imageUrl: '/assets/images/kagaj.webp', nepaliAudio: '/assets/voice/sound/kagaj_nepali.mp3', englishAudio: '/assets/voice/sound/kagaj_english.mp3' },
        { word: 'कठिन', transliteration: 'kathin', english: 'Difficult (Climb)', imageUrl: '/assets/images/kathin.webp', nepaliAudio: '/assets/voice/sound/kathin_nepali.mp3', englishAudio: '/assets/voice/sound/kathin_english.mp3' }
      ], 
      combos: getNepaliBarahkhari('क', 'k') 
    },
    { 
      char: 'ख', type: 'Consonant', transliteration: 'kha',
      letterNepaliAudio: '/assets/voice/sound/letter_kha_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_kha_english.mp3',
      examples: [
        { word: 'खरायो', transliteration: 'kharayo', english: 'Rabbit', imageUrl: '/assets/images/kharayo.webp', nepaliAudio: '/assets/voice/sound/kharayo_nepali.mp3', englishAudio: '/assets/voice/sound/kharayo_english.mp3' },
        { word: 'खल्ती', transliteration: 'khalti', english: 'Pocket', imageUrl: '/assets/images/khalti.webp', nepaliAudio: '/assets/voice/sound/khalti_nepali.mp3', englishAudio: '/assets/voice/sound/khalti_english.mp3' },
        { word: 'खर्च', transliteration: 'kharcha', english: 'Expense', imageUrl: '/assets/images/kharcha.webp', nepaliAudio: '/assets/voice/sound/kharcha_nepali.mp3', englishAudio: '/assets/voice/sound/kharcha_english.mp3' },
        { word: 'खुकुरी', transliteration: 'khukuri', english: 'Knife', imageUrl: '/assets/images/khukuri.webp', nepaliAudio: '/assets/voice/sound/khukuri_nepali.mp3', englishAudio: '/assets/voice/sound/khukuri_english.mp3' },
        { word: 'खोला', transliteration: 'khola', english: 'River', imageUrl: '/assets/images/khola.webp', nepaliAudio: '/assets/voice/sound/khola_nepali.mp3', englishAudio: '/assets/voice/sound/khola_english.mp3' }
      ], 
      combos: getNepaliBarahkhari('ख', 'kh') 
    },
    // Full remaining consonants with local assets (pattern applied)
    { 
      char: 'ग', type: 'Consonant', transliteration: 'ga',
      letterNepaliAudio: '/assets/voice/sound/letter_ga_nepali.mp3',
      letterEnglishAudio: '/assets/voice/sound/letter_ga_english.mp3',
      examples: [
        { word: 'गाई', transliteration: 'gai', english: 'Cow', imageUrl: '/assets/images/gai.webp', nepaliAudio: '/assets/voice/sound/gai_nepali.mp3', englishAudio: '/assets/voice/sound/gai_english.mp3' },
        { word: 'गमला', transliteration: 'gamala', english: 'Flowerpot', imageUrl: '/assets/images/gamala.webp', nepaliAudio: '/assets/voice/sound/gamala_nepali.mp3', englishAudio: '/assets/voice/sound/gamala_english.mp3' },
        { word: 'गरम', transliteration: 'garam', english: 'Hot (Sun)', imageUrl: '/assets/images/garam.webp', nepaliAudio: '/assets/voice/sound/garam_nepali.mp3', englishAudio: '/assets/voice/sound/garam_english.mp3' },
        { word: 'गिटार', transliteration: 'gitar', english: 'Guitar', imageUrl: '/assets/images/gitar.webp', nepaliAudio: '/assets/voice/sound/gitar_nepali.mp3', englishAudio: '/assets/voice/sound/gitar_english.mp3' },
        { word: 'गुलाफ', transliteration: 'gulaf', english: 'Rose', imageUrl: '/assets/images/gulaf.webp', nepaliAudio: '/assets/voice/sound/gulaf_nepali.mp3', englishAudio: '/assets/voice/sound/gulaf_english.mp3' }
      ], 
      combos: getNepaliBarahkhari('ग', 'g') 
    },
{
  char: 'घ', type: 'Consonant', transliteration: 'gha',
  letterNepaliAudio: '/assets/voice/sound/letter_gha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_gha_english.mp3',
  examples: [
    { word: 'घर', transliteration: 'ghar', english: 'House', imageUrl: '/assets/images/ghar.webp', nepaliAudio: '/assets/voice/sound/ghar_nepali.mp3', englishAudio: '/assets/voice/sound/ghar_english.mp3' },
    { word: 'घडी', transliteration: 'ghadi', english: 'Watch', imageUrl: '/assets/images/ghadi.webp', nepaliAudio: '/assets/voice/sound/ghadi_nepali.mp3', englishAudio: '/assets/voice/sound/ghadi_english.mp3' },
    { word: 'घाम', transliteration: 'gham', english: 'Sunshine', imageUrl: '/assets/images/gham.webp', nepaliAudio: '/assets/voice/sound/gham_nepali.mp3', englishAudio: '/assets/voice/sound/gham_english.mp3' },
    { word: 'घ्यू', transliteration: 'ghyu', english: 'Ghee', imageUrl: '/assets/images/ghyu.webp', nepaliAudio: '/assets/voice/sound/ghyu_nepali.mp3', englishAudio: '/assets/voice/sound/ghyu_english.mp3' },
    { word: 'घोडा', transliteration: 'ghoda', english: 'Horse', imageUrl: '/assets/images/ghoda.webp', nepaliAudio: '/assets/voice/sound/ghoda_nepali.mp3', englishAudio: '/assets/voice/sound/ghoda_english.mp3' }
  ],
  combos: getNepaliBarahkhari('घ', 'gh')
},
{
  char: 'ङ', type: 'Consonant', transliteration: 'nga',
  letterNepaliAudio: '/assets/voice/sound/letter_nga_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_nga_english.mp3',
  examples: [
    { word: 'राँगा', transliteration: 'raanga', english: 'Buffalo', imageUrl: '/assets/images/raanga.webp', nepaliAudio: '/assets/voice/sound/raanga_nepali.mp3', englishAudio: '/assets/voice/sound/raanga_english.mp3' },
    { word: 'बाङो', transliteration: 'baango', english: 'Bent', imageUrl: '/assets/images/baango.webp', nepaliAudio: '/assets/voice/sound/baango_nepali.mp3', englishAudio: '/assets/voice/sound/baango_english.mp3' },
    { word: 'आङ', transliteration: 'aang', english: 'Body', imageUrl: '/assets/images/aang.webp', nepaliAudio: '/assets/voice/sound/aang_nepali.mp3', englishAudio: '/assets/voice/sound/aang_english.mp3' },
    { word: 'नाङ्लो', transliteration: 'naanglo', english: 'Tray', imageUrl: '/assets/images/naanglo.webp', nepaliAudio: '/assets/voice/sound/naanglo_nepali.mp3', englishAudio: '/assets/voice/sound/naanglo_english.mp3' },
    { word: 'साङ्लो', transliteration: 'saanglo', english: 'Chain', imageUrl: '/assets/images/saanglo.webp', nepaliAudio: '/assets/voice/sound/saanglo_nepali.mp3', englishAudio: '/assets/voice/sound/saanglo_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ङ', 'ng')
},
{
  char: 'च', type: 'Consonant', transliteration: 'cha',
  letterNepaliAudio: '/assets/voice/sound/letter_cha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_cha_english.mp3',
  examples: [
    { word: 'चिया', transliteration: 'chiya', english: 'Tea', imageUrl: '/assets/images/chiya.webp', nepaliAudio: '/assets/voice/sound/chiya_nepali.mp3', englishAudio: '/assets/voice/sound/chiya_english.mp3' },
    { word: 'चरा', transliteration: 'chara', english: 'Bird', imageUrl: '/assets/images/chara.webp', nepaliAudio: '/assets/voice/sound/chara_nepali.mp3', englishAudio: '/assets/voice/sound/chara_english.mp3' },
    { word: 'चामल', transliteration: 'chamal', english: 'Rice', imageUrl: '/assets/images/chamal.webp', nepaliAudio: '/assets/voice/sound/chamal_nepali.mp3', englishAudio: '/assets/voice/sound/chamal_english.mp3' },
    { word: 'चम्चा', transliteration: 'chamcha', english: 'Spoon', imageUrl: '/assets/images/chamcha.webp', nepaliAudio: '/assets/voice/sound/chamcha_nepali.mp3', englishAudio: '/assets/voice/sound/chamcha_english.mp3' },
    { word: 'चिसो', transliteration: 'chiso', english: 'Cold', imageUrl: '/assets/images/chiso.webp', nepaliAudio: '/assets/voice/sound/chiso_nepali.mp3', englishAudio: '/assets/voice/sound/chiso_english.mp3' }
  ],
  combos: getNepaliBarahkhari('च', 'ch')
},
{
  char: 'छ', type: 'Consonant', transliteration: 'chha',
  letterNepaliAudio: '/assets/voice/sound/letter_chha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_chha_english.mp3',
  examples: [
    { word: 'छोरा', transliteration: 'chhora', english: 'Son', imageUrl: '/assets/images/chhora.webp', nepaliAudio: '/assets/voice/sound/chhora_nepali.mp3', englishAudio: '/assets/voice/sound/chhora_english.mp3' },
    { word: 'छोरी', transliteration: 'chhori', english: 'Daughter', imageUrl: '/assets/images/chhori.webp', nepaliAudio: '/assets/voice/sound/chhori_nepali.mp3', englishAudio: '/assets/voice/sound/chhori_english.mp3' },
    { word: 'छिटो', transliteration: 'chhito', english: 'Fast', imageUrl: '/assets/images/chhito.webp', nepaliAudio: '/assets/voice/sound/chhito_nepali.mp3', englishAudio: '/assets/voice/sound/chhito_english.mp3' },
    { word: 'छाता', transliteration: 'chhata', english: 'Umbrella', imageUrl: '/assets/images/chhata.webp', nepaliAudio: '/assets/voice/sound/chhata_nepali.mp3', englishAudio: '/assets/voice/sound/chhata_english.mp3' },
    { word: 'छेपारो', transliteration: 'chheparo', english: 'Lizard', imageUrl: '/assets/images/chheparo.webp', nepaliAudio: '/assets/voice/sound/chheparo_nepali.mp3', englishAudio: '/assets/voice/sound/chheparo_english.mp3' }
  ],
  combos: getNepaliBarahkhari('छ', 'chh')
},
{
  char: 'ज', type: 'Consonant', transliteration: 'ja',
  letterNepaliAudio: '/assets/voice/sound/letter_ja_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_ja_english.mp3',
  examples: [
    { word: 'जुत्ता', transliteration: 'jutta', english: 'Shoes', imageUrl: '/assets/images/jutta.webp', nepaliAudio: '/assets/voice/sound/jutta_nepali.mp3', englishAudio: '/assets/voice/sound/jutta_english.mp3' },
    { word: 'जल', transliteration: 'jal', english: 'Water', imageUrl: '/assets/images/jal.webp', nepaliAudio: '/assets/voice/sound/jal_nepali.mp3', englishAudio: '/assets/voice/sound/jal_english.mp3' },
    { word: 'जहाज', transliteration: 'jahaj', english: 'Ship', imageUrl: '/assets/images/jahaj.webp', nepaliAudio: '/assets/voice/sound/jahaj_nepali.mp3', englishAudio: '/assets/voice/sound/jahaj_english.mp3' },
    { word: 'जमीन', transliteration: 'jamin', english: 'Land', imageUrl: '/assets/images/jamin.webp', nepaliAudio: '/assets/voice/sound/jamin_nepali.mp3', englishAudio: '/assets/voice/sound/jamin_english.mp3' },
    { word: 'जुन', transliteration: 'jun', english: 'Moon', imageUrl: '/assets/images/jun.webp', nepaliAudio: '/assets/voice/sound/jun_nepali.mp3', englishAudio: '/assets/voice/sound/jun_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ज', 'j')
},
{
  char: 'झ', type: 'Consonant', transliteration: 'jha',
  letterNepaliAudio: '/assets/voice/sound/letter_jha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_jha_english.mp3',
  examples: [
    { word: 'झ्याल', transliteration: 'jhyal', english: 'Window', imageUrl: '/assets/images/jhyal.webp', nepaliAudio: '/assets/voice/sound/jhyal_nepali.mp3', englishAudio: '/assets/voice/sound/jhyal_english.mp3' },
    { word: 'झोला', transliteration: 'jhola', english: 'Bag', imageUrl: '/assets/images/jhola.webp', nepaliAudio: '/assets/voice/sound/jhola_nepali.mp3', englishAudio: '/assets/voice/sound/jhola_english.mp3' },
    { word: 'झार', transliteration: 'jhaar', english: 'Grass', imageUrl: '/assets/images/jhaar.webp', nepaliAudio: '/assets/voice/sound/jhaar_nepali.mp3', englishAudio: '/assets/voice/sound/jhaar_english.mp3' },
    { word: 'झिँगा', transliteration: 'jhinga', english: 'Fly', imageUrl: '/assets/images/jhinga.webp', nepaliAudio: '/assets/voice/sound/jhinga_nepali.mp3', englishAudio: '/assets/voice/sound/jhinga_english.mp3' },
    { word: 'झुटो', transliteration: 'jhuto', english: 'Lie', imageUrl: '/assets/images/jhuto.webp', nepaliAudio: '/assets/voice/sound/jhuto_nepali.mp3', englishAudio: '/assets/voice/sound/jhuto_english.mp3' }
  ],
  combos: getNepaliBarahkhari('झ', 'jh')
},
{
  char: 'ञ', type: 'Consonant', transliteration: 'nya',
  letterNepaliAudio: '/assets/voice/sound/letter_nya_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_nya_english.mp3',
  examples: [
    { word: 'पाँच', transliteration: 'paanch', english: 'Five', imageUrl: '/assets/images/paanch.webp', nepaliAudio: '/assets/voice/sound/paanch_nepali.mp3', englishAudio: '/assets/voice/sound/paanch_english.mp3' },
    { word: 'व्यञ्जन', transliteration: 'vyanjan', english: 'Consonant', imageUrl: '/assets/images/vyanjan.webp', nepaliAudio: '/assets/voice/sound/vyanjan_nepali.mp3', englishAudio: '/assets/voice/sound/vyanjan_english.mp3' },
    { word: 'चञ्चल', transliteration: 'chanchal', english: 'Restless', imageUrl: '/assets/images/chanchal.webp', nepaliAudio: '/assets/voice/sound/chanchal_nepali.mp3', englishAudio: '/assets/voice/sound/chanchal_english.mp3' },
    { word: 'कञ्जुस', transliteration: 'kanjus', english: 'Stingy', imageUrl: '/assets/images/kanjus.webp', nepaliAudio: '/assets/voice/sound/kanjus_nepali.mp3', englishAudio: '/assets/voice/sound/kanjus_english.mp3' },
    { word: 'मञ्जु', transliteration: 'manju', english: 'Beautiful', imageUrl: '/assets/images/manju.webp', nepaliAudio: '/assets/voice/sound/manju_nepali.mp3', englishAudio: '/assets/voice/sound/manju_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ञ', 'yn')
},
{
  char: 'ट', type: 'Consonant', transliteration: 'ta',
  letterNepaliAudio: '/assets/voice/sound/letter_ta_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_ta_english.mp3',
  examples: [
    { word: 'टाउको', transliteration: 'tauko', english: 'Head', imageUrl: '/assets/images/tauko.webp', nepaliAudio: '/assets/voice/sound/tauko_nepali.mp3', englishAudio: '/assets/voice/sound/tauko_english.mp3' },
    { word: 'टपरी', transliteration: 'tapari', english: 'Leaf plate', imageUrl: '/assets/images/tapari.webp', nepaliAudio: '/assets/voice/sound/tapari_nepali.mp3', englishAudio: '/assets/voice/sound/tapari_english.mp3' },
    { word: 'टिलिक', transliteration: 'tilik', english: 'Shiny', imageUrl: '/assets/images/tilik.webp', nepaliAudio: '/assets/voice/sound/tilik_nepali.mp3', englishAudio: '/assets/voice/sound/tilik_english.mp3' },
    { word: 'टिक्का', transliteration: 'tikka', english: 'Tika', imageUrl: '/assets/images/tikka.webp', nepaliAudio: '/assets/voice/sound/tikka_nepali.mp3', englishAudio: '/assets/voice/sound/tikka_english.mp3' },
    { word: 'टोपी', transliteration: 'topi', english: 'Hat', imageUrl: '/assets/images/topi.webp', nepaliAudio: '/assets/voice/sound/topi_nepali.mp3', englishAudio: '/assets/voice/sound/topi_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ट', 't')
},
{
  char: 'ठ', type: 'Consonant', transliteration: 'tha',
  letterNepaliAudio: '/assets/voice/sound/letter_tha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_tha_english.mp3',
  examples: [
    { word: 'ठूलो', transliteration: 'thulo', english: 'Big', imageUrl: '/assets/images/thulo.webp', nepaliAudio: '/assets/voice/sound/thulo_nepali.mp3', englishAudio: '/assets/voice/sound/thulo_english.mp3' },
    { word: 'ठिक', transliteration: 'thik', english: 'Correct', imageUrl: '/assets/images/thik.webp', nepaliAudio: '/assets/voice/sound/thik_nepali.mp3', englishAudio: '/assets/voice/sound/thik_english.mp3' },
    { word: 'ठट्टा', transliteration: 'thatta', english: 'Joke', imageUrl: '/assets/images/thatta.webp', nepaliAudio: '/assets/voice/sound/thatta_nepali.mp3', englishAudio: '/assets/voice/sound/thatta_english.mp3' },
    { word: 'ठेगाना', transliteration: 'thegana', english: 'Address', imageUrl: '/assets/images/thegana.webp', nepaliAudio: '/assets/voice/sound/thegana_nepali.mp3', englishAudio: '/assets/voice/sound/thegana_english.mp3' },
    { word: 'ठाम', transliteration: 'thaam', english: 'Place', imageUrl: '/assets/images/thaam.webp', nepaliAudio: '/assets/voice/sound/thaam_nepali.mp3', englishAudio: '/assets/voice/sound/thaam_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ठ', 'th')
},
{
  char: 'ड', type: 'Consonant', transliteration: 'da',
  letterNepaliAudio: '/assets/voice/sound/letter_da_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_da_english.mp3',
  examples: [
    { word: 'डोरी', transliteration: 'dori', english: 'Rope', imageUrl: '/assets/images/dori.webp', nepaliAudio: '/assets/voice/sound/dori_nepali.mp3', englishAudio: '/assets/voice/sound/dori_english.mp3' },
    { word: 'डर', transliteration: 'dar', english: 'Fear', imageUrl: '/assets/images/dar.webp', nepaliAudio: '/assets/voice/sound/dar_nepali.mp3', englishAudio: '/assets/voice/sound/dar_english.mp3' },
    { word: 'डण्डा', transliteration: 'danda', english: 'Stick', imageUrl: '/assets/images/danda.webp', nepaliAudio: '/assets/voice/sound/danda_nepali.mp3', englishAudio: '/assets/voice/sound/danda_english.mp3' },
    { word: 'डल्ले', transliteration: 'dalle', english: 'Round', imageUrl: '/assets/images/dalle.webp', nepaliAudio: '/assets/voice/sound/dalle_nepali.mp3', englishAudio: '/assets/voice/sound/dalle_english.mp3' },
    { word: 'डालो', transliteration: 'dalo', english: 'Basket', imageUrl: '/assets/images/dalo.webp', nepaliAudio: '/assets/voice/sound/dalo_nepali.mp3', englishAudio: '/assets/voice/sound/dalo_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ड', 'd')
},
{
  char: 'ढ', type: 'Consonant', transliteration: 'dha',
  letterNepaliAudio: '/assets/voice/sound/letter_dha_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_dha_english.mp3',
  examples: [
    { word: 'ढोका', transliteration: 'dhoka', english: 'Door', imageUrl: '/assets/images/dhoka.webp', nepaliAudio: '/assets/voice/sound/dhoka_nepali.mp3', englishAudio: '/assets/voice/sound/dhoka_english.mp3' },
    { word: 'ढुङ्गा', transliteration: 'dhungga', english: 'Stone', imageUrl: '/assets/images/dhungga.webp', nepaliAudio: '/assets/voice/sound/dhungga_nepali.mp3', englishAudio: '/assets/voice/sound/dhungga_english.mp3' },
    { word: 'ढिँडो', transliteration: 'dhindo', english: 'Porridge', imageUrl: '/assets/images/dhindo.webp', nepaliAudio: '/assets/voice/sound/dhindo_nepali.mp3', englishAudio: '/assets/voice/sound/dhindo_english.mp3' },
    { word: 'ढोग', transliteration: 'dhog', english: 'Greeting', imageUrl: '/assets/images/dhog.webp', nepaliAudio: '/assets/voice/sound/dhog_nepali.mp3', englishAudio: '/assets/voice/sound/dhog_english.mp3' },
    { word: 'ढिलो', transliteration: 'dhilo', english: 'Late', imageUrl: '/assets/images/dhilo.webp', nepaliAudio: '/assets/voice/sound/dhilo_nepali.mp3', englishAudio: '/assets/voice/sound/dhilo_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ढ', 'dh')
},
{
  char: 'ण', type: 'Consonant', transliteration: 'na',
  letterNepaliAudio: '/assets/voice/sound/letter_na_nepali.mp3',
  letterEnglishAudio: '/assets/voice/sound/letter_na_english.mp3',
  examples: [
    { word: 'गुण', transliteration: 'gun', english: 'Quality', imageUrl: '/assets/images/gun.webp', nepaliAudio: '/assets/voice/sound/gun_nepali.mp3', englishAudio: '/assets/voice/sound/gun_english.mp3' },
    { word: 'बाण', transliteration: 'baan', english: 'Arrow', imageUrl: '/assets/images/baan.webp', nepaliAudio: '/assets/voice/sound/baan_nepali.mp3', englishAudio: '/assets/voice/sound/baan_english.mp3' },
    { word: 'ऋण', transliteration: 'rin', english: 'Loan', imageUrl: '/assets/images/rin.webp', nepaliAudio: '/assets/voice/sound/rin_nepali.mp3', englishAudio: '/assets/voice/sound/rin_english.mp3' },
    { word: 'मणि', transliteration: 'mani', english: 'Gem', imageUrl: '/assets/images/mani.webp', nepaliAudio: '/assets/voice/sound/mani_nepali.mp3', englishAudio: '/assets/voice/sound/mani_english.mp3' },
    { word: 'काण्ड', transliteration: 'kanda', english: 'Chapter', imageUrl: '/assets/images/kanda.webp', nepaliAudio: '/assets/voice/sound/kanda_nepali.mp3', englishAudio: '/assets/voice/sound/kanda_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ण', 'n')
},
{
  char: 'त', type: 'Consonant', transliteration: 'ta',
  examples: [
    { word: 'तरकारी', transliteration: 'tarkari', english: 'Vegetables', imageUrl: '/assets/images/tarkari.webp', nepaliAudio: '/assets/voice/sound/tarkari_nepali.mp3', englishAudio: '/assets/voice/sound/tarkari_english.mp3' },
    { word: 'तारा', transliteration: 'tara', english: 'Star', imageUrl: '/assets/images/tara.webp', nepaliAudio: '/assets/voice/sound/tara_nepali.mp3', englishAudio: '/assets/voice/sound/tara_english.mp3' },
    { word: 'ताला', transliteration: 'tala', english: 'Lock', imageUrl: '/assets/images/tala.webp', nepaliAudio: '/assets/voice/sound/tala_nepali.mp3', englishAudio: '/assets/voice/sound/tala_english.mp3' },
    { word: 'तास', transliteration: 'taas', english: 'Cards', imageUrl: '/assets/images/taas.webp', nepaliAudio: '/assets/voice/sound/taas_nepali.mp3', englishAudio: '/assets/voice/sound/taas_english.mp3' },
    { word: 'तकिया', transliteration: 'takiya', english: 'Pillow', imageUrl: '/assets/images/takiya.webp', nepaliAudio: '/assets/voice/sound/takiya_nepali.mp3', englishAudio: '/assets/voice/sound/takiya_english.mp3' }
  ],
  combos: getNepaliBarahkhari('त', 't')
},
{
  char: 'थ', type: 'Consonant', transliteration: 'tha',
  examples: [
    { word: 'थोरै', transliteration: 'thorai', english: 'Few', imageUrl: '/assets/images/thorai.webp', nepaliAudio: '/assets/voice/sound/thorai_nepali.mp3', englishAudio: '/assets/voice/sound/thorai_english.mp3' },
    { word: 'थुप्रै', transliteration: 'thuprai', english: 'Many', imageUrl: '/assets/images/thuprai.webp', nepaliAudio: '/assets/voice/sound/thuprai_nepali.mp3', englishAudio: '/assets/voice/sound/thuprai_english.mp3' },
    { word: 'थाली', transliteration: 'thali', english: 'Plate', imageUrl: '/assets/images/thali.webp', nepaliAudio: '/assets/voice/sound/thali_nepali.mp3', englishAudio: '/assets/voice/sound/thali_english.mp3' },
    { word: 'थलो', transliteration: 'thalo', english: 'Place', imageUrl: '/assets/images/thalo.webp', nepaliAudio: '/assets/voice/sound/thalo_nepali.mp3', englishAudio: '/assets/voice/sound/thalo_english.mp3' },
    { word: 'थुन्नु', transliteration: 'thunnu', english: 'Block', imageUrl: '/assets/images/thunnu.webp', nepaliAudio: '/assets/voice/sound/thunnu_nepali.mp3', englishAudio: '/assets/voice/sound/thunnu_english.mp3' }
  ],
  combos: getNepaliBarahkhari('थ', 'th')
},
{
  char: 'द', type: 'Consonant', transliteration: 'da',
  examples: [
    { word: 'दाँत', transliteration: 'daant', english: 'Tooth', imageUrl: '/assets/images/daant.webp', nepaliAudio: '/assets/voice/sound/daant_nepali.mp3', englishAudio: '/assets/voice/sound/daant_english.mp3' },
    { word: 'दाल', transliteration: 'daal', english: 'Lentils', imageUrl: '/assets/images/daal.webp', nepaliAudio: '/assets/voice/sound/daal_nepali.mp3', englishAudio: '/assets/voice/sound/daal_english.mp3' },
    { word: 'दिन', transliteration: 'din', english: 'Day', imageUrl: '/assets/images/din.webp', nepaliAudio: '/assets/voice/sound/din_nepali.mp3', englishAudio: '/assets/voice/sound/din_english.mp3' },
    { word: 'दौरा', transliteration: 'daura', english: 'Shirt', imageUrl: '/assets/images/daura.webp', nepaliAudio: '/assets/voice/sound/daura_nepali.mp3', englishAudio: '/assets/voice/sound/daura_english.mp3' },
    { word: 'दही', transliteration: 'dahi', english: 'Yogurt', imageUrl: '/assets/images/dahi.webp', nepaliAudio: '/assets/voice/sound/dahi_nepali.mp3', englishAudio: '/assets/voice/sound/dahi_english.mp3' }
  ],
  combos: getNepaliBarahkhari('द', 'd')
},
{
  char: 'ध', type: 'Consonant', transliteration: 'dha',
  examples: [
    { word: 'धनी', transliteration: 'dhani', english: 'Rich', imageUrl: '/assets/images/dhani.webp', nepaliAudio: '/assets/voice/sound/dhani_nepali.mp3', englishAudio: '/assets/voice/sound/dhani_english.mp3' },
    { word: 'धूलो', transliteration: 'dhulo', english: 'Dust', imageUrl: '/assets/images/dhulo.webp', nepaliAudio: '/assets/voice/sound/dhulo_nepali.mp3', englishAudio: '/assets/voice/sound/dhulo_english.mp3' },
    { word: 'धन्यवाद', transliteration: 'dhanyabaad', english: 'Thanks', imageUrl: '/assets/images/dhanyabaad.webp', nepaliAudio: '/assets/voice/sound/dhanyabaad_nepali.mp3', englishAudio: '/assets/voice/sound/dhanyabaad_english.mp3' },
    { word: 'धारा', transliteration: 'dhara', english: 'Tap', imageUrl: '/assets/images/dhara.webp', nepaliAudio: '/assets/voice/sound/dhara_nepali.mp3', englishAudio: '/assets/voice/sound/dhara_english.mp3' },
    { word: 'धैर्य', transliteration: 'dhairya', english: 'Patience', imageUrl: '/assets/images/dhairya.webp', nepaliAudio: '/assets/voice/sound/dhairya_nepali.mp3', englishAudio: '/assets/voice/sound/dhairya_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ध', 'dh')
},
{
  char: 'न', type: 'Consonant', transliteration: 'na',
  examples: [
    { word: 'नदी', transliteration: 'nadi', english: 'River', imageUrl: '/assets/images/nadi.webp', nepaliAudio: '/assets/voice/sound/nadi_nepali.mp3', englishAudio: '/assets/voice/sound/nadi_english.mp3' },
    { word: 'नाम', transliteration: 'naam', english: 'Name', imageUrl: '/assets/images/naam.webp', nepaliAudio: '/assets/voice/sound/naam_nepali.mp3', englishAudio: '/assets/voice/sound/naam_english.mp3' },
    { word: 'नयाँ', transliteration: 'naya', english: 'New', imageUrl: '/assets/images/naya.webp', nepaliAudio: '/assets/voice/sound/naya_nepali.mp3', englishAudio: '/assets/voice/sound/naya_english.mp3' },
    { word: 'नुहाउनु', transliteration: 'nuhaunu', english: 'Bathe', imageUrl: '/assets/images/nuhaunu.webp', nepaliAudio: '/assets/voice/sound/nuhaunu_nepali.mp3', englishAudio: '/assets/voice/sound/nuhaunu_english.mp3' },
    { word: 'निद्रा', transliteration: 'nidra', english: 'Sleep', imageUrl: '/assets/images/nidra.webp', nepaliAudio: '/assets/voice/sound/nidra_nepali.mp3', englishAudio: '/assets/voice/sound/nidra_english.mp3' }
  ],
  combos: getNepaliBarahkhari('न', 'n')
},
{
  char: 'प', type: 'Consonant', transliteration: 'pa',
  examples: [
    { word: 'पानी', transliteration: 'paani', english: 'Water', imageUrl: '/assets/images/paani.webp', nepaliAudio: '/assets/voice/sound/paani_nepali.mp3', englishAudio: '/assets/voice/sound/paani_english.mp3' },
    { word: 'पिठो', transliteration: 'pitho', english: 'Flour', imageUrl: '/assets/images/pitho.webp', nepaliAudio: '/assets/voice/sound/pitho_nepali.mp3', englishAudio: '/assets/voice/sound/pitho_english.mp3' },
    { word: 'पैसा', transliteration: 'paisa', english: 'Money', imageUrl: '/assets/images/paisa.webp', nepaliAudio: '/assets/voice/sound/paisa_nepali.mp3', englishAudio: '/assets/voice/sound/paisa_english.mp3' },
    { word: 'पखेरा', transliteration: 'pakhera', english: 'Hillside', imageUrl: '/assets/images/pakhera.webp', nepaliAudio: '/assets/voice/sound/pakhera_nepali.mp3', englishAudio: '/assets/voice/sound/pakhera_english.mp3' },
    { word: 'पशु', transliteration: 'pashu', english: 'Animal', imageUrl: '/assets/images/pashu.webp', nepaliAudio: '/assets/voice/sound/pashu_nepali.mp3', englishAudio: '/assets/voice/sound/pashu_english.mp3' }
  ],
  combos: getNepaliBarahkhari('प', 'p')
},
{
  char: 'फ', type: 'Consonant', transliteration: 'pha',
  examples: [
    { word: 'फलफूल', transliteration: 'phalphul', english: 'Fruits', imageUrl: '/assets/images/phalphul.webp', nepaliAudio: '/assets/voice/sound/phalphul_nepali.mp3', englishAudio: '/assets/voice/sound/phalphul_english.mp3' },
    { word: 'फरक', transliteration: 'pharak', english: 'Difference', imageUrl: '/assets/images/pharak.webp', nepaliAudio: '/assets/voice/sound/pharak_nepali.mp3', englishAudio: '/assets/voice/sound/pharak_english.mp3' },
    { word: 'फोहोर', transliteration: 'phohor', english: 'Dirty', imageUrl: '/assets/images/phohor.webp', nepaliAudio: '/assets/voice/sound/phohor_nepali.mp3', englishAudio: '/assets/voice/sound/phohor_english.mp3' },
    { word: 'फलाम', transliteration: 'phalam', english: 'Iron', imageUrl: '/assets/images/phalam.webp', nepaliAudio: '/assets/voice/sound/phalam_nepali.mp3', englishAudio: '/assets/voice/sound/phalam_english.mp3' },
    { word: 'फुर्सद', transliteration: 'phursad', english: 'Leisure', imageUrl: '/assets/images/phursad.webp', nepaliAudio: '/assets/voice/sound/phursad_nepali.mp3', englishAudio: '/assets/voice/sound/phursad_english.mp3' }
  ],
  combos: getNepaliBarahkhari('फ', 'ph')
},
{
  char: 'ब', type: 'Consonant', transliteration: 'ba',
  examples: [
    { word: 'बाबु', transliteration: 'babu', english: 'Father', imageUrl: '/assets/images/babu.webp', nepaliAudio: '/assets/voice/sound/babu_nepali.mp3', englishAudio: '/assets/voice/sound/babu_english.mp3' },
    { word: 'बालक', transliteration: 'baalak', english: 'Child', imageUrl: '/assets/images/baalak.webp', nepaliAudio: '/assets/voice/sound/baalak_nepali.mp3', englishAudio: '/assets/voice/sound/baalak_english.mp3' },
    { word: 'बाल्टी', transliteration: 'baalti', english: 'Bucket', imageUrl: '/assets/images/baalti.webp', nepaliAudio: '/assets/voice/sound/baalti_nepali.mp3', englishAudio: '/assets/voice/sound/baalti_english.mp3' },
    { word: 'बजार', transliteration: 'bajar', english: 'Market', imageUrl: '/assets/images/bajar.webp', nepaliAudio: '/assets/voice/sound/bajar_nepali.mp3', englishAudio: '/assets/voice/sound/bajar_english.mp3' },
    { word: 'बिस्तारै', transliteration: 'bistarai', english: 'Slowly', imageUrl: '/assets/images/bistarai.webp', nepaliAudio: '/assets/voice/sound/bistarai_nepali.mp3', englishAudio: '/assets/voice/sound/bistarai_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ब', 'b')
},
{
  char: 'भ', type: 'Consonant', transliteration: 'bha',
  examples: [
    { word: 'भोक', transliteration: 'bhok', english: 'Hunger', imageUrl: '/assets/images/bhok.webp', nepaliAudio: '/assets/voice/sound/bhok_nepali.mp3', englishAudio: '/assets/voice/sound/bhok_english.mp3' },
    { word: 'भाइ', transliteration: 'bhai', english: 'Brother', imageUrl: '/assets/images/bhai.webp', nepaliAudio: '/assets/voice/sound/bhai_nepali.mp3', englishAudio: '/assets/voice/sound/bhai_english.mp3' },
    { word: 'भान्सा', transliteration: 'bhansa', english: 'Kitchen', imageUrl: '/assets/images/bhansa.webp', nepaliAudio: '/assets/voice/sound/bhansa_nepali.mp3', englishAudio: '/assets/voice/sound/bhansa_english.mp3' },
    { word: 'भालु', transliteration: 'bhalu', english: 'Bear', imageUrl: '/assets/images/bhalu.webp', nepaliAudio: '/assets/voice/sound/bhalu_nepali.mp3', englishAudio: '/assets/voice/sound/bhalu_english.mp3' },
    { word: 'भेट्नु', transliteration: 'bhetnu', english: 'Meet', imageUrl: '/assets/images/bhetnu.webp', nepaliAudio: '/assets/voice/sound/bhetnu_nepali.mp3', englishAudio: '/assets/voice/sound/bhetnu_english.mp3' }
  ],
  combos: getNepaliBarahkhari('भ', 'bha')
},
{
  char: 'म', type: 'Consonant', transliteration: 'ma',
  examples: [
    { word: 'माया', transliteration: 'maya', english: 'Love', imageUrl: '/assets/images/maya.webp', nepaliAudio: '/assets/voice/sound/maya_nepali.mp3', englishAudio: '/assets/voice/sound/maya_english.mp3' },
    { word: 'मन', transliteration: 'man', english: 'Mind', imageUrl: '/assets/images/man.webp', nepaliAudio: '/assets/voice/sound/man_nepali.mp3', englishAudio: '/assets/voice/sound/man_english.mp3' },
    { word: 'मानिस', transliteration: 'manis', english: 'Human', imageUrl: '/assets/images/manis.webp', nepaliAudio: '/assets/voice/sound/manis_nepali.mp3', englishAudio: '/assets/voice/sound/manis_english.mp3' },
    { word: 'मकै', transliteration: 'makai', english: 'Maize', imageUrl: '/assets/images/makai.webp', nepaliAudio: '/assets/voice/sound/makai_nepali.mp3', englishAudio: '/assets/voice/sound/makai_english.mp3' },
    { word: 'मासु', transliteration: 'masu', english: 'Meat', imageUrl: '/assets/images/masu.webp', nepaliAudio: '/assets/voice/sound/masu_nepali.mp3', englishAudio: '/assets/voice/sound/masu_english.mp3' }
  ],
  combos: getNepaliBarahkhari('म', 'm')
},
{
  char: 'य', type: 'Consonant', transliteration: 'ya',
  examples: [
    { word: 'यहाँ', transliteration: 'yahan', english: 'Here', imageUrl: '/assets/images/yahan.webp', nepaliAudio: '/assets/voice/sound/yahan_nepali.mp3', englishAudio: '/assets/voice/sound/yahan_english.mp3' },
    { word: 'यन्त्र', transliteration: 'yantra', english: 'Machine', imageUrl: '/assets/images/yantra.webp', nepaliAudio: '/assets/voice/sound/yantra_nepali.mp3', englishAudio: '/assets/voice/sound/yantra_english.mp3' },
    { word: 'यमराज', transliteration: 'yamraj', english: 'Death', imageUrl: '/assets/images/yamraj.webp', nepaliAudio: '/assets/voice/sound/yamraj_nepali.mp3', englishAudio: '/assets/voice/sound/yamraj_english.mp3' }
  ],
  combos: getNepaliBarahkhari('य', 'y')
},
{
  char: 'र', type: 'Consonant', transliteration: 'ra',
  examples: [
    { word: 'राम्रो', transliteration: 'ramro', english: 'Good', imageUrl: '/assets/images/ramro.webp', nepaliAudio: '/assets/voice/sound/ramro_nepali.mp3', englishAudio: '/assets/voice/sound/ramro_english.mp3' },
    { word: 'रङ', transliteration: 'rang', english: 'Color', imageUrl: '/assets/images/rang.webp', nepaliAudio: '/assets/voice/sound/rang_nepali.mp3', englishAudio: '/assets/voice/sound/rang_english.mp3' },
    { word: 'रोटी', transliteration: 'roti', english: 'Bread', imageUrl: '/assets/images/roti.webp', nepaliAudio: '/assets/voice/sound/roti_nepali.mp3', englishAudio: '/assets/voice/sound/roti_english.mp3' },
    { word: 'रगत', transliteration: 'ragat', english: 'Blood', imageUrl: '/assets/images/ragat.webp', nepaliAudio: '/assets/voice/sound/ragat_nepali.mp3', englishAudio: '/assets/voice/sound/ragat_english.mp3' },
    { word: 'रमाइलो', transliteration: 'ramailo', english: 'Fun', imageUrl: '/assets/images/ramailo.webp', nepaliAudio: '/assets/voice/sound/ramailo_nepali.mp3', englishAudio: '/assets/voice/sound/ramailo_english.mp3' }
  ],
  combos: getNepaliBarahkhari('र', 'r')
},
{
  char: 'ल', type: 'Consonant', transliteration: 'la',
  examples: [
    { word: 'लुगा', transliteration: 'luga', english: 'Clothes', imageUrl: '/assets/images/luga.webp', nepaliAudio: '/assets/voice/sound/luga_nepali.mp3', englishAudio: '/assets/voice/sound/luga_english.mp3' },
    { word: 'लामो', transliteration: 'lamo', english: 'Long', imageUrl: '/assets/images/lamo.webp', nepaliAudio: '/assets/voice/sound/lamo_nepali.mp3', englishAudio: '/assets/voice/sound/lamo_english.mp3' },
    { word: 'लसुन', transliteration: 'lasun', english: 'Garlic', imageUrl: '/assets/images/lasun.webp', nepaliAudio: '/assets/voice/sound/lasun_nepali.mp3', englishAudio: '/assets/voice/sound/lasun_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ल', 'l')
},
{
  char: 'व', type: 'Consonant', transliteration: 'wa',
  examples: [
    { word: 'वन', transliteration: 'wan', english: 'Forest', imageUrl: '/assets/images/wan.webp', nepaliAudio: '/assets/voice/sound/wan_nepali.mp3', englishAudio: '/assets/voice/sound/wan_english.mp3' },
    { word: 'वकील', transliteration: 'wakil', english: 'Lawyer', imageUrl: '/assets/images/wakil.webp', nepaliAudio: '/assets/voice/sound/wakil_nepali.mp3', englishAudio: '/assets/voice/sound/wakil_english.mp3' }
  ],
  combos: getNepaliBarahkhari('व', 'v')
},
{
  char: 'श', type: 'Consonant', transliteration: 'sha',
  examples: [
    { word: 'शहर', transliteration: 'shahar', english: 'City', imageUrl: '/assets/images/shahar.webp', nepaliAudio: '/assets/voice/sound/shahar_nepali.mp3', englishAudio: '/assets/voice/sound/shahar_english.mp3' },
    { word: 'शब्द', transliteration: 'shabda', english: 'Word', imageUrl: '/assets/images/shabda.webp', nepaliAudio: '/assets/voice/sound/shabda_nepali.mp3', englishAudio: '/assets/voice/sound/shabda_english.mp3' },
    { word: 'शरीर', transliteration: 'sharir', english: 'Body', imageUrl: '/assets/images/sharir.webp', nepaliAudio: '/assets/voice/sound/sharir_nepali.mp3', englishAudio: '/assets/voice/sound/sharir_english.mp3' }
  ],
  combos: getNepaliBarahkhari('श', 'sh')
},
{
  char: 'ष', type: 'Consonant', transliteration: 'sha',
  examples: [
    { word: 'कृषि', transliteration: 'krishi', english: 'Agriculture', imageUrl: '/assets/images/krishi.webp', nepaliAudio: '/assets/voice/sound/krishi_nepali.mp3', englishAudio: '/assets/voice/sound/krishi_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ष', 'sh')
},
{
  char: 'स', type: 'Consonant', transliteration: 'sa',
  examples: [
    { word: 'साथी', transliteration: 'sathi', english: 'Friend', imageUrl: '/assets/images/sathi.webp', nepaliAudio: '/assets/voice/sound/sathi_nepali.mp3', englishAudio: '/assets/voice/sound/sathi_english.mp3' },
    { word: 'सफा', transliteration: 'sapha', english: 'Clean', imageUrl: '/assets/images/sapha.webp', nepaliAudio: '/assets/voice/sound/sapha_nepali.mp3', englishAudio: '/assets/voice/sound/sapha_english.mp3' },
    { word: 'सानो', transliteration: 'sano', english: 'Small', imageUrl: '/assets/images/sano.webp', nepaliAudio: '/assets/voice/sound/sano_nepali.mp3', englishAudio: '/assets/voice/sound/sano_english.mp3' }
  ],
  combos: getNepaliBarahkhari('स', 's')
},
{
  char: 'ह', type: 'Consonant', transliteration: 'ha',
  examples: [
    { word: 'हजुर', transliteration: 'hajur', english: 'Yes (Polite)', imageUrl: '/assets/images/hajur.webp', nepaliAudio: '/assets/voice/sound/hajur_nepali.mp3', englishAudio: '/assets/voice/sound/hajur_english.mp3' },
    { word: 'हात', transliteration: 'haat', english: 'Hand', imageUrl: '/assets/images/haat.webp', nepaliAudio: '/assets/voice/sound/haat_nepali.mp3', englishAudio: '/assets/voice/sound/haat_english.mp3' },
    { word: 'हावा', transliteration: 'hawa', english: 'Air', imageUrl: '/assets/images/hawa.webp', nepaliAudio: '/assets/voice/sound/hawa_nepali.mp3', englishAudio: '/assets/voice/sound/hawa_english.mp3' }
  ],
  combos: getNepaliBarahkhari('ह', 'h')
},
{
  char: 'क्ष', type: 'Consonant', transliteration: 'kshya',
  examples: [
    { word: 'क्षमा', transliteration: 'kshama', english: 'Forgiveness', imageUrl: '/assets/images/kshama.webp', nepaliAudio: '/assets/voice/sound/kshama_nepali.mp3', englishAudio: '/assets/voice/sound/kshama_english.mp3' }
  ],
  combos: getNepaliBarahkhari('क्ष', 'ksh')
},
{
  char: 'त्र', type: 'Consonant', transliteration: 'tra',
  examples: [
    { word: 'त्रिशूल', transliteration: 'trishul', english: 'Trident', imageUrl: '/assets/images/trishul.webp', nepaliAudio: '/assets/voice/sound/trishul_nepali.mp3', englishAudio: '/assets/voice/sound/trishul_english.mp3' },
    { word: 'त्रिकोण', transliteration: 'trikon', english: 'Triangle', imageUrl: '/assets/images/trikon.webp', nepaliAudio: '/assets/voice/sound/trikon_nepali.mp3', englishAudio: '/assets/voice/sound/trikon_english.mp3' }
  ],
  combos: getNepaliBarahkhari('त्र', 'tr')
},
{
  char: 'ज्ञ', type: 'Consonant', transliteration: 'gya',
  examples: [
    { word: 'ज्ञान', transliteration: 'gyan', english: 'Knowledge', imageUrl: '/assets/images/gyan.webp', nepaliAudio: '/assets/voice/sound/gyan_nepali.mp3', englishAudio: '/assets/voice/sound/gyan_english.mp3' },
    { word: 'विज्ञान', transliteration: 'bigyan', english: 'Science', imageUrl: '/assets/images/bigyan.webp', nepaliAudio: '/assets/voice/sound/bigyan_nepali.mp3', englishAudio: '/assets/voice/sound/bigyan_english.mp3' }
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
    { native: 'शुभ रात्री', transliteration: 'Shuva raatri', english: 'Good night', category: 'Daily' },
    { native: 'कस्तो छ?', transliteration: 'Kasto cha?', english: 'How are you?', category: 'Greeting' },
    { native: 'म ठीक छु', transliteration: 'Ma theek chu', english: 'I am fine', category: 'Greeting' },
    { native: 'तपाईंको नाम के हो?', transliteration: 'Tapai ko naam ke ho?', english: 'What is your name?', category: 'Greeting' },
    { native: 'मेरो नाम [Name] हो', transliteration: 'Mero naam [Name] ho', english: 'My name is [Name]', category: 'Greeting' },
    { native: 'बिदाई', transliteration: 'Bidaai', english: 'Goodbye', category: 'Greeting' },
    { native: 'कृपया', transliteration: 'Kripaya', english: 'Please', category: 'Daily' },
    { native: 'माफ गर्नुहोस्', transliteration: 'Maaf garnuhos', english: 'Excuse me/Sorry', category: 'Daily' },
    { native: 'मलाई पानी चाहियो', transliteration: 'Malai paani chahiyo', english: 'I need water', category: 'Food' },
    { native: 'यो के हो?', transliteration: 'Yo ke ho?', english: 'What is this?', category: 'Daily' },
    { native: 'कति पर्छ?', transliteration: 'Kati parchha?', english: 'How much does it cost?', category: 'Daily' },
    { native: 'मलाई मद्दत चाहियो', transliteration: 'Malai maddat chahiyo', english: 'I need help', category: 'Daily' },
    { native: 'कहाँ छ?', transliteration: 'Kaha cha?', english: 'Where is it?', category: 'Daily' },
    { native: 'हो', transliteration: 'Ho', english: 'Yes', category: 'Daily' },
    { native: 'होइन', transliteration: 'Hoin', english: 'No', category: 'Daily' },
    { native: 'म भोकाएको छु', transliteration: 'Ma bhokaeko chu', english: 'I am hungry', category: 'Food' },
    { native: 'म तिर्खाएको छु', transliteration: 'Ma tirshaeko chu', english: 'I am thirsty', category: 'Food' },
    { native: 'खाना कस्तो छ?', transliteration: 'Khaana kasto cha?', english: 'How is the food?', category: 'Food' },
    { native: 'बिल ल्याउनुहोस्', transliteration: 'Bill lyaunuhos', english: 'Bring the bill', category: 'Food' },
    { native: 'शुभ दिन', transliteration: 'Shubha din', english: 'Good day', category: 'Greeting' },
    { native: 'तपाईंलाई भेटेर खुसी लाग्यो', transliteration: 'Tapai lai bhetera khusi lagyo', english: 'Nice to meet you', category: 'Greeting' },
    { native: 'फेरि भेटौँला', transliteration: 'Pheri bhetaula', english: 'See you again', category: 'Greeting' },
    { native: 'के गर्न सक्छु?', transliteration: 'Ke garna sakchu?', english: 'What can I do for you?', category: 'Daily' }
  ],
  es: [],
  zh: []
};
