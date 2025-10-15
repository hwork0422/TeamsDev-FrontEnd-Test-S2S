import { describe, it, expect } from 'vitest';
import themeReducer, { setTheme, setTeamsTheme } from '../../store/slices/themeSlice';

describe('themeSlice', () => {
  const initialState = {
    currentTheme: 'light' as const,
    isTeamsTheme: false,
  };

  it('should return the initial state', () => {
    expect(themeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setTheme', () => {
    const actual = themeReducer(initialState, setTheme('dark'));
    expect(actual.currentTheme).toBe('dark');
  });

  it('should handle setTeamsTheme', () => {
    const actual = themeReducer(initialState, setTeamsTheme(true));
    expect(actual.isTeamsTheme).toBe(true);
  });

  it('should handle multiple theme changes', () => {
    let state = themeReducer(initialState, setTheme('dark'));
    expect(state.currentTheme).toBe('dark');

    state = themeReducer(state, setTheme('contrast'));
    expect(state.currentTheme).toBe('contrast');

    state = themeReducer(state, setTheme('light'));
    expect(state.currentTheme).toBe('light');
  });

  it('should handle Teams theme flag changes', () => {
    let state = themeReducer(initialState, setTeamsTheme(true));
    expect(state.isTeamsTheme).toBe(true);

    state = themeReducer(state, setTeamsTheme(false));
    expect(state.isTeamsTheme).toBe(false);
  });
});
