import React, { useState, useRef } from 'react';
import { FileText, Plus, CheckCircle, ArrowRight } from 'lucide-react';
import { InvoiceFile } from '../types';
import { INITIAL_MOCK_FILES, generateRandomMockFile } from '../mockData';

function parseDateFromString(str: string): string | null {
  if (!str) return null;

  // Normalize spaces to handle patterns like "2026 年 04 月 18 日" or "2026 - 04 - 18"
  const normalized = str.replace(/\s+/g, '');

  // 1. Try standard YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD with correct alternation order
  // Alternation MUST have longer matches ([1-2][0-9]|3[0-1]) before shorter matches (0?[1-9]) to prevent greedy partial matches
  const pattern1 = /(20[1-3][0-9])[\-\/\.](1[0-2]|0?[1-9])[\-\/\.]([1-2][0-9]|3[0-1]|0?[1-9])/;
  const match1 = normalized.match(pattern1) || str.match(pattern1);
  if (match1) {
    const y = match1[1];
    const m = match1[2].padStart(2, '0');
    const d = match1[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Try YYYY年MM月DD日 / YYYY年MM月DD
  const pattern2 = /(20[1-3][0-9])\s*年\s*(1[0-2]|0?[1-9])\s*月\s*([1-2][0-9]|3[0-1]|0?[1-9])\s*(日|号)?/;
  const match2 = str.match(pattern2) || normalized.match(/(20[1-3][0-9])年(1[0-2]|0?[1-9])月([1-2][0-9]|3[0-1]|0?[1-9])(日|号)?/);
  if (match2) {
    const y = match2[1];
    const m = match2[2].padStart(2, '0');
    const d = match2[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. Try 8-digit pure numbers: e.g. 20260418
  const pattern3 = /\b(20[1-3][0-9])(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])\b/;
  const match3 = normalized.match(pattern3) || str.match(pattern3);
  if (match3) {
    return `${match3[1]}-${match3[2]}-${match3[3]}`;
  }

  // 4. Try MM月DD日 or MM月DD (without year, default to current year 2026)
  const currentYear = new Date().getFullYear();
  const pattern4 = /(1[0-2]|0?[1-9])\s*月\s*([1-2][0-9]|3[0-1]|0?[1-9])\s*(日|号)?/;
  const match4 = str.match(pattern4) || normalized.match(/(1[0-2]|0?[1-9])月([1-2][0-9]|3[0-1]|0?[1-9])(日|号)?/);
  if (match4) {
    const m = match4[1].padStart(2, '0');
    const d = match4[2].padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }

  // 5. Try standard MM-DD / MM.DD / MM/DD where MM is 1-12 and DD is 1-31 (using boundaries, e.g. "04-18" or "4/18")
  const pattern5 = /\b(1[0-2]|0?[1-9])[\-\/\.]([1-2][0-9]|3[0-1]|0[1-9])\b/;
  const match5 = str.match(pattern5) || normalized.match(pattern5);
  if (match5) {
    const m = match5[1].padStart(2, '0');
    const d = match5[2].padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }

  return null;
}

function parsePdfFile(file: File): Promise<{ previewUrl: string; extractedDate: string | null }> {
  return new Promise((resolve) => {
    const scriptId = 'pdfjs-loader-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const runRender = async () => {
      let previewUrl = '';
      let extractedDate: string | null = null;
      try {
        // @ts-ignore
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // 1. Generate high-fidelity canvas preview URL
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          previewUrl = canvas.toDataURL('image/png');
        }

        // 2. Extract text and search for date
        try {
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          extractedDate = parseDateFromString(textItems);
        } catch (textErr) {
          console.error('Error extracting text from PDF:', textErr);
        }

        resolve({ previewUrl, extractedDate });
      } catch (err) {
        console.error('Error rendering PDF preview/text extraction:', err);
        resolve({ previewUrl: '', extractedDate: null });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = runRender;
      script.onerror = () => {
        console.error('Failed to load PDF.js script');
        resolve({ previewUrl: '', extractedDate: null });
      };
      document.head.appendChild(script);
    } else {
      // @ts-ignore
      if (window['pdfjs-dist/build/pdf']) {
        runRender();
      } else {
        script.addEventListener('load', runRender);
      }
    }
  });
}

interface UploadZoneProps {
  onFilesAdded: (files: InvoiceFile[]) => void;
  currentCount: number;
  onGoToQueue?: () => void;
}

export default function UploadZone({ onFilesAdded, currentCount, onGoToQueue }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processUploadedFiles = async (fileList: FileList) => {
    const newFiles: InvoiceFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
        const fileType = extension === 'pdf' ? 'pdf' : (extension === 'png' ? 'png' : 'jpg');
        
        // 1. Try to parse date from filename first
        let detectedDate = parseDateFromString(file.name);
        
        // Generate a random preview image from the gorgeous examples as fallback, or local object URL if it's an image
        let preview = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uSnKcnc';
        if (fileType !== 'pdf') {
          preview = URL.createObjectURL(file);
        } else {
          // It's a real PDF, let's try to extract the first page in high fidelity and read text for invoice date
          const parsed = await parsePdfFile(file);
          if (parsed.previewUrl) {
            preview = parsed.previewUrl;
          }
          if (parsed.extractedDate) {
            detectedDate = parsed.extractedDate;
          }
        }

        // Default to today if no date was detected in filename or PDF text
        const finalDate = detectedDate || new Date().toISOString().split('T')[0];

        newFiles.push({
          id: 'uploaded-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: fileType,
          date: finalDate,
          previewUrl: preview,
          isReal: true,
          fileObject: file
        });
      }
    }
    
    if (newFiles.length > 0) {
      onFilesAdded(newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLoadDemoFiles = () => {
    onFilesAdded(INITIAL_MOCK_FILES);
  };

  const handleAddRandomMock = () => {
    const singleMock = generateRandomMockFile();
    onFilesAdded([singleMock]);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[380px] transition-all duration-300 ${
          isDragOver
            ? 'border-primary-container bg-surface-container-low scale-[1.01]'
            : 'border-outline-variant bg-surface-container-lowest hover:border-primary-container hover:bg-surface-container-low'
        }`}
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
        />

        {/* Dynamic background element from prompt hotlink pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 transition-opacity group-hover:opacity-10 rounded-2xl overflow-hidden">
          <div 
            className="w-full h-full bg-repeat opacity-20" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdE-y6QmztjEXpRhKch_gEJm0RwANt3gkoaF2JaIOIu5-MXoT6qGnQRTaJ8YC1EOnkppfIRHImBo503nVlyzaa2O-eNYRFDXCP9_ClYJj-GEePeN8XEClRW4uwNfJPOyIPsjszxe4YXMDkhubzBf3AiIV5b0K7KE-hnBunZ0E_SNBAtAYue8TsKu6PxqccGPgYihKvcHkDo9HsqMjm2pfXFkgL0YsKAuzUxxemnNNQ2ofCOaj1vOGW9WhUB4c60R1UOs3cvPjiST0')` 
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-105 duration-300">
            <FileText className="w-10 h-10 text-primary" />
          </div>

          <h2 className="font-display text-xl font-bold text-on-surface mb-2">
            拖拽发票文件到此处
          </h2>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            支持 <span className="font-semibold text-primary">PDF</span>、
            <span className="font-semibold text-primary">JPG</span>、
            <span className="font-semibold text-primary">PNG</span> 格式。
            支持多文件拖入或单反拍照直接上传。
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={triggerFileSelect}
              className="h-[48px] px-6 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-95 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              选择本地 PDF / 图片
            </button>
            
            <button
              onClick={handleLoadDemoFiles}
              className="h-[48px] px-6 border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container/10 active:scale-95 transition-all text-sm bg-white/80"
            >
              <CheckCircle className="w-4 h-4" />
              导入示例发票 (推荐)
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant/40 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant font-medium">
            队列状态: {currentCount} 个待处理文件
          </span>
          {currentCount > 0 && onGoToQueue && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGoToQueue();
              }}
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <span>返回合并队列</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={handleAddRandomMock}
          className="text-xs text-primary font-bold hover:underline hover:text-primary-container flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          一键生成随机发票
        </button>
      </div>
    </div>
  );
}
