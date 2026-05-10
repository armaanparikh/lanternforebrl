/**
 * Transcription service using LOCAL Whisper only
 */

import { transcribeAudio } from '@/services/backendApi';

export interface TranscriptionOptions {
  model?: string;
  language?: string;
}

export interface TranscriptionProgress {
  progress: number;
  message?: string;
}

/**
 * Transcribe audio using local Whisper backend
 */
export async function transcribeAudioFile(
  audioFile: File,
  options: TranscriptionOptions,
  onProgress?: (progress: TranscriptionProgress) => void
): Promise<string> {
  try {
    if (onProgress) {
      onProgress({ progress: 10, message: 'Sending audio to local Whisper...' });
    }

    const result = await transcribeAudio(
      audioFile,
      options.model || 'base',
      options.language || 'en',
      (progress) => {
        if (onProgress) {
          onProgress({ progress, message: 'Transcribing with local Whisper...' });
        }
      }
    );

    if (onProgress) {
      onProgress({ progress: 100, message: 'Transcription complete' });
    }

    return result.transcription;
  } catch (error) {
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend server is running.`);
  }
}
