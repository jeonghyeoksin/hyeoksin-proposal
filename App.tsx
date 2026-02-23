import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ProgressVisualizer from './components/ProgressVisualizer';
import Preview from './components/Preview';
import { ProposalInput, ProposalStep, GeneratedContent } from './types';
import { generateProposalText, generateInfographicPrompts, generateImage } from './services/geminiService';
import { createAndDownloadDocx } from './services/docxService';

// Helper for file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ProposalStep>(ProposalStep.IDLE);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [inputData, setInputData] = useState<ProposalInput | null>(null);

  const startGeneration = async (data: ProposalInput) => {
    setInputData(data);
    setCurrentStep(ProposalStep.GENERATING_TEXT);
    setGeneratedContent(null);

    try {
      // 1. Generate Text
      const rawText = await generateProposalText(data);
      const paragraphs = rawText.split('\n\n').filter(p => p.trim() !== '');

      // 2. Generate Infographics
      setCurrentStep(ProposalStep.GENERATING_INFOGRAPHICS);
      const infographicPrompts = await generateInfographicPrompts(rawText);
      const infographicDataList = [];

      // Generate images in parallel or sequence
      const imagePromises = infographicPrompts.slice(0, 3).map(async (prompt, index) => {
          const b64 = await generateImage(prompt, false);
          return {
              id: `info-${index}`,
              prompt,
              imageBase64: b64 || "", // Handle failure gracefully
              positionIndex: index // will serve as relative order
          };
      });
      const infographics = await Promise.all(imagePromises);
      const validInfographics = infographics.filter(i => i.imageBase64 !== "");

      // 3. Generate Cover
      setCurrentStep(ProposalStep.GENERATING_COVER);
      const coverPrompt = `${data.myCompanyName} providing services to ${data.clientCompanyName}. ${data.proposalType}. ${data.clientIndustry} industry theme. Text on cover: '${data.myCompanyName}', '${data.clientCompanyName}', '${data.proposalType}'`;
      const coverBase64 = await generateImage(coverPrompt, true);

      // Process Business Card if exists
      let businessCardBase64: string | null = null;
      if (data.businessCardFile) {
        businessCardBase64 = await fileToBase64(data.businessCardFile);
      }

      // Process Logo if exists
      let logoBase64: string | null = null;
      if (data.myCompanyLogoFile) {
        logoBase64 = await fileToBase64(data.myCompanyLogoFile);
      }

      // 4. Compile
      setCurrentStep(ProposalStep.COMPILING);
      const content: GeneratedContent = {
        rawText,
        paragraphs,
        coverImageBase64: coverBase64,
        infographics: validInfographics,
        businessCardImageBase64: businessCardBase64,
        myCompanyLogoBase64: logoBase64
      };
      
      setGeneratedContent(content);
      setCurrentStep(ProposalStep.COMPLETED);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setCurrentStep(ProposalStep.IDLE);
    }
  };

  const handleDownload = () => {
    if (generatedContent && inputData) {
      createAndDownloadDocx(generatedContent, `${inputData.clientCompanyName}_제안서`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex flex-col items-center">
      <Header />
      
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* State: Idle or Input */}
        {currentStep === ProposalStep.IDLE && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
               <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                 당신의 비즈니스를 위한 <span className="text-indigo-600">완벽한 제안서</span>
               </h2>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                 AI가 원고 작성부터 디자인, 워드 파일 생성까지 자동으로 처리합니다.
                 몇 가지 정보만 입력하고 결과를 확인하세요.
               </p>
            </div>
            <InputForm onSubmit={startGeneration} isLoading={false} />
          </div>
        )}

        {/* State: Processing */}
        {currentStep !== ProposalStep.IDLE && currentStep !== ProposalStep.COMPLETED && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <h2 className="text-3xl font-bold text-slate-800 mb-8">혁신적인 제안서를 만들고 있습니다</h2>
             <ProgressVisualizer currentStep={currentStep} />
             <div className="mt-8 text-slate-500 text-sm animate-pulse">
               이 과정은 약 1~2분 정도 소요됩니다. 잠시만 기다려 주세요...
             </div>
           </div>
        )}

        {/* State: Completed */}
        {currentStep === ProposalStep.COMPLETED && generatedContent && (
            <div>
                 <ProgressVisualizer currentStep={currentStep} />
                 <div className="mt-10">
                    <Preview content={generatedContent} onDownload={handleDownload} />
                 </div>
                 <div className="mt-8 text-center">
                    <button 
                      onClick={() => setCurrentStep(ProposalStep.IDLE)}
                      className="text-slate-500 underline hover:text-indigo-600 text-sm"
                    >
                      새로운 제안서 만들기
                    </button>
                 </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;