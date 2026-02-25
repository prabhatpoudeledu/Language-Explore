import { describe, it, expect } from 'vitest';
import { STATIC_ALPHABET, STATIC_WORDS, STATIC_PHRASES, STATIC_NUMBERS, STATIC_VOCABULARY } from '../constants';

describe('static content', () => {
  it('contains Nepali alphabet data', () => {
    expect(STATIC_ALPHABET.np.length).toBeGreaterThan(0);
    expect(STATIC_ALPHABET.np[0]).toHaveProperty('char');
  });

  it('contains Nepali word challenges', () => {
    expect(STATIC_WORDS.np.length).toBeGreaterThan(0);
    expect(STATIC_WORDS.np[0]).toHaveProperty('word');
  });

  it('contains Nepali phrases', () => {
    expect(STATIC_PHRASES.np.length).toBeGreaterThan(0);
    expect(STATIC_PHRASES.np[0]).toHaveProperty('native');
    expect(STATIC_PHRASES.np[0]).toHaveProperty('english');
  });

  it('contains Nepali numbers', () => {
    expect(STATIC_NUMBERS.np.length).toBeGreaterThan(0);
    expect(STATIC_NUMBERS.np[0]).toHaveProperty('value');
    expect(STATIC_NUMBERS.np[0]).toHaveProperty('word');
  });

  it('contains Nepali vocabulary', () => {
    expect(STATIC_VOCABULARY.np.length).toBeGreaterThan(0);
    expect(STATIC_VOCABULARY.np[0]).toHaveProperty('items');
  });
});
