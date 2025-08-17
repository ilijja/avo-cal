import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function TrainingFrequencyScreen() {
    const { trainingFrequency, setTrainingFrequency } = useOnboardingStore();
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>(trainingFrequency);

    const handleFrequencySelect = (frequency: string) => {
        setSelectedFrequency(frequency);
        setTrainingFrequency(frequency);
    };

    const handleNext = () => {
        if (selectedFrequency) {
            console.log('Training frequency:', selectedFrequency);
            router.push('/(onboarding)/weight-change-rate');
        }
    };

    return (
        <View className='flex-1 bg-white px-6'>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-3xl font-bold text-gray-900 mb-8 text-center'>
                    How many times you train per week?
                </Text>
                
                <View className='w-full space-y-4'>
                    <TouchableOpacity 
                        className={`w-full py-4 px-6 rounded-lg border-2 ${
                            selectedFrequency === '0-2' 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-white border-gray-300'
                        }`}
                        onPress={() => handleFrequencySelect('0-2')}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-center text-lg font-semibold ${
                            selectedFrequency === '0-2' ? 'text-white' : 'text-gray-700'
                        }`}>
                            0-2 times
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className={`w-full py-4 px-6 rounded-lg border-2 ${
                            selectedFrequency === '2-5' 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-white border-gray-300'
                        }`}
                        onPress={() => handleFrequencySelect('2-5')}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-center text-lg font-semibold ${
                            selectedFrequency === '2-5' ? 'text-white' : 'text-gray-700'
                        }`}>
                            2-5 times
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className={`w-full py-4 px-6 rounded-lg border-2 ${
                            selectedFrequency === '6+' 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-white border-gray-300'
                        }`}
                        onPress={() => handleFrequencySelect('6+')}
                        activeOpacity={0.7}
                    >
                        <Text className={`text-center text-lg font-semibold ${
                            selectedFrequency === '6+' ? 'text-white' : 'text-gray-700'
                        }`}>
                            6+ times
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View className='pb-8'>
                <TouchableOpacity 
                    className={`w-full py-4 rounded-lg ${
                        selectedFrequency ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onPress={handleNext}
                    disabled={!selectedFrequency}
                >
                    <Text className='text-white text-center text-lg font-semibold'>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
