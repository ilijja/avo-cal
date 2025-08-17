import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCameraStore, useSelectedDateStore } from '@/store';

export default function FloatingActionButton() {
  const { openCamera } = useCameraStore();
  const { resetToToday } = useSelectedDateStore();

  const handlePress = () => {
    // Reset to today's date when opening camera
    resetToToday();
    openCamera();
  };

  return (
    <View className="absolute bottom-6 right-6">
      <TouchableOpacity
        onPress={handlePress}
        className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
