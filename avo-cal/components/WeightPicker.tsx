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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 14;

interface WeightPickerProps {
    onWeightChange: (weight: number, unit: 'kg' | 'lbs') => void;
    initialWeight: number;
    initialUnit?: 'kg' | 'lbs';
    title?: string;
    // Props za goal weight
    isGoalWeight?: boolean;
    currentWeight?: number;
    goal?: string | null;
}

export default function WeightPicker({
    onWeightChange,
    initialWeight,
    initialUnit = 'kg',
    title = "What's your weight?",
    isGoalWeight = false,
    currentWeight,
    goal
}: WeightPickerProps) {

    const [unit, setUnit] = useState<'kg' | 'lbs'>(initialUnit);
    const [weight, setWeight] = useState(initialWeight);
    const scrollViewRef = useRef<any>(null);
    const lastVibratedValue = useRef<number | null>(null);

    // Generisanje vrednosti
    const generateValues = () => {
        if (isGoalWeight && currentWeight && goal) {
            if (goal === 'gain') {
                // Za gain weight - počinje od trenutne težine i ide gore
                const startWeight = currentWeight;
                const endWeight = unit === 'kg' ? 250 : 551;
                const length = endWeight - startWeight + 1;
                return Array.from({ length }, (_, i) => startWeight + i);
            } else if (goal === 'lose') {
                // Za lose weight - počinje od 30/66 i ide do trenutne težine
                const startWeight = unit === 'kg' ? 30 : 66;
                const endWeight = currentWeight;
                const length = endWeight - startWeight + 1;
                return Array.from({ length }, (_, i) => startWeight + i);
            } else if (goal === 'maintain') {
                // Za maintain - samo trenutna težina
                return [currentWeight];
            }
        }
        
        // Default vrednosti za običan weight picker
        return unit === 'kg' 
            ? Array.from({ length: 221 }, (_, i) => i + 30) // 30-250 kg
            : Array.from({ length: 221 }, (_, i) => i + 66); // 66-551 lbs
    };

    const currentValues = generateValues();
    
    // Reference vrednosti za konverziju
    const kgValues = Array.from({ length: 221 }, (_, i) => i + 30); // 30-250 kg
    const lbsValues = Array.from({ length: 221 }, (_, i) => i + 66); // 66-551 lbs

    // useEffect za inicijalno postavljanje - samo jednom pri mountu
    useEffect(() => {
        setWeight(initialWeight);
        setUnit(initialUnit);
        
        // Scroll na poziciju initialWeight
        setTimeout(() => {
            const index = currentValues.indexOf(initialWeight);
            if (index !== -1 && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: index * ITEM_WIDTH,
                    animated: false 
                });
            }
        }, 200);
    }, []); 

    useEffect(() => {
        if (initialWeight !== weight || initialUnit !== unit) {
            setWeight(initialWeight);
            setUnit(initialUnit);
            onWeightChange(initialWeight, initialUnit);
            
            // Scroll na novu poziciju
            setTimeout(() => {
                const index = currentValues.indexOf(initialWeight);
                if (index !== -1 && scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                        x: index * ITEM_WIDTH,
                        animated: false 
                    });
                }
            }, 100);
        }
    }, [initialWeight, initialUnit]);

    // Haptic feedback funkcija
    const triggerHapticFeedback = useCallback(() => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
            Vibration.vibrate([0, 15, 0, 15], false);
        }
    }, []);

    const handleMomentumEnd = useCallback((event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / ITEM_WIDTH);
        const value = currentValues[index];

        if (value && value !== weight) {
            setWeight(value);
            onWeightChange(value, unit);
            triggerHapticFeedback();
            lastVibratedValue.current = value;
        }
    }, [currentValues, weight, onWeightChange, unit, triggerHapticFeedback]);

    const handleUnitToggle = useCallback((newUnit: 'kg' | 'lbs') => {
        if (newUnit === unit) return;
        
        // Ne dozvoli promenu jedinice u goal weight
        if (isGoalWeight) return;

        setUnit(newUnit);

        // Convert weight between units
        let newWeight;
        if (newUnit === 'lbs' && unit === 'kg') {
            newWeight = Math.round(weight * 2.20462);
            newWeight = Math.max(66, Math.min(551, newWeight));
        } else if (newUnit === 'kg' && unit === 'lbs') {
            newWeight = Math.round(weight * 0.453592);
            newWeight = Math.max(30, Math.min(250, newWeight));
        } else {
            newWeight = weight;
        }

        setWeight(newWeight);
        onWeightChange(newWeight, newUnit);

        // Scroll to correct position
        setTimeout(() => {
            // Regenerišemo currentValues sa novom jedinicom
            const newCurrentValues = (() => {
                if (isGoalWeight && currentWeight && goal) {
                    if (goal === 'gain') {
                        const startWeight = newWeight;
                        const endWeight = newUnit === 'kg' ? 250 : 551;
                        const length = endWeight - startWeight + 1;
                        return Array.from({ length }, (_, i) => startWeight + i);
                    } else if (goal === 'lose') {
                        const startWeight = newUnit === 'kg' ? 30 : 66;
                        const endWeight = newWeight;
                        const length = endWeight - startWeight + 1;
                        return Array.from({ length }, (_, i) => startWeight + i);
                    } else if (goal === 'maintain') {
                        return [newWeight];
                    }
                }
                return newUnit === 'kg' 
                    ? Array.from({ length: 221 }, (_, i) => i + 30)
                    : Array.from({ length: 221 }, (_, i) => i + 66);
            })();
            
            const index = newCurrentValues.indexOf(newWeight);
            if (index !== -1 && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: index * ITEM_WIDTH,
                    animated: true
                });
            }
        }, 100);
    }, [unit, weight, onWeightChange, isGoalWeight, currentWeight, goal]);

    const handleScroll = useCallback((event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / ITEM_WIDTH);

        const value = currentValues[index];

        if (value && value !== weight) {
            setWeight(value);
            onWeightChange(value, unit);

            triggerHapticFeedback();
            lastVibratedValue.current = value;
        }
    }, [currentValues, weight, onWeightChange, unit, triggerHapticFeedback]);

    const getDisplayValue = useCallback(() => {
        if (unit === 'lbs') {
            return `${weight} lbs`;
        }
        return `${weight} kg`;
    }, [weight, unit]);

    const shouldShowLabel = useCallback((value: number) => {
        if (unit === 'kg') {
            return value % 10 === 0;
        } else {
            return value % 20 === 0;
        }
    }, [unit]);

    const getTickLength = useCallback((value: number) => {
        if (unit === 'kg') {
            if (value % 10 === 0) return 40;
            if (value % 5 === 0) return 30;
            return 20;
        } else {
            if (value % 20 === 0) return 40;
            if (value % 10 === 0) return 35;
            if (value % 5 === 0) return 25;
            return 20;
        }
    }, [unit]);

    const renderTick = useCallback((value: number, index: number) => {
        const tickLength = getTickLength(value);
        const showLabel = shouldShowLabel(value);
        const isCurrentValue = value === weight;

        return (
            <View
                key={`${unit}-${value}-${index}`}
                className="justify-center items-center"
                style={{ width: ITEM_WIDTH, height: 144 }} 
            >
                <View className="flex flex-col items-center">
                    <View
                        className={`rounded-sm ${isCurrentValue ? 'bg-gray-700' : showLabel ? 'bg-gray-700' : 'bg-gray-500'}`}
                        style={{
                            height: tickLength,
                            width: 1.5,
                        }}
                    />
                    {showLabel && (
                        <Text
                            className={` text-xs w-full text-center font-semibold ${isCurrentValue ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                        >
                            {value}
                        </Text>
                    )}
                </View>
            </View>
        );
    }, [getTickLength, shouldShowLabel, weight, unit]);

    return (
        <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-8 text-center px-6">
                {title}
            </Text>

            {/* Unit Toggle - prikaži samo ako nije goal weight */}
            {!isGoalWeight && (
                <View className="flex-row rounded-xl p-1 mb-8 self-center mx-6">
                    <TouchableOpacity
                        className={`px-6 py-3 rounded-lg ${unit === 'kg' ? 'bg-blue-600' : ''}`}
                        onPress={() => handleUnitToggle('kg')}
                        activeOpacity={0.7}
                    >
                        <Text className={`font-semibold ${unit === 'kg' ? 'text-white' : 'text-gray-600'}`}>
                            kg
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`px-6 py-3 rounded-lg ${unit === 'lbs' ? 'bg-blue-600' : ''}`}
                        onPress={() => handleUnitToggle('lbs')}
                        activeOpacity={0.7}
                    >
                        <Text className={`font-semibold ${unit === 'lbs' ? 'text-white' : 'text-gray-600'}`}>
                            lbs
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Value Display - Center */}
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-5xl font-bold text-gray-900">
                    {getDisplayValue()}
                </Text>
                <Text className="text-lg text-gray-600 mt-2 uppercase tracking-wider">
                    {unit === 'kg' ? 'kilograms' : 'pounds'}
                </Text>
            </View>

            {/* Weight Picker Container - Bottom */}
            <View className="relative mb-8">
                {/* Full Width Ruler */}
                <View className="h-36 w-screen px-4">
                    {/* Left fade overlay */}
                    <View className="absolute top-0 bottom-0 left-4 bg-white/90 z-10" style={{ width: 30 }} />

                    <FlashList
                        ref={scrollViewRef}
                        data={currentValues}
                        keyExtractor={(item) => item.toString()}
                        renderItem={({ item, index }) => renderTick(item, index)}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        contentContainerStyle={{
                            paddingLeft: (SCREEN_WIDTH - 32) / 2,
                            paddingRight: (SCREEN_WIDTH - 32) / 2,
                        }}
                        onScroll={handleScroll}
                        onMomentumScrollEnd={handleMomentumEnd}
                        scrollEventThrottle={16}
                        decelerationRate="fast"
                        snapToInterval={ITEM_WIDTH}
                        snapToAlignment="center"
                        bounces={false}
                        overScrollMode="never"
                        scrollIndicatorInsets={{ right: 0, left: 0 }}
                    />

                    {/* Right fade overlay */}
                    <View className="absolute top-0 bottom-0 right-4 bg-white/90 z-10" style={{ width: 30 }} />

                    {/* Cursor Indicator - Static */}
                    <View 
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-20"
                        style={{ 
                            left: SCREEN_WIDTH/2 + 3.5, // FIXED: Center at 7px
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 2,
                            elevation: 3
                        }}
                    />
                </View>
            </View>
        </View>
    );
}
