import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CultureHub } from '../components/CultureHub';

vi.mock('../components/NepalMap', () => ({
  NepalMap: () => <div data-testid="nepal-map">Map</div>
}));

vi.mock('../components/SongSection', () => ({
  SongSection: () => <div data-testid="song-section">Songs</div>
}));

vi.mock('../components/PuzzleSection', () => ({
  PuzzleSection: () => <div data-testid="puzzle-section">Puzzles</div>
}));

describe('CultureHub', () => {
  it('shows Places tab by default and switches tabs', async () => {
    const user = userEvent.setup();

    render(
      <CultureHub
        language="np"
        userProfile={{ name: 'Test', avatar: '🐼', voice: 'test-voice', gender: 'male', xp: 0 }}
        showTranslation={true}
        addXp={vi.fn()}
      />
    );

    expect(screen.getByTestId('nepal-map')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /songs/i }));
    expect(screen.getByTestId('song-section')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /puzzles/i }));
    expect(screen.getByTestId('puzzle-section')).toBeInTheDocument();
  });
});
