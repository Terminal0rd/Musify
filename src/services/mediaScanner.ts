import * as MediaLibrary from 'expo-media-library';
import { Song } from '../types';
import { generateGradient } from '../utils/colors';

export const requestMediaPermission = async (): Promise<boolean> => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

export const scanDeviceAudio = async (): Promise<Song[]> => {
  const hasPermission = await requestMediaPermission();
  if (!hasPermission) {
    return [];
  }

  const songs: Song[] = [];
  let hasNextPage = true;
  let endCursor: string | undefined = undefined;

  while (hasNextPage) {
    const mediaPage: MediaLibrary.PagedInfo<MediaLibrary.Asset> = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 200,
      after: endCursor,
    });

    for (const asset of mediaPage.assets) {
      // Try to extract title from filename
      let title = asset.filename;
      const lastDotIndex = title.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        title = title.substring(0, lastDotIndex);
      }
      title = title.replace(/[_-]/g, ' ');

      const song: Song = {
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        duration: asset.duration,
        title: title,
        artist: 'Unknown',
        album: 'Unknown',
        genre: 'Unknown',
        gradientColors: generateGradient(asset.id),
      };
      songs.push(song);
    }

    hasNextPage = mediaPage.hasNextPage;
    endCursor = mediaPage.endCursor;
  }

  return songs;
};
