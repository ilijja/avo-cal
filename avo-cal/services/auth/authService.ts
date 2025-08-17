import { supabase, AuthUser, AuthError } from '@/lib/supabase';

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || name || email.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: { message: 'Sign up failed' } };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: { message: 'Sign in failed' } };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  // Sign in with Google OAuth
  static async signInWithGoogle(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'avo-cal://auth/callback',
        },
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      // OAuth flow will redirect, so we return success
      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        // Don't treat missing session as an error
        if (error.message === 'Auth session missing!') {
          return { user: null, error: null };
        }
        return { user: null, error: { message: error.message } };
      }

      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        };
        callback(authUser);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}
