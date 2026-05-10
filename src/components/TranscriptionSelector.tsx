import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User } from 'lucide-react';
import { getAllTranscriptionVersions } from '@/utils/transcriptionStorage';
import { TranscriptionProject, TranscriptionVersion } from '@/types/audioTranscription';

interface TranscriptionSelectorProps {
  onSelect: (content: string, label: string) => void;
  selectedLabel?: string;
  title: string;
}

const TranscriptionSelector: React.FC<TranscriptionSelectorProps> = ({ 
  onSelect, 
  selectedLabel, 
  title 
}) => {
  const allVersions = getAllTranscriptionVersions();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whisper_raw':
        return 'bg-blue-100 text-blue-800';
      case 'whisper_qa':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (allVersions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No saved transcriptions found</p>
            <p className="text-xs mt-1">
              Create some transcriptions in the Audio Pipeline first
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {selectedLabel && (
          <Badge variant="outline" className="w-fit">
            Selected: {selectedLabel}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {allVersions.map(({ project, version }) => {
            const label = `${project.name} - ${version.name}`;
            const isSelected = selectedLabel === label;
            
            return (
              <div
                key={`${project.id}-${version.id}`}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelect(version.content, label)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTypeColor(version.type)}`}
                      >
                        {version.name}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {version.content.substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(version.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{version.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptionSelector; 