import { create } from 'zustand';
import { FoodAnalysisResponse } from '@/services';

// Food store interface
interface FoodState {
  // Food analysis state
  foodAnalysis: FoodAnalysisResponse | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Actions
  analyzeFoodImage: (imageUri: string) => Promise<FoodAnalysisResponse>;
  clearFoodAnalysis: () => void;
  setAnalysisError: (error: string | null) => void;
}

// Create food store
export const useFoodStore = create<FoodState>((set) => ({
  // Initial state
  foodAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
  
  // Actions
  analyzeFoodImage: async (imageUri: string) => {
    set({ isAnalyzing: true, analysisError: null });
    try {
      const { GeminiService } = await import('@/services');
      const analysis = await GeminiService.analyzeFoodImage(imageUri);
      set({ foodAnalysis: analysis, isAnalyzing: false });
      
      // Log the analysis result
      console.log('=== FOOD ANALYSIS RESULT ===');
      console.log('Total items found:', analysis.items.length);
      analysis.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: ${item.weight_grams}g, ${item.calories_per_100g} cal/100g`);
      });
      console.log('===========================');
      
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ analysisError: errorMessage, isAnalyzing: false });
      console.error('Food analysis failed:', errorMessage);
      throw error;
    }
  },
  
  clearFoodAnalysis: () => set({ 
    foodAnalysis: null, 
    analysisError: null 
  }),
  
  setAnalysisError: (analysisError) => set({ analysisError }),
}));
