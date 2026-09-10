import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { usePlayerStore } from '../stores/playerStore';
import SongItem from './SongItem';
import { Song } from '../types';

interface QueueSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const QueueSheet: React.FC<QueueSheetProps> = ({ isVisible, onClose }) => {
  const { queue, currentTrack, playTrackFromList } = usePlayerStore();
  const snapPoints = useMemo(() => ['90%'], []);
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

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

  const handlePlaySong = (song: Song) => {
    const index = queue.findIndex(s => s.id === song.id);
    if (index !== -1) {
      playTrackFromList(queue, index);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <BottomSheetFlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-two" size={24} color={COLORS.textMuted} />
            </View>
            <View style={styles.songContainer}>
              <SongItem
                song={item}
                onPress={handlePlaySong}
                isPlaying={currentTrack?.id === item.id}
              />
            </View>
          </View>
        )}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.bgSecondary,
  },
  indicator: {
    backgroundColor: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgElevated,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dragHandle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songContainer: {
    flex: 1,
  },
});

export default QueueSheet;
