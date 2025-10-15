import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface UserState {
  currentUser: User | null;
  isInitialized: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isInitialized: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setUser, setInitialized } = userSlice.actions;
export default userSlice.reducer;
