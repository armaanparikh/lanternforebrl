import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrimmerState } from '@/types/audioTrimmer';

interface ZoomScrollControlsProps {
  trimmerState: TrimmerState;
  setTrimmerState: React.Dispatch<React.SetStateAction<TrimmerState>>;
  scrollPosition: number;
  setScrollPosition: React.Dispatch<React.SetStateAction<number>>;
}

const ZoomScrollControls: React.FC<ZoomScrollControlsProps> = ({
  trimmerState,
  setTrimmerState,
  scrollPosition,
  setScrollPosition
}) => {
  // Scroll functions
  const scrollLeft = () => {
    const newScrollPosition = Math.max(0, scrollPosition - 100);
    setScrollPosition(newScrollPosition);
  };

  const scrollRight = () => {
    const maxScroll = Math.max(0, 800 * trimmerState.zoomLevel - 800);
    const newScrollPosition = Math.min(maxScroll, scrollPosition + 100);
    setScrollPosition(newScrollPosition);
  };

  // Zoom functions with playhead centering
  const zoomIn = () => {
    const newZoomLevel = Math.min(trimmerState.zoomLevel * 2, 16);
    
    // Calculate new scroll position to center playhead
    const playheadProgress = trimmerState.currentTime / trimmerState.duration;
    const newTotalWidth = 800 * newZoomLevel;
    const playheadX = playheadProgress * newTotalWidth;
    const newScrollPosition = Math.max(0, Math.min(playheadX - 400, newTotalWidth - 800));
    
    setTrimmerState(prev => ({
      ...prev,
      zoomLevel: newZoomLevel
    }));
    setScrollPosition(newScrollPosition);
  };

  const zoomOut = () => {
    const newZoomLevel = Math.max(trimmerState.zoomLevel / 2, 1);
    
    if (newZoomLevel === 1) {
      setScrollPosition(0);
    } else {
      // Calculate new scroll position to keep playhead centered
      const playheadProgress = trimmerState.currentTime / trimmerState.duration;
      const newTotalWidth = 800 * newZoomLevel;
      const playheadX = playheadProgress * newTotalWidth;
      const newScrollPosition = Math.max(0, Math.min(playheadX - 400, newTotalWidth - 800));
      setScrollPosition(newScrollPosition);
    }
    
    setTrimmerState(prev => ({
      ...prev,
      zoomLevel: newZoomLevel
    }));
  };

  const resetZoom = () => {
    setTrimmerState(prev => ({
      ...prev,
      zoomLevel: 1
    }));
    setScrollPosition(0);
  };

  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={zoomOut} disabled={trimmerState.zoomLevel <= 1}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Zoom: {trimmerState.zoomLevel}x</span>
        <Button variant="outline" size="sm" onClick={zoomIn} disabled={trimmerState.zoomLevel >= 16}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetZoom} disabled={trimmerState.zoomLevel === 1}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {trimmerState.zoomLevel > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={scrollLeft} disabled={scrollPosition <= 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Scroll</span>
          <Button variant="outline" size="sm" onClick={scrollRight} disabled={scrollPosition >= 800 * trimmerState.zoomLevel - 800}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ZoomScrollControls;
