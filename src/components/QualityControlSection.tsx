
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Save, RotateCcw } from 'lucide-react';
import { QualityControlState, TranscriptionProject } from '@/types/audioTranscription';

interface QualityControlSectionProps {
  qcState: QualityControlState;
  currentProject: TranscriptionProject | null;
  onTextEdit: (text: string) => void;
  onSaveQA: () => void;
  onReset: () => void;
}

const QualityControlSection: React.FC<QualityControlSectionProps> = ({
  qcState,
  currentProject,
  onTextEdit,
  onSaveQA,
  onReset
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <span>Quality Control</span>
          </div>
          {currentProject && currentProject.versions.find(v => v.type === 'whisper_qa') && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              QA Version Exists
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Textarea
            value={qcState.editedText}
            onChange={(e) => onTextEdit(e.target.value)}
            placeholder="Edit the transcription here..."
            className="min-h-[300px] font-mono text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <p className="text-xs text-gray-500">
            Review and edit the transcription above. You can save it as-is if no changes are needed, or make edits and then save.
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {qcState.hasChanges ? (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No changes made</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={!qcState.hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={onSaveQA}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {qcState.hasChanges ? 'Save QA Version' : 'Approve as QA'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QualityControlSection;
