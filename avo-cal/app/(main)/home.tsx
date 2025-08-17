import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore, useSelectedDateStore } from '@/store';
import { useDailyScans } from '@/hooks/useDailyScans';
import { useScans } from '@/hooks/useScans';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatDate } from '@/services/utils';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import ScanDetailModal from '@/components/ScanDetailModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import SwipeableScanItem from '@/components/SwipeableScanItem';
import { Scan } from '@/services/database/scanService';

export default function HomeScreen() {
  const { user } = useUserStore();
  const insets = useSafeAreaInsets();
  const { selectedDate, setSelectedDate } = useSelectedDateStore();
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: dailyScans = [], isLoading, refetch } = useDailyScans(selectedDate);
  const { data: userProfile } = useUserProfile();
  const { deleteScan, isDeleting } = useScans();

  // Calculate daily calories for selected date
  const dailyCalories = dailyScans.reduce((total, scan) => total + scan.total_calories, 0);
  const dailyGoal = userProfile?.daily_calorie_goal || 2000;
  const progressPercentage = Math.min((dailyCalories / dailyGoal) * 100, 100);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  console.log('Root index.tsx is rendering!');

  const handleScanPress = (scan: Scan) => {
    setSelectedScan(scan);
    setIsModalVisible(true);
  };

  const handleScanDelete = async (scanId: string) => {
    try {
      await deleteScan(scanId);
    } catch (error) {
      console.error('Failed to delete scan:', error);
      Alert.alert('Error', 'Failed to delete meal. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedScan(null);
  };

  const renderScanItem = ({ item }: { item: Scan }) => {
    return (
      <SwipeableScanItem
        scan={item}
        onPress={handleScanPress}
        onDelete={handleScanDelete}
        isDeleting={isDeleting}
      />
    );
  };


  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="py-4">
          <Text className="text-2xl font-bold text-gray-900">Hellllo, {user?.email}</Text>
          <Text className="text-gray-600 mt-1">{formatDate(selectedDate)}</Text>
        </View>

        {/* Weekly Calendar */}
        <WeeklyCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {/* Daily Progress */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900">Daily Progress</Text>
            <Text className="text-sm text-gray-500">
              {dailyCalories} / {dailyGoal} cal
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3">
            <View
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        {/* Daily Scans */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">Today's Meals</Text>
            <Text className="text-sm text-gray-500">
              {dailyScans.length} {dailyScans.length === 1 ? 'meal' : 'meals'}
            </Text>
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Loading meals...</Text>
            </View>
          ) : dailyScans.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No meals for this day</Text>
              <Text className="text-gray-400 text-sm">Tap the camera to add your first meal</Text>
            </View>
          ) : (
            <FlatList
              data={dailyScans}
              renderItem={renderScanItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} />
              }
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Scan Detail Modal */}
      {selectedScan && (
        <ScanDetailModal
          scan={selectedScan}
          isVisible={isModalVisible}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}

