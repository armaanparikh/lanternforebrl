
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, FileText, CheckCircle } from 'lucide-react';
import { TranscriptionState, AudioTrimmingState } from '@/types/audioTranscription';

interface TranscriptionSectionProps {
  transcriptionState: TranscriptionState;
  trimmingState: AudioTrimmingState;
  backendHealthy: boolean;
  onStartTranscription: () => void;
}

const TranscriptionSection: React.FC<TranscriptionSectionProps> = ({
  transcriptionState,
  trimmingState,
  backendHealthy,
  onStartTranscription
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <span>Generate Transcription</span>
          {transcriptionState.result && (
            <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              ✓ Complete
            </div>
          )}
        </CardTitle>
        {trimmingState.trimmedFile && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            Using trimmed audio: {trimmingState.trimmedFile.name}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <Button
            onClick={onStartTranscription}
            disabled={transcriptionState.isTranscribing || !backendHealthy}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50"
          >
            {transcriptionState.isTranscribing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Transcribing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {!backendHealthy ? 'Backend Required - Run: npm start' : 'Start Transcription'}
              </>
            )}
          </Button>
          
          {transcriptionState.isTranscribing && (
            <div className="space-y-3">
              <Progress value={transcriptionState.progress} className="w-full h-2" />
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Processing audio... {transcriptionState.progress}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptionSection;
