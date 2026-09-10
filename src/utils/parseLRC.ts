import { LyricLine } from '../types';

export function parseLRC(lrcContent: string): LyricLine[] {
  if (!lrcContent) return [];

  const lines = lrcContent.split(/\r?\n/);
  const lyrics: LyricLine[] = [];
  const timeRegex = /\[(\d{2,}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // Skip metadata tags like [ar:Artist], [ti:Title]
    if (/^\[[a-zA-Z]+:.*\]$/.test(line) && !timeRegex.test(line)) {
      return;
    }

    let match;
    const timestamps = [];
    // Reset lastIndex for the regex just in case
    timeRegex.lastIndex = 0;
    
    // Find all timestamps in the line (e.g. [01:22.33][02:33.44]Lyric text)
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let milliseconds = 0;
      
      if (match[3]) {
        milliseconds = parseInt(match[3], 10);
        // Normalize milliseconds (could be 2 digits like .xx or 3 digits like .xxx)
        if (match[3].length === 1) milliseconds *= 100;
        else if (match[3].length === 2) milliseconds *= 10;
      }
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      timestamps.push(timeInSeconds);
    }

    if (timestamps.length > 0) {
      const text = line.replace(timeRegex, '').trim();
      timestamps.forEach(time => {
        lyrics.push({ time, text });
      });
    }
  });

  return lyrics.sort((a, b) => a.time - b.time);
}
