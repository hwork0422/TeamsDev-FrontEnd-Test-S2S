import { describe, it, expect } from 'vitest';
import userReducer, { setUser, setInitialized } from '../../store/slices/userSlice';
import type { User } from '../../types';

describe('userSlice', () => {
  const initialState = {
    currentUser: null,
    isInitialized: false,
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const user: User = {
      id: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
    };

    const actual = userReducer(initialState, setUser(user));
    expect(actual.currentUser).toEqual(user);
  });

  it('should handle setUser with null', () => {
    const state = {
      ...initialState,
      currentUser: {
        id: 'test-user-id',
        displayName: 'Test User',
        email: 'test@example.com',
      },
    };

    const actual = userReducer(state, setUser(null));
    expect(actual.currentUser).toBeNull();
  });

  it('should handle setInitialized', () => {
    const actual = userReducer(initialState, setInitialized(true));
    expect(actual.isInitialized).toBe(true);
  });

  it('should handle setInitialized with false', () => {
    const state = {
      ...initialState,
      isInitialized: true,
    };

    const actual = userReducer(state, setInitialized(false));
    expect(actual.isInitialized).toBe(false);
  });

  it('should handle multiple user updates', () => {
    const user1: User = {
      id: 'user-1',
      displayName: 'User One',
      email: 'user1@example.com',
    };

    const user2: User = {
      id: 'user-2',
      displayName: 'User Two',
      email: 'user2@example.com',
    };

    let state = userReducer(initialState, setUser(user1));
    expect(state.currentUser).toEqual(user1);

    state = userReducer(state, setUser(user2));
    expect(state.currentUser).toEqual(user2);
  });
});
