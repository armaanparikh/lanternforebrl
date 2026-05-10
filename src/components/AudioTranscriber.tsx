
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mic, RotateCcw, Plus, ChevronDown, ChevronUp, Lightbulb, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from './AudioPlayer';
import AudioTrimmer from './AudioTrimmer';
import TranscriptionComparison from './TranscriptionComparison';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import AudioUploadSection from './AudioUploadSection';
import TrimmingDecisionSection from './TrimmingDecisionSection';
import TranscriptionSection from './TranscriptionSection';
import QualityControlSection from './QualityControlSection';
import SavedVersionsSection from './SavedVersionsSection';
import CooccurrenceMatrix from './CooccurrenceMatrix';
import BackendStatusIndicator from './BackendStatusIndicator';
import { AudioFile, TranscriptionProject, TranscriptionVersion, TranscriptionState, QualityControlState, AudioTrimmingState } from '@/types/audioTranscription';
import { saveProject, loadProjects } from '@/utils/transcriptionStorage';
import { checkBackendHealth } from '@/services/backendApi';
import { transcribeAudioFile } from '@/utils/transcriptionService';

const AudioTranscriber = () => {
  // Audio and project state
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [currentProject, setCurrentProject] = useState<TranscriptionProject | null>(null);
  const [projects, setProjects] = useState<TranscriptionProject[]>([]);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [trimmingState, setTrimmingState] = useState<AudioTrimmingState>({
    needsTrimming: null,
    isTrimmingStep: false,
    originalFile: null,
    trimmedFile: null
  });
  const [showCurrentResults, setShowCurrentResults] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProjects = loadProjects();
    setProjects(savedProjects);

    // Check backend health on startup
    checkBackendHealth().then(healthy => {
      setBackendHealthy(healthy);
      if (!healthy) {
        toast({
          title: 'Backend Not Running',
          description: 'Please start the backend server with: npm start',
          variant: 'destructive',
        });
      }
    });
  }, []);

  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    isTranscribing: false,
    progress: 0
  });

  const [qcState, setQcState] = useState<QualityControlState>({
    originalText: '',
    editedText: '',
    hasChanges: false
  });

  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  // Check if pipeline is complete (has QA version)
  const isPipelineComplete = currentProject?.versions.find(v => v.type === 'whisper_qa') !== undefined;

  // Reset entire pipeline for new analysis
  const resetPipeline = () => {
    // Clean up old audio URL
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }
    if (trimmingState.originalFile?.url) {
      URL.revokeObjectURL(trimmingState.originalFile.url);
    }
    if (trimmingState.trimmedFile?.url) {
      URL.revokeObjectURL(trimmingState.trimmedFile.url);
    }

    setAudioFile(null);
    setCurrentProject(null);
    setTrimmingState({
      needsTrimming: null,
      isTrimmingStep: false,
      originalFile: null,
      trimmedFile: null
    });
    setTranscriptionState({
      isTranscribing: false,
      progress: 0
    });
    setQcState({
      originalText: '',
      editedText: '',
      hasChanges: false
    });
    setShowComparison(false);
    setShowCurrentResults(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Ready for New Analysis",
      description: "Upload a new audio file to begin"
    });
  };

  // Quick start new analysis (keeps current work visible but collapsed)
  const startNewAnalysis = () => {
    setShowCurrentResults(false);
    resetPipeline();
    
    // Trigger file upload dialog
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // Retrim the same audio file and re-process
  const retrimAudio = () => {
    if (!trimmingState.originalFile) {
      toast({
        title: "No Original Audio",
        description: "Original audio file not available for retrimming",
        variant: "destructive"
      });
      return;
    }

    // Clean up trimmed file URL if it exists
    if (trimmingState.trimmedFile?.url) {
      URL.revokeObjectURL(trimmingState.trimmedFile.url);
    }

    // Reset to trimming step with original file
    setAudioFile(trimmingState.originalFile);
    setTrimmingState({
      needsTrimming: true,
      isTrimmingStep: true,
      originalFile: trimmingState.originalFile,
      trimmedFile: null
    });
    
    // Reset transcription and QC states
    setCurrentProject(null);
    setTranscriptionState({
      isTranscribing: false,
      progress: 0
    });
    setQcState({
      originalText: '',
      editedText: '',
      hasChanges: false
    });
    setShowComparison(false);
    setShowCurrentResults(true);

    toast({
      title: "Retrim Audio",
      description: "You can now retrim your audio and re-process"
    });
  };

  // Handle audio file upload
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (.mp3, .wav, .m4a, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (500MB limit to prevent crashes)
    const maxSizeInBytes = 500 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File Too Large",
        description: "Audio file must be under 500MB. Please use a smaller file or compress your audio.",
        variant: "destructive"
      });
      return;
    }

    // Clean up old URLs
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }

    const url = URL.createObjectURL(file);
    const newAudioFile: AudioFile = {
      file,
      url,
      name: file.name
    };

    setAudioFile(newAudioFile);
    setShowCurrentResults(true);
    
    // Reset all pipeline states when new audio is uploaded
    setTrimmingState({
      needsTrimming: null,
      isTrimmingStep: false,
      originalFile: newAudioFile,
      trimmedFile: null
    });
    
    setCurrentProject(null);
    
    setTranscriptionState({
      isTranscribing: false,
      progress: 0
    });
    
    setQcState({
      originalText: '',
      editedText: '',
      hasChanges: false
    });
    
    setShowComparison(false);

    toast({
      title: "Audio Uploaded",
      description: `${file.name} is ready. Do you need to trim it?`
    });
  };

  const handleTrimmingDecision = (needsTrimming: boolean) => {
    if (needsTrimming) {
      setTrimmingState(prev => ({
        ...prev,
        needsTrimming: true,
        isTrimmingStep: true
      }));
    } else {
      setTrimmingState(prev => ({
        ...prev,
        needsTrimming: false,
        isTrimmingStep: false
      }));
      createProject(audioFile!);
    }
  };

  const handleTrimComplete = (trimmedBlob: Blob, trimmedFile: File) => {
    const url = URL.createObjectURL(trimmedBlob);
    const newTrimmedAudioFile: AudioFile = {
      file: trimmedFile,
      url,
      name: trimmedFile.name
    };

    setTrimmingState(prev => ({
      ...prev,
      trimmedFile: newTrimmedAudioFile,
      isTrimmingStep: false
    }));
    setAudioFile(newTrimmedAudioFile);
    createProject(newTrimmedAudioFile);
  };

  const handleSkipTrimming = () => {
    setTrimmingState(prev => ({
      ...prev,
      needsTrimming: false,
      isTrimmingStep: false
    }));
    createProject(audioFile!);
  };

  const createProject = (finalAudioFile: AudioFile) => {
    const projectId = Date.now().toString();
    const baseFileName = finalAudioFile.name.replace(/\.[^/.]+$/, '');

    const newProject: TranscriptionProject = {
      id: projectId,
      name: baseFileName,
      audioFile: finalAudioFile,
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentProject(newProject);
    setProjects(prev => {
      const updated = [...prev, newProject];
      saveProject(newProject);
      return updated;
    });
  };

  const startTranscription = async () => {
    if (!audioFile) return;

    // Check if backend is running
    if (!backendHealthy) {
      toast({
        title: "Backend Not Running",
        description: "Please start the backend server with: npm start",
        variant: "destructive"
      });
      return;
    }

    setTranscriptionState({
      isTranscribing: true,
      progress: 0
    });

    try {
      // Use local Whisper transcription
      const transcriptionText = await transcribeAudioFile(
        audioFile.file,
        {
          model: 'base',
          language: 'en'
        },
        (progressUpdate) => {
          setTranscriptionState(prev => ({
            ...prev,
            progress: progressUpdate.progress
          }));
        }
      );

      const rawVersion: TranscriptionVersion = {
        id: Date.now().toString(),
        name: 'whisper_raw',
        content: transcriptionText,
        type: 'whisper_raw',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          versions: [...currentProject.versions, rawVersion],
          currentVersion: rawVersion.id,
          updatedAt: new Date()
        };

        setCurrentProject(updatedProject);
        setProjects(prev => {
          const updated = prev.map(p => p.id === updatedProject.id ? updatedProject : p);
          saveProject(updatedProject);
          return updated;
        });

        setQcState({
          originalText: transcriptionText,
          editedText: transcriptionText,
          hasChanges: false
        });
      }

      setTranscriptionState({
        isTranscribing: false,
        progress: 100,
        result: transcriptionText
      });

      toast({
        title: "Transcription Complete",
        description: "Transcribed with local Whisper. You can now review and edit it."
      });
    } catch (error) {
      console.error('Transcription error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during transcription';
      
      setTranscriptionState({
        isTranscribing: false,
        progress: 0,
        error: errorMessage
      });

      // Show error in multiple ways to ensure visibility
      toast({
        title: "Transcription Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000 // Show for 10 seconds
      });
      
      // Also show an alert for critical errors
      if (errorMessage.includes('backend') || errorMessage.includes('Backend') || errorMessage.includes('IPC')) {
        alert(`Transcription Error: ${errorMessage}\n\nMake sure the backend server is running.`);
      }
    }
  };

  const handleTextEdit = (newText: string) => {
    setQcState(prev => ({
      ...prev,
      editedText: newText,
      hasChanges: newText !== prev.originalText
    }));
  };

  const saveQAVersion = () => {
    if (!currentProject) return;

    const existingQAVersion = currentProject.versions.find(v => v.type === 'whisper_qa');

    if (existingQAVersion && !qcState.hasChanges) {
      toast({
        title: "QA Version Already Exists",
        description: "A quality-controlled version has already been saved for this transcription",
        variant: "destructive"
      });
      return;
    }

    const qaVersion: TranscriptionVersion = {
      id: Date.now().toString(),
      name: 'whisper_qa',
      content: qcState.editedText,
      type: 'whisper_qa',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let updatedVersions;
    if (existingQAVersion) {
      updatedVersions = currentProject.versions.map(v =>
        v.type === 'whisper_qa' ? qaVersion : v
      );
    } else {
      updatedVersions = [...currentProject.versions, qaVersion];
    }

    const updatedProject = {
      ...currentProject,
      versions: updatedVersions,
      currentVersion: qaVersion.id,
      updatedAt: new Date()
    };

    setCurrentProject(updatedProject);
    setProjects(prev => {
      const updated = prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      saveProject(updatedProject);
      return updated;
    });

    setQcState(prev => ({
      ...prev,
      originalText: prev.editedText,
      hasChanges: false
    }));

    const actionText = qcState.hasChanges ? "saved with changes" : "approved as-is";
    toast({
      title: "QA Version Saved",
      description: `Quality-controlled transcription has been ${actionText}`
    });
  };

  const handleViewVersion = (content: string) => {
    setQcState({
      originalText: content,
      editedText: content,
      hasChanges: false
    });
  };

  const handleReset = () => {
    setQcState(prev => ({
      ...prev,
      editedText: prev.originalText,
      hasChanges: false
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header with enhanced design */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            LANTERN
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Language Analysis of Text Retell Networks
          </p>
        </div>

        {/* Quick Actions Bar - Always visible */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {audioFile && (
            <Button
              variant="outline"
              onClick={resetPipeline}
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          {isPipelineComplete && trimmingState.originalFile && (
            <Button
              variant="outline"
              onClick={retrimAudio}
              className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Scissors className="h-4 w-4" />
              Retrim Audio
            </Button>
          )}
          {isPipelineComplete && (
            <Button
              onClick={startNewAnalysis}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          )}
        </div>

        {/* Hidden file input for programmatic triggering */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
        />

        {/* Progress indicator */}
        <WorkflowProgressIndicator
          backendHealthy={backendHealthy}
          audioFile={audioFile}
          transcriptionResult={transcriptionState.result}
          hasQaVersion={isPipelineComplete}
          hasCooccurrence={isPipelineComplete && !!qcState.editedText}
        />

        {/* Backend Status */}
        <BackendStatusIndicator isHealthy={backendHealthy} useLocalWhisper={true} />

        {/* Pipeline Complete Banner */}
        {isPipelineComplete && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="p-2 rounded-full bg-green-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl font-semibold">Analysis Complete!</span>
              </div>
              <p className="text-green-600 text-sm">
                Your transcription for <strong>{currentProject?.name}</strong> has been saved with quality control.
              </p>
              <div className="flex gap-3 mt-2 flex-wrap justify-center">
                <Button
                  onClick={startNewAnalysis}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Analysis
                </Button>
                {trimmingState.originalFile && (
                  <Button
                    onClick={retrimAudio}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    Retrim Same Audio
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowCurrentResults(!showCurrentResults)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {showCurrentResults ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Results
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Results
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Current Results Section */}
        {showCurrentResults && (
          <>
            {/* Audio Upload */}
            <AudioUploadSection audioFile={audioFile} onAudioUpload={handleAudioUpload} />

            {/* Trimming Question */}
            {audioFile && trimmingState.needsTrimming === null && (
              <TrimmingDecisionSection onTrimmingDecision={handleTrimmingDecision} />
            )}

            {/* Audio Trimming Tool */}
            {trimmingState.isTrimmingStep && trimmingState.originalFile && (
              <AudioTrimmer
                audioUrl={trimmingState.originalFile.url}
                audioFile={trimmingState.originalFile.file}
                onTrimComplete={handleTrimComplete}
                onSkipTrimming={handleSkipTrimming}
              />
            )}

            {/* Transcription */}
            {audioFile && trimmingState.needsTrimming !== null && !trimmingState.isTrimmingStep && (
              <TranscriptionSection
                transcriptionState={transcriptionState}
                trimmingState={trimmingState}
                backendHealthy={backendHealthy}
                onStartTranscription={startTranscription}
              />
            )}

            {/* Audio Player & Quality Control */}
            {transcriptionState.result && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Audio Player */}
                <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Mic className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Audio Playback</span>
                    </h3>
                  </div>
                  <div className="p-0">
                    <AudioPlayer audioUrl={audioFile?.url || ''} title="" />
                  </div>
                </div>

                {/* Quality Control */}
                <QualityControlSection
                  qcState={qcState}
                  currentProject={currentProject}
                  onTextEdit={handleTextEdit}
                  onSaveQA={saveQAVersion}
                  onReset={handleReset}
                />
              </div>
            )}

            {/* Saved Versions */}
            {currentProject && currentProject.versions.length > 0 && (
              <SavedVersionsSection
                currentProject={currentProject}
                showComparison={showComparison}
                onToggleComparison={() => setShowComparison(!showComparison)}
                onViewVersion={handleViewVersion}
              />
            )}

            {/* Transcription Comparison */}
            {showComparison && currentProject && (
              <TranscriptionComparison
                project={currentProject}
                onClose={() => setShowComparison(false)}
              />
            )}

            {/* Co-occurrence Matrix */}
            {isPipelineComplete && qcState.editedText && (
              <CooccurrenceMatrix transcriptionText={qcState.editedText} />
            )}
          </>
        )}

        {/* Empty state when no audio and results hidden */}
        {!audioFile && !showCurrentResults && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No audio file loaded</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Audio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTranscriber;
