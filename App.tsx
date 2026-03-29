import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ProgressVisualizer from './components/ProgressVisualizer';
import Preview from './components/Preview';
import HeroBanner from './components/HeroBanner';
import FloatingButtons from './components/FloatingButtons';
import { ProposalInput, ProposalStep, GeneratedContent } from './types';
import { generateProposalText, generateInfographicPrompts, generateImage } from './services/geminiService';
import { RefreshCw, RotateCcw } from 'lucide-react';

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
  const [isRegenerating, setIsRegenerating] = useState(false);

  const startGeneration = async (data: ProposalInput) => {
    setInputData(data);
    setCurrentStep(ProposalStep.GENERATING_TEXT);
    setGeneratedContent(null);

    try {
      // 1. Generate Text
      const rawText = await generateProposalText(data);
      const paragraphs = rawText.split('\n\n').filter(p => p.trim() !== '');

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

      // Process Client Main Image if exists
      let clientMainImageBase64: string | null = null;
      if (data.clientMainImageFile) {
        clientMainImageBase64 = await fileToBase64(data.clientMainImageFile);
      }

      // 2. Generate Infographics
      setCurrentStep(ProposalStep.GENERATING_INFOGRAPHICS);
      const infographicPrompts = await generateInfographicPrompts(rawText);
      
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
      const coverPrompt = `${data.myCompanyName} providing ${data.proposedService || data.proposalType} to ${data.clientCompanyName}. ${data.proposalType}. ${data.clientIndustry} industry theme. Text on cover: '${data.myCompanyName}', '${data.clientCompanyName}', '${data.proposedService || data.proposalType}'`;
      const coverBase64 = await generateImage(coverPrompt, true, clientMainImageBase64);

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

  const regenerateImages = async () => {
    if (!generatedContent || !inputData) return;
    
    setIsRegenerating(true);
    try {
      // 1. Regenerate Infographics
      const infographicPrompts = await generateInfographicPrompts(generatedContent.rawText);
      const imagePromises = infographicPrompts.slice(0, 3).map(async (prompt, index) => {
          const b64 = await generateImage(prompt, false);
          return {
              id: `info-${index}`,
              prompt,
              imageBase64: b64 || "",
              positionIndex: index
          };
      });
      const infographics = await Promise.all(imagePromises);
      const validInfographics = infographics.filter(i => i.imageBase64 !== "");

      // 2. Regenerate Cover
      let clientMainImageBase64: string | null = null;
      if (inputData.clientMainImageFile) {
        clientMainImageBase64 = await fileToBase64(inputData.clientMainImageFile);
      }
      
      const coverPrompt = `${inputData.myCompanyName} providing ${inputData.proposedService || inputData.proposalType} to ${inputData.clientCompanyName}. ${inputData.proposalType}. ${inputData.clientIndustry} industry theme. Text on cover: '${inputData.myCompanyName}', '${inputData.clientCompanyName}', '${inputData.proposedService || inputData.proposalType}'`;
      const coverBase64 = await generateImage(coverPrompt, true, clientMainImageBase64);

      setGeneratedContent(prev => prev ? {
        ...prev,
        coverImageBase64: coverBase64,
        infographics: validInfographics
      } : null);
      
      alert("이미지가 성공적으로 다시 생성되었습니다.");
    } catch (error) {
      console.error("Regeneration failed:", error);
      alert("이미지 다시 생성 중 오류가 발생했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateCover = async () => {
    if (!generatedContent || !inputData) return;
    setIsRegenerating(true);
    try {
      let clientMainImageBase64: string | null = null;
      if (inputData.clientMainImageFile) {
        clientMainImageBase64 = await fileToBase64(inputData.clientMainImageFile);
      }
      const coverPrompt = `${inputData.myCompanyName} providing ${inputData.proposedService || inputData.proposalType} to ${inputData.clientCompanyName}. ${inputData.proposalType}. ${inputData.clientIndustry} industry theme. Text on cover: '${inputData.myCompanyName}', '${inputData.clientCompanyName}', '${inputData.proposedService || inputData.proposalType}'`;
      const coverBase64 = await generateImage(coverPrompt, true, clientMainImageBase64);
      setGeneratedContent(prev => prev ? { ...prev, coverImageBase64: coverBase64 } : null);
    } catch (error) {
      console.error(error);
      alert("표지 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateInfographic = async (id: string) => {
    if (!generatedContent) return;
    const graphic = generatedContent.infographics.find(g => g.id === id);
    if (!graphic) return;
    
    setIsRegenerating(true);
    try {
      const b64 = await generateImage(graphic.prompt, false);
      if (b64) {
        setGeneratedContent(prev => {
          if (!prev) return null;
          return {
            ...prev,
            infographics: prev.infographics.map(g => g.id === id ? { ...g, imageBase64: b64 } : g)
          };
        });
      }
    } catch (error) {
      console.error(error);
      alert("인포그래픽 재생성 중 오류가 발생했습니다.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 sm:pt-24 pb-12 bg-slate-50 flex flex-col items-center">
      <Header />
      
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* State: Idle or Input */}
        {currentStep === ProposalStep.IDLE && (
          <div className="animate-fade-in-up">
            <HeroBanner />
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
                    <Preview 
                      content={generatedContent} 
                      onStartOver={() => setCurrentStep(ProposalStep.IDLE)}
                      onRegenerateImages={regenerateImages}
                      onRegenerateCover={regenerateCover}
                      onRegenerateInfographic={regenerateInfographic}
                      isRegenerating={isRegenerating}
                    />
                 </div>
            </div>
        )}

      </main>

      <FloatingButtons />
    </div>
  );
};

export default App;
