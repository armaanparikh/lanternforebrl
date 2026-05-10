import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, BarChart3, Type, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WordVisualization from './WordVisualization';
import TranscriptionSelector from './TranscriptionSelector';
import mammoth from 'mammoth';
import { compareTextsLikePython } from '@/utils/wordMatching';

interface ComparisonResults {
  totalWords: number;
  numMatches: number;
  differentWords: number;
  sequenceSimilarity: number;
  wordOrderSimilarity: number;
}

const DocumentComparator = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [selectedTranscription1, setSelectedTranscription1] = useState<string>('');
  const [selectedTranscription2, setSelectedTranscription2] = useState<string>('');
  const [transcriptionLabel1, setTranscriptionLabel1] = useState<string>('');
  const [transcriptionLabel2, setTranscriptionLabel2] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [originalTexts, setOriginalTexts] = useState<{ text1: string; text2: string } | null>(null);
  const { toast } = useToast();

  const compareTexts = (text1: string, text2: string): ComparisonResults => {
    return compareTextsLikePython(text1, text2);
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.name.endsWith('.docx')) {
        // Handle .docx files using mammoth
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            console.log('DOCX file read:', {
              fileName: file.name,
              textLength: result.value.length,
              firstChars: result.value.substring(0, 100)
            });
            resolve(result.value);
          } catch (error) {
            console.error('Error reading DOCX file:', error);
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        // Handle .txt files
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          console.log('TXT file read:', {
            fileName: file.name,
            textLength: content.length,
            firstChars: content.substring(0, 100),
            encoding: 'UTF-8'
          });
          resolve(content);
        };
        reader.onerror = (error) => {
          console.error('Error reading TXT file:', error);
          reject(error);
        };
        reader.readAsText(file, 'UTF-8');
      }
    });
  };

  const handleFileUpload = (fileNumber: 1 | 2) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['.txt', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .txt or .docx file",
          variant: "destructive"
        });
        return;
      }
      
      if (fileNumber === 1) {
        setFile1(file);
        setText1(''); // Clear text input when file is uploaded
      } else {
        setFile2(file);
        setText2(''); // Clear text input when file is uploaded
      }
    }
  };

  const handleTextChange = (textNumber: 1 | 2) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    if (textNumber === 1) {
      setText1(text);
      if (text.trim()) {
        setFile1(null); // Clear file when text is entered
        setSelectedTranscription1(''); // Clear transcription selection
        setTranscriptionLabel1('');
      }
    } else {
      setText2(text);
      if (text.trim()) {
        setFile2(null); // Clear file when text is entered
        setSelectedTranscription2(''); // Clear transcription selection
        setTranscriptionLabel2('');
      }
    }
  };

  const handleTranscriptionSelect = (textNumber: 1 | 2) => (content: string, label: string) => {
    if (textNumber === 1) {
      setSelectedTranscription1(content);
      setTranscriptionLabel1(label);
      setText1(''); // Clear manual text
      setFile1(null); // Clear file
    } else {
      setSelectedTranscription2(content);
      setTranscriptionLabel2(label);
      setText2(''); // Clear manual text
      setFile2(null); // Clear file
    }
  };

  const handleCompare = async () => {
    const content1 = file1 ? '' : selectedTranscription1 || text1.trim();
    const content2 = file2 ? '' : selectedTranscription2 || text2.trim();
    
    if (!file1 && !content1) {
      toast({
        title: "Missing Content",
        description: "Please upload a file, select a transcription, or enter text for Document 1",
        variant: "destructive"
      });
      return;
    }

    if (!file2 && !content2) {
      toast({
        title: "Missing Content",
        description: "Please upload a file, select a transcription, or enter text for Document 2",
        variant: "destructive"
      });
      return;
    }

    setIsComparing(true);
    
    try {
      let finalContent1 = content1;
      let finalContent2 = content2;
      
      if (file1) {
        finalContent1 = await readFileContent(file1);
      }
      
      if (file2) {
        finalContent2 = await readFileContent(file2);
      }
      
      console.log('Final content before comparison:', {
        content1Length: finalContent1.length,
        content2Length: finalContent2.length,
        content1Preview: finalContent1.substring(0, 200),
        content2Preview: finalContent2.substring(0, 200)
      });
      
      // Store original texts for visualization
      setOriginalTexts({ text1: finalContent1, text2: finalContent2 });
      
      const comparisonResults = compareTexts(finalContent1, finalContent2);
      setResults(comparisonResults);
      
      toast({
        title: "Comparison Complete",
        description: "Documents have been successfully analyzed"
      });
    } catch (error) {
      console.error('Comparison error:', error);
      toast({
        title: "Comparison Failed",
        description: "An error occurred while comparing the documents",
        variant: "destructive"
      });
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Document Comparison Tool
            </CardTitle>
            <p className="text-muted-foreground">
              Compare two documents for similarity. Upload files (.txt or .docx), select saved transcriptions from the Audio Pipeline, or paste/type text directly.
              Analysis ignores capitalization, punctuation, and handles contractions and compound words exactly like the Python version.
            </p>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document 1 Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document 1</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="file">
                    <Upload className="h-4 w-4 mr-2" />
                    File
                  </TabsTrigger>
                  <TabsTrigger value="transcription">
                    <Headphones className="h-4 w-4 mr-2" />
                    Transcription
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".txt,.docx"
                      onChange={handleFileUpload(1)}
                      className="hidden"
                      id="file1-upload"
                    />
                    <label
                      htmlFor="file1-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Click to upload document
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports .txt and .docx files
                    </p>
                    {file1 && (
                      <div className="mt-3 p-2 bg-green-50 rounded border text-sm">
                        ✓ {file1.name}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="transcription">
                  <TranscriptionSelector
                    title="Select Saved Transcription"
                    onSelect={handleTranscriptionSelect(1)}
                    selectedLabel={transcriptionLabel1}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Paste or type your text here..."
                    value={text1}
                    onChange={handleTextChange(1)}
                    className="min-h-[200px]"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Document 2 Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document 2</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="file">
                    <Upload className="h-4 w-4 mr-2" />
                    File
                  </TabsTrigger>
                  <TabsTrigger value="transcription">
                    <Headphones className="h-4 w-4 mr-2" />
                    Transcription
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".txt,.docx"
                      onChange={handleFileUpload(2)}
                      className="hidden"
                      id="file2-upload"
                    />
                    <label
                      htmlFor="file2-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Click to upload document
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports .txt and .docx files
                    </p>
                    {file2 && (
                      <div className="mt-3 p-2 bg-green-50 rounded border text-sm">
                        ✓ {file2.name}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="transcription">
                  <TranscriptionSelector
                    title="Select Saved Transcription"
                    onSelect={handleTranscriptionSelect(2)}
                    selectedLabel={transcriptionLabel2}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Paste or type your text here..."
                    value={text2}
                    onChange={handleTextChange(2)}
                    className="min-h-[200px]"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Compare Button */}
        <div className="text-center">
          <Button
            onClick={handleCompare}
            disabled={(!file1 && !text1.trim() && !selectedTranscription1) || (!file2 && !text2.trim() && !selectedTranscription2) || isComparing}
            size="lg"
            className="px-8"
          >
            {isComparing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Comparing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare Documents
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Comparison Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Word Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total words (longer document):</span>
                        <span className="font-medium">{results.totalWords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matching words:</span>
                        <span className="font-medium text-green-600">{results.numMatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Different words:</span>
                        <span className="font-medium text-red-600">{results.differentWords.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-3">Similarity Metrics</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Word Order Similarity:</span>
                          <span className="font-medium">{(results.wordOrderSimilarity * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${results.wordOrderSimilarity * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Sequence Similarity:</span>
                          <span className="font-medium">{(results.sequenceSimilarity * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${results.sequenceSimilarity * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Analysis Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Comparison ignores capitalization and punctuation</li>
                  <li>• Expanded forms are converted to contractions (e.g., "do not" → "don't")</li>
                  <li>• Compound words are split for better matching (e.g., "underwater" → "under water")</li>
                  <li>• "Inaudible" markers are removed from text</li>
                  <li>• Uses the same LCS algorithm as the Python version for precise matching</li>
                  <li>• Both .txt and .docx files are fully supported</li>
                  <li>• You can upload files or paste text directly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word Visualization */}
        {originalTexts && (
          <WordVisualization
            text1={originalTexts.text1}
            text2={originalTexts.text2}
            fileName1={file1?.name || "Text Input 1"}
            fileName2={file2?.name || "Text Input 2"}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentComparator;
