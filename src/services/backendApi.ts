/**
 * Backend API service for EBRL Transcription Pipeline
 * Communicates with local Flask backend for Whisper transcription and co-occurrence matrix generation
 * Uses IPC in Electron for better compatibility
 */

// Use port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001';

// Check if running in Electron
const isElectron = !!(window as any).electronAPI;

export interface TranscriptionResponse {
  success: boolean;
  transcription: string;
  model: string;
  language: string;
}

export interface CooccurrenceMatrixData {
  vocabulary: string[];
  matrix: number[][];
  pairs: Array<{
    word1: string;
    word2: string;
    value: number;
  }>;
  total_words: number;
  unique_words: number;
  window_size: number;
}

export interface CooccurrenceResponse {
  success: boolean;
  data: CooccurrenceMatrixData;
}

export interface ModelsResponse {
  models: string[];
  current: string | null;
  recommended: string;
}

/**
 * Check if backend server is running
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Transcribe audio file using local Whisper model
 */
export async function transcribeAudio(
  audioFile: File,
  model: string = 'base',
  language: string = 'en',
  onProgress?: (progress: number) => void
): Promise<TranscriptionResponse> {
  try {
    if (onProgress) {
      onProgress(10);
    }

    let data: TranscriptionResponse;

    // Use IPC in Electron to avoid CORS issues
    if (isElectron) {
      try {
        console.log('Starting Electron IPC transcription...');
        console.log('Audio file:', audioFile.name, 'Size:', audioFile.size);
        
        // Convert File to base64 for IPC using FileReader (more reliable for large files)
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
            const base64 = result.split(',')[1];
            console.log('Base64 conversion complete, length:', base64?.length || 0);
            resolve(base64);
          };
          reader.onerror = () => {
            console.error('FileReader error:', reader.error);
            reject(new Error('Failed to read audio file'));
          };
          reader.readAsDataURL(audioFile);
        });
        
        if (onProgress) {
          onProgress(20);
        }
        
        console.log('Calling electronAPI.transcribeAudio...');
        data = await (window as any).electronAPI.transcribeAudio(
          base64Data,
          audioFile.name,
          model,
          language
        );
        console.log('IPC call completed, success:', data?.success);
      } catch (ipcError) {
        console.error('Transcription IPC Error:', ipcError);
        throw new Error(`IPC Error: ${ipcError instanceof Error ? ipcError.message : 'Unknown error'}`);
      }
    } else {
      // Use fetch in browser
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', model);
      formData.append('language', language);

      const response = await fetch(`${BACKEND_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      data = await response.json();
    }

    if (onProgress) {
      onProgress(90);
    }

    if (!data.success) {
      throw new Error((data as any).error || 'Transcription failed');
    }

    if (onProgress) {
      onProgress(100);
    }

    return data;
  } catch (error) {
    if (onProgress) {
      onProgress(0);
    }
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Generate co-occurrence matrix from text
 */
export async function generateCooccurrenceMatrix(
  text: string,
  windowSize: number = 2,
  minFreq: number = 1
): Promise<CooccurrenceResponse> {
  try {
    let data: CooccurrenceResponse;

    // Use IPC in Electron
    if (isElectron) {
      data = await (window as any).electronAPI.generateCooccurrence(text, windowSize, minFreq);
    } else {
      const response = await fetch(`${BACKEND_URL}/cooccurrence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          window_size: windowSize,
          min_freq: minFreq,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Co-occurrence matrix generation failed');
      }

      data = await response.json();
    }

    if (!data.success) {
      throw new Error((data as any).error || 'Co-occurrence matrix generation failed');
    }

    return data;
  } catch (error) {
    console.error('Co-occurrence error:', error);
    throw error;
  }
}

/**
 * Get list of available Whisper models
 */
export async function getAvailableModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/models`);

    if (!response.ok) {
      throw new Error('Failed to fetch available models');
    }

    const data: ModelsResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
