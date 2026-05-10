
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, CheckCircle } from 'lucide-react';

interface TrimmingDecisionSectionProps {
  onTrimmingDecision: (needsTrimming: boolean) => void;
}

const TrimmingDecisionSection: React.FC<TrimmingDecisionSectionProps> = ({
  onTrimmingDecision
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <Scissors className="h-5 w-5 text-orange-600" />
          </div>
          <span>Audio Length Check</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <p className="text-gray-700 text-lg">
            Do you need to trim or select a specific portion of this audio file for transcription?
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => onTrimmingDecision(true)}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
            >
              <Scissors className="h-4 w-4" />
              Yes, I need to trim it
            </Button>
            <Button
              onClick={() => onTrimmingDecision(false)}
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <CheckCircle className="h-4 w-4" />
              No, use the entire file
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrimmingDecisionSection;
