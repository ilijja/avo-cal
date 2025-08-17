import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import WeightPicker from '@/components/WeightPicker';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function WeightScreen() {
    const { setWeight } = useOnboardingStore();
    const [weight, setWeightLocal] = useState(70);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

    const handleWeightChange = (newWeight: number, newUnit: 'kg' | 'lbs') => {
        setWeightLocal(newWeight);
        setUnit(newUnit);
    };

    const handleNext = () => {
        setWeight(weight, unit);
        router.push('/(onboarding)/goal-weight');
    };

    return (
        <View className='flex-1 bg-white'>
            <WeightPicker 
                onWeightChange={handleWeightChange}
                initialWeight={weight}
                initialUnit={unit}
            />
            
            <View className='px-6 pb-8'>
                <TouchableOpacity 
                    className='w-full py-4 rounded-lg bg-blue-500'
                    onPress={handleNext}
                >
                    <Text className='text-white text-center text-lg font-semibold'>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
