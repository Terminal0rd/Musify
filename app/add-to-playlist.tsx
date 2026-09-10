import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '../src/stores/libraryStore';
import { COLORS } from '../src/utils/colors';

export default function AddToPlaylistScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const { playlists, addSongToPlaylists, removeSongFromPlaylist } = useLibraryStore();
  
  // Track local state for checkboxes
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    playlists.forEach(p => {
      if (p.songIds.includes(songId)) {
        initial.add(p.id);
      }
    });
    return initial;
  });

  const togglePlaylist = (id: string) => {
    setSelectedPlaylists(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    // Determine additions and removals
    playlists.forEach(p => {
      const isCurrentlyIn = p.songIds.includes(songId);
      const isSelected = selectedPlaylists.has(p.id);
      
      if (isSelected && !isCurrentlyIn) {
        addSongToPlaylists(songId, [p.id]);
      } else if (!isSelected && isCurrentlyIn) {
        removeSongFromPlaylist(songId, p.id);
      }
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add to Playlist</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedPlaylists.has(item.id);
          return (
            <TouchableOpacity style={styles.playlistRow} onPress={() => togglePlaylist(item.id)}>
              <View style={[styles.colorBox, { backgroundColor: item.color || COLORS.accentPrimary }]} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.songIds.length} songs</Text>
              </View>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={isSelected ? COLORS.accentPrimary : COLORS.textSecondary} 
              />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No playlists available. Create one first!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgElevated },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceGlass },
  headerText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 4 },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surfaceGlass, borderRadius: 16 },
  saveText: { color: COLORS.accentPrimary, fontWeight: 'bold' },
  listContent: { padding: 16 },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceGlass },
  colorBox: { width: 48, height: 48, borderRadius: 8, marginRight: 16 },
  info: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  count: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
});
