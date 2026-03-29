import React from 'react';
import { ProposalStep } from '../types';
import { FileText, Image, Layout, FileOutput, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  currentStep: ProposalStep;
}

const steps = [
  { id: ProposalStep.GENERATING_TEXT, label: '원고 작성', icon: FileText, description: 'AI가 핵심 전략과 원고를 작성 중입니다' },
  { id: ProposalStep.GENERATING_INFOGRAPHICS, label: '인포그래픽 생성', icon: Image, description: '제안서에 어울리는 시각 자료를 생성 중입니다' },
  { id: ProposalStep.GENERATING_COVER, label: '표지 디자인', icon: Layout, description: '브랜드 아이덴티티를 담은 표지를 디자인 중입니다' },
  { id: ProposalStep.COMPILING, label: '문서 통합', icon: FileOutput, description: '모든 자료를 하나로 통합하여 완성 중입니다' },
];

const ProgressVisualizer: React.FC<Props> = ({ currentStep }) => {
  if (currentStep === ProposalStep.IDLE) return null;

  const getPercentage = () => {
    if (currentStep === ProposalStep.COMPLETED) return 100;
    const currentOrder = steps.findIndex(s => s.id === currentStep);
    if (currentOrder === -1) return 0;
    
    // Calculate percentage based on step order
    // 0: 15%, 1: 40%, 2: 65%, 3: 90%
    return 15 + (currentOrder * 25);
  };

  const percentage = getPercentage();

  const getStepStatus = (stepId: ProposalStep) => {
    const stepOrder = steps.findIndex(s => s.id === stepId);
    const currentOrder = steps.findIndex(s => s.id === currentStep);
    
    // If completed is the state, all are done
    if (currentStep === ProposalStep.COMPLETED) return 'completed';

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'active';
    return 'pending';
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Progress Circle */}
        <div className="relative flex flex-col items-center mb-16">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - percentage / 100) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{
                  strokeDasharray: `${2 * Math.PI * 88}`,
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
              </defs>
            </svg>

            {/* Percentage Text */}
            <div className="flex flex-col items-center justify-center z-10">
              <motion.span 
                key={percentage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600"
              >
                {percentage}%
              </motion.span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Processing</span>
            </div>

            {/* Decorative Pulse */}
            {currentStep !== ProposalStep.COMPLETED && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-indigo-500 -z-10"
              />
            )}
          </div>

          {/* Current Step Description */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mt-8 text-center"
            >
              <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center">
                {currentStepData?.label || '완성되었습니다!'}
                {currentStep !== ProposalStep.COMPLETED && <Sparkles className="w-5 h-5 text-indigo-500 ml-2 animate-pulse" />}
              </h3>
              <p className="text-slate-500 mt-2">{currentStepData?.description || '제안서가 성공적으로 생성되었습니다.'}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Indicators */}
        <div className="relative grid grid-cols-4 gap-4">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 transform -translate-y-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center relative">
                <motion.div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 bg-white shadow-sm
                    ${status === 'completed' ? 'border-indigo-500 text-indigo-500 bg-indigo-50' : 
                      status === 'active' ? 'border-indigo-600 text-indigo-600 scale-110 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : 
                      'border-slate-200 text-slate-300'}`}
                  whileHover={status !== 'pending' ? { scale: 1.05 } : {}}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>
                
                <div className="mt-4 flex flex-col items-center">
                  <span className={`text-xs font-black uppercase tracking-tighter mb-1 ${status === 'active' ? 'text-indigo-600' : 'text-slate-300'}`}>
                    Step 0{idx + 1}
                  </span>
                  <span className={`text-sm font-bold transition-colors duration-300 text-center
                     ${status === 'active' || status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressVisualizer;
