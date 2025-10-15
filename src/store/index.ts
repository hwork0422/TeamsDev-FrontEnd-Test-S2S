import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './slices/menuSlice';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    theme: themeReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
