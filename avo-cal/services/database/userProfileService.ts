import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  daily_calorie_goal: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  user_id: string;
  daily_calorie_goal?: number;
}

export class UserProfileService {
  static async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  }

  static async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: profileData.user_id,
        daily_calorie_goal: profileData.daily_calorie_goal || 2000, // hardcoded default
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async ensureUserProfile(): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Prvo pokušaj da dohvatiš postojeći profil
    let profile = await this.getUserProfile();

    // Ako ne postoji, kreiraj ga
    if (!profile) {
      profile = await this.createUserProfile({
        user_id: user.id,
        daily_calorie_goal: 2000, // hardcoded
      });
    }

    return profile;
  }
}
