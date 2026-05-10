
import { useState, useRef, useEffect, useCallback } from 'react';
import { TrimmerState } from '@/types/audioTrimmer';
import { generateWaveform } from '@/utils/audioProcessing';

export const useAudioTrimmer = (audioUrl: string) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<number[]>([]);
  const animationRef = useRef<number>();

  const [trimmerState, setTrimmerState] = useState<TrimmerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    startTime: 0,
    endTime: 0,
    isSelecting: false,
    isDraggingPlayhead: false,
    isDraggingStartFlag: false,
    isDraggingEndFlag: false,
    hasStartFlag: false,
    hasEndFlag: false,
    zoomLevel: 1,
    zoomStart: 0
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isWaveformLoading, setIsWaveformLoading] = useState(true);

  // Generate waveform data from audio
  const generateWaveformData = useCallback(async () => {
    if (!audioUrl) {
      console.log('No audio URL provided');
      return;
    }
    
    console.log('Generating waveform for:', audioUrl);
    setIsWaveformLoading(true);
    
    try {
      const waveformData = await generateWaveform(audioUrl);
      console.log('Waveform data received:', waveformData.length, 'samples');
      waveformRef.current = waveformData;
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Provide fallback data
      const fallbackData = Array(1600).fill(0).map((_, i) => Math.sin(i / 50) * 0.3 + 0.4);
      console.log('Using fallback waveform data');
      waveformRef.current = fallbackData;
    } finally {
      setIsWaveformLoading(false);
    }
  }, [audioUrl]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded - duration:', audio.duration);
      setTrimmerState(prev => ({
        ...prev,
        duration: audio.duration,
        endTime: audio.duration
      }));
    };

    const handleTimeUpdate = () => {
      setTrimmerState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    const handlePlay = () => {
      setTrimmerState(prev => ({
        ...prev,
        isPlaying: true
      }));
    };

    const handlePause = () => {
      setTrimmerState(prev => ({
        ...prev,
        isPlaying: false
      }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  // Generate waveform when audio URL changes
  useEffect(() => {
    if (audioUrl) {
      console.log('Audio URL changed, generating waveform:', audioUrl);
      generateWaveformData();
    }
  }, [audioUrl, generateWaveformData]);

  return {
    audioRef,
    waveformRef,
    trimmerState,
    setTrimmerState,
    scrollPosition,
    setScrollPosition,
    isWaveformLoading
  };
};
