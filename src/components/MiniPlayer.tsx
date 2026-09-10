import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import * as Haptics from 'expo-haptics';

import { COLORS } from '../utils/colors';
import AlbumArt from './AlbumArt';
import { usePlayerStore } from '../stores/playerStore';

const MiniPlayer = () => {
  const router = useRouter();
  const { currentTrack, isPlaying, playNext } = usePlayerStore();
  const { position, duration } = useProgress();
  
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (currentTrack) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = withTiming(100);
    }
  }, [currentTrack]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const progress = duration > 0 ? (position / duration) * 100 : 0;
    return {
      width: `${progress}%`,
    };
  });

  if (!currentTrack) return null;

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playNext();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable onPress={() => router.push('/player')} style={styles.pressable}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
          
          <View style={styles.content}>
            <AlbumArt 
              uri={currentTrack.albumArtUri} 
              gradientColors={currentTrack.gradientColors} 
              size={44} 
            />
            
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist || 'Unknown Artist'}
              </Text>
            </View>

            <View style={styles.controls}>
              <Pressable onPress={handlePlayPause} style={styles.controlButton}>
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={24} 
                  color={COLORS.textPrimary} 
                />
              </Pressable>
              <Pressable onPress={handleNext} style={styles.controlButton}>
                <Ionicons name="play-skip-forward" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Adjust based on tab bar height
    left: 8,
    right: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 18, 26, 0.6)',
  },
  pressable: {
    width: '100%',
  },
  blurContainer: {
    width: '100%',
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.accentPrimary,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 12,
  },
});

export default MiniPlayer;
