import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Load auth state from localStorage
const loadAuthState = (): AuthState => {
  try {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      return JSON.parse(savedAuth);
    }
  } catch (error) {
    console.error('Failed to load auth state:', error);
  }
  return {
    user: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: action.payload,
        isAuthenticated: true
      }));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Clear localStorage
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
