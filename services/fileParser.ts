import * as pdfjsLib from 'pdfjs-dist';
import * as mammothLib from 'mammoth';

// Handle esm.sh module structure (often wraps in default) for pdfjs-dist
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Handle esm.sh module structure for mammoth
const mammoth = (mammothLib as any).default || mammothLib;

// Initialize PDF.js worker
// Using cdnjs for the worker script is often more reliable for classic script loading in workers than esm.sh
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const parseFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePdf(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')
    ) {
      return await parseDocx(file);
    } else {
      // Default to text parsing for .txt, .md, etc.
      return await parseText(file);
    }
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error(`파일 내용을 읽는데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const parseText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const parsePdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Use the resolved pdfjs object
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore - 'str' exists on TextItem
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (e: any) {
    console.error("PDF Parse Error Details:", e);
    // Fallback error message if worker fails
    if (e.name === 'MissingPDFException') {
       throw new Error("PDF 파일이 손상되었거나 유효하지 않습니다.");
    }
    throw e;
  }
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Use the resolved mammoth object
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};