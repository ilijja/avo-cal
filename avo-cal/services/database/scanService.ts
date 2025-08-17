import { supabase } from '@/lib/supabase';
import { FoodAnalysisResponse } from '../api/types';

export interface Scan {
  id: string;
  created_at: string;
  user_id: string;
  ingredients: FoodAnalysisResponse;
  total_calories: number;
  image_url?: string;
}

export interface CreateScanData {
  ingredients: FoodAnalysisResponse;
  total_calories: number;
  image_url?: string;
}

export interface UpdateScanData {
  ingredients: FoodAnalysisResponse;
  total_calories: number;
}

export class ScanService {
  /**
   * Creates a new scan record
   * @param scanData - The scan data to save
   * @returns Promise<Scan> - The created scan
   */
  static async createScan(scanData: CreateScanData): Promise<Scan> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          ingredients: scanData.ingredients,
          total_calories: scanData.total_calories,
          image_url: scanData.image_url,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating scan:', error);
        throw new Error(`Failed to create scan: ${error.message}`);
      }

      return data as Scan;
    } catch (error) {
      console.error('Error in createScan:', error);
      throw error;
    }
  }

  /**
   * Updates an existing scan record
   * @param scanId - The scan ID to update
   * @param updateData - The updated scan data
   * @returns Promise<Scan> - The updated scan
   */
  static async updateScan(scanId: string, updateData: UpdateScanData): Promise<Scan> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scans')
        .update({
          ingredients: updateData.ingredients,
          total_calories: updateData.total_calories,
        })
        .eq('id', scanId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scan:', error);
        throw new Error(`Failed to update scan: ${error.message}`);
      }

      return data as Scan;
    } catch (error) {
      console.error('Error in updateScan:', error);
      throw error;
    }
  }

  /**
   * Deletes a scan record
   * @param scanId - The scan ID to delete
   * @returns Promise<void>
   */
  static async deleteScan(scanId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting scan:', error);
        throw new Error(`Failed to delete scan: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteScan:', error);
      throw error;
    }
  }

  /**
   * Gets scans for a specific date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Promise<Scan[]> - Array of scans in date range
   */
  static async getScansForDateRange(startDate: Date, endDate: Date): Promise<Scan[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching daily scans:', error);
        throw new Error(`Failed to fetch daily scans: ${error.message}`);
      }

      return data as Scan[];
    } catch (error) {
      console.error('Error in getScansForDateRange:', error);
      throw error;
    }
  }

  /**
   * Gets a specific scan by ID
   * @param scanId - The scan ID
   * @returns Promise<Scan> - The scan data
   */
  static async getScanById(scanId: string): Promise<Scan> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching scan:', error);
        throw new Error(`Failed to fetch scan: ${error.message}`);
      }

      return data as Scan;
    } catch (error) {
      console.error('Error in getScanById:', error);
      throw error;
    }
  }
}
