
export interface TrimmerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
  isSelecting: boolean;
  isDraggingPlayhead: boolean;
  isDraggingStartFlag: boolean;
  isDraggingEndFlag: boolean;
  hasStartFlag: boolean;
  hasEndFlag: boolean;
  zoomLevel: number;
  zoomStart: number;
}

export interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface AudioTrimmerProps {
  audioUrl: string;
  audioFile: File;
  onTrimComplete: (trimmedBlob: Blob, trimmedFile: File) => void;
  onSkipTrimming: () => void;
}
