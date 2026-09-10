import { create } from 'zustand';
import { Song, Playlist, LyricsSettings } from '../types';
import { scanDeviceAudio } from '../services/mediaScanner';
import {
  loadPlaylists, savePlaylists,
  loadLikedSongs, saveLikedSongs,
  loadRecentlyPlayed, saveRecentlyPlayed,
  loadPlayCount, savePlayCount,
  loadLyricsSettings, saveLyricsSettings,
  loadScanCache, saveScanCache
} from '../services/storageService';

interface LibraryState {
  songs: Song[];
  playlists: Playlist[];
  likedSongIds: string[];
  recentlyPlayed: Song[];
  playCount: Record<string, number>;
  isScanning: boolean;
  hasScanned: boolean;
  lyricsSettings: LyricsSettings;

  loadLibrary: () => Promise<void>;
  scanLibrary: () => Promise<void>;
  setSongs: (songs: Song[]) => void;
  createPlaylist: (name: string, color: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  addSongToPlaylist: (songId: string, playlistId: string) => Promise<void>;
  addSongToPlaylists: (songId: string, playlistIds: string[]) => Promise<void>;
  removeSongFromPlaylist: (songId: string, playlistId: string) => Promise<void>;
  reorderPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  toggleLike: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
  addToRecentlyPlayed: (song: Song) => Promise<void>;
  incrementPlayCount: (songId: string) => Promise<void>;
  getMostPlayed: (limit: number) => Song[];
  setLyricsSettings: (settings: LyricsSettings) => Promise<void>;
  getSongById: (id: string) => Song | undefined;
  getSongsByIds: (ids: string[]) => Song[];
  getArtists: () => string[];
  getAlbums: () => { name: string; artist: string; songs: Song[] }[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  playlists: [],
  likedSongIds: [],
  recentlyPlayed: [],
  playCount: {},
  isScanning: false,
  hasScanned: false,
  lyricsSettings: { autoFetchOnline: true },

  loadLibrary: async () => {
    try {
      const [
        playlists,
        likedSongIds,
        recentlyPlayed,
        playCount,
        lyricsSettings,
        scanCache
      ] = await Promise.all([
        loadPlaylists(),
        loadLikedSongs(),
        loadRecentlyPlayed(),
        loadPlayCount(),
        loadLyricsSettings(),
        loadScanCache()
      ]);

      set({
        playlists: playlists || [],
        likedSongIds: likedSongIds || [],
        recentlyPlayed: recentlyPlayed || [],
        playCount: playCount || {},
        lyricsSettings: lyricsSettings || { autoFetchOnline: true },
        songs: scanCache || [],
        hasScanned: !!(scanCache && scanCache.length > 0)
      });

      // Trigger background scan
      get().scanLibrary();
    } catch (error) {
      console.error('Error loading library:', error);
    }
  },

  scanLibrary: async () => {
    const { isScanning } = get();
    if (isScanning) return;

    set({ isScanning: true });
    try {
      const newSongs = await scanDeviceAudio();
      set({ songs: newSongs, hasScanned: true, isScanning: false });
      await saveScanCache(newSongs);
    } catch (error) {
      console.error('Error scanning library:', error);
      set({ isScanning: false });
    }
  },

  setSongs: (songs: Song[]) => {
    set({ songs });
  },

  createPlaylist: async (name: string, color: string) => {
    const { playlists } = get();
    const newPlaylist: Playlist = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name,
      color,
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  deletePlaylist: async (id: string) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.filter(p => p.id !== id);
    
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  renamePlaylist: async (id: string, name: string) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(p => 
      p.id === id ? { ...p, name, updatedAt: Date.now() } : p
    );
    
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  addSongToPlaylist: async (songId: string, playlistId: string) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.songIds.includes(songId)) {
          return { ...p, songIds: [...p.songIds, songId], updatedAt: Date.now() };
        }
      }
      return p;
    });
    
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  addSongToPlaylists: async (songId: string, playlistIds: string[]) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(p => {
      if (playlistIds.includes(p.id)) {
        if (!p.songIds.includes(songId)) {
          return { ...p, songIds: [...p.songIds, songId], updatedAt: Date.now() };
        }
      }
      return p;
    });
    
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  removeSongFromPlaylist: async (songId: string, playlistId: string) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { 
          ...p, 
          songIds: p.songIds.filter(id => id !== songId),
          updatedAt: Date.now() 
        };
      }
      return p;
    });
    
    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  reorderPlaylist: async (playlistId: string, fromIndex: number, toIndex: number) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        const newSongIds = [...p.songIds];
        const [movedId] = newSongIds.splice(fromIndex, 1);
        newSongIds.splice(toIndex, 0, movedId);
        return { ...p, songIds: newSongIds, updatedAt: Date.now() };
      }
      return p;
    });

    set({ playlists: updatedPlaylists });
    await savePlaylists(updatedPlaylists);
  },

  toggleLike: async (songId: string) => {
    const { likedSongIds } = get();
    const isCurrentlyLiked = likedSongIds.includes(songId);
    
    const updatedLikedIds = isCurrentlyLiked
      ? likedSongIds.filter(id => id !== songId)
      : [...likedSongIds, songId];
      
    set({ likedSongIds: updatedLikedIds });
    await saveLikedSongs(updatedLikedIds);
  },

  isLiked: (songId: string) => {
    return get().likedSongIds.includes(songId);
  },

  addToRecentlyPlayed: async (song: Song) => {
    const { recentlyPlayed } = get();
    
    // Remove the song if it's already in the list (to avoid duplicates) and prepend it
    const filtered = recentlyPlayed.filter(s => s.id !== song.id);
    const updatedRecentlyPlayed = [song, ...filtered].slice(0, 50);
    
    set({ recentlyPlayed: updatedRecentlyPlayed });
    await saveRecentlyPlayed(updatedRecentlyPlayed);
  },

  incrementPlayCount: async (songId: string) => {
    const { playCount } = get();
    const currentCount = playCount[songId] || 0;
    const updatedPlayCount = { ...playCount, [songId]: currentCount + 1 };
    
    set({ playCount: updatedPlayCount });
    await savePlayCount(updatedPlayCount);
  },

  getMostPlayed: (limit: number) => {
    const { songs, playCount } = get();
    
    const sortedIds = Object.keys(playCount).sort((a, b) => playCount[b] - playCount[a]);
    const topSongs: Song[] = [];
    
    for (const id of sortedIds) {
      if (topSongs.length >= limit) break;
      const song = songs.find(s => s.id === id);
      if (song) {
        topSongs.push(song);
      }
    }
    
    return topSongs;
  },

  setLyricsSettings: async (settings: LyricsSettings) => {
    set({ lyricsSettings: settings });
    await saveLyricsSettings(settings);
  },

  getSongById: (id: string) => {
    return get().songs.find(s => s.id === id);
  },

  getSongsByIds: (ids: string[]) => {
    const { songs } = get();
    // Maintain the order of the ids array
    return ids.map(id => songs.find(s => s.id === id)).filter((s): s is Song => !!s);
  },

  getArtists: () => {
    const { songs } = get();
    const artists = new Set(songs.map(s => s.artist));
    return Array.from(artists).sort((a, b) => a.localeCompare(b));
  },

  getAlbums: () => {
    const { songs } = get();
    const albumMap = new Map<string, { name: string; artist: string; songs: Song[] }>();
    
    songs.forEach(song => {
      const albumKey = `${song.album}-${song.artist}`;
      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          name: song.album,
          artist: song.artist,
          songs: []
        });
      }
      albumMap.get(albumKey)!.songs.push(song);
    });
    
    return Array.from(albumMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}));
