import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Scan } from '@/services/database/scanService';

interface SwipeableScanItemProps {
  scan: Scan;
  onPress: (scan: Scan) => void;
  onDelete: (scanId: string) => void;
  isDeleting?: boolean;
}

export default function SwipeableScanItem({ 
  scan, 
  onPress, 
  onDelete, 
  isDeleting = false 
}: SwipeableScanItemProps) {
  const scanId = String(scan?.id || '');
  const isSkeleton = scanId.startsWith('skeleton-') || scanId.startsWith('temp-');

  const handleDelete = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(scan.id),
        },
      ]
    );
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        onPress={handleDelete}
        className="bg-red-500 justify-center items-center w-20 h-full"
        disabled={isDeleting || isSkeleton}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  if (isSkeleton) {
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row items-center space-x-3">
          <View className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
          <View className="flex-1">
            <View className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
            <View className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
      enabled={!isDeleting}
    >
      <TouchableOpacity
        onPress={() => onPress(scan)}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm"
        disabled={isDeleting}
      >
        <View className="flex-row items-center space-x-3">
          {scan.image_url ? (
            <Image
              source={{ uri: scan.image_url }}
              className="w-16 h-16 rounded-lg"
              fadeDuration={300}
            />
          ) : (
            <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center">
              <Ionicons name="restaurant" size={24} color="#9CA3AF" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {scan.total_calories} cal
            </Text>
            <Text className="text-sm text-gray-500">
              {scan.ingredients.items.length} ingredients
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(scan.created_at).toLocaleTimeString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
