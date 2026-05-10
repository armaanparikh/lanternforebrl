
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Clock, Play, Flag } from 'lucide-react';
import { TimeComponents, TrimmerState } from '@/types/audioTrimmer';
import { secondsToTimeComponents, timeComponentsToSeconds, formatTime } from '@/utils/timeUtils';

interface TimeInputControlsProps {
  trimmerState: TrimmerState;
  setTrimmerState: React.Dispatch<React.SetStateAction<TrimmerState>>;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const TimeInputControls: React.FC<TimeInputControlsProps> = ({
  trimmerState,
  setTrimmerState,
  audioRef
}) => {
  // Time input handlers with improved validation and flag activation
  const handleTimeChange = (timeType: 'start' | 'end', component: keyof TimeComponents, value: string) => {
    const numValue = parseInt(value) || 0;
    const currentTime = timeType === 'start' ? trimmerState.startTime : trimmerState.endTime;
    const timeComponents = secondsToTimeComponents(currentTime);
    const maxValues = {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999
    };
    const clampedValue = Math.max(0, Math.min(numValue, maxValues[component]));
    const newTimeComponents = {
      ...timeComponents,
      [component]: clampedValue
    };
    const newTime = timeComponentsToSeconds(newTimeComponents);
    
    if (timeType === 'start') {
      const maxStartTime = Math.max(0, trimmerState.endTime - 0.1);
      setTrimmerState(prev => ({
        ...prev,
        startTime: Math.max(0, Math.min(newTime, maxStartTime)),
        hasStartFlag: true // Automatically activate start flag when time is changed
      }));
    } else {
      const minEndTime = trimmerState.startTime + 0.1;
      setTrimmerState(prev => ({
        ...prev,
        endTime: Math.max(minEndTime, Math.min(newTime, trimmerState.duration)),
        hasEndFlag: true // Automatically activate end flag when time is changed
      }));
    }
  };

  // Copy current playhead time to start/end
  const copyPlayheadTime = (timeType: 'start' | 'end') => {
    if (timeType === 'start') {
      const maxStartTime = Math.max(0, trimmerState.endTime - 0.1);
      setTrimmerState(prev => ({
        ...prev,
        startTime: Math.min(trimmerState.currentTime, maxStartTime),
        hasStartFlag: true // Activate flag when copying time
      }));
    } else {
      const minEndTime = trimmerState.startTime + 0.1;
      setTrimmerState(prev => ({
        ...prev,
        endTime: Math.max(trimmerState.currentTime, minEndTime),
        hasEndFlag: true // Activate flag when copying time
      }));
    }
  };

  // Play from selected time
  const playFromTime = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    audio.play().catch(console.error);
  };

  const startTimeComponents = secondsToTimeComponents(trimmerState.startTime);
  const endTimeComponents = secondsToTimeComponents(trimmerState.endTime);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">Precise Time Selection</span>
      </div>
      
      {/* Consolidated time inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Time Row */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            {trimmerState.hasStartFlag && <Flag className="h-4 w-4 text-green-600" />}
            Start Time
          </div>
          <div className="flex items-center gap-1">
            <Input 
              type="number" 
              min="0" 
              max="23" 
              value={startTimeComponents.hours.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('start', 'hours', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">:</span>
            <Input 
              type="number" 
              min="0" 
              max="59" 
              value={startTimeComponents.minutes.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('start', 'minutes', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">:</span>
            <Input 
              type="number" 
              min="0" 
              max="59" 
              value={startTimeComponents.seconds.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('start', 'seconds', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">.</span>
            <Input 
              type="number" 
              min="0" 
              max="999" 
              value={startTimeComponents.milliseconds.toString().padStart(3, '0')} 
              onChange={e => handleTimeChange('start', 'milliseconds', e.target.value)} 
              className="w-20 text-center font-mono text-sm" 
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => playFromTime(trimmerState.startTime)}
              className="ml-2 px-2"
            >
              <Play className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => copyPlayheadTime('start')}
            className="w-full text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Set to Current
          </Button>
        </div>

        {/* End Time Row */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-red-700">
            {trimmerState.hasEndFlag && <Flag className="h-4 w-4 text-red-600" />}
            End Time
          </div>
          <div className="flex items-center gap-1">
            <Input 
              type="number" 
              min="0" 
              max="23" 
              value={endTimeComponents.hours.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('end', 'hours', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">:</span>
            <Input 
              type="number" 
              min="0" 
              max="59" 
              value={endTimeComponents.minutes.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('end', 'minutes', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">:</span>
            <Input 
              type="number" 
              min="0" 
              max="59" 
              value={endTimeComponents.seconds.toString().padStart(2, '0')} 
              onChange={e => handleTimeChange('end', 'seconds', e.target.value)} 
              className="w-16 text-center font-mono text-sm" 
            />
            <span className="text-sm">.</span>
            <Input 
              type="number" 
              min="0" 
              max="999" 
              value={endTimeComponents.milliseconds.toString().padStart(3, '0')} 
              onChange={e => handleTimeChange('end', 'milliseconds', e.target.value)} 
              className="w-20 text-center font-mono text-sm" 
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => playFromTime(trimmerState.endTime)}
              className="ml-2 px-2"
            >
              <Play className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => copyPlayheadTime('end')}
            className="w-full text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Set to Current
          </Button>
        </div>
      </div>
      
      {/* Current playhead time for reference */}
      <div className="bg-gray-50 border rounded p-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current Playhead:</span>
          <span className="font-mono font-medium">{formatTime(trimmerState.currentTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default TimeInputControls;
