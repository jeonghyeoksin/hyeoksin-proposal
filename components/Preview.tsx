import React, { useEffect, useState, useRef } from 'react';
import { GeneratedContent } from '../types';
import { FileDown, FileText, Copy, Check, Printer } from 'lucide-react';

interface Props {
  content: GeneratedContent;
  onDownload: () => void;
}

const Preview: React.FC<Props> = ({ content, onDownload }) => {
  const [displayHtml, setDisplayHtml] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject infographics into HTML string for Preview
    let html = content.rawText;
    
    const sections = html.split('</h1>');
    let newHtml = "";
    
    sections.forEach((section, index) => {
        newHtml += section;
        if (index < sections.length - 1) {
            newHtml += '</h1>'; // Add the tag back
            
            // Inject infographic if available for this section index
            const graphicIndex = Math.floor((index) / 2);
            if (index % 2 === 1 && graphicIndex < content.infographics.length) {
                 const graphic = content.infographics[graphicIndex];
                 if (graphic && graphic.imageBase64) {
                     newHtml += `
                        <div class="infographic-container" style="margin: 40px 0; text-align: center; page-break-inside: avoid;">
                            <img src="data:image/png;base64,${graphic.imageBase64}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" alt="Infographic" />
                            <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 8px;">AI Generated Visualization</p>
                        </div>
                     `;
                 }
            }
        }
    });

    setDisplayHtml(newHtml);
  }, [content]);

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

  const handlePdfDownload = () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    const element = printRef.current;
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: '제안서_draft.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore - html2pdf is loaded via CDN in index.html
    if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
            setIsGeneratingPdf(false);
        }).catch((err: any) => {
            console.error(err);
            setIsGeneratingPdf(false);
            alert("PDF 생성 중 오류가 발생했습니다.");
        });
    } else {
        alert("PDF 라이브러리 로드에 실패했습니다.");
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Action Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-sm sticky top-24 z-40 gap-4 no-print">
            <div>
                <h3 className="text-lg font-bold text-slate-800">제안서 생성이 완료되었습니다!</h3>
                <p className="text-slate-500 text-sm">아래 버튼을 사용하여 결과물을 저장하거나 복사하세요.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button 
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition border ${
                        isCopied 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? '복사 완료' : '내용 복사'}</span>
                </button>

                <button 
                    onClick={handlePdfDownload}
                    disabled={isGeneratingPdf}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold transition shadow-md disabled:bg-slate-500"
                >
                    {isGeneratingPdf ? <Printer className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
                    <span>PDF 다운로드</span>
                </button>

                <button 
                    onClick={onDownload}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition transform hover:scale-105"
                >
                    <FileDown className="w-5 h-5" />
                    <span>WORD 다운로드</span>
                </button>
            </div>
        </div>

      {/* Preview Content Container */}
      <div className="bg-white p-8 md:p-16 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto min-h-[1000px] print-container" ref={printRef}>
        
        {/* 1. Cover Page */}
        {content.coverImageBase64 && (
          <div className="mb-16 flex flex-col items-center justify-center border-b pb-12 border-slate-100 page-break-after-always">
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
            <div className="relative group">
                <img 
                    src={`data:image/png;base64,${content.coverImageBase64}`} 
                    alt="Cover" 
                    className="w-[500px] h-auto object-cover rounded shadow-sm border border-slate-100" 
                />
            </div>
          </div>
        )}

        {/* 2. Main HTML Content */}
        <div 
            className="prose prose-lg max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: displayHtml }}
        />

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