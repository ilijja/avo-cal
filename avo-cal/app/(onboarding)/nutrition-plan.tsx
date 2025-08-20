// screens/NutritionPlanScreen.tsx
import { useEffect } from 'react';
import { View, Text } from 'react-native';
;
import { useOnboardingStore } from '@/store';
import { useNutritionPlanStore } from '@/store';
import { calculateNutritionPlan } from '@/services/utils/nutritionCalculator';
import { router } from 'expo-router';

export default function NutritionPlanScreen() {
  const onboardingData = useOnboardingStore(); 
  const { setNutritionPlan, calories, protein, carbs, fats, tdee } = useNutritionPlanStore();

  useEffect(() => {
    // Check if all required data is available
    if (!onboardingData.gender || !onboardingData.age || !onboardingData.height || 
        !onboardingData.weight || !onboardingData.goal || !onboardingData.trainingFrequency || 
        !onboardingData.diet || onboardingData.weightChangeRate === null) {
      console.warn('Missing onboarding data for nutrition calculation:');
      return;
    }

    try {
      // Mapiraj podatke iz onboardinga u ulaz za kalkulator:
      const plan = calculateNutritionPlan({
        gender: onboardingData.gender as 'male' | 'female' | 'other',
        age: onboardingData.age,
        height: onboardingData.height,
        weight: onboardingData.weight,
        desiredWeight: onboardingData.goalWeight || undefined,
        goal: onboardingData.goal as 'lose' | 'maintain' | 'gain' | 'gain_muscle',
        weekActivity: onboardingData.trainingFrequency as '0' | '1-3' | '4-5' | '6+',
        dietType: onboardingData.diet as 'classic' | 'vegan' | 'vegetarian',
        weeklyWeightChange: onboardingData.weightChangeRate,
      });

      console.log('Calculated nutrition plan:', plan);
      
      // Map the new format to the store format
      setNutritionPlan({
        calories: plan.calories,
        protein: plan.macros.protein,
        carbs: plan.macros.carbs,
        fats: plan.macros.fat,
        tdee: plan.tdee,
      });
    } catch (error) {
      console.error('Error calculating nutrition plan:', error);
      // Set fallback data if calculation fails
      setNutritionPlan({
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 67,
        tdee: 2200,
      });
    }
  }, [setNutritionPlan, onboardingData]);

  const handleContinue = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View className='flex-1 flex items-center justify-center'>
      <Text>Calories: {calories} kcal</Text>
      <Text>Protein: {protein} g</Text>
      <Text>Carbs: {carbs} g</Text>
      <Text>Fats: {fats} g</Text>
      <Text>TDEE: {tdee} kcal</Text>

      <Button title='Save' onPress={handleContinue}>Continue</Button>
    </View>
  );
}
