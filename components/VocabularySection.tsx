import React, { useEffect, useState } from 'react';
import { fetchVocabulary, speakText, stopAllAudio, triggerHaptic, unlockAudio, resolveVoiceId } from '../services/geminiService';
import { LanguageCode, UserProfile, VocabularyCategory, VocabularyItem } from '../types';

interface Props {
  language: LanguageCode;
  userProfile: UserProfile;
  showTranslation: boolean;
  addXp: (amount: number) => void;
}

export const VocabularySection: React.FC<Props> = ({ language, userProfile, showTranslation, addXp }) => {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const voiceId = resolveVoiceId(userProfile);
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#facc15',
    green: '#22c55e',
    blue: '#3b82f6',
    'dark blue': '#1d4ed8',
    pink: '#ec4899',
    brown: '#a16207',
    white: '#f8fafc',
    black: '#0f172a',
    silver: '#94a3b8'
  };
  const categoryEmoji: Record<string, string> = {
    fruits: '🍎',
    food: '🍲',
    vegetables: '🥕',
    animals: '🐾',
    birds: '🕊️',
    insects: '🦋',
    flowers: '🌸',
    toys: '🧸',
    vehicles: '🚗',
    body_parts: '🧍',
    clothes: '👕'
  };
  const itemEmoji: Record<string, string> = {
    pineapple: '🍍',
    mango: '🥭',
    orange: '🍊',
    banana: '🍌',
    strawberry: '🍓',
    grapes: '🍇',
    apple: '🍎',
    pomegranate: '🍎',
    peach: '🍑',
    litchi: '🍒',
    papaya: '🧡',
    guava: '🍐',
    watermelon: '🍉',
    sugarcane: '🎋',
    pear: '🍐',
    plum: '🫐',
    persimmon: '🍊',
    'custard apple': '🍏',
    kiwi: '🥝',
    jackfruit: '🍈',
    'dal bhat': '🍛',
    chowmein: '🍜',
    pizza: '🍕',
    pasta: '🍝',
    macaroni: '🍝',
    'chicken sizzler': '🍗',
    potato: '🥔',
    tomato: '🍅',
    onion: '🧅',
    carrot: '🥕',
    cauliflower: '🥦',
    cabbage: '🥬',
    cucumber: '🥒',
    eggplant: '🍆',
    broccoli: '🥦',
    spinach: '🥬',
    cow: '🐄',
    dog: '🐕',
    cat: '🐈',
    goat: '🐐',
    horse: '🐎',
    tiger: '🐅',
    lion: '🦁',
    elephant: '🐘',
    bear: '🐻',
    monkey: '🐒',
    fish: '🐟',
    dolphin: '🐬',
    shark: '🦈',
    whale: '🐋',
    crow: '🐦‍⬛',
    sparrow: '🐦',
    parrot: '🦜',
    peacock: '🦚',
    pigeon: '🕊️',
    eagle: '🦅',
    ant: '🐜',
    bee: '🐝',
    butterfly: '🦋',
    mosquito: '🦟',
    fly: '🪰',
    rose: '🌹',
    lotus: '🪷',
    sunflower: '🌻',
    marigold: '🌼',
    jasmine: '🌼',
    ball: '⚽',
    doll: '🪆',
    'teddy bear': '🧸',
    'toy car': '🚗',
    kite: '🪁',
    car: '🚗',
    bus: '🚌',
    bicycle: '🚲',
    motorcycle: '🏍️',
    train: '🚆',
    airplane: '✈️',
    head: '🧑',
    hair: '💇',
    eye: '👁️',
    nose: '👃',
    ear: '👂',
    mouth: '👄',
    teeth: '🦷',
    hand: '✋',
    finger: '👉',
    leg: '🦵',
    knee: '🦵',
    foot: '🦶'
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchVocabulary(language);
        setCategories(data);
        setActiveId(data[0]?.id || '');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => stopAllAudio();
  }, [language]);

  const activeCategory = categories.find(c => c.id === activeId) || categories[0];
  const isColors = activeCategory?.id === 'colors';
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const imageSlug = selectedItem
    ? slugify(selectedItem.pronunciation || selectedItem.english)
    : '';
  const imageSrc = selectedItem ? `/assets/images/${imageSlug}.webp` : '';

  useEffect(() => {
    if (!activeCategory) return;
    if (activeCategory.id === 'colors') {
      setSelectedItem(null);
      setImageError(false);
      return;
    }
    setSelectedItem(activeCategory.items[0] || null);
    setImageError(false);
  }, [activeId, categories]);

  const handlePlay = async (item: VocabularyItem) => {
    setSelectedItem(item);
    setImageError(false);
    await unlockAudio();
    speakText(item.nepali, voiceId);
    triggerHaptic(5);
    addXp(2);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-black animate-pulse text-indigo-500">
        {showTranslation ? 'Loading vocabulary...' : 'शब्दहरू लोड हुँदै...'}
      </div>
    );
  }

  if (!activeCategory) return null;

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-16 px-2 md:px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 tracking-tighter">
          {showTranslation ? 'Vocabulary' : 'शब्द कोष'} 📚
        </h2>
        <p className="text-sm text-indigo-400 font-bold bg-white px-6 py-2 rounded-full shadow-sm border">
          {showTranslation ? 'Tap a word to hear it!' : 'शब्द थिचेर सुन्नुहोस्!'}
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-indigo-100 mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className={`px-4 py-2 rounded-2xl font-black text-xs shadow-sm transition ${activeId === cat.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {showTranslation ? `${cat.labelEn} • ${cat.labelNp}` : `${cat.labelNp} • ${cat.labelEn}`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-emerald-600">
            {showTranslation ? activeCategory.labelEn : activeCategory.labelNp}
          </h3>
          <span className="text-xs font-black text-emerald-400">
            {showTranslation ? activeCategory.labelNp : activeCategory.labelEn}
          </span>
        </div>

        {!isColors && selectedItem && (
          <div className="mb-5 bg-emerald-50/70 border border-emerald-100 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-28 h-28 rounded-3xl bg-white border border-emerald-100 flex items-center justify-center overflow-hidden">
              {!imageError ? (
                <img
                  src={imageSrc}
                  alt={selectedItem.english}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-5xl">
                  {itemEmoji[selectedItem.english.toLowerCase()] || categoryEmoji[activeCategory.id] || '📦'}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-emerald-700">{selectedItem.nepali}</div>
              <div className="text-sm font-black text-emerald-500 uppercase tracking-widest">{selectedItem.pronunciation}</div>
              <div className="text-base font-black text-gray-700 mt-1">{selectedItem.english}</div>
            </div>
          </div>
        )}

        {activeCategory.items.length === 0 ? (
          <div className="text-center text-sm font-black text-emerald-400 py-8">
            {showTranslation ? 'Coming soon!' : 'छिट्टै आउँदैछ!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeCategory.items.map((item, idx) => {
              const colorKey = item.english.toLowerCase();
              const swatch = colorMap[colorKey];
              return (
                <button
                  key={`${activeCategory.id}_${idx}`}
                  onClick={() => handlePlay(item)}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-50 text-left hover:bg-emerald-50 transition"
                >
                  <div className="flex items-start gap-3">
                    {isColors ? (
                      <div
                        className="w-12 h-12 rounded-2xl border border-emerald-100 shadow-inner"
                        style={{ backgroundColor: swatch || '#e2e8f0' }}
                        aria-hidden="true"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                        {itemEmoji[item.english.toLowerCase()] || categoryEmoji[activeCategory.id] || '📦'}
                      </div>
                    )}
                    <div>
                      <div className="text-xl font-black text-gray-800">{item.nepali}</div>
                      <div className="text-xs font-black text-emerald-500 uppercase tracking-widest">{item.pronunciation}</div>
                      <div className="text-sm font-black text-emerald-700 mt-1">{item.english}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
