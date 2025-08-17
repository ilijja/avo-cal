import React, { useState } from 'react';
import { View, Image, ActivityIndicator, ImageProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressiveImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  fallbackUri?: string;
  showLoadingIndicator?: boolean;
}

export default function ProgressiveImage({ 
  uri, 
  fallbackUri, 
  showLoadingIndicator = true,
  ...props 
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUri, setCurrentUri] = useState(uri);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Pokušaj fallback URI ako postoji
    if (fallbackUri && fallbackUri !== currentUri) {
      setCurrentUri(fallbackUri);
    }
  };

  return (
    <View className="relative">
      {/* Loading indicator */}
      {isLoading && showLoadingIndicator && (
        <View className="absolute inset-0 bg-gray-200 items-center justify-center z-10">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}
      
      {/* Error state */}
      {hasError && (
        <View className="absolute inset-0 bg-gray-100 items-center justify-center z-10">
          <Ionicons name="image" size={24} color="#9ca3af" />
        </View>
      )}
      
      {/* Image */}
      <Image
        source={{ 
          uri: currentUri,
          headers: {
            'Accept': 'image/*',
          },
        }}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    </View>
  );
}
