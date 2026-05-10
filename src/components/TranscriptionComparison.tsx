import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, ArrowLeftRight, CheckCircle, AlertCircle } from 'lucide-react';
import { TranscriptionProject, TranscriptionVersion } from '@/types/audioTranscription';
import WordVisualization from './WordVisualization';
import { compareTextsLikePython } from '@/utils/wordMatching';

interface TranscriptionComparisonProps {
  project: TranscriptionProject;
  onClose: () => void;
}

interface ComparisonResults {
  totalWords: number;
  numMatches: number;
  differentWords: number;
  sequenceSimilarity: number;
  wordOrderSimilarity: number;
}

const TranscriptionComparison: React.FC<TranscriptionComparisonProps> = ({ project, onClose }) => {
  const [rawVersion, setRawVersion] = useState<TranscriptionVersion | null>(null);
  const [qaVersion, setQaVersion] = useState<TranscriptionVersion | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    // Find the raw and QA versions
    const raw = project.versions.find(v => v.type === 'whisper_raw');
    const qa = project.versions.find(v => v.type === 'whisper_qa');
    
    setRawVersion(raw || null);
    setQaVersion(qa || null);
  }, [project]);

  useEffect(() => {
    if (rawVersion && qaVersion) {
      setIsComparing(true);
      
      try {
        const results = compareTextsLikePython(rawVersion.content, qaVersion.content);
        setComparisonResults(results);
      } catch (error) {
        console.error('Comparison error:', error);
      } finally {
        setIsComparing(false);
      }
    }
  }, [rawVersion, qaVersion]);

  const status = comparisonResults ? (() => {
    const similarity = (comparisonResults.numMatches / comparisonResults.totalWords) * 100;
    
    if (similarity >= 95) {
      return { color: 'green', icon: CheckCircle, text: 'Minimal Changes' };
    } else if (similarity >= 80) {
      return { color: 'yellow', icon: AlertCircle, text: 'Moderate Changes' };
    } else {
      return { color: 'red', icon: AlertCircle, text: 'Significant Changes' };
    }
  })() : null;

  if (!rawVersion || !qaVersion) {
    return (
             <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <ArrowLeftRight className="h-5 w-5" />
             Transcription Comparison
           </CardTitle>
         </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cannot Compare Versions
            </h3>
            <p className="text-gray-600 mb-4">
              Both whisper_raw and whisper_qa versions are required for comparison.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={rawVersion ? "default" : "secondary"}>
                  whisper_raw {rawVersion ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={qaVersion ? "default" : "secondary"}>
                  whisper_qa {qaVersion ? "✓" : "✗"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
                 <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <ArrowLeftRight className="h-5 w-5" />
             Transcription Comparison: {project.name}
           </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                Raw: {rawVersion.updatedAt.toLocaleDateString()}
              </Badge>
              <ArrowLeftRight className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="bg-green-50">
                QA: {qaVersion.updatedAt.toLocaleDateString()}
              </Badge>
            </div>
            {status && (
              <div className="flex items-center gap-2">
                <status.icon className={`h-4 w-4 text-${status.color}-600`} />
                <span className={`text-sm text-${status.color}-600`}>
                  {status.text}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Comparison Results */}
      {comparisonResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparison Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg mb-3">Word Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total words (longer document):</span>
                    <span className="font-medium">{comparisonResults.totalWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matching words:</span>
                    <span className="font-medium text-green-600">{comparisonResults.numMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Different words:</span>
                    <span className="font-medium text-red-600">{comparisonResults.differentWords.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg mb-3">Similarity Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Word similarity:</span>
                    <span className="font-medium">
                      {((comparisonResults.numMatches / comparisonResults.totalWords) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sequence similarity:</span>
                    <span className="font-medium">
                      {(comparisonResults.sequenceSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Word order similarity:</span>
                    <span className="font-medium">
                      {(comparisonResults.wordOrderSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                Original (whisper_raw)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {rawVersion.content}
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {rawVersion.content.split(' ').length} words
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">
                Quality Controlled (whisper_qa)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {qaVersion.content}
              </pre>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {qaVersion.content.split(' ').length} words
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word-by-Word Visualization */}
      {comparisonResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Word-by-Word Comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visual comparison showing word matches and differences between the original and quality-controlled versions.
            </p>
          </CardHeader>
                     <CardContent>
             <WordVisualization 
               text1={rawVersion.content}
               text2={qaVersion.content}
               fileName1="whisper_raw"
               fileName2="whisper_qa"
             />
           </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranscriptionComparison; 