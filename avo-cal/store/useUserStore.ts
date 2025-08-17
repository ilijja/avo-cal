import { create } from 'zustand';
import { AuthUser } from '@/lib/supabase';
import { AuthService } from '@/services/auth/authService';

// User store interface
interface UserState {
  // User state
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  getCurrentUser: () => Promise<void>;
}

// Create user store
export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  
  // Actions
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, error } = await AuthService.signIn(email, password);
      if (error) {
        return { success: false, error: error.message };
      }
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  signUp: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      const { user, error } = await AuthService.signUp(email, password, name);
      if (error) {
        return { success: false, error: error.message };
      }
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { error } = await AuthService.signInWithGoogle();
      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
      // OAuth flow will handle the redirect
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await AuthService.signOut();
      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
  
  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const { user, error } = await AuthService.getCurrentUser();
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error getting current user:', error.message);
      }
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch (error) {
      console.error('Error getting current user:', error);
      set({ isLoading: false });
    }
  },
}));
