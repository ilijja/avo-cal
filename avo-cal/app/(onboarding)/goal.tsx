import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useOnboardingStore } from '../../store/useOnboardingStore';

export default function GoalScreen() {
    const { setGoal } = useOnboardingStore();

    const handleGoalSelect = (goal: string) => {
        setGoal(goal);
        router.push('/(onboarding)/age');
    };

    return (
        <View className='flex-1 items-center justify-center px-6'>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-3xl font-bold text-gray-900 mb-8 text-center'>What's your goal?</Text>
                
                <View className='space-y-4 w-full'>
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGoalSelect('lose')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Lose Weight</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGoalSelect('maintain')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Maintain</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGoalSelect('gain')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Gain Weight</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className='w-full bg-blue-500 py-4 rounded-lg'
                        onPress={() => handleGoalSelect('gain_muscle')}
                    >
                        <Text className='text-white text-center text-lg font-semibold'>Gain muscle</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
