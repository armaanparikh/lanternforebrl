import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, RefreshCw, FileAudio } from 'lucide-react';
import { AudioFile } from '@/types/audioTranscription';

interface AudioUploadSectionProps {
  audioFile: AudioFile | null;
  onAudioUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudioUploadSection: React.FC<AudioUploadSectionProps> = ({
  audioFile,
  onAudioUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className={`rounded-t-lg ${audioFile ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${audioFile ? 'bg-green-100' : 'bg-blue-100'}`}>
            {audioFile ? <FileAudio className="h-5 w-5 text-green-600" /> : <Upload className="h-5 w-5 text-blue-600" />}
          </div>
          <span>{audioFile ? 'Audio File Ready' : 'Upload Audio File'}</span>
          {audioFile && (
            <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Ready
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <input 
          type="file" 
          accept="audio/*" 
          onChange={onAudioUpload} 
          className="hidden" 
          ref={fileInputRef} 
        />
        
        {audioFile ? (
          // File uploaded state - compact view
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <FileAudio className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{audioFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(audioFile.file.size)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Change File
            </Button>
          </div>
        ) : (
          // No file state - upload prompt
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-white shadow-sm">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">Drop your audio file here</p>
                <p className="text-sm text-gray-500">or</p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Audio File
              </Button>
              <p className="text-xs text-gray-400">
                Supports MP3, WAV, M4A, FLAC • Max 500MB
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioUploadSection;