import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../src/stores/playerStore';
import { useLibraryStore } from '../src/stores/libraryStore';
import { AlbumArt } from '../src/components/AlbumArt';
import { ProgressBar } from '../src/components/ProgressBar';
import { PlayerControls } from '../src/components/PlayerControls';
import { LyricsView } from '../src/components/LyricsView';
import { fetchLyrics } from '../src/services/lyricsService';
import { COLORS } from '../src/utils/colors';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const { currentTrack } = usePlayerStore();
  const { toggleLike, likedSongIds } = useLibraryStore();
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  
  const isLiked = currentTrack ? likedSongIds.includes(currentTrack.id) : false;

  useEffect(() => {
    if (currentTrack) {
      // Mock lyrics fetch or actual if implemented
      fetchLyrics(currentTrack.title, currentTrack.artist || '').then(setLyrics).catch(() => setLyrics(''));
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.bgElevated, COLORS.bgPrimary]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-down" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Now Playing</Text>
        <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)} style={styles.iconButton}>
          <Ionicons name="text" size={24} color={showLyrics ? COLORS.accentPrimary : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {showLyrics ? (
          <LyricsView lyrics={lyrics} />
        ) : (
          <View style={styles.mainPlayer}>
            <View style={styles.albumArtContainer}>
              <AlbumArt url={currentTrack.artwork} size={width - 64} />
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.textInfo}>
                <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleLike(currentTrack.id)} style={styles.likeButton}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? COLORS.accentPink : COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ProgressBar />
            <PlayerControls size="large" />

            <View style={styles.bottomActions}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/add-to-playlist', params: { songId: currentTrack.id } })}>
                <Ionicons name="add-circle-outline" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  headerText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  iconButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 32, paddingBottom: 40 },
  mainPlayer: { flex: 1, justifyContent: 'space-between' },
  albumArtContainer: { alignItems: 'center', marginTop: 24, marginBottom: 40 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  textInfo: { flex: 1, marginRight: 16 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  artist: { color: COLORS.textSecondary, fontSize: 18 },
  likeButton: { padding: 8 },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
});
