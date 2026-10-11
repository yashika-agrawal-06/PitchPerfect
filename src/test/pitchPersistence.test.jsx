import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import SavedPitches from '../components/SavedPitches';

const STORAGE_KEY = 'pitchperfect-saved-pitches';

describe('Pitch Persistence & Pitch Vault Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('preserves existing saved pitches across page reload (no wipe on mount)', async () => {
    const existingPitches = [
      {
        id: 'pitch_test_1',
        title: 'AlphaPitch',
        savedAt: new Date().toISOString(),
        metadata: {
          title: 'AlphaPitch',
          problem: 'Alpha problem',
          targetUsers: 'Alpha users',
          technologies: 'React, Node',
        },
        sections: {
          problem: { title: '1. Problem', content: 'Alpha problem details', coachTip: 'Tip 1' },
          solution: { title: '2. Solution', content: 'Alpha solution details', coachTip: 'Tip 2' },
        },
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPitches));

    const { unmount } = render(<App />);

    // Verify localStorage was not overwritten with an empty array
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('AlphaPitch');
    expect(stored[0].id).toBe('pitch_test_1');

    unmount();
  });

  it('handles multiple saved drafts with stable unique IDs', async () => {
    const drafts = [
      {
        id: 'pitch_id_101',
        title: 'SmartMed',
        savedAt: '2026-10-11T12:00:00Z',
        metadata: { title: 'SmartMed', technologies: 'FastAPI, PostGIS' },
        sections: { problem: { title: '1. Problem', content: 'Medical delays' } },
      },
      {
        id: 'pitch_id_102',
        title: 'EduTrack',
        savedAt: '2026-10-11T13:00:00Z',
        metadata: { title: 'EduTrack', technologies: 'React, GraphQL' },
        sections: { problem: { title: '1. Problem', content: 'Student dropout rates' } },
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));

    const onRestore = vi.fn();
    const onDelete = vi.fn();

    render(
      <SavedPitches
        savedPitches={drafts}
        onRestore={onRestore}
        onDelete={onDelete}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText('SmartMed')).toBeInTheDocument();
    expect(screen.getByText('EduTrack')).toBeInTheDocument();

    // Verify restoring triggers correct pitch object
    const openButtons = screen.getAllByText('Open');
    expect(openButtons).toHaveLength(2);

    fireEvent.click(openButtons[0]);
    expect(onRestore).toHaveBeenCalledWith(drafts[0]);
  });

  it('renders corrupted or malformed pitch entries safely without crashing', () => {
    const malformed = [
      {
        id: 'malformed_1',
        title: null,
        sections: null,
        savedAt: 'invalid-date',
      },
      {
        id: 'malformed_2',
        metadata: null,
      },
    ];

    render(
      <SavedPitches
        savedPitches={malformed}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText('Pitch Vault')).toBeInTheDocument();
    expect(screen.getAllByText('Untitled Pitch').length).toBeGreaterThan(0);
  });

  it('displays storage error notification if browser storage quota is exceeded', () => {
    render(
      <SavedPitches
        savedPitches={[]}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onNavigate={vi.fn()}
        storageError="Storage quota exceeded. Changes may not be saved."
      />
    );

    expect(screen.getByText(/Storage quota exceeded/i)).toBeInTheDocument();
  });
});
