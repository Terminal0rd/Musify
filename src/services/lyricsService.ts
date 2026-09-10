import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, LyricsData, LyricLine } from '../types';
import { parseLRC } from '../utils/parseLRC';
import { extractMetadata } from './metadataService';
import { loadLyricsSettings } from './storageService';

export const fetchLyrics = async (song: Song): Promise<LyricsData | null> => {
  // 1. Check embedded lyrics from ID3 tags
  const metadata = await extractMetadata(song.uri);
  if (metadata.lyrics) {
    const parsed = parseLRC(metadata.lyrics);
    return {
      syncedLyrics: parsed.length > 0 ? parsed : undefined,
      plainLyrics: metadata.lyrics,
    };
  }

  // 2. Look for .lrc file in same directory
  try {
    const lrcUri = song.uri.substring(0, song.uri.lastIndexOf('.')) + '.lrc';
    // Remove content:// prefixes if needed for local file system check
    // This is a naive check, if the file is content:// we might not be able to getInfoAsync directly
    if (lrcUri.startsWith('file://')) {
      const lrcExists = await FileSystem.getInfoAsync(lrcUri);
      if (lrcExists.exists) {
        const lrcContent = await FileSystem.readAsStringAsync(lrcUri);
        return {
          syncedLyrics: parseLRC(lrcContent),
          plainLyrics: lrcContent,
        };
      }
    }
  } catch (error) {
    console.error('Error checking local LRC file', error);
  }

  // 3. Fetch online if allowed
  const settings = await loadLyricsSettings();
  if (settings.autoFetchOnline) {
    try {
      const artist = encodeURIComponent(song.artist || '');
      const title = encodeURIComponent(song.title || '');
      const duration = song.duration ? Math.round(song.duration) : '';
      
      const response = await fetch(`https://lrclib.net/api/get?artist_name=${artist}&track_name=${title}&duration=${duration}`);
      if (response.ok) {
        const data = await response.json();
        const lyricsData: LyricsData = {
          syncedLyrics: data.syncedLyrics ? parseLRC(data.syncedLyrics) : undefined,
          plainLyrics: data.plainLyrics || undefined,
        };
        
        await saveLyrics(song.id, lyricsData);
        return lyricsData;
      }
    } catch (error) {
      console.error('Error fetching lyrics from LRCLIB', error);
    }
  }

  return null;
};

export const getCachedLyrics = async (songId: string): Promise<LyricsData | null> => {
  try {
    const cached = await AsyncStorage.getItem(`lyrics_${songId}`);
    if (cached) {
      return JSON.parse(cached) as LyricsData;
    }
  } catch (error) {
    console.error('Error getting cached lyrics', error);
  }
  return null;
};

export const saveLyrics = async (songId: string, lyrics: LyricsData): Promise<void> => {
  try {
    await AsyncStorage.setItem(`lyrics_${songId}`, JSON.stringify(lyrics));
  } catch (error) {
    console.error('Error saving lyrics', error);
  }
};

export const clearLyricsCache = async (songId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`lyrics_${songId}`);
  } catch (error) {
    console.error('Error clearing lyrics cache', error);
  }
};
