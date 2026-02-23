import React from 'react';
import { ProposalStep } from '../types';
import { FileText, Image, Layout, FileOutput, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  currentStep: ProposalStep;
}

const steps = [
  { id: ProposalStep.GENERATING_TEXT, label: '원고 작성', icon: FileText },
  { id: ProposalStep.GENERATING_INFOGRAPHICS, label: '인포그래픽 생성', icon: Image },
  { id: ProposalStep.GENERATING_COVER, label: '표지 디자인', icon: Layout },
  { id: ProposalStep.COMPILING, label: '문서 통합', icon: FileOutput },
];

const ProgressVisualizer: React.FC<Props> = ({ currentStep }) => {
  if (currentStep === ProposalStep.IDLE) return null;

  const getStepStatus = (stepId: ProposalStep) => {
    const stepOrder = steps.findIndex(s => s.id === stepId);
    const currentOrder = steps.findIndex(s => s.id === currentStep);
    
    // If completed is the state, all are done
    if (currentStep === ProposalStep.COMPLETED) return 'completed';

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full py-10">
      <div className="relative flex justify-between items-center max-w-3xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-700"
            style={{ 
                width: currentStep === ProposalStep.COMPLETED ? '100%' : 
                       `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%` 
            }}
        ></div>

        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-white
                  ${status === 'completed' ? 'border-indigo-600 text-indigo-600' : 
                    status === 'active' ? 'border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-200' : 
                    'border-slate-300 text-slate-300'}`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : status === 'active' ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <span className={`mt-3 text-sm font-bold transition-colors duration-300
                 ${status === 'active' || status === 'completed' ? 'text-indigo-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressVisualizer;