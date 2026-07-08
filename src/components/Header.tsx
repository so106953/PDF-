import React from 'react';
import { Upload, Merge, History, User } from 'lucide-react';
import { AppStep } from '../types';

interface HeaderProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  queueCount: number;
  onOpenHistory: () => void;
}

export default function Header({
  currentStep,
  setStep,
  queueCount,
  onOpenHistory
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant h-16 px-4 md:px-6 flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* Logo and Tag */}
        <div 
          onClick={() => setStep('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <span className="font-display text-2xl font-extrabold text-primary group-hover:opacity-90 transition-opacity">
            InvoiceMerge
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 bg-primary-container text-on-primary-container text-[11px] font-bold rounded-lg uppercase tracking-wider">
            发票合并专家
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setStep('home')}
            className={`font-sans font-medium text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${
              currentStep === 'home'
                ? 'text-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Upload className="w-4 h-4" />
            上传发票
          </button>

          <button
            onClick={() => setStep('queue')}
            className={`font-sans font-medium text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors relative ${
              currentStep === 'queue' || currentStep === 'merging'
                ? 'text-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Merge className="w-4 h-4" />
            合并队列
            {queueCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary-container">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHistory}
            className="font-sans font-medium text-sm flex items-center gap-1.5 px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <History className="w-4 h-4" />
            合并历史
          </button>
        </nav>

        {/* Free Service Tag on Desktop/Mobile */}
        <div className="flex items-center gap-2 bg-primary-container/30 px-4 py-1.5 rounded-full select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-bold text-primary">完全免费独立版</span>
        </div>

      </div>
    </header>
  );
}
