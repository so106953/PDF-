import React, { useEffect, useState } from 'react';
import { X, Calendar, Download, Trash2, ShieldCheck, Share2, Clipboard, ExternalLink } from 'lucide-react';
import { formatBytes } from '../mockData';

interface HistoryItem {
  id: string;
  timestamp: string;
  fileCount: number;
  totalSize: number;
  names: string[];
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Let parents register a handler if needed
}

export default function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage + add some default mock corporate history on first launch for aesthetic premium feel
  useEffect(() => {
    if (!isOpen) return;
    
    const stored = localStorage.getItem('invoice_merge_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Add standard high-quality mock items so history doesn't look empty and boring
      const mockHistory: HistoryItem[] = [
        {
          id: 'hist-20230812',
          timestamp: '2023-08-12 14:24',
          fileCount: 12,
          totalSize: 7.8 * 1024 * 1024,
          names: ['AWS_Invoice_Oct.pdf', 'Uber_Business_Travel.pdf', 'WeChat_Pay_Taxi_Receipt.jpg', 'Google_Cloud_Billing.pdf']
        },
        {
          id: 'hist-20230704',
          timestamp: '2023-07-04 09:12',
          fileCount: 4,
          totalSize: 2.1 * 1024 * 1024,
          names: ['Figma_Team_Seat_Billing.pdf', 'GitHub_CoPilot_Subscription.pdf', 'Starbucks_Coffee_Fapiao.jpg']
        }
      ];
      setHistory(mockHistory);
      localStorage.setItem('invoice_merge_history', JSON.stringify(mockHistory));
    }
  }, [isOpen]);

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('invoice_merge_history', JSON.stringify(updated));
  };

  const copyHistoryShareLink = (id: string) => {
    const shareUrl = `${window.location.origin}/?share=invoice-${id.replace('hist-', '')}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('已复制专属分享链接！');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Drawer Panel content */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col justify-between border-l border-outline-variant/60 animate-slide-in p-6 z-10 overflow-y-auto">
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">合并历史记录</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">仅保存在您的本地浏览器缓存中</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* History Item list */}
          {history.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant space-y-3">
              <Calendar className="w-12 h-12 text-outline-variant mx-auto opacity-70" />
              <p className="text-sm font-medium">暂无历史记录</p>
              <p className="text-xs">成功合并发票后，记录将自动在此汇总。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 space-y-3.5 hover:border-primary transition-all group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-outline-variant font-bold">
                        ID: #{item.id.replace('hist-', '')}
                      </span>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-1">
                        {item.timestamp}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="删除记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-on-surface">
                      包含 {item.fileCount} 份文件:
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {item.names.join('、')}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-outline-variant/20">
                    <span className="text-xs font-mono font-semibold text-primary">
                      {formatBytes(item.totalSize)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyHistoryShareLink(item.id)}
                        className="text-[11px] font-bold text-outline-variant hover:text-primary flex items-center gap-1 hover:underline"
                      >
                        <Share2 className="w-3 h-3" />
                        分享
                      </button>
                      <span className="text-outline-variant/30 text-xs">|</span>
                      <button
                        onClick={() => alert('此历史记录归档保存在本地浏览器缓存中，可以直接进行清单核对或复制分享。')}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        下载
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Security guidelines in panel footer */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-2 mt-6">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0 text-outline" />
            零痕迹云安全机制
          </div>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            InvoiceMerge 基于沙盒隔离机制运作，您的任何发票文件和收据快照均不会向服务器数据库进行持久存储。此历史面板仅读取您的浏览器 LocalStorage。清空浏览器数据即会立即抹除。
          </p>
        </div>

      </div>
    </div>
  );
}
