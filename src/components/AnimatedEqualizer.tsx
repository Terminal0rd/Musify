import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';
import { COLORS } from '../utils/colors';

interface AnimatedEqualizerProps {
  size?: 'small' | 'medium';
}

const AnimatedEqualizer: React.FC<AnimatedEqualizerProps> = ({ size = 'small' }) => {
  const bar1Height = useSharedValue(0.3);
  const bar2Height = useSharedValue(0.8);
  const bar3Height = useSharedValue(0.5);

  const maxHeight = size === 'small' ? 12 : 20;

  useEffect(() => {
    const config = { duration: 400, easing: Easing.inOut(Easing.ease) };
    
    bar1Height.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withTiming(0.3, { duration: 400 }),
        withTiming(1.0, { duration: 350 }),
        withTiming(0.4, { duration: 300 })
      ),
      -1,
      true
    );

    bar2Height.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 350 }),
        withTiming(1.0, { duration: 300 }),
        withTiming(0.2, { duration: 450 }),
        withTiming(0.7, { duration: 350 })
      ),
      -1,
      true
    );

    bar3Height.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 450 }),
        withTiming(0.3, { duration: 350 }),
        withTiming(0.8, { duration: 300 }),
        withTiming(0.5, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    height: bar1Height.value * maxHeight,
  }));
  
  const animatedStyle2 = useAnimatedStyle(() => ({
    height: bar2Height.value * maxHeight,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    height: bar3Height.value * maxHeight,
  }));

  const barWidth = size === 'small' ? 3 : 4;
  const gap = size === 'small' ? 2 : 3;

  return (
    <View style={[styles.container, { height: maxHeight, gap }]}>
      <Animated.View style={[styles.bar, { width: barWidth }, animatedStyle1]} />
      <Animated.View style={[styles.bar, { width: barWidth }, animatedStyle2]} />
      <Animated.View style={[styles.bar, { width: barWidth }, animatedStyle3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 2,
  },
});

export default AnimatedEqualizer;
