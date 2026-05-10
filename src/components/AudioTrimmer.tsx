import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, SkipBack, SkipForward, Scissors, Download, Check, Flag, Trash2, Loader2 } from 'lucide-react';
import WaveformCanvas from './WaveformCanvas';
import TimeInputControls from './TimeInputControls';
import ZoomScrollControls from './ZoomScrollControls';
import { AudioTrimmerProps } from '@/types/audioTrimmer';
import { useAudioTrimmer } from '@/hooks/useAudioTrimmer';
import { formatTime } from '@/utils/timeUtils';
import { trimAudio } from '@/utils/audioProcessing';

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({
  audioUrl,
  audioFile,
  onTrimComplete,
  onSkipTrimming
}) => {
  const {
    audioRef,
    waveformRef,
    trimmerState,
    setTrimmerState,
    scrollPosition,
    setScrollPosition,
    isWaveformLoading
  } = useAudioTrimmer(audioUrl);

  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);

  // Handle canvas interactions for flag dragging
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    if (!canvas || trimmerState.duration === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const actualWidth = 800 * trimmerState.zoomLevel;
    const progress = (clickX + scrollPosition) / actualWidth;
    const clickTime = progress * trimmerState.duration;
    
    // Check if clicking near playhead (within 10px)
    const playheadProgress = trimmerState.currentTime / trimmerState.duration;
    const playheadX = playheadProgress * actualWidth - scrollPosition;
    
    // Check if clicking near start flag (within 20px)
    if (trimmerState.hasStartFlag) {
      const startProgress = trimmerState.startTime / trimmerState.duration;
      const startX = startProgress * actualWidth - scrollPosition;
      if (Math.abs(clickX - startX) < 20) {
        setTrimmerState(prev => ({
          ...prev,
          isDraggingStartFlag: true
        }));
        return;
      }
    }
    
    // Check if clicking near end flag (within 20px)
    if (trimmerState.hasEndFlag) {
      const endProgress = trimmerState.endTime / trimmerState.duration;
      const endX = endProgress * actualWidth - scrollPosition;
      if (Math.abs(clickX - endX) < 20) {
        setTrimmerState(prev => ({
          ...prev,
          isDraggingEndFlag: true
        }));
        return;
      }
    }
    
    if (Math.abs(clickX - playheadX) < 10) {
      setTrimmerState(prev => ({
        ...prev,
        isDraggingPlayhead: true
      }));
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const moveX = event.clientX - rect.left;
    const actualWidth = 800 * trimmerState.zoomLevel;
    const progress = Math.max(0, Math.min(1, (moveX + scrollPosition) / actualWidth));
    const moveTime = progress * trimmerState.duration;
    
    if (trimmerState.isDraggingPlayhead) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = Math.max(0, Math.min(moveTime, trimmerState.duration));
      }
    } else if (trimmerState.isDraggingStartFlag) {
      const maxStartTime = trimmerState.hasEndFlag ? Math.max(0, trimmerState.endTime - 0.1) : trimmerState.duration;
      setTrimmerState(prev => ({
        ...prev,
        startTime: Math.max(0, Math.min(moveTime, maxStartTime))
      }));
    } else if (trimmerState.isDraggingEndFlag) {
      const minEndTime = trimmerState.hasStartFlag ? trimmerState.startTime + 0.1 : 0;
      setTrimmerState(prev => ({
        ...prev,
        endTime: Math.max(minEndTime, Math.min(moveTime, trimmerState.duration))
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setTrimmerState(prev => ({
      ...prev,
      isSelecting: false,
      isDraggingPlayhead: false,
      isDraggingStartFlag: false,
      isDraggingEndFlag: false
    }));
  };

  const handleCanvasDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    if (!canvas || trimmerState.duration === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const actualWidth = 800 * trimmerState.zoomLevel;
    const progress = (clickX + scrollPosition) / actualWidth;
    const clickTime = progress * trimmerState.duration;
    
    // Only move playhead, don't change selection
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(clickTime, trimmerState.duration));
    }
  };

  // Flag management functions
  const addStartFlag = () => {
    setTrimmerState(prev => ({
      ...prev,
      hasStartFlag: true,
      startTime: prev.currentTime
    }));
    toast({
      title: "Start Flag Added",
      description: `Start flag set at ${formatTime(trimmerState.currentTime)}`
    });
  };

  const addEndFlag = () => {
    setTrimmerState(prev => ({
      ...prev,
      hasEndFlag: true,
      endTime: prev.currentTime
    }));
    toast({
      title: "End Flag Added",
      description: `End flag set at ${formatTime(trimmerState.currentTime)}`
    });
  };

  const removeStartFlag = () => {
    setTrimmerState(prev => ({
      ...prev,
      hasStartFlag: false,
      startTime: 0
    }));
    toast({
      title: "Start Flag Removed"
    });
  };

  const removeEndFlag = () => {
    setTrimmerState(prev => ({
      ...prev,
      hasEndFlag: false,
      endTime: prev.duration
    }));
    toast({
      title: "End Flag Removed"
    });
  };

  // Audio control functions
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (trimmerState.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, trimmerState.duration));
  };

  const playSelection = () => {
    const audio = audioRef.current;
    if (!audio || trimmerState.endTime <= trimmerState.startTime) return;
    audio.currentTime = trimmerState.startTime;
    audio.play().catch(console.error);
    const checkTime = () => {
      if (audio.currentTime >= trimmerState.endTime) {
        audio.pause();
      } else if (trimmerState.isPlaying) {
        requestAnimationFrame(checkTime);
      }
    };
    requestAnimationFrame(checkTime);
  };

  // Trim audio function
  const handleTrimAudio = async () => {
    if (trimmerState.endTime <= trimmerState.startTime) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid time range to trim",
        variant: "destructive"
      });
      return;
    }
    
    setIsTrimming(true);
    
    try {
      const { blob, file } = await trimAudio(audioUrl, audioFile, trimmerState.startTime, trimmerState.endTime);
      onTrimComplete(blob, file);
      toast({
        title: "Audio Trimmed Successfully",
        description: `Trimmed from ${formatTime(trimmerState.startTime)} to ${formatTime(trimmerState.endTime)}`
      });
    } catch (error) {
      console.error('Error trimming audio:', error);
      toast({
        title: "Trimming Failed",
        description: "An error occurred while trimming the audio",
        variant: "destructive"
      });
    } finally {
      setIsTrimming(false);
    }
  };

  // Download trimmed audio - separate from pipeline advancement
  const downloadTrimmedAudio = async () => {
    if (trimmerState.endTime <= trimmerState.startTime) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid time range to download",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const { blob, file } = await trimAudio(audioUrl, audioFile, trimmerState.startTime, trimmerState.endTime);
      
      // Create download link and trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: `Downloading trimmed audio: ${file.name}`
      });
    } catch (error) {
      console.error('Error downloading trimmed audio:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while preparing the download",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Update zoom start when zooming
  useEffect(() => {
    if (trimmerState.zoomLevel > 1) {
      const zoomDuration = trimmerState.duration / (trimmerState.zoomLevel / 2);
      const maxZoomStart = trimmerState.duration - zoomDuration;
      setTrimmerState(prev => ({
        ...prev,
        zoomStart: Math.max(0, Math.min(prev.zoomStart, maxZoomStart))
      }));
    }
  }, [trimmerState.zoomLevel, trimmerState.duration, setTrimmerState]);

  // Reset scroll position when zoom changes
  useEffect(() => {
    if (trimmerState.zoomLevel === 1) {
      setScrollPosition(0);
    } else {
      const maxScroll = Math.max(0, 800 * trimmerState.zoomLevel - 800);
      setScrollPosition(prev => Math.min(prev, maxScroll));
    }
  }, [trimmerState.zoomLevel, setScrollPosition]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Audio Trimming Tool
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add start and end flags to mark your selection. Drag the flags on the timeline to adjust timing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {isWaveformLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading waveform data...</p>
              <p className="text-xs text-muted-foreground">This may take a moment for longer audio files</p>
            </div>
          </div>
        ) : (
          <>
            {/* Timeline Controls Section - Flag Controls, Zoom, and Playback near timeline */}
            <div className="space-y-4">
              {/* Flag Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!trimmerState.hasStartFlag ? (
                    <Button variant="outline" size="sm" onClick={addStartFlag}>
                      <Flag className="h-4 w-4 mr-1 text-green-600" />
                      Add Start Flag
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-sm">
                        <Flag className="h-3 w-3 text-green-600" />
                        <span>Start: {formatTime(trimmerState.startTime)}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={removeStartFlag}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {!trimmerState.hasEndFlag ? (
                    <Button variant="outline" size="sm" onClick={addEndFlag}>
                      <Flag className="h-4 w-4 mr-1 text-red-600" />
                      Add End Flag
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-sm">
                        <Flag className="h-3 w-3 text-red-600" />
                        <span>End: {formatTime(trimmerState.endTime)}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={removeEndFlag}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Zoom Controls */}
                <ZoomScrollControls
                  trimmerState={trimmerState}
                  setTrimmerState={setTrimmerState}
                  scrollPosition={scrollPosition}
                  setScrollPosition={setScrollPosition}
                />
              </div>

              {/* Waveform Visualization */}
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {(!trimmerState.hasStartFlag && !trimmerState.hasEndFlag) ? 
                    "Add start and end flags to mark your selection. Double-click to move playhead." :
                    "Drag flags to adjust selection. Double-click to move playhead."
                  }
                </div>
                <WaveformCanvas
                  trimmerState={trimmerState}
                  scrollPosition={scrollPosition}
                  waveformData={waveformRef.current}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onDoubleClick={handleCanvasDoubleClick}
                />
                <div className="flex justify-between text-sm text-gray-600 font-mono">
                  <span>{formatTime(trimmerState.currentTime)}</span>
                  <span>{formatTime(trimmerState.duration)}</span>
                </div>
              </div>

              {/* Playback Controls - Right below timeline */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => seekTo(trimmerState.currentTime - 10)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button onClick={togglePlayback} size="lg">
                  {trimmerState.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => seekTo(trimmerState.currentTime + 10)}>
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button variant="outline" onClick={playSelection} disabled={trimmerState.endTime <= trimmerState.startTime}>
                  Play Selection
                </Button>
              </div>
            </div>

            {/* Selection Info */}
            {trimmerState.hasStartFlag && trimmerState.hasEndFlag && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-2">Selected Range:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Start: </span>
                    <span className="font-mono">{formatTime(trimmerState.startTime)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">End: </span>
                    <span className="font-mono">{formatTime(trimmerState.endTime)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration: </span>
                    <span className="font-mono">{formatTime(trimmerState.endTime - trimmerState.startTime)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Section - Precise Time Controls and Actions */}
            <div className="space-y-6 border-t pt-6">
              {/* Time Input Controls */}
              <TimeInputControls
                trimmerState={trimmerState}
                setTrimmerState={setTrimmerState}
                audioRef={audioRef}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onSkipTrimming}>
                  Skip Trimming
                </Button>

                <Button 
                  variant="outline" 
                  onClick={downloadTrimmedAudio} 
                  disabled={trimmerState.endTime <= trimmerState.startTime || isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Trimmed Audio
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleTrimAudio} 
                  disabled={trimmerState.endTime <= trimmerState.startTime || isTrimming}
                >
                  {isTrimming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Use Trimmed Audio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioTrimmer;
