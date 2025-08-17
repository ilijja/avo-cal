import { create } from 'zustand';

interface OnboardingData {
  gender: string | null;
  goal: string | null;
  age: number | null;
  height: number | null;
  heightUnit: 'cm' | 'ft';
  weight: number | null;
  weightUnit: 'kg' | 'lbs';
  goalWeight: number | null;
  goalWeightUnit: 'kg' | 'lbs';
  trainingFrequency: string | null;
  weightChangeRate: number | null;
}

interface OnboardingStore extends OnboardingData {
  setGender: (gender: string) => void;
  setGoal: (goal: string) => void;
  setAge: (age: number) => void;
  setHeight: (height: number, unit: 'cm' | 'ft') => void;
  setWeight: (weight: number, unit: 'kg' | 'lbs') => void;
  setGoalWeight: (weight: number, unit: 'kg' | 'lbs') => void;
  setTrainingFrequency: (frequency: string) => void;
  setWeightChangeRate: (rate: number) => void;
  reset: () => void;
  isComplete: () => boolean;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Initial state
  gender: null,
  goal: null,
  age: null,
  height: null,
  heightUnit: 'cm',
  weight: null,
  weightUnit: 'kg',
  goalWeight: null,
  goalWeightUnit: 'kg',
  trainingFrequency: null,
  weightChangeRate: null,

  // Actions
  setGender: (gender: string) => set({ gender }),
  
  setGoal: (goal: string) => set({ goal }),
  
  setAge: (age: number) => set({ age }),
  
  setHeight: (height: number, unit: 'cm' | 'ft') => set({ 
    height, 
    heightUnit: unit 
  }),
  
  setWeight: (weight: number, unit: 'kg' | 'lbs') => set({ 
    weight, 
    weightUnit: unit 
  }),
  
  setGoalWeight: (weight: number, unit: 'kg' | 'lbs') => set({ 
    goalWeight: weight, 
    goalWeightUnit: unit 
  }),
  
  setTrainingFrequency: (frequency: string) => set({ trainingFrequency: frequency }),
  
  setWeightChangeRate: (rate: number) => set({ weightChangeRate: rate }),
  
  reset: () => set({
    gender: null,
    goal: null,
    age: null,
    height: null,
    heightUnit: 'cm',
    weight: null,
    weightUnit: 'kg',
    goalWeight: null,
    goalWeightUnit: 'kg',
    trainingFrequency: null,
    weightChangeRate: null,
  }),
  
  isComplete: () => {
    const state = get();
    return !!(
      state.gender &&
      state.goal &&
      state.age &&
      state.height &&
      state.weight &&
      state.goalWeight &&
      state.trainingFrequency &&
      (state.goal === 'maintain' || state.weightChangeRate)
    );
  },
}));
