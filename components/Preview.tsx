import React, { useEffect, useState, useRef } from 'react';
import { GeneratedContent } from '../types';
import { FileDown, FileText, Copy, Check, Printer, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  content: GeneratedContent;
  onStartOver: () => void;
  onRegenerateImages: () => void;
  onRegenerateCover: () => void;
  onRegenerateInfographic: (id: string) => void;
  isRegenerating: boolean;
}

const Preview: React.FC<Props> = ({ 
  content, 
  onStartOver, 
  onRegenerateImages, 
  onRegenerateCover,
  onRegenerateInfographic,
  isRegenerating 
}) => {
  const [displayHtml, setDisplayHtml] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject infographics into HTML string for Preview
    // We'll use a special marker to render them as React components later if possible, 
    // but for now let's keep the HTML injection and add buttons outside if needed.
    // Actually, let's split the HTML by sections and render them with React.
    
    let html = content.rawText;
    const sections = html.split('</h1>');
    let newHtml = "";
    
    sections.forEach((section, index) => {
        newHtml += section;
        if (index < sections.length - 1) {
            newHtml += '</h1>';
            
            const graphicIndex = Math.floor((index) / 2);
            if (index % 2 === 1 && graphicIndex < content.infographics.length) {
                 const graphic = content.infographics[graphicIndex];
                 if (graphic && graphic.imageBase64) {
                     // Add a unique ID to the container so we can target it or just keep it as is
                     newHtml += `
                        <div id="graphic-${graphic.id}" class="infographic-container" style="margin: 40px 0; text-align: center; page-break-inside: avoid; position: relative; group;">
                            <img src="data:image/png;base64,${graphic.imageBase64}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" alt="Infographic" />
                        </div>
                     `;
                 }
            }
        }
    });

    setDisplayHtml(newHtml);
  }, [content]);

  // We need a way to render the buttons for infographics. 
  // Since they are injected as HTML, we can use a portal or just re-render the whole thing as React components.
  // Let's try to parse the HTML into sections and render them.

  const renderContent = () => {
    const html = content.rawText;
    const parts = html.split('</h1>');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      let contentPart = part;
      if (index < parts.length - 1) {
        contentPart += '</h1>';
      }

      elements.push(
        <div key={`section-${index}`} dangerouslySetInnerHTML={{ __html: contentPart }} />
      );

      // Inject infographic
      const graphicIndex = Math.floor((index) / 2);
      if (index % 2 === 1 && graphicIndex < content.infographics.length) {
        const graphic = content.infographics[graphicIndex];
        if (graphic && graphic.imageBase64) {
          elements.push(
            <div key={`graphic-${graphic.id}`} className="my-10 text-center relative group">
              <img 
                src={`data:image/png;base64,${graphic.imageBase64}`} 
                className="max-width-full rounded-lg shadow-md mx-auto" 
                alt="Infographic" 
              />
              <button
                onClick={() => onRegenerateInfographic(graphic.id)}
                disabled={isRegenerating}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="이 이미지 다시 생성"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          );
        }
      }
    });

    return elements;
  };

  const handleCopy = async () => {
    if (!printRef.current) return;
    
    try {
      // Create a Blob with HTML content for rich text copy
      const type = "text/html";
      const blob = new Blob([printRef.current.innerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      
      await navigator.clipboard.write(data);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback to plain text if HTML copy fails
      try {
        await navigator.clipboard.writeText(printRef.current.innerText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (e) {
        alert("클립보드 복사에 실패했습니다.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Action Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-sm sticky top-24 z-40 gap-4 no-print">
            <div>
                <h3 className="text-lg font-bold text-slate-800">제안서 생성이 완료되었습니다!</h3>
                <p className="text-indigo-600 text-sm font-medium">
                    <span className="bg-indigo-50 px-2 py-1 rounded mr-2">Tip</span>
                    내용을 복사하여 구글 Docs(Google Docs)에 붙여넣기 하시면 바로 사용 가능합니다.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button 
                    onClick={onStartOver}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>처음부터 다시 시작하기</span>
                </button>

                <button 
                    onClick={onRegenerateImages}
                    disabled={isRegenerating}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>모든 이미지는 다시 생성하기</span>
                </button>

                <button 
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold transition shadow-lg transform hover:scale-105 ${
                        isCopied 
                        ? 'bg-green-600 text-white border-transparent' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent'
                    }`}
                >
                    {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span>{isCopied ? '복사 완료!' : '전체 내용 복사하기'}</span>
                </button>

                <a 
                    href="https://docs.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-md transform hover:scale-105"
                >
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>Google Docs 바로가기</span>
                </a>
            </div>
        </div>

      {/* Preview Content Container */}
      <div className="bg-white p-8 md:p-16 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto min-h-[1000px] print-container" ref={printRef}>
        
        {/* 1. Cover Page */}
        {content.coverImageBase64 && (
          <div className="mb-16 flex flex-col items-center justify-center border-b pb-12 border-slate-100 page-break-after-always relative group">
            {/* Logo Display on Cover */}
            {content.myCompanyLogoBase64 && (
                <div className="mb-8">
                    <img 
                        src={`data:image/png;base64,${content.myCompanyLogoBase64}`} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                    />
                </div>
            )}
            <div className="relative">
                <img 
                    src={`data:image/png;base64,${content.coverImageBase64}`} 
                    alt="Cover" 
                    className="w-[500px] h-auto object-cover rounded shadow-sm border border-slate-100" 
                />
                <button
                    onClick={onRegenerateCover}
                    disabled={isRegenerating}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="표지 이미지 다시 생성"
                >
                    <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRegenerating ? 'animate-spin' : ''}`} />
                </button>
            </div>
          </div>
        )}

        {/* 2. Main HTML Content */}
        <div className="prose prose-lg max-w-none text-slate-800">
            {renderContent()}
        </div>

        {/* 3. Business Card (Explicitly Rendered Here) */}
        {content.businessCardImageBase64 && (
            <div className="mt-20 pt-12 border-t-2 border-dashed border-slate-300 text-center page-break-before-always">
                <h2 className="text-2xl font-bold text-slate-700 mb-6">Contact Information</h2>
                <div className="inline-block p-2 bg-white rounded-lg border border-slate-200 shadow-md">
                    <img 
                        src={`data:image/png;base64,${content.businessCardImageBase64}`} 
                        alt="Business Card" 
                        className="max-w-[400px] w-full h-auto rounded"
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Preview;