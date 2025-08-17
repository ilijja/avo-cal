import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import WeightPicker from '@/components/WeightPicker';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function GoalWeightScreen() {
    const { setGoalWeight, weight, weightUnit, goal } = useOnboardingStore();
    const [goalWeightLocal, setGoalWeightLocal] = useState(weight || 70);
    const [unit, setUnit] = useState<'kg' | 'lbs'>(weightUnit || 'kg');

    const handleWeightChange = (newWeight: number, newUnit: 'kg' | 'lbs') => {
        setGoalWeightLocal(newWeight);
    };

    const handleFinish = () => {
        setGoalWeight(goalWeightLocal, unit);
        router.push('/(onboarding)/training-frequency');
    };

    useEffect(() => {
        if (weight && weightUnit) {
            setGoalWeightLocal(weight);
            setUnit(weightUnit);
        }
    }, [weight, weightUnit]);

    return (
        <View className='flex-1 bg-white'>
            <WeightPicker
                onWeightChange={handleWeightChange}
                initialWeight={goalWeightLocal}
                initialUnit={unit}
                title="What's your goal weight?"
                isGoalWeight={true}
                currentWeight={weight || undefined}
                goal={goal}
            />

            <View className='px-6 pb-8'>
                <TouchableOpacity
                    className='w-full py-4 rounded-lg bg-blue-500'
                    onPress={handleFinish}
                >
                    <Text className='text-white text-center text-lg font-semibold'>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
