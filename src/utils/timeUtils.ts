
import { TimeComponents } from '@/types/audioTrimmer';

// Convert seconds to time components
export const secondsToTimeComponents = (seconds: number): TimeComponents => {
  const totalMs = seconds * 1000;
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor(totalMs % 3600000 / 60000);
  const secs = Math.floor(totalMs % 60000 / 1000);
  const milliseconds = Math.floor(totalMs % 1000);
  return {
    hours,
    minutes,
    seconds: secs,
    milliseconds
  };
};

// Convert time components to seconds
export const timeComponentsToSeconds = (time: TimeComponents): number => {
  return time.hours * 3600 + time.minutes * 60 + time.seconds + time.milliseconds / 1000;
};

// Format time for display (HH:MM:SS.mmm)
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '00:00:00.000';
  const time = secondsToTimeComponents(seconds);
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}.${time.milliseconds.toString().padStart(3, '0')}`;
};
