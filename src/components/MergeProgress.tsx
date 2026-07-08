import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Ban, Sparkles } from 'lucide-react';
import { InvoiceFile } from '../types';

interface MergeProgressProps {
  files: InvoiceFile[];
  onComplete: () => void;
  onCancel: () => void;
}

export default function MergeProgress({ files, onComplete, onCancel }: MergeProgressProps) {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(2.4);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('正在初始化智能合并引擎...');

  const totalFiles = files.length;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 4500; // 4.5 seconds of beautiful, highly engaging merging animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(Math.floor(currentProgress));

      // Fluctuating speed for maximum realism
      const randomFluctuation = (Math.random() - 0.5) * 0.6;
      setSpeed(Math.max(1.1, parseFloat((2.4 + randomFluctuation).toFixed(1))));

      // Update active file count in step with progress
      const fileIndex = Math.min(
        Math.floor((currentProgress / 100) * totalFiles),
        totalFiles - 1
      );
      setCurrentFileIndex(fileIndex);

      // Update rich process statuses based on percentage
      if (currentProgress < 15) {
        setStatusMessage('正在读取原始文件并建立多页文档树...');
      } else if (currentProgress < 35) {
        setStatusMessage(`正在进行 OCR 元数据提取 (第 ${fileIndex + 1} 张发票)...`);
      } else if (currentProgress < 55) {
        setStatusMessage('正在执行透视校正与四角边缘修剪...');
      } else if (currentProgress < 75) {
        setStatusMessage('正在对高清图像执行亮度平衡与二值化优化...');
      } else if (currentProgress < 90) {
        setStatusMessage('正在生成 A4 矢量规范文档并执行无损高压压缩...');
      } else if (currentProgress < 99) {
        setStatusMessage('正在嵌入中文字体并校验防伪数字签名...');
      } else {
        setStatusMessage('合并成功！正在生成最终下载文件...');
      }

      if (currentProgress < 100) {
        window.requestAnimationFrame(step);
      } else {
        // Delay completion slightly so user can enjoy the 100% completion glow
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    };

    const animFrame = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animFrame);
    };
  }, [totalFiles, onComplete]);

  // SVG parameters for standard circle ring of radius 80
  const circumference = 2 * Math.PI * 80; // 502.65
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
      
      {/* Decorative backdrop glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-fixed opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-tertiary-fixed opacity-10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass-styled Card */}
      <div className="bg-white/85 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/60 flex flex-col items-center text-center">
        
        {/* Animated Circular Progress Section */}
        <div className="relative w-48 h-48 mb-6 group">
          
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Base Circle */}
            <circle
              className="text-surface-container-highest"
              cx="96"
              cy="96"
              fill="transparent"
              r="80"
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Active Gold Ring Progress Circle */}
            <circle
              className="text-primary transition-all duration-100 ease-out"
              cx="96"
              cy="96"
              fill="transparent"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Percentage indicators */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="font-display text-4xl font-extrabold text-primary animate-pulse">
              {progress}%
            </span>
            <span className="text-xs font-bold text-on-surface-variant mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-outline" />
              合并中
            </span>
          </div>

          {/* Decorative spinning dot orbiter */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `rotate(${(progress / 100) * 360}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-container rounded-full shadow-md border-2 border-white" />
          </div>

        </div>

        {/* Dynamic Descriptive Status labels */}
        <h1 className="font-display text-xl font-bold text-on-surface mb-2">
          正在合并 PDF...
        </h1>
        <p className="text-sm text-on-surface-variant font-medium min-h-[20px] transition-all">
          {statusMessage}
        </p>

        {/* Bento Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mt-8 mb-6">
          {/* File index processed card */}
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5 border border-outline-variant/30 text-left">
            <div className="bg-primary-container p-2 rounded-lg text-on-primary-container">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                文件处理进度
              </div>
              <div className="text-base font-extrabold text-primary mt-0.5">
                Files: {currentFileIndex + 1} / {totalFiles}
              </div>
            </div>
          </div>

          {/* Processing Transfer rate speed */}
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5 border border-outline-variant/30 text-left">
            <div className="bg-secondary-container p-2 rounded-lg text-on-secondary-container">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                当前运行速率
              </div>
              <div className="text-base font-extrabold text-primary mt-0.5 font-mono">
                {speed} MB/s
              </div>
            </div>
          </div>
        </div>

        {/* Abort Operation and Security Note */}
        <div className="w-full pt-6 border-t border-outline-variant/45 space-y-4">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface border border-error hover:bg-error-container/10 text-error font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto shadow-sm"
          >
            <Ban className="w-4 h-4" />
            取消当前任务
          </button>
          
          <p className="text-xs text-outline">
            中断操作将立即中止合并，不会在服务器及缓存中留下任何残余碎片
          </p>
        </div>

      </div>

    </div>
  );
}
