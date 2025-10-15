import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'contrast';

interface ThemeState {
  currentTheme: Theme;
  isTeamsTheme: boolean;
}

const initialState: ThemeState = {
  currentTheme: 'light',
  isTeamsTheme: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.currentTheme = action.payload;
    },
    setTeamsTheme: (state, action: PayloadAction<boolean>) => {
      state.isTeamsTheme = action.payload;
    },
  },
});

export const { setTheme, setTeamsTheme } = themeSlice.actions;
export default themeSlice.reducer;
