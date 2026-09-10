import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  runOnJS,
  useDerivedValue
} from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';

import { COLORS } from '../utils/colors';
import { usePlayerStore } from '../stores/playerStore';
import { formatDuration } from '../utils/formatters';

const ProgressBar = () => {
  const { position, duration } = useProgress();
  const { seekTo } = usePlayerStore();
  
  const isDragging = useSharedValue(false);
  const dragPosition = useSharedValue(0);
  const width = useSharedValue(0);

  const currentPosition = useDerivedValue(() => {
    if (isDragging.value) return dragPosition.value;
    return duration > 0 ? position / duration : 0;
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      if (width.value > 0) {
        let newPos = event.x / width.value;
        if (newPos < 0) newPos = 0;
        if (newPos > 1) newPos = 1;
        dragPosition.value = newPos;
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      const targetPosition = dragPosition.value * duration;
      runOnJS(seekTo)(targetPosition);
    });

  const trackStyle = useAnimatedStyle(() => {
    return {
      width: `${currentPosition.value * 100}%`,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      left: `${currentPosition.value * 100}%`,
      transform: [
        { translateX: -7 },
        { scale: withTiming(isDragging.value ? 1.3 : 1) }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View 
          style={styles.sliderContainer}
          onLayout={(e) => { width.value = e.nativeEvent.layout.width; }}
        >
          <View style={styles.trackBackground} />
          <Animated.View style={[styles.trackFill, trackStyle]} />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>

      <View style={styles.labels}>
        <Text style={styles.timeText}>
          {formatDuration(isDragging.value ? dragPosition.value * duration : position)}
        </Text>
        <Text style={styles.timeText}>
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 4,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 2,
    width: '100%',
  },
  trackFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accentPrimary,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});

export default ProgressBar;
