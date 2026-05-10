import React, { useRef, useEffect, useCallback } from 'react';
import { TrimmerState } from '@/types/audioTrimmer';
import { formatTime } from '@/utils/timeUtils';

interface WaveformCanvasProps {
  trimmerState: TrimmerState;
  scrollPosition: number;
  waveformData: number[];
  onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onDoubleClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  trimmerState,
  scrollPosition,
  waveformData,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDoubleClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate visible time range for current zoom and scroll
  const getVisibleTimeRange = useCallback(() => {
    const totalWidth = 800 * trimmerState.zoomLevel;
    const visibleStartProgress = scrollPosition / totalWidth;
    const visibleEndProgress = (scrollPosition + 800) / totalWidth;
    const startTime = visibleStartProgress * trimmerState.duration;
    const endTime = visibleEndProgress * trimmerState.duration;
    return { startTime, endTime };
  }, [scrollPosition, trimmerState.zoomLevel, trimmerState.duration]);

  // Enhanced drawWaveform with flag rendering
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas ref');
      return;
    }
    console.log('Drawing waveform - data length:', waveformData.length, 'duration:', trimmerState.duration, 'zoom:', trimmerState.zoomLevel);
    if (!waveformData.length) {
      console.log('No waveform data available');
      return;
    }
    if (trimmerState.duration === 0) {
      console.log('Duration is 0');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('No canvas context');
      return;
    }
    const canvasWidth = 800;
    const canvasHeight = 120;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const centerY = canvasHeight / 2;

    // Calculate zoom parameters
    const {
      zoomLevel
    } = trimmerState;
    const totalWidth = canvasWidth * zoomLevel;
    const samplesPerPixel = waveformData.length / totalWidth;

    // Calculate visible range based on scroll position
    const visibleStartX = scrollPosition;
    const visibleEndX = scrollPosition + canvasWidth;
    console.log('Zoom rendering - total width:', totalWidth, 'samples per pixel:', samplesPerPixel, 'visible range:', visibleStartX, '-', visibleEndX);

    // Enhanced waveform rendering with better speech detection
    for (let x = 0; x < canvasWidth; x++) {
      const actualX = visibleStartX + x;
      if (actualX >= totalWidth) break;

      // Calculate which samples to process for this pixel
      const sampleStart = Math.floor(actualX * samplesPerPixel);
      const sampleEnd = Math.floor((actualX + 1) * samplesPerPixel);
      let maxAmplitude = 0;
      let rmsAmplitude = 0;
      let sampleCount = 0;

      // Calculate both peak and RMS for better speech detection
      for (let i = sampleStart; i < Math.min(sampleEnd, waveformData.length); i++) {
        const sample = waveformData[i];
        maxAmplitude = Math.max(maxAmplitude, sample);
        rmsAmplitude += sample * sample;
        sampleCount++;
      }
      if (sampleCount > 0) {
        rmsAmplitude = Math.sqrt(rmsAmplitude / sampleCount);
      }

      // Use RMS for main waveform (smoother, better for speech)
      const mainHeight = Math.max(1, rmsAmplitude * (canvasHeight * 0.8));

      // Color coding for speech detection
      let fillStyle = '#94a3b8'; // Default slate-400

      // Speech detection thresholds - consolidated weak speech categories
      if (rmsAmplitude > 0.3) {
        fillStyle = '#059669'; // Strong speech - emerald-600
      } else if (rmsAmplitude > 0.05) {
        fillStyle = '#3b82f6'; // Weak speech (consolidated) - blue-500
      }

      // Draw main waveform bar
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, centerY - mainHeight / 2, 1, mainHeight);

      // Add peak indicators for high zoom levels (4x and above)
      if (zoomLevel >= 4 && maxAmplitude > rmsAmplitude * 1.5) {
        const peakHeight = Math.max(1, maxAmplitude * (canvasHeight * 0.9));
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'; // Semi-transparent red for peaks
        ctx.fillRect(x, centerY - peakHeight / 2, 1, Math.max(1, peakHeight - mainHeight));
      }
    }

    // Draw selection overlay only if both flags are present
    if (trimmerState.hasStartFlag && trimmerState.hasEndFlag && trimmerState.endTime > trimmerState.startTime) {
      const startProgress = trimmerState.startTime / trimmerState.duration;
      const endProgress = trimmerState.endTime / trimmerState.duration;
      const startX = startProgress * totalWidth - scrollPosition;
      const endX = endProgress * totalWidth - scrollPosition;
      if (endX > 0 && startX < canvasWidth) {
        const visibleStartX = Math.max(0, startX);
        const visibleEndX = Math.min(canvasWidth, endX);
        if (visibleEndX > visibleStartX) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.fillRect(visibleStartX, 0, visibleEndX - visibleStartX, canvasHeight);
        }
      }
    }

    // Draw start flag
    if (trimmerState.hasStartFlag) {
      const startProgress = trimmerState.startTime / trimmerState.duration;
      const startX = startProgress * totalWidth - scrollPosition;
      if (startX >= -20 && startX <= canvasWidth + 20) {
        // Flag pole
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, canvasHeight);
        ctx.stroke();
        
        // Flag triangle
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX + 15, 8);
        ctx.lineTo(startX, 16);
        ctx.closePath();
        ctx.fill();
        
        // "S" label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S', startX + 7, 12);
      }
    }

    // Draw end flag
    if (trimmerState.hasEndFlag) {
      const endProgress = trimmerState.endTime / trimmerState.duration;
      const endX = endProgress * totalWidth - scrollPosition;
      if (endX >= -20 && endX <= canvasWidth + 20) {
        // Flag pole
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, canvasHeight);
        ctx.stroke();
        
        // Flag triangle
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX - 15, 8);
        ctx.lineTo(endX, 16);
        ctx.closePath();
        ctx.fill();
        
        // "E" label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('E', endX - 7, 12);
      }
    }

    // Draw playhead
    const playheadProgress = trimmerState.currentTime / trimmerState.duration;
    const playheadX = playheadProgress * totalWidth - scrollPosition;
    if (playheadX >= 0 && playheadX <= canvasWidth) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvasHeight);
      ctx.stroke();
      
      // Playhead circle
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(playheadX, 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    console.log('Enhanced waveform drawn with flags');
  }, [trimmerState, scrollPosition, waveformData]);

  // Redraw waveform when state changes
  useEffect(() => {
    console.log('Redrawing waveform due to state change');
    drawWaveform();
  }, [drawWaveform]);

  const visibleTimeRange = getVisibleTimeRange();

  return <div className="relative">
      <div className="overflow-hidden border rounded bg-gray-50" style={{
      width: '800px',
      height: '120px'
    }}>
        <canvas ref={canvasRef} width={800} height={120} className="cursor-crosshair" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onDoubleClick={onDoubleClick} style={{
        width: '800px',
        height: '120px'
      }} />
      </div>
      
      {/* Time reference for zoom level */}
      {trimmerState.zoomLevel > 1 && (
        <div className="mt-1 flex justify-between text-xs text-gray-500 font-mono">
          <span>{formatTime(visibleTimeRange.startTime)}</span>
          <span className="bg-blue-100 px-2 py-1 rounded">
            Zoom {trimmerState.zoomLevel}x • Viewing {formatTime(visibleTimeRange.endTime - visibleTimeRange.startTime)}
          </span>
          <span>{formatTime(visibleTimeRange.endTime)}</span>
        </div>
      )}
      
      {/* Speech detection legend - consolidated */}
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          <span>Strong Speech</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Weak Speech</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-slate-400 rounded"></div>
          <span>Silence</span>
        </div>
        {trimmerState.zoomLevel >= 4 && <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded opacity-60"></div>
            <span>Peaks</span>
          </div>}
      </div>
    </div>;
};

export default WaveformCanvas;
