import React, { useState, useRef } from 'react';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import { InvoiceFile } from '../types';
import { INITIAL_MOCK_FILES, generateRandomMockFile } from '../mockData';

interface UploadZoneProps {
  onFilesAdded: (files: InvoiceFile[]) => void;
  currentCount: number;
}

export default function UploadZone({ onFilesAdded, currentCount }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processUploadedFiles = (fileList: FileList) => {
    const newFiles: InvoiceFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf' || extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
        const fileType = extension === 'pdf' ? 'pdf' : (extension === 'png' ? 'png' : 'jpg');
        
        // Generate a random preview image from the gorgeous examples as fallback, or local object URL if it's an image
        let preview = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uUqSnKcnc';
        if (fileType !== 'pdf') {
          preview = URL.createObjectURL(file);
        }

        // Generate dynamic reasonable invoice date (default to today)
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        newFiles.push({
          id: 'uploaded-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: fileType,
          date: dateStr,
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            队列状态: {currentCount} 个待处理文件
          </span>
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
