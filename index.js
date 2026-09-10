import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/trackPlayerService';
import { ExpoRoot } from 'expo-router';

// Register the track player background service for lock screen controls
TrackPlayer.registerPlaybackService(() => PlaybackService);

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
