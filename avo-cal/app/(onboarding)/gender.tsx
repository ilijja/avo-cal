import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function GenderScreen() {
    const { setGender } = useOnboardingStore();

    const handleGenderSelect = (gender: string) => {
        setGender(gender);
        router.push('/(onboarding)/goal');
    };

    return (
        <View className='flex-1 items-center justify-center px-6'>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-3xl font-bold text-gray-900 mb-8 text-center'>Pick your gender</Text>
                
                <View className='space-y-4 w-full'>
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGenderSelect('male')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Male</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGenderSelect('female')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Female</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGenderSelect('other')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Other</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
