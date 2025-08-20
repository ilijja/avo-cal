import { create } from 'zustand';

interface NutritionPlanData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  tdee: number;
}

interface NutritionPlanStore extends NutritionPlanData {
  setNutritionPlan: (data: NutritionPlanData) => void;
  reset: () => void;
}

export const useNutritionPlanStore = create<NutritionPlanStore>((set) => ({
  // Initial state
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  tdee: 0,

  // Actions
  setNutritionPlan: (data: NutritionPlanData) => set(data),
  
  reset: () => set({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    tdee: 0,
  }),
}));
