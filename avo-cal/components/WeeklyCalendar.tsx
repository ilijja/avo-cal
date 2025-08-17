import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DayInfo, getWeekDays } from '@/services/utils';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function WeeklyCalendar({ selectedDate, onDateSelect }: WeeklyCalendarProps) {
  const weekDays = getWeekDays(selectedDate);

  return (
    <View className="w-full bg-white rounded-lg p-4 mb-4">
      <View className="flex-row justify-between items-center">
        {weekDays.map((day: DayInfo) => (
          <TouchableOpacity
            key={day.date.toISOString()}
            onPress={() => onDateSelect(day.date)}
            className={`flex-1 items-center py-3 rounded-lg mx-1 ${
              day.isSelected
                ? 'bg-blue-500'
                : day.isToday
                ? 'bg-blue-100'
                : 'bg-gray-50'
            }`}
          >
            <Text
              className={`text-xs font-medium mb-1 ${
                day.isSelected
                  ? 'text-white'
                  : day.isToday
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {day.dayName}
            </Text>
            <Text
              className={`text-lg font-bold ${
                day.isSelected
                  ? 'text-white'
                  : day.isToday
                  ? 'text-blue-600'
                  : 'text-gray-900'
              }`}
            >
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
