import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { Song } from '../types';
import AlbumArt from './AlbumArt';

interface ContextMenuProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onToggleLike: (song: Song) => void;
  isLiked: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  song,
  onClose,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onToggleLike,
  isLiked
}) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    []
  );

  if (!song) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.header}>
        <AlbumArt uri={song.albumArtUri} size={56} />
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist || 'Unknown Artist'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <Pressable 
          style={styles.menuItem} 
          onPress={() => { onPlayNext(song); onClose(); }}
        >
          <Ionicons name="play-forward" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuText}>Play Next</Text>
        </Pressable>

        <Pressable 
          style={styles.menuItem} 
          onPress={() => { onAddToQueue(song); onClose(); }}
        >
          <Ionicons name="list" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuText}>Add to Queue</Text>
        </Pressable>

        <Pressable 
          style={styles.menuItem} 
          onPress={() => { onAddToPlaylist(song); onClose(); }}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.textPrimary} />
          <Text style={styles.menuText}>Add to Playlist</Text>
        </Pressable>

        <Pressable 
          style={styles.menuItem} 
          onPress={() => { onToggleLike(song); onClose(); }}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? COLORS.accentPink : COLORS.textPrimary} 
          />
          <Text style={styles.menuText}>{isLiked ? 'Remove from Liked' : 'Like'}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.bgElevated,
  },
  indicator: {
    backgroundColor: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceGlass,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  menu: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default ContextMenu;
