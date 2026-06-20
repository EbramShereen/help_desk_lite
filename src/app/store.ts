import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/logic/authSlice';
import ticketsReducer from '../features/tickets/logic/ticketsSlice';
import preferencesReducer from '../features/preferences/preferencesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    preferences: preferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
