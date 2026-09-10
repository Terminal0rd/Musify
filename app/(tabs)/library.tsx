import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLibraryStore } from '../../src/stores/libraryStore';
import { PlaylistCard } from '../../src/components/PlaylistCard';
import { CreatePlaylistModal } from '../../src/components/CreatePlaylistModal';
import { COLORS } from '../../src/utils/colors';

export default function LibraryScreen() {
  const playlists = useLibraryStore((state) => state.playlists);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreatePlaylist = (name: string, description: string) => {
    createPlaylist(name, description);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Your Library</Text>
        
        <TouchableOpacity 
          style={styles.likedSongsRow} 
          onPress={() => router.push('/playlist/liked')}
        >
          <View style={styles.likedIconContainer}>
            <Ionicons name="heart" size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.likedInfo}>
            <Text style={styles.likedTitle}>Liked Songs</Text>
            <Text style={styles.likedSubtitle}>Playlist</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.grid}>
          {playlists.map((playlist) => (
            <View key={playlist.id} style={styles.gridItem}>
              <PlaylistCard 
                playlist={playlist} 
                onPress={() => router.push(`/playlist/${playlist.id}`)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Ionicons name="add" size={32} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <CreatePlaylistModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCreate={handleCreatePlaylist}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scrollContent: { paddingBottom: 150 },
  header: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold', marginHorizontal: 16, marginTop: 16, marginBottom: 24 },
  likedSongsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24 },
  likedIconContainer: { width: 64, height: 64, borderRadius: 12, backgroundColor: COLORS.accentPink, justifyContent: 'center', alignItems: 'center' },
  likedInfo: { marginLeft: 16 },
  likedTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  likedSubtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  gridItem: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
  fab: { position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.accentPrimary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});
