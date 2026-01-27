import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NepalMap } from '../components/NepalMap';

vi.mock('leaflet', () => {
  class Icon {
    static Default = { prototype: {}, mergeOptions: vi.fn() };
    constructor(_opts?: any) {}
  }
  return {
    __esModule: true,
    default: { Icon },
    Icon
  };
});

vi.mock('react-leaflet', () => {
  return {
    __esModule: true,
    MapContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="map-container">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="marker">{children}</div>
    ),
    Popup: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    ),
    useMap: () => ({ invalidateSize: vi.fn() })
  };
});

describe('NepalMap', () => {
  it('renders the map container and helper text', () => {
    render(
      <NepalMap
        language="np"
        userProfile={{ voice: 'test-voice' }}
        addXp={vi.fn()}
        showTranslation={true}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByText(/tap to explore/i)).toBeInTheDocument();
  });
});
