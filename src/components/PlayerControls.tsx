import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence
} from 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';
import * as Haptics from 'expo-haptics';

import { COLORS } from '../utils/colors';
import { usePlayerStore } from '../stores/playerStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PlayerControls = () => {
  const { 
    isPlaying, 
    shuffleMode, 
    repeatMode, 
    playNext, 
    playPrevious, 
    toggleShuffle, 
    toggleRepeat 
  } = usePlayerStore();

  const playScale = useSharedValue(1);
  const nextScale = useSharedValue(1);
  const prevScale = useSharedValue(1);

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playScale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextScale.value = withSequence(
      withSpring(0.8),
      withSpring(1)
    );
    playNext();
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prevScale.value = withSequence(
      withSpring(0.8),
      withSpring(1)
    );
    playPrevious();
  };

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleShuffle();
  };

  const handleRepeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleRepeat();
  };

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }]
  }));
  const nextAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nextScale.value }]
  }));
  const prevAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prevScale.value }]
  }));

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return 'repeat-once';
    return 'repeat';
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleShuffle} style={styles.secondaryBtn}>
        <Ionicons 
          name="shuffle" 
          size={24} 
          color={shuffleMode ? COLORS.accentPrimary : COLORS.textMuted} 
        />
      </Pressable>

      <AnimatedPressable onPress={handlePrev} style={[styles.skipBtn, prevAnimatedStyle]}>
        <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
      </AnimatedPressable>

      <AnimatedPressable onPress={handlePlayPause} style={[styles.playBtn, playAnimatedStyle]}>
        <Ionicons 
          name={isPlaying ? 'pause' : 'play'} 
          size={36} 
          color={COLORS.textPrimary}
          style={!isPlaying ? { marginLeft: 4 } : {}}
        />
      </AnimatedPressable>

      <AnimatedPressable onPress={handleNext} style={[styles.skipBtn, nextAnimatedStyle]}>
        <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
      </AnimatedPressable>

      <Pressable onPress={handleRepeat} style={styles.secondaryBtn}>
        <Ionicons 
          name={getRepeatIcon()} 
          size={24} 
          color={repeatMode !== 'off' ? COLORS.accentPrimary : COLORS.textMuted} 
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    width: '100%',
  },
  secondaryBtn: {
    padding: 12,
  },
  skipBtn: {
    padding: 12,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default PlayerControls;
