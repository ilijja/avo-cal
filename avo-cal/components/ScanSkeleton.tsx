import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScanSkeletonProps {
  imageUrl: string;
}

export default function ScanSkeleton({ imageUrl }: ScanSkeletonProps) {
  return (
    <View className="w-full h-32 rounded-lg bg-zinc-50 flex items-center justify-center p-4 mb-4">
      <View className="flex-row items-center justify-between w-full">
        {/* Image */}
        <View className="w-16 h-16 rounded-lg overflow-hidden mr-4 bg-gray-200">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              fadeDuration={300}
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-200">
              <Ionicons name="camera" size={20} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Content - Loading state */}
        <View className="flex-1">
          <View className="flex-row items-center space-x-2 mb-2">
            <View className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
          <View className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse" />
          <View className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
        </View>
        
        {/* Icon */}
        <View className="items-end">
          <Ionicons name="restaurant" size={24} color="#6b7280" />
          <View className="h-3 bg-gray-200 rounded w-20 mt-1 animate-pulse" />
        </View>
      </View>
    </View>
  );
}
