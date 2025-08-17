import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Vibration,
    Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48; // px-6 padding

interface WeightChangeRateSliderProps {
    onRateChange: (rate: number) => void;
    initialRate?: number;
    goal: 'lose' | 'gain' | 'maintain';
    unit: 'kg' | 'lbs';
}

interface RateOption {
    value: number;
    label: string;
    status: 'premalo' | 'healthy' | 'brzo' | 'ekstremno';
    emoji: string;
}

export default function WeightChangeRateSlider({
    onRateChange,
    initialRate = 0.8,
    goal,
    unit
}: WeightChangeRateSliderProps) {

    const [rate, setRate] = useState(initialRate);
    const lastVibratedValue = useRef<number | null>(null);

    // Generisanje vrednosti za kg
    const kgRates: RateOption[] = [
        { value: 0.2, label: '0.2', status: 'premalo', emoji: '' },
        { value: 0.4, label: '0.4', status: 'premalo', emoji: '' },
        { value: 0.6, label: '0.6', status: 'premalo', emoji: '' },
        { value: 0.8, label: '0.8', status: 'healthy', emoji: '✅' },
        { value: 1.0, label: '1.0', status: 'healthy', emoji: '✅' },
        { value: 1.2, label: '1.2', status: 'healthy', emoji: '✅' },
        { value: 1.4, label: '1.4', status: 'healthy', emoji: '✅' },
        { value: 1.6, label: '1.6', status: 'brzo', emoji: '⚠️' },
        { value: 1.8, label: '1.8', status: 'brzo', emoji: '⚠️' },
        { value: 2.0, label: '2.0', status: 'ekstremno', emoji: '⚠️' },
    ];

    // Generisanje vrednosti za lbs (konvertovano iz kg)
    const lbsRates: RateOption[] = kgRates.map(kgRate => ({
        ...kgRate,
        value: Math.round(kgRate.value * 2.20462 * 10) / 10,
        label: (Math.round(kgRate.value * 2.20462 * 10) / 10).toString(),
    }));

    const currentRates = unit === 'kg' ? kgRates : lbsRates;
    const rateValues = currentRates.map(r => r.value);

    // Haptic feedback funkcija
    const triggerHapticFeedback = useCallback(() => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
            Vibration.vibrate([0, 15, 0, 15], false);
        }
    }, []);

    // Pronađi index za trenutnu vrednost
    const getIndexForRate = useCallback((targetRate: number) => {
        return rateValues.indexOf(targetRate);
    }, [rateValues]);

    // Pronađi vrednost za index
    const getRateForIndex = useCallback((index: number) => {
        return rateValues[Math.max(0, Math.min(rateValues.length - 1, index))];
    }, [rateValues]);

    // useEffect za inicijalno postavljanje
    useEffect(() => {
        const defaultRate = unit === 'kg' ? 0.8 : Math.round(0.8 * 2.20462 * 10) / 10;
        setRate(defaultRate);
        onRateChange(defaultRate);
        setCurrentSliderIndex(rateValues.indexOf(defaultRate));
    }, [unit]);

    // useEffect za reagovanje na promene initialRate
    useEffect(() => {
        if (initialRate !== rate) {
            setRate(initialRate);
            setCurrentSliderIndex(rateValues.indexOf(initialRate));
        }
    }, [initialRate]);

    const handleSliderChange = useCallback((value: number) => {
        const index = Math.round(value);
        const newRate = getRateForIndex(index);

        if (newRate !== rate) {
            setRate(newRate);
            onRateChange(newRate);
        }
    }, [rate, onRateChange, getRateForIndex]);

    // Dodajemo lokalno stanje za trenutni index za brže ažuriranje step marks
    const [currentSliderIndex, setCurrentSliderIndex] = useState(getIndexForRate(initialRate));

    const handleSliderValueChange = useCallback((value: number) => {
        const index = Math.round(value);
        setCurrentSliderIndex(index);
        
        // Haptic feedback dok se slide-uje
        const newRate = getRateForIndex(index);
        if (newRate !== lastVibratedValue.current) {
            triggerHapticFeedback();
            lastVibratedValue.current = newRate;
        }
    }, [getRateForIndex, triggerHapticFeedback]);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'premalo': return 'text-gray-500';
            case 'healthy': return 'text-green-600';
            case 'brzo': return 'text-yellow-600';
            case 'ekstremno': return 'text-red-600';
            default: return 'text-gray-700';
        }
    }, []);

    const getStatusText = useCallback((status: string) => {
        switch (status) {
            case 'premalo': return 'premalo';
            case 'healthy': return 'healthy';
            case 'brzo': return 'brzo';
            case 'ekstremno': return 'ekstremno';
            default: return '';
        }
    }, []);

    const getGoalText = useCallback(() => {
        if (goal === 'lose') {
            return unit === 'kg' ? 'kg per week' : 'lbs per week';
        } else {
            return unit === 'kg' ? 'kg per week' : 'lbs per week';
        }
    }, [goal, unit]);

    const currentRateOption = currentRates.find(r => r.value === rate);
    const currentIndex = currentSliderIndex; // Koristimo lokalno stanje za brže ažuriranje

    const renderStepMarks = () => {
        return (
            <View className="w-full flex-row justify-between items-center">
                {rateValues.map((value, index) => (
                    <View
                        key={index}
                        className={`w-1 h-2 rounded-sm ${index <= currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                ))}
            </View>
        );
    };

    return (
        <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-8 text-center px-6">
                How much {goal === 'lose' ? 'weekly to lose' : 'weekly to gain'}?
            </Text>

            {/* Value Display - Center */}
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-5xl font-bold text-gray-900">
                    {rate} {getGoalText()}
                </Text>

                {/* Status Message - Center */}
                {currentRateOption && (
                    <View className="mt-4 items-center">
                        <Text className={`text-lg font-semibold ${getStatusColor(currentRateOption.status)}`}>
                            {currentRateOption.emoji} {getStatusText(currentRateOption.status)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Slider Container */}
            <View className="px-6 pb-8">
                {/* Step marks */}
                <View className="mb-4 px-4">
                    {renderStepMarks()}
                </View>

                {/* Slider */}
                <View className="w-full flex justify-center items-center">
                    <Slider
                        style={{ width: SLIDER_WIDTH, height: 40 }}
                        minimumValue={0}
                        maximumValue={rateValues.length - 1}
                        value={currentIndex}
                        onValueChange={handleSliderValueChange}
                        onSlidingComplete={handleSliderChange}
                        minimumTrackTintColor="#3b82f6"
                        maximumTrackTintColor="#e5e7eb"
                        thumbTintColor="#ffffff"
                        step={1}
                    />
                </View>
            </View>
        </View>
    );
}
