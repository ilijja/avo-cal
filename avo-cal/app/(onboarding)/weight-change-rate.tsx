import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import WeightChangeRateSlider from '@/components/WeightChangeRateSlider';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function WeightChangeRateScreen() {
    const { goal, weightUnit, setWeightChangeRate } = useOnboardingStore();
    const [rate, setRate] = useState(0.8);

    const handleRateChange = (newRate: number) => {
        setRate(newRate);
        setWeightChangeRate(newRate);
    };

    const handleNext = () => {
        // Rate je već setovan u store-u kroz handleRateChange
        if (rate) {
            router.push('/(onboarding)/nutrition-plan');
        }
    };


    return (
        <View className='flex-1 bg-white'>
            <WeightChangeRateSlider 
                onRateChange={handleRateChange}
                initialRate={rate}
                goal={goal as 'lose' | 'gain'}
                unit={weightUnit as 'kg' | 'lbs'}
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
