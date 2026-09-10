import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/stores/libraryStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { SongItem } from '../../src/components/SongItem';
import { COLORS } from '../../src/utils/colors';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { songs, playlists, likedSongIds } = useLibraryStore();
  const { currentTrack, isPlaying, playTrackFromList } = usePlayerStore();

  const isLiked = id === 'liked';
  
  const playlist = useMemo(() => {
    if (isLiked) return { id: 'liked', name: 'Liked Songs', color: COLORS.accentPink, songIds: likedSongIds };
    return playlists.find(p => p.id === id);
  }, [id, playlists, likedSongIds, isLiked]);

  const playlistSongs = useMemo(() => {
    if (!playlist) return [];
    return playlist.songIds.map(songId => songs.find(s => s.id === songId)).filter(Boolean) as typeof songs;
  }, [playlist, songs]);

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      playTrackFromList(playlistSongs, 0);
    }
  };

  const handlePlay = (index: number) => {
    playTrackFromList(playlistSongs, index);
  };

  if (!playlist) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[playlist.color || COLORS.accentPrimary, COLORS.bgPrimary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{playlist.name}</Text>
            <Text style={styles.subtitle}>{playlistSongs.length} songs</Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
              <Ionicons name="play" size={24} color={COLORS.textPrimary} />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={playlistSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            isPlaying={isPlaying && currentTrack?.id === item.id}
            onPress={() => handlePlay(index)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgPrimary },
  errorText: { color: COLORS.textPrimary, fontSize: 18 },
  headerGradient: { paddingBottom: 24 },
  headerTop: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16 },
  backButton: { padding: 8, marginLeft: -8 },
  headerInfo: { paddingHorizontal: 24, marginTop: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.surfaceGlass, marginTop: 8 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 24 },
  playButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentPrimary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  playButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 150, paddingTop: 16 },
});
