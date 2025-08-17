import { useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditableIngredientProps {
  name: string;
  weight: number;
  calories_per_100g: number;
  onWeightChange: (newWeight: number) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

const EditableIngredient = forwardRef<View, EditableIngredientProps>(({
  name,
  weight,
  calories_per_100g,
  onWeightChange,
  isEditing,
  onEditToggle,
}, ref) => {
  const [inputValue, setInputValue] = useState(weight.toString());

  const handleSave = () => {
    const newWeight = parseInt(inputValue) || 0;
    onWeightChange(newWeight);
    onEditToggle();
  };

 
  const totalCalories = Math.round((weight * calories_per_100g) / 100);

  return (
    <View ref={ref} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{name}</Text>
        <Text className="text-sm text-gray-600">
          {calories_per_100g} cal/100g
        </Text>
      </View>
      
      <View className="flex-row items-center space-x-2">
        {isEditing ? (
          <>
            <TextInput
              className="border border-gray-300 rounded px-2 py-1 text-center w-16"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              autoFocus
            />
            <Text className="text-sm text-gray-600">g</Text>
            <TouchableOpacity
              className="bg-green-500 p-1 rounded"
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="items-end">
              <Text className="text-base font-semibold text-gray-900">
                {weight}g
              </Text>
              <Text className="text-sm text-gray-600">
                {totalCalories} cal
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-500 p-1 rounded ml-2"
              onPress={onEditToggle}
            >
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

EditableIngredient.displayName = 'EditableIngredient';

export default EditableIngredient;
