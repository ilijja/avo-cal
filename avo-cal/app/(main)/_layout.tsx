import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCameraStore } from '@/store';
import CameraModal from '@/components/CameraModal';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const { isCameraOpen, closeCamera } = useCameraStore();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          }}
        />
      </Tabs>

      <FloatingActionButton />
      <CameraModal
        isVisible={isCameraOpen}
        onClose={closeCamera}
      />
    </>
  );
}
