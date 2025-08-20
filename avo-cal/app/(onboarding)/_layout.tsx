import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="age" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="goal-weight" />
      <Stack.Screen name="training-frequency" />
      <Stack.Screen name="weight-change-rate" />
      <Stack.Screen name="nutrition-plan" />
      <Stack.Screen name="diet" />
    </Stack>
  );    
}