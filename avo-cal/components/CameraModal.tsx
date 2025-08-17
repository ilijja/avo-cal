import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCameraStore, useFoodStore, useUserStore, useSelectedDateStore } from '@/store';
import { R2Service } from '@/services';
import { calculateTotalCalories } from '@/services/utils';
import { useScans } from '@/hooks/useScans';
import { Scan } from '@/services/database/scanService';

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
}


export default function CameraModal({ isVisible, onClose }: CameraModalProps) {
  const [type, setType] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { analyzeFoodImage, isAnalyzing, analysisError } = useFoodStore();
  const { user } = useUserStore();
  const { createScan, isCreating, addSkeletonToCache, removeSkeletonFromCache, updateSkeletonWithRealData } = useScans();


  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 items-center justify-center bg-black">
          <Text className="text-lg text-center mb-4 text-white">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded"
            onPress={requestPermission}
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="absolute top-12 left-4 bg-black bg-opacity-50 p-3 rounded-full"
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }


  function toggleCameraType() {
    setType(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.2, // 80% kvalitet - brže capture
          base64: false,
          skipProcessing: true, // Brže processing
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error('Take picture error:', error);
      }
    }
  };



  const handleContinue = async () => {
    if (!capturedImage) return;

    try {
      // Add skeleton to cache immediately - this will appear in today's daily scans
      addSkeletonToCache(capturedImage);
      
      // Close modal immediately
      handleClose();
      
      // Continue analysis in background
      const analysis = await analyzeFoodImage(capturedImage);

      // Calculate total calories
      const totalCalories = calculateTotalCalories(analysis);

      // Upload image to R2
      let imageUrl: string | undefined;
      if (capturedImage && user) {
        try {
          imageUrl = await R2Service.uploadImage(capturedImage, user.id);
        } catch (error) {
          console.error('Failed to upload image to R2:', error);
          // Continue without image if upload fails
        }
      }

      // Create scan data
      const scanData = {
        ingredients: analysis,
        total_calories: totalCalories,
        image_url: imageUrl,
      };

      // OPTIMISTIC UPDATE: Immediately update skeleton with real data
      const tempScan: Scan = {
        id: `temp-${Date.now()}`, // Temporary ID
        user_id: user?.id || '',
        ingredients: analysis,
        total_calories: totalCalories,
        image_url: imageUrl,
        created_at: new Date().toISOString(), // Use current date for today
      };

      // Update skeleton with real data immediately
      updateSkeletonWithRealData(tempScan);

      // Save to database in background (without waiting)
      createScan(scanData).catch((error) => {
        console.error('Failed to save scan to database:', error);
        // If database save fails, remove the optimistic update
        removeSkeletonFromCache();
        Alert.alert('Error', 'Failed to save scan. Please try again.');
      });

    } catch (error) {
      console.error('Error in food analysis:', error);
      // Remove skeleton on error
      removeSkeletonFromCache();
      Alert.alert('Error', 'Failed to create scan. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Show captured image
  if (capturedImage) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-black">
          <View className="flex-1">
            <Image
              source={{ uri: capturedImage }}
              className="flex-1"
              resizeMode="contain"
            />
          </View>

          <View className="absolute top-12 left-4">
            <TouchableOpacity
              className="bg-black bg-opacity-50 p-3 rounded-full"
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-8 left-0 right-0 items-center">
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="bg-gray-500 px-6 py-3 rounded-lg"
                onPress={handleRetake}
                disabled={isAnalyzing}
              >
                <Text className="text-white font-semibold">Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-6 py-3 rounded-lg ${isAnalyzing || isCreating ? 'bg-gray-400' : 'bg-blue-500'}`}
                onPress={handleContinue}
                disabled={isAnalyzing || isCreating}
              >
                <Text className="text-white font-semibold">
                  {isAnalyzing ? 'Analyzing...' : isCreating ? 'Saving...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Show camera
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing={type}
          ref={cameraRef}
        />
        
        {/* Back button */}
        <View className="absolute top-12 left-4 z-10">
          <TouchableOpacity
            className="bg-black bg-opacity-50 p-3 rounded-full"
            onPress={handleClose}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera controls */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="bg-white bg-opacity-50 p-4 rounded-full"
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white p-6 rounded-full"
              onPress={takePicture}
            >
              <View className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
