import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { setupTrackPlayer } from '../src/services/trackPlayerService';
import { useLibraryStore } from '../src/stores/libraryStore';
import { COLORS } from '../src/utils/colors';
import { MiniPlayer } from '../src/components/MiniPlayer';

export default function RootLayout() {
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);

  useEffect(() => {
    async function init() {
      await setupTrackPlayer();
      await loadLibrary();
    }
    init();
  }, [loadLibrary]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bgPrimary } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="add-to-playlist" options={{ presentation: 'modal' }} />
      </Stack>
      <MiniPlayer />
    </GestureHandlerRootView>
  );
}
