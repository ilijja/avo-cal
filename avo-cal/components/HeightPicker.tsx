import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Vibration,
    Platform
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 14;
const RULER_HEIGHT = SCREEN_HEIGHT * 0.6;
const MAJOR_TICK_INTERVAL = 10;
const FT_MAJOR_TICK_INTERVAL = 12;

interface HeightPickerProps {
    onHeightChange: (height: number, unit: 'cm' | 'ft') => void;
    initialHeight?: number;
    initialUnit?: 'cm' | 'ft';
}

export default function HeightPicker({
    onHeightChange,
    initialHeight,
    initialUnit = 'cm'
}: HeightPickerProps) {

    const [unit, setUnit] = useState<'cm' | 'ft'>(initialUnit);
    const [height, setHeight] = useState(initialHeight || 170); // Default 170cm
    const scrollViewRef = useRef<any>(null);
    const lastVibratedValue = useRef<number | null>(null);

    // Generisanje vrednosti (obrnuto)
    const cmValues = Array.from({ length: 251 }, (_, i) => 300 - i); // 300-50 cm
    const ftValues = Array.from({ length: 81 }, (_, i) => 104 - i); // 104-24 inches

    const currentValues = unit === 'cm' ? cmValues : ftValues;

    // useEffect za automatsko setovanje na 170 pri mountu
    useEffect(() => {
        if (initialHeight) return;
        
        setHeight(170);
        onHeightChange(170, unit);
        
        setTimeout(() => {
            const targetValues = unit === 'cm' ? cmValues : ftValues;
            const index = targetValues.indexOf(170);
            if (index !== -1 && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    y: index * ITEM_HEIGHT,
                    animated: false
                });
            }
        }, 200);
    }, []);

    // Haptic feedback funkcija
    const triggerHapticFeedback = useCallback(() => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
            Vibration.vibrate([0, 15, 0, 15], false);
        }
    }, []);

    const handleMomentumEnd = useCallback((event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const value = currentValues[index];

        if (value && value !== height) {
            setHeight(value);
            onHeightChange(value, unit);
            triggerHapticFeedback();
            lastVibratedValue.current = value;
        }
    }, [currentValues, height, onHeightChange, unit, triggerHapticFeedback]);

    const handleUnitToggle = useCallback((newUnit: 'cm' | 'ft') => {
        if (newUnit === unit) return;

        setUnit(newUnit);

        // Convert height between units
        let newHeight;
        if (newUnit === 'ft' && unit === 'cm') {
            newHeight = Math.round(height * 0.393701);
            newHeight = Math.max(24, Math.min(104, newHeight));
        } else if (newUnit === 'cm' && unit === 'ft') {
            newHeight = Math.round(height * 2.54);
            newHeight = Math.max(50, Math.min(300, newHeight));
        } else {
            newHeight = height;
        }

        setHeight(newHeight);
        onHeightChange(newHeight, newUnit);

        // Scroll to correct position
        setTimeout(() => {
            const targetValues = newUnit === 'cm' ? cmValues : ftValues;
            const index = targetValues.indexOf(newHeight);
            if (index !== -1 && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    y: index * ITEM_HEIGHT,
                    animated: true
                });
            }
        }, 100);
    }, [unit, height, onHeightChange, cmValues, ftValues]);

    const handleScroll = useCallback((event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);

        const value = currentValues[index];

        if (value && value !== height) {
            setHeight(value);
            onHeightChange(value, unit);

            triggerHapticFeedback();
            lastVibratedValue.current = value;
        }
    }, [currentValues, height, onHeightChange, unit, triggerHapticFeedback]);

    const getDisplayValue = useCallback(() => {
        if (unit === 'ft') {
            const feet = Math.floor(height / 12);
            const inches = height % 12;
            return `${feet}' ${inches}"`;
        }
        return `${height} cm`;
    }, [height, unit]);

    const shouldShowLabel = useCallback((value: number) => {
        if (unit === 'cm') {
            return value % MAJOR_TICK_INTERVAL === 0;
        } else {
            return value % FT_MAJOR_TICK_INTERVAL === 0;
        }
    }, [unit]);

    const getTickLength = useCallback((value: number) => {
        if (unit === 'cm') {
            if (value % MAJOR_TICK_INTERVAL === 0) return 50;
            if (value % 5 === 0) return 30;
            return 20;
        } else {
            if (value % FT_MAJOR_TICK_INTERVAL === 0) return 50;
            if (value % 6 === 0) return 35;
            if (value % 3 === 0) return 25;
            return 20;
        }
    }, [unit]);

    const getDisplayLabel = useCallback((value: number) => {
        if (unit === 'cm') {
            return value.toString();
        } else {
            return Math.floor(value / 12).toString();
        }
    }, [unit]);

    const renderTick = useCallback((value: number, index: number) => {
        const tickLength = getTickLength(value);
        const showLabel = shouldShowLabel(value);
        const isCurrentValue = value === height;

        return (
            <View
                key={`${unit}-${value}-${index}`}
                className="justify-center items-start pl-4"
                style={{ height: ITEM_HEIGHT, width: 144 }} // Fixed width = w-36 (144px)
            >
                <View className="flex-row items-center">
                    <View
                        className={`rounded-sm ${isCurrentValue ? 'bg-gray-700' : showLabel ? 'bg-gray-700' : 'bg-gray-500'}`}
                        style={{
                            width: tickLength,
                            height: 2,
                        }}
                    />
                    {showLabel && (
                        <Text
                            className={`ml-3 flex items-center justify-center h-5 text-sm font-semibold ${isCurrentValue ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                        >
                            {getDisplayLabel(value)}
                        </Text>
                    )}
                </View>
            </View>
        );
    }, [getTickLength, shouldShowLabel, height, unit, getDisplayLabel]);

    // Debug info za centriranje
    console.log('RULER_HEIGHT:', RULER_HEIGHT);
    console.log('Cursor position:', RULER_HEIGHT / 2 - 1);

    return (
        <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-8 text-center px-6">
                What's your height?
            </Text>

            {/* Unit Toggle */}
            <View className="flex-row  rounded-xl p-1 mb-8 self-center mx-6">
                <TouchableOpacity
                    className={`px-6 py-3 rounded-lg ${unit === 'cm' ? 'bg-blue-600' : ''}`}
                    onPress={() => handleUnitToggle('cm')}
                    activeOpacity={0.7}
                >
                    <Text className={`font-semibold ${unit === 'cm' ? 'text-white' : 'text-gray-600'}`}>
                        cm
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-6 py-3 rounded-lg ${unit === 'ft' ? 'bg-blue-600' : ''}`}
                    onPress={() => handleUnitToggle('ft')}
                    activeOpacity={0.7}
                >
                    <Text className={`font-semibold ${unit === 'ft' ? 'text-white' : 'text-gray-600'}`}>
                        ft
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Height Picker Container */}
            <View className="flex-1 relative justify-center">
                {/* Full Width Ruler */}
                <View className="w-full" style={{ height: RULER_HEIGHT }}>
                    {/* Top fade overlay */}
                    <View className="absolute top-0 left-0 right-0 bg-white/90 z-10" style={{ height: 30 }} />

                    <FlashList
                        ref={scrollViewRef}
                        data={currentValues}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item, index }) => renderTick(item, index)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingTop: RULER_HEIGHT / 2, // Tačno na sredini
                            paddingBottom: RULER_HEIGHT / 2, // Tačno na sredini
                        }}
                        onScroll={handleScroll}
                        onMomentumScrollEnd={handleMomentumEnd}
                        scrollEventThrottle={16}
                        decelerationRate="fast"
                        snapToInterval={ITEM_HEIGHT}
                        snapToAlignment="center"
                        bounces={false}
                    />

                    {/* Bottom fade overlay */}
                    <View className="absolute bottom-0 left-0 right-0 bg-white/90 z-10" style={{ height: 30 }} />

                    {/* Cursor Indicator - Perfectly Centered */}
                    <View 
                        className="absolute left-0 w-36 h-0.5 bg-blue-600 z-20"
                        style={{ 
                            top: RULER_HEIGHT / 2 + 5, // Tačno centrirano
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 2,
                            elevation: 3
                        }}
                    />
                </View>

                {/* Value Display - Overlay */}
                <View className="absolute right-0 top-0 bottom-0 flex-1 items-center justify-center px-6 pointer-events-none">
                    <Text className="text-5xl font-bold text-gray-900">
                        {getDisplayValue()}
                    </Text>
                    <Text className="text-lg text-gray-600 mt-2 uppercase tracking-wider">
                        {unit === 'cm' ? 'centimeters' : 'feet & inches'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
