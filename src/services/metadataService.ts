import * as FileSystem from 'expo-file-system';
import { Song } from '../types';

// NOTE: jsmediatags in React Native may not work directly with content:// URIs on Android.
// A common approach is to copy the file to a local cache first, or use a custom FileReader.
// We try the direct approach first with error handling.
const jsmediatags = require('jsmediatags/dist/jsmediatags.min.js');

const arrayBufferToBase64 = (buffer: number[]) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa === 'function' ? btoa(binary) : binary; 
};

export const extractMetadata = async (uri: string): Promise<Partial<Song> & { lyrics?: string }> => {
  return new Promise((resolve) => {
    new jsmediatags.Reader(uri)
      .setTagsToRead(['TIT2', 'TPE1', 'TALB', 'TCON', 'TDRC', 'TYER', 'TRCK', 'APIC', 'USLT'])
      .read({
        onSuccess: async (tag: any) => {
          const tags = tag.tags;
          const result: Partial<Song> & { lyrics?: string } = {};

          if (tags.TIT2) result.title = tags.TIT2.data;
          if (tags.TPE1) result.artist = tags.TPE1.data;
          if (tags.TALB) result.album = tags.TALB.data;
          if (tags.TCON) result.genre = tags.TCON.data;
          if (tags.TDRC || tags.TYER) result.year = tags.TDRC?.data || tags.TYER?.data;
          if (tags.TRCK) result.trackNumber = tags.TRCK.data;
          if (tags.USLT) result.lyrics = tags.USLT.lyrics;

          if (tags.APIC) {
            try {
              const data = tags.APIC.data.data;
              const b64 = arrayBufferToBase64(data);
              const filename = `${FileSystem.cacheDirectory}album_art_${Date.now()}.jpg`;
              await FileSystem.writeAsStringAsync(filename, b64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              result.albumArtUri = filename;
            } catch (e) {
              console.error('Error extracting album art', e);
            }
          }

          resolve(result);
        },
        onError: (error: any) => {
          console.error('jsmediatags error:', error);
          resolve({});
        },
      });
  });
};

export const extractAlbumArt = async (uri: string, songId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    new jsmediatags.Reader(uri)
      .setTagsToRead(['APIC'])
      .read({
        onSuccess: async (tag: any) => {
          const tags = tag.tags;
          if (tags.APIC) {
            try {
              const data = tags.APIC.data.data;
              const b64 = arrayBufferToBase64(data);
              const filename = `${FileSystem.cacheDirectory}album_art_${songId}.jpg`;
              await FileSystem.writeAsStringAsync(filename, b64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              resolve(filename);
            } catch (e) {
              console.error('Error extracting album art', e);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        },
        onError: (error: any) => {
          console.error('jsmediatags error:', error);
          resolve(null);
        },
      });
  });
};

export const enrichSongMetadata = async (song: Song): Promise<Song> => {
  const metadata = await extractMetadata(song.uri);
  return {
    ...song,
    title: metadata.title || song.title,
    artist: metadata.artist || song.artist,
    album: metadata.album || song.album,
    genre: metadata.genre || song.genre,
    year: metadata.year || song.year,
    trackNumber: metadata.trackNumber || song.trackNumber,
    albumArtUri: metadata.albumArtUri || song.albumArtUri,
  };
};
