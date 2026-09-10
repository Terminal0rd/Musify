import TrackPlayer, { 
  Event, 
  Capability, 
  AppKilledPlaybackBehavior, 
  Track 
} from 'react-native-track-player';
import { Song } from '../types';

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused || event.permanent) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
};

export const setupTrackPlayer = async () => {
  let isSetup = false;
  try {
    await TrackPlayer.getCurrentTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    isSetup = true;
  }
  return isSetup;
};

export const songToTrack = (song: Song): Track => {
  return {
    id: song.id,
    url: song.uri,
    title: song.title,
    artist: song.artist,
    artwork: song.albumArtUri,
    duration: song.duration,
  };
};

export const playTrack = async (song: Song) => {
  const track = songToTrack(song);
  await TrackPlayer.reset();
  await TrackPlayer.add([track]);
  await TrackPlayer.play();
};

export const addToTrackPlayerQueue = async (songs: Song[]) => {
  const tracks = songs.map(songToTrack);
  await TrackPlayer.add(tracks);
};
