import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../utils/colors';
import { Playlist, Song } from '../types';
import AlbumArt from './AlbumArt';

interface PlaylistCardProps {
  playlist: Playlist;
  songs: Song[];
  onPress: (playlist: Playlist) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, songs, onPress }) => {
  const { width } = useWindowDimensions();
  const cardSize = (width - 48) / 2; // 2 columns, 16px padding on sides and between
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: withTiming(opacity.value === 1 ? 1 : 0.98, { duration: 150 }) }]
  }));

  const gridSongs = songs.slice(0, 4);

  return (
    <AnimatedPressable
      style={[styles.container, { width: cardSize, height: cardSize }, animatedStyle]}
      onPress={() => onPress(playlist)}
      onPressIn={() => (opacity.value = 0.8)}
      onPressOut={() => (opacity.value = 1)}
    >
      <LinearGradient
        colors={[playlist.color || COLORS.accentPrimary, COLORS.bgElevated]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.gridContainer}>
          {gridSongs.length > 0 ? (
            <View style={styles.grid}>
              {gridSongs.map((song, i) => (
                <View key={song.id || i} style={styles.gridItem}>
                  <AlbumArt uri={song.albumArtUri} size={(cardSize - 48) / 2} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyGrid}>
              <AlbumArt size={cardSize * 0.5} />
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{playlist.name}</Text>
          <Text style={styles.subtitle}>
            {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    flex: 1,
    padding: 12,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginTop: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});

export default PlaylistCard;
