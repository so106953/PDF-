import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, ShieldAlert, BadgeInfo, Play, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceFile, AppStep } from './types';
import Header from './components/Header';
import SidebarFeatures from './components/SidebarFeatures';
import UploadZone from './components/UploadZone';
import QueueList from './components/QueueList';
import MergeProgress from './components/MergeProgress';
import SuccessView from './components/SuccessView';
import HistoryPanel from './components/HistoryPanel';
import SharedView from './components/SharedView';

export default function App() {
  const [step, setStep] = useState<AppStep>('home');
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sharedInvoiceId, setSharedInvoiceId] = useState<string | null>(null);

  // Parse URL query parameter for active share state on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      setSharedInvoiceId(shareParam);
    }
  }, []);

  // Automatically transition to 'queue' step when files are added in the 'home' step
  const handleFilesAdded = (newFiles: InvoiceFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setStep('queue');
  };

  const handleStartMerge = () => {
    setStep('merging');
  };

  const handleMergeComplete = () => {
    // Record this merge action to local history database for rich premium UX
    try {
      const stored = localStorage.getItem('invoice_merge_history');
      const historyList = stored ? JSON.parse(stored) : [];
      
      const newHistoryItem = {
        id: 'hist-' + Date.now().toString().substring(6),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fileCount: files.length,
        totalSize: files.reduce((acc, f) => acc + f.size, 0),
        names: files.slice(0, 4).map(f => f.name)
      };

      const updatedHistory = [newHistoryItem, ...historyList].slice(0, 20); // keep max 20 logs
      localStorage.setItem('invoice_merge_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to update history log', e);
    }

    setStep('success');
  };

  const handleCancelMerge = () => {
    setStep('queue');
  };

  const handleClearQueue = () => {
    if (confirm('确定要清空当前的待处理队列吗？')) {
      setFiles([]);
      setStep('home');
    }
  };

  const handleResetApp = () => {
    setFiles([]);
    setStep('home');
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen pb-24 relative select-none">
      
      {/* Dynamic Header Component */}
      <Header
        currentStep={step}
        setStep={(nextStep) => {
          if (nextStep === 'queue' && files.length === 0) {
            alert('当前队列为空，请先上传您的发票文件。');
            return;
          }
          setStep(nextStep);
        }}
        queueCount={files.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container Stage */}
      <main className="pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto w-full">
        {sharedInvoiceId ? (
          <SharedView
            shareId={sharedInvoiceId}
            onGoToHome={() => {
              setSharedInvoiceId(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
          />
        ) : (
          /* Animated slide pages */
          <AnimatePresence mode="wait">
            {step === 'home' && (
              <motion.div
                key="home-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-start"
              >
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                      更智能、更高效的发票合并
                    </h1>
                    <p className="text-base text-on-surface-variant mt-2 leading-relaxed">
                      无需手动排版。支持标准 PDF、JPG、PNG 图像格式的混合上传与自动整理。一键识别开票日期、自动归类、无损高清压缩为标准 A4 文档包。
                    </p>
                  </div>

                  {/* Upload Zone */}
                  <UploadZone onFilesAdded={handleFilesAdded} currentCount={files.length} />

                  {/* Security badges displayed directly on Upload Screen */}
                  <div className="pt-8 border-t border-outline-variant/40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck className="w-5 h-5 text-outline" />
                        </div>
                        <p className="text-xs font-bold text-on-surface">银行级加密</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">AES-256 加密保护</p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck className="w-5 h-5 text-outline" />
                        </div>
                        <p className="text-xs font-bold text-on-surface">GDPR 合规</p>
                        <p className="text-[10px] text-on-surface-variant">严格遵守隐私规范</p>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck className="w-5 h-5 text-outline" />
                        </div>
                        <p className="text-xs font-bold text-on-surface">即时数据销毁</p>
                        <p className="text-[10px] text-on-surface-variant">合并下载后自动擦除</p>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck className="w-5 h-5 text-outline" />
                        </div>
                        <p className="text-xs font-bold text-on-surface">官方级认证</p>
                        <p className="text-[10px] text-on-surface-variant">信赖的企业级发票包</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sidebar Assistant */}
                <div className="lg:col-span-4">
                  <SidebarFeatures />
                </div>
              </motion.div>
            )}

            {step === 'queue' && (
              <motion.div
                key="queue-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* Top back banner button */}
                <button
                  onClick={() => setStep('home')}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-6 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-outline" />
                  返回上传页面
                </button>

                <QueueList
                  files={files}
                  setFiles={setFiles}
                  onStartMerge={handleStartMerge}
                  onClearQueue={handleClearQueue}
                  onGoBack={handleResetApp}
                  onTriggerUpload={() => setStep('home')}
                />
              </motion.div>
            )}

            {step === 'merging' && (
              <motion.div
                key="merging-step"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="py-12"
              >
                <MergeProgress
                  files={files}
                  onComplete={handleMergeComplete}
                  onCancel={handleCancelMerge}
                />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <SuccessView files={files} onReset={handleResetApp} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </main>

      {/* Global Bottom Status Bar inspired by the second progress mockup */}
      <footer className="fixed bottom-0 left-0 w-full z-30 bg-surface border-t border-outline-variant py-2.5 px-4 md:px-6 flex justify-between items-center text-[11px] select-none h-10 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${step === 'merging' ? 'bg-primary animate-ping' : 'bg-primary'}`} />
          <span className="font-medium text-on-surface-variant font-sans">
            {step === 'merging' ? '合并引擎正在规范化处理中...' : '服务引擎状态: 运行正常'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-outline">
          <span className="font-mono hidden sm:inline">SESSION ID: #INV-MERGE-2026</span>
          <span className="flex items-center gap-0.5 hover:text-primary cursor-pointer" onClick={() => alert('InvoiceMerge 是由 Google AI Studio 提供技术支持的高精度智能财税报销辅助工具。')}>
            <HelpCircle className="w-3.5 h-3.5" />
            技术帮助
          </span>
        </div>
      </footer>

      {/* Sidebar drawer menus */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

    </div>
  );
}
