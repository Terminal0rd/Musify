import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS } from '../utils/colors';
import { LyricsData } from '../types';

interface LyricsViewProps {
  lyrics: LyricsData | null;
  currentPosition: number;
  isLoading: boolean;
}

const LyricsView: React.FC<LyricsViewProps> = ({ lyrics, currentPosition, isLoading }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (lyrics?.synced && currentPosition > 0) {
      // Very basic auto-scroll implementation
      const index = lyrics.synced.findIndex(line => line.time > currentPosition);
      const activeIndex = index === -1 ? lyrics.synced.length - 1 : Math.max(0, index - 1);
      
      if (activeIndex > 0) {
        scrollViewRef.current?.scrollTo({
          y: activeIndex * 40, // Approximate height per line
          animated: true
        });
      }
    }
  }, [currentPosition, lyrics]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        <Text style={styles.loadingText}>Finding lyrics...</Text>
      </View>
    );
  }

  if (!lyrics) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No lyrics available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.8)', COLORS.bgPrimary]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{lyrics.source}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lyrics.synced ? (
          lyrics.synced.map((line, index) => {
            const isNext = line.time > currentPosition;
            const isPrev = !isNext && (index === lyrics.synced!.length - 1 || lyrics.synced![index + 1].time > currentPosition);
            const isActive = isPrev;

            return (
              <Animated.Text 
                key={index}
                style={[
                  styles.lyricLine,
                  isActive ? styles.lyricLineActive : styles.lyricLineInactive
                ]}
              >
                {line.text}
              </Animated.Text>
            );
          })
        ) : (
          <Text style={styles.plainLyrics}>{lyrics.plain}</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.surfaceGlass,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  lyricLine: {
    fontSize: 20,
    lineHeight: 32,
    marginVertical: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  lyricLineActive: {
    color: COLORS.accentPrimary,
    fontSize: 24,
    lineHeight: 36,
  },
  lyricLineInactive: {
    color: COLORS.textMuted,
  },
  plainLyrics: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
});

export default LyricsView;
