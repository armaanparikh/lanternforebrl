
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, ArrowLeftRight, Eye, Download } from 'lucide-react';
import { TranscriptionProject, QualityControlState } from '@/types/audioTranscription';
import { exportTranscriptionVersion } from '@/utils/transcriptionStorage';

interface SavedVersionsSectionProps {
  currentProject: TranscriptionProject;
  showComparison: boolean;
  onToggleComparison: () => void;
  onViewVersion: (content: string) => void;
}

const SavedVersionsSection: React.FC<SavedVersionsSectionProps> = ({
  currentProject,
  showComparison,
  onToggleComparison,
  onViewVersion
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Archive className="h-5 w-5 text-indigo-600" />
            </div>
            <span>Saved Transcription Versions</span>
          </div>
          {currentProject.versions.find(v => v.type === 'whisper_raw') && 
           currentProject.versions.find(v => v.type === 'whisper_qa') && (
            <Button
              variant="outline"
              onClick={onToggleComparison}
              className="flex items-center gap-2"
            >
              <ArrowLeftRight className="h-4 w-4" />
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {currentProject.versions.map((version) => (
            <div
              key={version.id}
              className="border border-gray-200 rounded-xl p-4 space-y-3 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">{version.name}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    version.type === 'whisper_raw'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {version.type === 'whisper_raw' ? 'Raw' : 'QA'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                {version.content}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {version.updatedAt.toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewVersion(version.content)}
                    className="h-8 w-8 p-0"
                    title="View/Edit"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTranscriptionVersion(version, currentProject.name)}
                    className="h-8 w-8 p-0"
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedVersionsSection;
