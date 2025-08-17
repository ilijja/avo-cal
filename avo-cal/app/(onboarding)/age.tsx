import { router } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function AgeScreen() {
    const { setAge } = useOnboardingStore();
    const [selectedAge, setSelectedAge] = useState<number | null>(null);
    
    const ages = Array.from({ length: 88 }, (_, i) => i + 12); // 12 to 99

    const handleAgeSelect = (age: number) => {
        setSelectedAge(age);
        setAge(age);
        router.push('/(onboarding)/height');
    };

    return (
        <View className='flex-1 items-center justify-center px-6'>
            <View className='flex-1 items-center justify-center w-full'>
                <Text className='text-3xl font-bold text-gray-900 mb-8 text-center'>What's your age?</Text>
                
                <ScrollView 
                    className='w-full max-h-80'
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingVertical: 20 }}
                >
                    {ages.map((age) => (
                        <TouchableOpacity 
                            key={age}
                            className={`w-full py-4 px-6 rounded-lg mb-2 ${
                                selectedAge === age ? 'bg-blue-500' : 'bg-gray-100'
                            }`}
                            onPress={() => handleAgeSelect(age)}
                        >
                            <Text className={`text-center text-lg font-semibold ${
                                selectedAge === age ? 'text-white' : 'text-gray-900'
                            }`}>
                                {age} years old
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}
