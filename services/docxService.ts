import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } from "docx";
import { GeneratedContent } from "../types";

export const createAndDownloadDocx = async (content: GeneratedContent, fileName: string) => {
  // We need to parse the HTML string from content.rawText
  const parser = new DOMParser();
  const doc = parser.parseFromString(content.rawText, 'text/html');
  const bodyNodes = Array.from(doc.body.childNodes);

  const children: (Paragraph | Table)[] = [];

  // Helper to convert base64 to buffer safely
  const base64ToUint8Array = (base64: string) => {
    try {
      // Remove data URL prefix if present (e.g., data:image/png;base64,)
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("Base64 decode error", e);
      return new Uint8Array(0);
    }
  };

  // 1. Cover Page
  if (content.coverImageBase64) {
    // Add Logo if exists
    if (content.myCompanyLogoBase64) {
        children.push(
            new Paragraph({
                children: [
                    new ImageRun({
                        data: base64ToUint8Array(content.myCompanyLogoBase64),
                        transformation: { width: 150, height: 75 }, // Restrict logo size
                    } as any)
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );
    }

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: base64ToUint8Array(content.coverImageBase64),
            transformation: { width: 500, height: 667 }, // Safer size for A4
          } as any),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(new Paragraph({ pageBreakBefore: true }));
  }

  // 2. HTML to Docx Parser Logic
  let sectionCount = 0;
  let graphicIndex = 0;

  const parseNodeToDocx = (node: Node): (Paragraph | Table)[] => {
    const result: (Paragraph | Table)[] = [];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // H1 (Main Section)
      if (tagName === 'h1') {
        sectionCount++;
        const colorMatch = el.getAttribute('style')?.match(/color:\s*#([0-9a-fA-F]{6})/);
        const color = colorMatch ? colorMatch[1] : "111827";

        result.push(
            new Paragraph({
                text: el.textContent || "",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 600, after: 300 },
                border: { bottom: { color: "2563eb", space: 1, style: "single", size: 12 } }, // Thicker blue border
                run: { color: color, bold: true }
            })
        );
        
        // Inject Infographic after H1
        if (sectionCount % 2 === 0 && graphicIndex < content.infographics.length) {
             const graphic = content.infographics[graphicIndex];
             if (graphic && graphic.imageBase64) {
                 result.push(
                     new Paragraph({
                         children: [
                             new ImageRun({
                                 data: base64ToUint8Array(graphic.imageBase64),
                                 transformation: { width: 500, height: 281 }
                             } as any)
                         ],
                         alignment: AlignmentType.CENTER,
                         spacing: { before: 400, after: 400 }
                     })
                 );
                 graphicIndex++;
             }
        }
      } 
      // H2 (Sub Section)
      else if (tagName === 'h2') {
         const colorMatch = el.getAttribute('style')?.match(/color:\s*#([0-9a-fA-F]{6})/);
         const color = colorMatch ? colorMatch[1] : "1e293b";
         result.push(
            new Paragraph({
                text: el.textContent || "",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
                run: { color: color, bold: true }
            })
         );
      }
      // H3 (Sub-Sub Section)
      else if (tagName === 'h3') {
         const style = el.getAttribute('style') || "";
         const colorMatch = style.match(/color:\s*#([0-9a-fA-F]{6})/);
         const color = colorMatch ? colorMatch[1] : "1e40af";
         result.push(
            new Paragraph({
                text: el.textContent || "",
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 150 },
                border: { left: { color: color, space: 10, style: "single", size: 24 } },
                run: { color: color, bold: true, italics: false }
            })
         );
      }
      // Paragraphs and Lists
      else if (tagName === 'p' || tagName === 'div' || tagName === 'li') {
        const runs: TextRun[] = [];
        const style = el.getAttribute('style') || "";
        const bgColorMatch = style.match(/background-color:\s*#([0-9a-fA-F]{6})/);
        const pBgColor = bgColorMatch ? bgColorMatch[1] : undefined;
        
        el.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun({ text: child.textContent || "" }));
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childEl = child as HTMLElement;
                const childTag = childEl.tagName.toLowerCase();
                const childStyle = childEl.getAttribute('style') || "";
                
                const color = childStyle.match(/color:\s*#([0-9a-fA-F]{6})/)?.[1];
                const bgColor = childStyle.match(/background-color:\s*#([0-9a-fA-F]{6})/)?.[1];
                
                runs.push(new TextRun({
                    text: childEl.textContent || "",
                    bold: childTag === 'strong' || childTag === 'b' || childStyle.includes('font-weight: bold'),
                    color: color,
                    shading: bgColor ? { type: ShadingType.CLEAR, fill: bgColor } : undefined,
                }));
            }
        });

        result.push(
            new Paragraph({
                children: runs,
                spacing: { line: 360, after: 200 },
                alignment: AlignmentType.JUSTIFIED,
                bullet: tagName === 'li' ? { level: 0 } : undefined,
                shading: pBgColor ? { type: ShadingType.CLEAR, fill: pBgColor } : undefined,
            })
        );
      }
      // Tables
      else if (tagName === 'table') {
         const rows = Array.from(el.querySelectorAll('tr'));
         const tableRows: TableRow[] = [];

         rows.forEach((tr, rIndex) => {
             const cells = Array.from(tr.querySelectorAll('td, th'));
             const tableCells = cells.map((td) => {
                 const tdEl = td as HTMLElement;
                 const isHeader = tdEl.tagName.toLowerCase() === 'th';
                 const style = tdEl.getAttribute('style') || "";
                 const bgColor = style.match(/background-color:\s*#([0-9a-fA-F]{6})/)?.[1];
                 const color = style.match(/color:\s*#([0-9a-fA-F]{6})/)?.[1];

                 return new TableCell({
                     children: [new Paragraph({ 
                         children: [new TextRun({ 
                             text: tdEl.textContent?.trim() || "", 
                             bold: isHeader,
                             color: color || (isHeader ? "1e293b" : "334155"),
                         })],
                         alignment: AlignmentType.CENTER 
                     })],
                     shading: (isHeader || bgColor) ? { fill: bgColor || (isHeader ? "F1F5F9" : "FFFFFF") } : undefined,
                     verticalAlign: AlignmentType.CENTER,
                     borders: {
                         top: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
                         bottom: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
                         left: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
                         right: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
                     }
                 });
             });
             tableRows.push(new TableRow({ children: tableCells }));
         });

         if (tableRows.length > 0) {
             result.push(new Table({
                 rows: tableRows,
                 width: { size: 100, type: WidthType.PERCENTAGE },
                 borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "aaaaaa" },
                }
             }));
             result.push(new Paragraph({ text: "" }));
         }
      }
      else if (tagName === 'div' || tagName === 'ul' || tagName === 'ol') {
          el.childNodes.forEach(child => {
              result.push(...parseNodeToDocx(child));
          });
      }
    }

    return result;
  };

  bodyNodes.forEach(node => {
      children.push(...parseNodeToDocx(node));
  });

  // 3. Business Card (Footer)
  if (content.businessCardImageBase64) {
    children.push(new Paragraph({ pageBreakBefore: true }));
    children.push(
        new Paragraph({
            text: "CONTACT INFO",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 }
        })
    );
    children.push(
        new Paragraph({
            children: [
                new ImageRun({
                    data: base64ToUint8Array(content.businessCardImageBase64),
                    transformation: { width: 400, height: 228 }
                } as any)
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
        })
    );
  }

  const docx = new Document({
    sections: [{
        properties: {},
        children: children,
    }],
  });

  const blob = await Packer.toBlob(docx);
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};