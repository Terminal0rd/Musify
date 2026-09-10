import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Song, LyricsSettings } from '../types';

export const STORAGE_KEYS = {
  playlists: '@musify_playlists',
  likedSongs: '@musify_liked_songs',
  recentlyPlayed: '@musify_recently_played',
  lyricsSettings: '@musify_lyrics_settings',
  playCount: '@musify_play_count',
  lastScanCache: '@musify_scan_cache',
};

export const savePlaylists = async (playlists: Playlist[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(playlists));
  } catch (e) {
    console.error('Error saving playlists', e);
  }
};

export const loadPlaylists = async (): Promise<Playlist[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.playlists);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading playlists', e);
    return [];
  }
};

export const saveLikedSongs = async (ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.likedSongs, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving liked songs', e);
  }
};

export const loadLikedSongs = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.likedSongs);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading liked songs', e);
    return [];
  }
};

export const saveRecentlyPlayed = async (songs: Song[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recentlyPlayed, JSON.stringify(songs));
  } catch (e) {
    console.error('Error saving recently played', e);
  }
};

export const loadRecentlyPlayed = async (): Promise<Song[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.recentlyPlayed);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading recently played', e);
    return [];
  }
};

export const saveLyricsSettings = async (settings: LyricsSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.lyricsSettings, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving lyrics settings', e);
  }
};

export const loadLyricsSettings = async (): Promise<LyricsSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.lyricsSettings);
    return data ? JSON.parse(data) : { autoFetchOnline: true };
  } catch (e) {
    console.error('Error loading lyrics settings', e);
    return { autoFetchOnline: true };
  }
};

export const savePlayCount = async (counts: Record<string, number>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.playCount, JSON.stringify(counts));
  } catch (e) {
    console.error('Error saving play counts', e);
  }
};

export const loadPlayCount = async (): Promise<Record<string, number>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.playCount);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error loading play counts', e);
    return {};
  }
};

export const saveScanCache = async (songs: Song[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.lastScanCache, JSON.stringify(songs));
  } catch (e) {
    console.error('Error saving scan cache', e);
  }
};

export const loadScanCache = async (): Promise<Song[] | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.lastScanCache);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading scan cache', e);
    return null;
  }
};
