import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function WelcomeScreen() {
    return (
        <View className='flex-1 items-center justify-center px-6'>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-4xl font-bold text-gray-900 mb-4'>Welcome</Text>
            </View>
            
            <TouchableOpacity 
                className='w-full bg-blue-500 py-4 rounded-lg mb-8'
                onPress={() => router.push('/(onboarding)/gender')}
            >
                <Text className='text-white text-center text-lg font-semibold'>Start</Text>
            </TouchableOpacity>
        </View>
    );
}