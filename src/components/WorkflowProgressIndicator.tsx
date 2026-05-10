
import React from 'react';
import { Server, Music, Zap, Shield, Check, Network } from 'lucide-react';

interface WorkflowProgressIndicatorProps {
  backendHealthy: boolean;
  audioFile: any;
  transcriptionResult: string | undefined;
  hasQaVersion: boolean;
  hasCooccurrence: boolean;
}

const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({
  backendHealthy,
  audioFile,
  transcriptionResult,
  hasQaVersion,
  hasCooccurrence
}) => {
  const steps = [
    { label: 'Backend', icon: Server, complete: backendHealthy },
    { label: 'Audio', icon: Music, complete: !!audioFile },
    { label: 'Transcribe', icon: Zap, complete: !!transcriptionResult },
    { label: 'QA', icon: Shield, complete: hasQaVersion },
    { label: 'Co-occurrence', icon: Network, complete: hasCooccurrence },
  ];

  // Calculate current step (0-indexed, -1 if none complete)
  const currentStep = steps.findIndex(s => !s.complete);
  const allComplete = currentStep === -1;

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.complete;
          const isCurrent = index === currentStep;
          
          return (
            <React.Fragment key={step.label}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete 
                      ? 'bg-green-500 text-white shadow-md' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white shadow-md ring-4 ring-blue-200' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`mt-2 text-xs font-medium ${isComplete ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${
                    steps[index + 1].complete || (isComplete && (index + 1 === currentStep))
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Completion badge */}
      {allComplete && (
        <div className="ml-6 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <Check className="h-3 w-3" />
          Complete
        </div>
      )}
    </div>
  );
};

export default WorkflowProgressIndicator;
