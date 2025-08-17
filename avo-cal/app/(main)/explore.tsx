import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';


export default function TabTwoScreen() {
  return (
    <View className='flex-1 bg-red-500'>
      <Text>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
