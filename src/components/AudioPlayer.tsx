import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title = "Audio Playback" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<number[]>([]);
  const animationRef = useRef<number>();

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    isLoading: true
  });

  // Generate waveform data from audio
  const generateWaveform = useCallback(async () => {
    if (!audioUrl) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of bars in waveform
      const blockSize = Math.floor(channelData.length / samples);
      const waveformData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j] || 0);
        }
        waveformData.push(sum / blockSize);
      }

      // Normalize waveform data
      const max = Math.max(...waveformData);
      waveformRef.current = waveformData.map(val => val / max);
      
      drawWaveform();
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Create a simple flat waveform as fallback
      waveformRef.current = Array(200).fill(0.1);
      drawWaveform();
    }
  }, [audioUrl]);

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformRef.current.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const progress = playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = width / waveformRef.current.length;
    const centerY = height / 2;

    waveformRef.current.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.8;
      const x = index * barWidth;
      
      // Determine color based on playback progress
      const barProgress = index / waveformRef.current.length;
      const isPlayed = barProgress <= progress;
      
      ctx.fillStyle = isPlayed ? '#3b82f6' : '#e5e7eb'; // Blue for played, gray for unplayed
      
      // Draw bar (centered vertically)
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // Draw playhead
    const playheadX = progress * width;
    ctx.strokeStyle = '#ef4444'; // Red playhead
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [playerState.currentTime, playerState.duration]);

  // Handle canvas click for seeking
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || playerState.duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / canvas.width;
    const newTime = progress * playerState.duration;
    
    audio.currentTime = newTime;
  };

  // Audio control functions
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (playerState.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, playerState.duration));
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  // Generate waveform when audio URL changes
  useEffect(() => {
    if (audioUrl) {
      generateWaveform();
    }
  }, [audioUrl, generateWaveform]);

  // Redraw waveform when player state changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Animation loop for smooth waveform updates
  useEffect(() => {
    const animate = () => {
      drawWaveform();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (playerState.isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playerState.isPlaying, drawWaveform]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* Waveform Visualization */}
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-24 border rounded cursor-pointer bg-gray-50"
            onClick={handleCanvasClick}
            style={{ maxHeight: '100px' }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seekTo(playerState.currentTime - 10)}
            disabled={playerState.isLoading}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={togglePlayback}
            disabled={playerState.isLoading}
            size="lg"
          >
            {playerState.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => seekTo(playerState.currentTime + 10)}
            disabled={playerState.isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Additional Timeline Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={playerState.duration || 0}
            value={playerState.currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={playerState.isLoading}
          />
        </div>

        {/* Playback Rate Controls */}
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm">Speed:</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
            <Button
              key={rate}
              variant={playerState.playbackRate === rate ? "default" : "outline"}
              size="sm"
              onClick={() => changePlaybackRate(rate)}
              disabled={playerState.isLoading}
            >
              {rate}x
            </Button>
          ))}
        </div>

        {playerState.isLoading && (
          <div className="text-center text-sm text-gray-500">
            Loading audio...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer; 