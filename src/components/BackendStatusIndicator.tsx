import React from 'react';
import { Server, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BackendStatusIndicatorProps {
  isHealthy: boolean;
  useLocalWhisper: boolean;
}

const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  isHealthy,
}) => {
  if (isHealthy) {
    // Compact success state
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
        <CheckCircle className="h-4 w-4" />
        <span>Local Whisper ready</span>
        <span className="text-green-500">•</span>
        <code className="text-xs bg-green-100 px-1.5 py-0.5 rounded">localhost:5000</code>
      </div>
    );
  }

  // Error state - more prominent
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-red-700">Backend Required</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Not Running
            </span>
          </div>
          <p className="text-sm text-red-600 mb-2">
            Start the backend server to enable transcription:
          </p>
          <code className="block text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-mono">
            npm start
          </code>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusIndicator;
