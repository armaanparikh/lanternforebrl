
export interface AudioFile {
  file: File;
  url: string;
  duration?: number;
  name: string;
}

export interface TranscriptionVersion {
  id: string;
  name: string;
  content: string;
  type: 'whisper_raw' | 'whisper_qa' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptionProject {
  id: string;
  name: string;
  audioFile: AudioFile;
  versions: TranscriptionVersion[];
  currentVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptionState {
  isTranscribing: boolean;
  progress: number;
  error?: string;
  result?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

export interface QualityControlState {
  originalText: string;
  editedText: string;
  hasChanges: boolean;
  selectedRange?: {
    start: number;
    end: number;
  };
}

export interface AudioTrimmingState {
  needsTrimming: boolean | null;
  isTrimmingStep: boolean;
  originalFile: AudioFile | null;
  trimmedFile: AudioFile | null;
}
