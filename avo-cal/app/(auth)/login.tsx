import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useUserStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        router.replace('/(main)/home');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        Alert.alert('Error', result.error || 'Google sign in failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white justify-center px-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="items-center space-y-2">
            <Text className="text-3xl font-bold text-gray-900">
              Welcome to Avo-Cal
            </Text>
            <Text className="text-gray-600 text-center">
              Sign in to start tracking your nutrition
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

                      <TouchableOpacity
            className={`rounded-lg py-3 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center space-x-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            className={`rounded-lg py-3 border border-gray-300 ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text className="text-gray-700 font-semibold text-center text-lg">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Signup Link */}
        <View className="items-center">
          <Text className="text-gray-600 text-center">
            Don't have an account?{' '}
            <Text 
              className="text-blue-500 font-semibold"
              onPress={() => router.push('/(auth)/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
