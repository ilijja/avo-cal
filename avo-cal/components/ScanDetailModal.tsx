import { View, Text, TouchableOpacity, Image, Alert, Keyboard, Dimensions } from 'react-native';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Scan } from '@/services';
import { formatCalories, calculateTotalCalories } from '@/services/utils';
import EditableIngredient from './EditableIngredient';
import { useScans } from '@/hooks/useScans';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScanDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  scan: Scan | null;
}

export default function ScanDetailModal({ isVisible, onClose, scan }: ScanDetailModalProps) {
  const { updateScan, isUpdating } = useScans();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localIngredients, setLocalIngredients] = useState(scan?.ingredients || { items: [] });
  const scrollViewRef = useRef<any>(null);

  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points (80% of screen height)
  const snapPoints = useMemo(() => [SCREEN_HEIGHT * 0.8], []);

  useEffect(() => {
    if (scan) {
      setLocalIngredients(scan.ingredients);
      setEditingIndex(null);
    }
  }, [scan]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

 
  if (!scan) return null;

  const handleWeightChange = (index: number, newWeight: number) => {
    const updatedItems = [...localIngredients.items];
    const itemToUpdate = updatedItems[index];
    
    // Ažuriraj weight
    updatedItems[index] = {
      ...itemToUpdate,
      weight_grams: newWeight,
    };

    setLocalIngredients({ items: updatedItems });

    console.log('💾 Weight updated for:', itemToUpdate.name, 'at index:', index, 'new weight:', newWeight);
    updateScanInDatabase(updatedItems);
  };

  const handleEditToggle = (index: number) => {
    const currentItem = localIngredients.items[index];
    
    if (editingIndex === index) {
      // Zatvaranje editing-a
      setEditingIndex(null);
    } else {
      // Otvaranje editing-a - premesti ingredient na vrh
      const updatedItems = [...localIngredients.items];
      const itemToMove = updatedItems[index];
      
      // Ukloni item sa trenutne pozicije
      updatedItems.splice(index, 1);
      
      // Dodaj na vrh
      updatedItems.unshift(itemToMove);
      
      // Ažuriraj state
      setLocalIngredients({ items: updatedItems });
      setEditingIndex(0); // Sada je na vrhu, dakle index 0
      
      console.log('🔄 Ingredient moved to top:', itemToMove.name, 'now at index 0');
      
      // Smooth scroll na vrh da se ingredient vidi
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ 
          y: 0, 
          animated: true 
        });
      }, 200); // Blagi delay za smooth animaciju
    }
  };

  const updateScanInDatabase = async (updatedItems: any[]) => {
    try {
      const newTotalCalories = calculateTotalCalories({ items: updatedItems });

      await updateScan({
        scanId: scan.id,
        updateData: {
          ingredients: { items: updatedItems },
          total_calories: newTotalCalories,
        },
      });
    } catch (error) {
      console.error('Error updating scan:', error);
      Alert.alert('Error', 'Failed to update meal. Please try again.');
    }
  };

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderContent = () => (
    <View>
      <View className="h-64 relative rounded-2xl overflow-hidden">
        {scan.image_url ? (
          <Image
            source={{ uri: scan.image_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="bg-zinc-300 justify-center items-center w-full h-full">
            <Ionicons name="camera" size={48} color="#71717a" />
            <Text className="text-zinc-600 mt-2">No image available</Text>
          </View>
        )}
        
        <TouchableOpacity 
          onPress={onClose}
          className="absolute top-4 left-4 w-8 h-8 bg-black/50 rounded-full justify-center items-center"
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Custom handle indicator preko slike */}
        <View className="absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white/80 rounded-full" />
      </View>

      {/* Content */}
      <View className="p-6 space-y-6 bg-white bottom-10 rounded-t-2xl">
        {/* Total Calories */}
        <View className="items-center">
          <Text className="text-3xl font-bold text-gray-900">
            {formatCalories(calculateTotalCalories(localIngredients))}
          </Text>
          <Text className="text-gray-600 mt-1">
            Total Calories
          </Text>
        </View>

        <View className="space-y-4">
          <Text className="text-xl font-semibold text-gray-900">
            Ingredients ({localIngredients.items.length})
          </Text>

          {localIngredients.items.map((item, index) => (
            <EditableIngredient
              key={`${item.name}-${index}`}
              name={item.name}
              weight={item.weight_grams}
              calories_per_100g={item.calories_per_100g}
              onWeightChange={(newWeight) => handleWeightChange(index, newWeight)}
              isEditing={editingIndex === index}
              onEditToggle={() => handleEditToggle(index)}
            />
          ))}
        </View>

        {/* Date */}
        <View className="items-center pt-4 pb-2">
          <Text className="text-sm text-gray-500">
            Scanned on {new Date(scan.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
          <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableContentPanningGesture={true} 
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: 'transparent', width: 0, height: 0 }}
        handleStyle={{ backgroundColor: 'transparent', paddingTop: 0, paddingBottom: 0 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        maxDynamicContentSize={SCREEN_HEIGHT * 0.95} 
      >
      <View className="flex-1">
        {/* Header */}
        

        <BottomSheetScrollView
          ref={scrollViewRef}
          nestedScrollEnabled={true}
          overScrollMode="never"
          bounces={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {renderContent()}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
