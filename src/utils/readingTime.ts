import readingTime from 'reading-time';

export function getReadingTime(content: string): number {
  const stats = readingTime(content);
  return Math.max(1, Math.ceil(stats.minutes));
}

