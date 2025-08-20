import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/store';

const dietOptions = [
    {
        id: 'classic',
        title: 'Classic',
        emoji: '🍖'
    },
    {
        id: 'vegetarian',
        title: 'Vegetarian',
        emoji: '🥗'
    },
    {
        id: 'vegan',
        title: 'Vegan',
        emoji: '🌱'
    }
];

export default function DietScreen() {
    const { setDiet } = useOnboardingStore();
    const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

    const handleDietSelect = (diet: string) => {
        setSelectedDiet(diet);
    };

    const handleNext = () => {
        if (selectedDiet) {
            setDiet(selectedDiet);
            router.push('/(onboarding)/weight-change-rate');
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-12">
                <Text className="text-3xl font-bold text-gray-900 mb-2">What's your diet preference?</Text>
                <Text className="text-lg text-gray-600 mb-8">
                    This helps us create a nutrition plan that fits your lifestyle
                </Text>

                <View className="space-y-4">
                    {dietOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            className={`p-6 rounded-xl border-2 ${
                                selectedDiet === option.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                            onPress={() => handleDietSelect(option.id)}
                        >
                            <View className="flex-row items-center">
                                <Text className="text-3xl mr-4">{option.emoji}</Text>
                                <View className="flex-1">
                                    <Text className={`text-xl font-semibold ${
                                        selectedDiet === option.id ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                        {option.title}
                                    </Text>
                                </View>
                                {selectedDiet === option.id && (
                                    <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                                        <Text className="text-white text-sm">✓</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="px-6 pb-8">
                <TouchableOpacity
                    className={`py-4 rounded-xl ${
                        selectedDiet ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onPress={handleNext}
                    disabled={!selectedDiet}
                >
                    <Text className={`text-center text-lg font-semibold ${
                        selectedDiet ? 'text-white' : 'text-gray-500'
                    }`}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}