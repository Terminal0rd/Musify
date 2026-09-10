export interface Song {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // seconds
  filename: string;
  albumArtUri: string | null; // path to extracted album art image
  gradientColors: [string, string]; // fallback gradient
  year?: string;
  trackNumber?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
}

export interface LyricsData {
  synced: LyricLine[] | null; // timed lyrics
  plain: string | null; // plain text lyrics
  source: 'embedded' | 'lrc_file' | 'online' | 'manual' | null;
}

export interface LyricsSettings {
  autoFetchOnline: boolean;
}
