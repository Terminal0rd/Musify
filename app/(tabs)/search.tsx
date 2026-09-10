import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../src/components/SearchBar';
import { SongItem } from '../../src/components/SongItem';
import { useLibraryStore } from '../../src/stores/libraryStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { COLORS } from '../../src/utils/colors';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const songs = useLibraryStore((state) => state.songs);
  const { currentTrack, isPlaying, playTrackFromList } = usePlayerStore();

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    return songs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) || 
      song.artist?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, songs]);

  const handlePlay = (index: number) => {
    playTrackFromList(filteredSongs, index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchContainer}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search songs, artists..." />
      </View>
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            isPlaying={isPlaying && currentTrack?.id === item.id}
            onPress={() => handlePlay(index)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          query.trim() ? (
            <Text style={styles.emptyText}>No results found for "{query}"</Text>
          ) : (
            <Text style={styles.emptyText}>Search your library</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  searchContainer: { padding: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 150 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
});
