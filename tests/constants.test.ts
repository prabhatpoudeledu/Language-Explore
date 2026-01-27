import { describe, it, expect } from 'vitest';
import { STATIC_ALPHABET, STATIC_WORDS, STATIC_PHRASES } from '../constants';

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
});
