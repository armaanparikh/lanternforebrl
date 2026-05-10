import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Network, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateCooccurrenceMatrix, CooccurrenceMatrixData } from '@/services/backendApi';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CooccurrenceMatrixProps {
  transcriptionText: string;
}

const CooccurrenceMatrix: React.FC<CooccurrenceMatrixProps> = ({ transcriptionText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [matrixData, setMatrixData] = useState<CooccurrenceMatrixData | null>(null);
  const [windowSize, setWindowSize] = useState(2);
  const [minFreq, setMinFreq] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMatrix = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateCooccurrenceMatrix(transcriptionText, windowSize, minFreq);
      setMatrixData(response.data);

      toast({
        title: 'Co-occurrence Matrix Generated',
        description: `Found ${response.data.unique_words} unique words with ${response.data.pairs.length} word pairs`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate co-occurrence matrix';
      setError(errorMessage);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!matrixData) return;

    // Create CSV content as a proper word-by-word matrix
    const vocabulary = matrixData.vocabulary;
    const matrix = matrixData.matrix;
    
    // Header row: empty cell + all words
    let csvContent = ',' + vocabulary.join(',') + '\n';
    
    // Each row: word label + values for that row
    vocabulary.forEach((word, rowIndex) => {
      const rowValues = matrix[rowIndex].map(val => val.toFixed(2));
      csvContent += word + ',' + rowValues.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cooccurrence_matrix_ws${windowSize}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHeatmapColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-gray-50';
    if (intensity < 0.2) return 'bg-blue-100';
    if (intensity < 0.4) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-300';
    if (intensity < 0.8) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Network className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Co-occurrence Matrix Analysis</CardTitle>
              <CardDescription>
                Analyze word relationships in your transcription
              </CardDescription>
            </div>
          </div>
          {matrixData && (
            <Button onClick={downloadCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Window Size: {windowSize}</Label>
              <Slider
                value={[windowSize]}
                onValueChange={(value) => setWindowSize(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Number of words to look ahead for co-occurrence
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Frequency: {minFreq}</Label>
              <Slider
                value={[minFreq]}
                onValueChange={(value) => setMinFreq(value[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Minimum times a word must appear
              </p>
            </div>
          </div>

          <Button
            onClick={generateMatrix}
            disabled={isLoading || !transcriptionText}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Matrix...
              </>
            ) : (
              <>
                <Network className="mr-2 h-4 w-4" />
                Generate Co-occurrence Matrix
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Matrix Display */}
        {matrixData && (
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {matrixData.total_words}
                </div>
                <div className="text-xs text-gray-600">Total Words</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {matrixData.unique_words}
                </div>
                <div className="text-xs text-gray-600">Unique Words</div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {matrixData.pairs.length}
                </div>
                <div className="text-xs text-gray-600">Word Pairs</div>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">
                  {matrixData.window_size}
                </div>
                <div className="text-xs text-gray-600">Window Size</div>
              </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="pairs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pairs">Top Word Pairs</TabsTrigger>
                <TabsTrigger value="heatmap">Heatmap Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="pairs" className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Word 1</TableHead>
                        <TableHead>Word 2</TableHead>
                        <TableHead className="text-right">Co-occurrence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matrixData.pairs.slice(0, 50).map((pair, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{pair.word1}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pair.word2}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {pair.value.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {matrixData.pairs.length > 50 && (
                  <p className="text-sm text-gray-500 text-center">
                    Showing top 50 of {matrixData.pairs.length} word pairs. Download CSV for full data.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="heatmap" className="space-y-4">
                <p className="text-sm text-gray-600">
                  Heatmap showing co-occurrence strength (top 20 words)
                </p>
                <div className="overflow-auto max-h-96">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-100 sticky left-0"></th>
                        {matrixData.vocabulary.slice(0, 20).map((word, i) => (
                          <th
                            key={i}
                            className="border p-2 bg-gray-100 text-xs transform -rotate-45 h-24 min-w-[40px]"
                          >
                            <div className="w-full flex items-end justify-center">
                              {word}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.vocabulary.slice(0, 20).map((word1, i) => {
                        const maxValue = Math.max(...matrixData.matrix[i].slice(0, 20));
                        return (
                          <tr key={i}>
                            <td className="border p-2 bg-gray-100 font-medium text-xs sticky left-0">
                              {word1}
                            </td>
                            {matrixData.matrix[i].slice(0, 20).map((value, j) => (
                              <td
                                key={j}
                                className={`border p-2 text-center text-xs ${getHeatmapColor(
                                  value,
                                  maxValue
                                )}`}
                                title={`${word1} - ${matrixData.vocabulary[j]}: ${value.toFixed(2)}`}
                              >
                                {value > 0 ? value.toFixed(1) : ''}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {matrixData.vocabulary.length > 20 && (
                  <p className="text-sm text-gray-500 text-center">
                    Showing top 20×20 words. Download CSV for full matrix.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CooccurrenceMatrix;
