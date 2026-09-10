import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../utils/colors';
import { Song } from '../types';
import AlbumArt from './AlbumArt';
import AnimatedEqualizer from './AnimatedEqualizer';
import { formatDuration } from '../utils/formatters';

interface SongItemProps {
  song: Song;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
  isPlaying?: boolean;
  showIndex?: boolean;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SongItem: React.FC<SongItemProps> = ({ 
  song, 
  onPress, 
  onLongPress, 
  isPlaying = false, 
  showIndex = false,
  index = 0
}) => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: isPlaying ? COLORS.surfaceGlass : 'transparent',
  }));

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
      onPressIn={() => (opacity.value = withTiming(0.7, { duration: 100 }))}
      onPressOut={() => (opacity.value = withTiming(1, { duration: 200 }))}
    >
      <View style={styles.leftContent}>
        {showIndex && !isPlaying && (
          <Text style={styles.indexText}>{index + 1}</Text>
        )}
        {isPlaying && (
          <View style={styles.equalizerContainer}>
            <AnimatedEqualizer size="small" />
          </View>
        )}
        <AlbumArt 
          uri={song.albumArtUri} 
          gradientColors={song.gradientColors} 
          size={48} 
        />
      </View>

      <View style={styles.centerContent}>
        <Text style={[styles.title, isPlaying && styles.titlePlaying]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist || 'Unknown Artist'}
        </Text>
      </View>

      <View style={styles.rightContent}>
        <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        <Pressable onPress={() => onLongPress?.(song)} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 64,
  },
  indexText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
    marginRight: 8,
  },
  equalizerContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  titlePlaying: {
    color: COLORS.accentPrimary,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginRight: 16,
  },
  moreButton: {
    padding: 4,
  },
});

export default SongItem;
