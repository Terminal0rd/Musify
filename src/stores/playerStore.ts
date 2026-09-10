import { create } from 'zustand';
import TrackPlayer, { State } from 'react-native-track-player';
import { Song, RepeatMode } from '../types';
import { songToTrack } from '../services/trackPlayerService';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  shuffledQueue: Song[];
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  
  setCurrentTrack: (track: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  playTrackFromList: (song: Song, songList: Song[]) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  addToQueue: (song: Song) => Promise<void>;
  playNextInQueue: (song: Song) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  clearQueue: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seekTo: (position: number) => Promise<void>;
}

const generateShuffledQueue = (queue: Song[], currentIndex: number): Song[] => {
  if (queue.length === 0) return [];
  if (currentIndex < 0 || currentIndex >= queue.length) currentIndex = 0;
  
  const currentSong = queue[currentIndex];
  const remaining = queue.filter((_, i) => i !== currentIndex);
  
  // Fisher-Yates shuffle for remaining songs
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  
  return [currentSong, ...remaining];
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  shuffledQueue: [],
  shuffleMode: false,
  repeatMode: 'off',

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (pos) => set({ position: pos }),
  setDuration: (dur) => set({ duration: dur }),

  playTrackFromList: async (song: Song, songList: Song[]) => {
    const { shuffleMode } = get();
    let index = songList.findIndex((s) => s.id === song.id);
    if (index === -1) index = 0;

    const shuffledQueue = shuffleMode ? generateShuffledQueue(songList, index) : [];

    set({
      queue: songList,
      queueIndex: index,
      currentTrack: songList[index],
      shuffledQueue,
    });

    await TrackPlayer.reset();
    const tracks = songList.map(songToTrack);
    await TrackPlayer.add(tracks);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  },

  playNext: async () => {
    const { queue, queueIndex, shuffledQueue, shuffleMode, repeatMode } = get();
    if (queue.length === 0) return;

    let nextSong: Song;
    let nextIndex = queueIndex;

    if (repeatMode === 'one') {
      nextIndex = queueIndex;
      nextSong = queue[queueIndex];
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      return;
    }

    const activeQueue = shuffleMode ? shuffledQueue : queue;
    const currentActiveIndex = activeQueue.findIndex(s => s.id === queue[queueIndex]?.id);
    let nextActiveIndex = currentActiveIndex + 1;

    if (nextActiveIndex >= activeQueue.length) {
      if (repeatMode === 'all') {
        nextActiveIndex = 0;
      } else {
        await TrackPlayer.stop();
        set({ isPlaying: false });
        return;
      }
    }

    nextSong = activeQueue[nextActiveIndex];
    nextIndex = queue.findIndex((s) => s.id === nextSong.id);

    set({ currentTrack: nextSong, queueIndex: nextIndex });
    await TrackPlayer.skip(nextIndex);
    await TrackPlayer.play();
  },

  playPrevious: async () => {
    const { queue, queueIndex, position } = get();
    if (queue.length === 0) return;

    if (position > 3) {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      return;
    }

    // Go to previous track
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = 0; // Or queue.length - 1 if you want to loop backwards
    }

    const prevSong = queue[prevIndex];
    set({ currentTrack: prevSong, queueIndex: prevIndex });
    await TrackPlayer.skip(prevIndex);
    await TrackPlayer.play();
  },

  addToQueue: async (song: Song) => {
    const { queue, shuffledQueue, shuffleMode } = get();
    const newQueue = [...queue, song];
    
    set({ queue: newQueue });
    
    if (shuffleMode) {
      // Just append to the end of shuffled queue to prevent re-shuffling current upcoming tracks
      set({ shuffledQueue: [...shuffledQueue, song] });
    }
    
    await TrackPlayer.add(songToTrack(song));
  },

  playNextInQueue: async (song: Song) => {
    const { queue, queueIndex, shuffledQueue, shuffleMode } = get();
    
    // Insert after current track
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, song);
    
    set({ queue: newQueue });
    
    if (shuffleMode) {
      const newShuffledQueue = [...shuffledQueue];
      const currentActiveIndex = newShuffledQueue.findIndex(s => s.id === queue[queueIndex]?.id);
      newShuffledQueue.splice(Math.max(0, currentActiveIndex) + 1, 0, song);
      set({ shuffledQueue: newShuffledQueue });
    }

    // Insert into TrackPlayer directly after current track
    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentTrackIndex !== undefined && currentTrackIndex !== null) {
      await TrackPlayer.add(songToTrack(song), currentTrackIndex + 1);
    } else {
      await TrackPlayer.add(songToTrack(song));
    }
  },

  removeFromQueue: async (index: number) => {
    const { queue, queueIndex, shuffledQueue, shuffleMode } = get();
    if (index < 0 || index >= queue.length) return;
    
    const removedSong = queue[index];
    const newQueue = queue.filter((_, i) => i !== index);
    
    let newQueueIndex = queueIndex;
    if (index < queueIndex) {
      newQueueIndex--;
    } else if (index === queueIndex) {
      // If we remove the currently playing song, we should probably play next, but keeping it simple:
      newQueueIndex = Math.max(0, queueIndex - 1); 
    }
    
    set({ queue: newQueue, queueIndex: newQueueIndex });
    
    if (shuffleMode) {
      set({ shuffledQueue: shuffledQueue.filter(s => s.id !== removedSong.id) });
    }
    
    await TrackPlayer.remove(index);
  },

  clearQueue: async () => {
    const { currentTrack } = get();
    if (!currentTrack) return;
    
    set({ queue: [currentTrack], queueIndex: 0, shuffledQueue: [currentTrack] });
    
    // Remove all tracks except current from TrackPlayer
    const activeIndex = await TrackPlayer.getActiveTrackIndex();
    if (activeIndex !== undefined && activeIndex !== null) {
      const queueLen = (await TrackPlayer.getQueue()).length;
      const removeIndices = Array.from({length: queueLen}, (_, i) => i).filter(i => i !== activeIndex);
      if (removeIndices.length > 0) {
        await TrackPlayer.remove(removeIndices);
      }
    } else {
      await TrackPlayer.reset();
    }
  },

  toggleShuffle: () => {
    const { shuffleMode, queue, queueIndex } = get();
    const newShuffleMode = !shuffleMode;
    
    let newShuffledQueue: Song[] = [];
    if (newShuffleMode && queue.length > 0) {
      newShuffledQueue = generateShuffledQueue(queue, queueIndex);
    }
    
    set({ 
      shuffleMode: newShuffleMode, 
      shuffledQueue: newShuffledQueue 
    });
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const nextMode: Record<RepeatMode, RepeatMode> = {
      'off': 'all',
      'all': 'one',
      'one': 'off'
    };
    
    set({ repeatMode: nextMode[repeatMode] });
  },

  seekTo: async (position: number) => {
    await TrackPlayer.seekTo(position);
    set({ position });
  }
}));
