import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/stores/libraryStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { SongItem } from '../../src/components/SongItem';
import { COLORS } from '../../src/utils/colors';

export default function HomeScreen() {
  const songs = useLibraryStore((state) => state.songs);
  const { currentTrack, isPlaying, playTrackFromList } = usePlayerStore();

  const recentlyPlayed = useMemo(() => songs.slice(0, 5), [songs]);
  const quickPicks = useMemo(() => [...songs].sort(() => 0.5 - Math.random()).slice(0, 10), [songs]);
  const mostPlayed = useMemo(() => songs.slice(5, 15), [songs]);

  const handlePlay = (songId: string, list: any[]) => {
    const index = list.findIndex(s => s.id === songId);
    if (index !== -1) {
      playTrackFromList(list, index);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Welcome Back</Text>
        
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {recentlyPlayed.map((song) => (
            <View key={song.id} style={styles.horizontalItem}>
              <SongItem
                song={song}
                isPlaying={isPlaying && currentTrack?.id === song.id}
                onPress={() => handlePlay(song.id, recentlyPlayed)}
              />
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Quick Picks</Text>
        <View style={styles.verticalList}>
          {quickPicks.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isPlaying={isPlaying && currentTrack?.id === song.id}
              onPress={() => handlePlay(song.id, quickPicks)}
            />
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Most Played</Text>
        <View style={styles.verticalList}>
          {mostPlayed.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isPlaying={isPlaying && currentTrack?.id === song.id}
              onPress={() => handlePlay(song.id, mostPlayed)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scrollContent: { paddingBottom: 150 },
  header: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  horizontalList: { paddingHorizontal: 16 },
  horizontalItem: { width: 300, marginRight: 16 },
  verticalList: { paddingHorizontal: 16 },
});
