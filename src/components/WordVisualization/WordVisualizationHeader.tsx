
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

interface WordVisualizationHeaderProps {
  fileName1: string;
  fileName2: string;
  words1Length: number;
  words2Length: number;
  connectionsLength: number;
}

const WordVisualizationHeader = ({ 
  fileName1, 
  fileName2, 
  words1Length, 
  words2Length, 
  connectionsLength 
}: WordVisualizationHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Network className="h-6 w-6" />
        Nodal Word Connection Visualization
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Visual representation showing word connections between texts with intelligent matching ({connectionsLength} total connections)
      </p>
      <div className="space-y-4">
        {/* File info */}
        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
          <div className="text-center font-medium text-blue-700">
            {fileName1} ({words1Length} words)
          </div>
          <div className="text-center font-medium text-green-700">
            {fileName2} ({words2Length} words)
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Connected words</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Unmatched words</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 opacity-60"></div>
            <span>Connection lines</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default WordVisualizationHeader;
