import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useUserStore } from '@/store';
import { useUserProfile } from '@/hooks/useUserProfile';
import { router } from 'expo-router';

export default function AccountScreen() {
  const { user, isAuthenticated, signOut } = useUserStore();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              router.replace('/(auth)/login');
            } else {
              Alert.alert('Error', result.error || 'Logout failed');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="space-y-6">
        {/* Header */}
        <View className="items-center space-y-2">
          <Text className="text-2xl font-bold text-gray-900">
            Account
          </Text>
          <Text className="text-gray-600 text-center">
            Manage your account settings
          </Text>
        </View>

        {/* User Info */}
        {isAuthenticated && user && (
          <View className="bg-gray-50 rounded-lg p-4 space-y-2">
            <Text className="text-lg font-semibold text-gray-900">
              {user.name || 'User'}
            </Text>
            <Text className="text-gray-600">
              {user.email}
            </Text>
            <Text className="text-sm text-gray-500">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* User Profile Info */}
        {userProfile && (
          <View className="bg-blue-50 rounded-lg p-4 space-y-2">
            <Text className="text-lg font-semibold text-blue-900">
              Daily Calorie Goal
            </Text>
            <Text className="text-2xl font-bold text-blue-600">
              {userProfile.daily_calorie_goal} cal
            </Text>
            <Text className="text-sm text-blue-500">
              Profile created: {new Date(userProfile.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}

        {profileLoading && (
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-600 text-center">Loading profile...</Text>
          </View>
        )}

        {/* Account Options */}
        <View className="space-y-4">
          <TouchableOpacity 
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => {
              // TODO: Add profile editing functionality
              Alert.alert('Coming Soon', 'Profile editing will be available soon!');
            }}
          >
            <Text className="text-white font-semibold text-center">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-6 py-3 rounded-lg"
            onPress={() => {
              // TODO: Add settings functionality
              Alert.alert('Coming Soon', 'Settings will be available soon!');
            }}
          >
            <Text className="text-white font-semibold text-center">Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-500 px-6 py-3 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white font-semibold text-center">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
