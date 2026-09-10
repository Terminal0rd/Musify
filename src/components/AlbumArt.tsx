import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

interface AlbumArtProps {
  uri?: string | null;
  gradientColors?: [string, string];
  size: number;
  style?: StyleProp<ViewStyle>;
}

const AlbumArt: React.FC<AlbumArtProps> = ({ uri, gradientColors = [COLORS.bgElevated, COLORS.bgSecondary], size, style }) => {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size > 64 ? 16 : 12,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, containerStyle]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradient, containerStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name="musical-notes" 
            size={size * 0.4} 
            color={COLORS.textSecondary} 
          />
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backgroundColor: COLORS.bgElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlbumArt;
