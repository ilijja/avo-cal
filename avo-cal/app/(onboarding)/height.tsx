import { router } from 'expo-router';
import { View, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import HeightPicker from '@/components/HeightPicker';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function HeightScreen() {
    const { setHeight } = useOnboardingStore();
    const [selectedHeight, setSelectedHeight] = useState<{ value: number; unit: 'cm' | 'ft' }>({ value: 170, unit: 'cm' });

    const handleHeightChange = (height: number, unit: 'cm' | 'ft') => {
        setSelectedHeight({ value: height, unit });
    };

    const handleNext = () => {
        setHeight(selectedHeight.value, selectedHeight.unit);
        router.push('/(onboarding)/weight');
    };

    return (
        <View className='flex-1'>
            <HeightPicker onHeightChange={handleHeightChange} />
            
            {/* Next Button */}
            <View className='px-6 pb-8'>
                <TouchableOpacity 
                    className='w-full py-4 rounded-lg z-10 bg-blue-500'
                    onPress={handleNext}
                >
                    <Text className='text-white text-center text-lg font-semibold'>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}