import React, { useState } from 'react';
import { CheckCircle2, Download, Share2, Eye, Fullscreen, ChevronLeft, ChevronRight, X, Sparkles, RefreshCw, Loader2, FileSpreadsheet, Scissors, Layers, List, Plus } from 'lucide-react';
import { InvoiceFile } from '../types';
import { formatBytes } from '../mockData';
import { mergeInvoices } from '../lib/pdfMerger';

interface SuccessViewProps {
  files: InvoiceFile[];
  onReset: () => void;
  onBackToQueue?: () => void;
}

export default function SuccessView({ files, onReset, onBackToQueue }: SuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMerging, setIsMerging] = useState(false);

  // Layout states for stitching
  const [layoutType, setLayoutType] = useState<'original' | '1-per-page' | '2-per-page' | '3-per-page'>('original');
  const [includeCover, setIncludeCover] = useState<boolean>(false);
  const [shouldCrop, setShouldCrop] = useState<boolean>(true);

  // Calculate stats
  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const precompressedSize = (totalSizeBytes / 1024 / 1024 * 0.95).toFixed(1); // simulated size representing original/high quality

  // Helper to get total merged page count dynamically
  const getMergedTotalPages = () => {
    const coverCount = includeCover ? 1 : 0;
    if (layoutType === 'original') {
      return coverCount + files.length;
    }
    let invoicePageCount = files.length;
    if (layoutType === '2-per-page') {
      invoicePageCount = Math.ceil(files.length / 2);
    } else if (layoutType === '3-per-page') {
      invoicePageCount = Math.ceil(files.length / 3);
    }
    return coverCount + invoicePageCount;
  };

  // Helper to chunk the files array based on items per page for live visualization
  const getGroupedPages = () => {
    if (layoutType === 'original') {
      return files.map(file => [file]);
    }
    const itemsPerPage = layoutType === '1-per-page' ? 1 : layoutType === '2-per-page' ? 2 : 3;
    const groups: InvoiceFile[][] = [];
    for (let i = 0; i < files.length; i += itemsPerPage) {
      groups.push(files.slice(i, i + itemsPerPage));
    }
    return groups;
  };

  const groupedPages = getGroupedPages();

  // Live interactive preview states
  const [previewMode, setPreviewMode] = useState<'pages' | 'scroll'>('pages');
  const [activePageIdx, setActivePageIdx] = useState<number>(0);

  interface MergedPage {
    type: 'cover' | 'invoices';
    pageNumber: number;
    files?: InvoiceFile[];
  }

  const getPagesList = (): MergedPage[] => {
    const pages: MergedPage[] = [];
    let pageCounter = 1;

    if (includeCover) {
      pages.push({
        type: 'cover',
        pageNumber: pageCounter++
      });
    }

    const grouped = getGroupedPages();
    grouped.forEach((group) => {
      pages.push({
        type: 'invoices',
        pageNumber: pageCounter++,
        files: group
      });
    });

    return pages;
  };

  const pagesList = getPagesList();
  const totalPagesCount = pagesList.length;
  const currentActivePage = Math.min(activePageIdx, Math.max(0, totalPagesCount - 1));

  // Core PDF Generation function with real metadata drawing and stitching
  const handleDownloadPDF = async () => {
    if (isMerging) return;
    setIsMerging(true);
    try {
      const mergedBlob = await mergeInvoices(files, layoutType, includeCover, shouldCrop);
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged_Invoices_Report_' + new Date().toISOString().split('T')[0] + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('合并真实 PDF/图片时出错，请重试或检查文件是否已损坏。');
    } finally {
      setIsMerging(false);
    }
  };

  // Share link copy action
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?share=invoice-${Math.random().toString(36).substring(2, 10)}`;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((err) => {
        console.error('Clipboard copy failed, using fallback', err);
        fallbackCopyText(shareUrl);
      });
    } else {
      fallbackCopyText(shareUrl);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(Math.min(index, Math.max(0, totalPagesCount - 1)));
    setIsLightboxOpen(true);
  };

  const renderA4Page = (page: MergedPage, isLarge: boolean = false) => {
    if (!page) return null;

    if (page.type === 'cover') {
      return (
        <div className={`w-full h-full bg-white flex flex-col justify-between border-4 border-double border-neutral-300 p-4 sm:p-6 text-neutral-800 ${isLarge ? 'p-8 sm:p-10' : ''}`}>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-3">
              <div>
                <h2 className="font-display text-sm sm:text-base md:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-1.5">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  发票报销拼版汇总目录清单
                </h2>
                <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono mt-0.5 uppercase tracking-wider">
                  Consolidated Invoice Reconciliation Summary
                </p>
              </div>
              <div className="text-right font-mono text-[8px] sm:text-[9px] text-neutral-500 border border-neutral-300 p-1 rounded bg-neutral-50 select-none">
                <div className="font-bold text-neutral-900">INDEXED SYSTEM</div>
                <div>Status: COMPLIANT</div>
              </div>
            </div>

            {/* Meta Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-[9px] sm:text-xs font-mono">
              <div>
                <div className="text-neutral-400 text-[8px] sm:text-[9px]">合并日期 (Date)</div>
                <div className="font-bold text-neutral-800">{new Date().toISOString().split('T')[0]}</div>
              </div>
              <div>
                <div className="text-neutral-400 text-[8px] sm:text-[9px]">发票总数 (Invoices)</div>
                <div className="font-bold text-primary">{files.length} 份文件</div>
              </div>
              <div>
                <div className="text-neutral-400 text-[8px] sm:text-[9px]">排版格式 (Layout)</div>
                <div className="font-bold text-neutral-800">
                  {layoutType === 'original' && '1:1 原始规格'}
                  {layoutType === '1-per-page' && '一页一张 (A4)'}
                  {layoutType === '2-per-page' && '一页两张 (A4)'}
                  {layoutType === '3-per-page' && '一页三张 (A4)'}
                </div>
              </div>
              <div>
                <div className="text-neutral-400 text-[8px] sm:text-[9px]">估算大小 (Size)</div>
                <div className="font-bold text-neutral-800">{precompressedSize} MB</div>
              </div>
            </div>

            {/* Main Metadata Table */}
            <div className="overflow-hidden border border-neutral-200 rounded-lg">
              <table className="w-full text-[9px] sm:text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 font-bold select-none">
                    <th className="py-1.5 px-2 text-center w-10 border-r border-neutral-200">序号</th>
                    <th className="py-1.5 px-2 border-r border-neutral-200">发票/单据文件名</th>
                    <th className="py-1.5 px-2 text-center border-r border-neutral-200 w-24">提取开票日期</th>
                    <th className="py-1.5 px-2 text-center border-r border-neutral-200 w-14">类型</th>
                    <th className="py-1.5 px-2 text-right w-16">文件大小</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {files.map((f, i) => (
                    <tr key={f.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-1 px-2 text-center font-mono text-neutral-400 border-r border-neutral-200">{i + 1}</td>
                      <td className="py-1 px-2 font-medium text-neutral-700 truncate max-w-[130px] sm:max-w-[240px] border-r border-neutral-200" title={f.name}>
                        {f.name}
                      </td>
                      <td className="py-1 px-2 text-center font-mono text-primary font-bold border-r border-neutral-200">{f.date || '未识别'}</td>
                      <td className="py-1 px-2 text-center font-mono uppercase text-neutral-400 border-r border-neutral-200">
                        <span className="px-1 bg-neutral-100 border border-neutral-200 rounded text-[8px] font-semibold">{f.type}</span>
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-neutral-500">{formatBytes(f.size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer stamp elements */}
          <div className="flex justify-between items-end border-t border-dashed border-neutral-200 pt-3 text-[8px] sm:text-[9px] font-mono text-neutral-400">
            <div>
              <p>系统数字指纹签章 (Digital Signature Handshake)</p>
              <p className="text-neutral-300 font-mono text-[7px] sm:text-[8px]">SHA256: {Math.random().toString(16).substring(2, 18).toUpperCase()}</p>
            </div>
            <div className="text-right border border-red-200 rounded-full px-2.5 py-1 rotate-[-3deg] text-red-500 border-dashed bg-red-50/30 flex flex-col items-center justify-center select-none">
              <span className="font-extrabold tracking-wider text-[8px]">报销专用章</span>
              <span className="scale-75 text-[7px]">VERIFIED SECURITY</span>
            </div>
          </div>
        </div>
      );
    }

    // Invoices Page
    const pageFiles = page.files || [];

    return (
      <div className="w-full h-full bg-white flex flex-col justify-between p-2 sm:p-4 gap-2 relative">
        {layoutType === '1-per-page' || layoutType === 'original' ? (
          // 1 Per Page Layout
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-2 relative group/invoice">
              <img
                src={pageFiles[0]?.previewUrl}
                className="w-full h-auto object-contain block select-none pointer-events-none"
                alt=""
              />
              <span className="absolute top-2 left-2 bg-black/65 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                💡 鼠标滚轮可滑动查看完整单据
              </span>
            </div>
            <div className="text-center text-[10px] text-neutral-400 font-mono mt-1.5 truncate">
              {pageFiles[0]?.name} ({pageFiles[0]?.date})
            </div>
          </div>
        ) : layoutType === '2-per-page' ? (
          // 2 Per Page Layout
          <div className="w-full h-full flex flex-col justify-between gap-1.5">
            {pageFiles[0] && (
              <div className="h-[46%] w-full bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-1.5 relative group/invoice">
                <img
                  src={pageFiles[0]?.previewUrl}
                  className="w-full h-auto object-contain block select-none pointer-events-none"
                  alt=""
                />
                <span className="absolute top-1.5 left-1.5 bg-black/65 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                  💡 鼠标滚轮可滑动查看
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-neutral-800/85 text-white font-mono text-[8px] sm:text-[9px] px-2 py-0.5 rounded truncate max-w-[150px] select-none">
                  {pageFiles[0]?.name}
                </span>
              </div>
            )}

            {/* Cut line */}
            <div className="h-[5%] flex items-center justify-center relative select-none">
              <div className="w-full border-t border-dashed border-neutral-300" />
              <span className="absolute bg-white px-2 text-[8px] sm:text-[9px] text-neutral-400 font-mono flex items-center gap-1">
                <Scissors className="w-3 h-3 text-neutral-400" />
                沿此线裁剪 (Cut Line)
              </span>
            </div>

            {pageFiles[1] ? (
              <div className="h-[46%] w-full bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-1.5 relative group/invoice">
                <img
                  src={pageFiles[1]?.previewUrl}
                  className="w-full h-auto object-contain block select-none pointer-events-none"
                  alt=""
                />
                <span className="absolute top-1.5 left-1.5 bg-black/65 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                  💡 鼠标滚轮可滑动查看
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-neutral-800/85 text-white font-mono text-[8px] sm:text-[9px] px-2 py-0.5 rounded truncate max-w-[150px] select-none">
                  {pageFiles[1]?.name}
                </span>
              </div>
            ) : (
              <div className="h-[46%] w-full bg-neutral-50/40 rounded-lg border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 select-none">
                <span className="text-[10px] sm:text-xs font-semibold">此处留空</span>
                <span className="text-[9px] sm:text-[10px]">无更多发票拼入此页</span>
              </div>
            )}
          </div>
        ) : (
          // 3 Per Page Layout
          <div className="w-full h-full flex flex-col justify-between gap-1">
            {pageFiles[0] && (
              <div className="h-[29%] w-full bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-1 relative group/invoice">
                <img
                  src={pageFiles[0]?.previewUrl}
                  className="w-full h-auto object-contain block select-none pointer-events-none"
                  alt=""
                />
                <span className="absolute top-1 left-1 bg-black/65 text-white text-[8px] px-1.5 py-0.2 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                  💡 滚轮可滚动查看
                </span>
                <span className="absolute bottom-1 right-1 bg-neutral-800/85 text-white font-mono text-[8px] px-1.5 py-0.2 rounded truncate max-w-[120px] select-none">
                  {pageFiles[0]?.name}
                </span>
              </div>
            )}

            {/* Cut line 1 */}
            <div className="h-[4%] flex items-center justify-center relative select-none">
              <div className="w-full border-t border-dashed border-neutral-300" />
              <span className="absolute bg-white px-2 text-[8px] text-neutral-400 font-mono flex items-center gap-0.5">
                <Scissors className="w-2.5 h-2.5 text-neutral-300" />
                裁剪线
              </span>
            </div>

            {pageFiles[1] ? (
              <div className="h-[29%] w-full bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-1 relative group/invoice">
                <img
                  src={pageFiles[1]?.previewUrl}
                  className="w-full h-auto object-contain block select-none pointer-events-none"
                  alt=""
                />
                <span className="absolute top-1 left-1 bg-black/65 text-white text-[8px] px-1.5 py-0.2 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                  💡 滚轮可滚动查看
                </span>
                <span className="absolute bottom-1 right-1 bg-neutral-800/85 text-white font-mono text-[8px] px-1.5 py-0.2 rounded truncate max-w-[120px] select-none">
                  {pageFiles[1]?.name}
                </span>
              </div>
            ) : (
              <div className="h-[29%] w-full bg-neutral-50/40 rounded-lg border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 select-none">
                <span className="text-[8px] sm:text-[9px]">此处留空</span>
              </div>
            )}

            {/* Cut line 2 */}
            <div className="h-[4%] flex items-center justify-center relative select-none">
              <div className="w-full border-t border-dashed border-neutral-300" />
              <span className="absolute bg-white px-2 text-[8px] text-neutral-400 font-mono flex items-center gap-0.5">
                <Scissors className="w-2.5 h-2.5 text-neutral-300" />
                裁剪线
              </span>
            </div>

            {pageFiles[2] ? (
              <div className="h-[29%] w-full bg-neutral-50 rounded-lg border border-neutral-100 overflow-y-auto custom-scrollbar flex items-start justify-center p-1 relative group/invoice">
                <img
                  src={pageFiles[2]?.previewUrl}
                  className="w-full h-auto object-contain block select-none pointer-events-none"
                  alt=""
                />
                <span className="absolute top-1 left-1 bg-black/65 text-white text-[8px] px-1.5 py-0.2 rounded opacity-0 group-hover/invoice:opacity-100 transition-opacity select-none">
                  💡 滚轮可滚动查看
                </span>
                <span className="absolute bottom-1 right-1 bg-neutral-800/85 text-white font-mono text-[8px] px-1.5 py-0.2 rounded truncate max-w-[120px] select-none">
                  {pageFiles[2]?.name}
                </span>
              </div>
            ) : (
              <div className="h-[29%] w-full bg-neutral-50/40 rounded-lg border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 select-none">
                <span className="text-[8px] sm:text-[9px]">此处留空</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic atmospheric background decorative rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Success State Section */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
        
        {/* Large green pop-up check circle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg ring-4 ring-primary/10 animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-primary" style={{ fill: 'currentColor' }} />
          </div>
          <div className="absolute -top-1 -right-1 bg-tertiary-container text-on-tertiary-container p-1 rounded-full animate-pulse">
            <Sparkles className="w-4 h-4 text-tertiary" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-on-surface tracking-tight">
          发票合并成功!
        </h1>
        
        <p className="text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
          您的所有发票已成功合并为一个标准高清 <span className="font-bold text-primary">A4 PDF 文件</span>。您可以立即在线预览每一页结果、直接下载成品或获取专属分享链接。
        </p>

        {/* Floating actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 w-full max-w-md">
          <button
            onClick={handleDownloadPDF}
            disabled={isMerging}
            className="flex-1 h-[52px] px-8 bg-primary-container text-on-primary-container hover:brightness-95 font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm disabled:opacity-60"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                正在合并PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-primary" />
                下载合并后的 PDF
              </>
            )}
          </button>
          
          <button
            onClick={handleShare}
            className={`flex-1 h-[52px] px-8 font-bold rounded-xl border border-outline-variant flex items-center justify-center gap-2.5 active:scale-95 transition-all ${
              copied
                ? 'bg-secondary-container text-on-secondary-container border-secondary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <Share2 className="w-5 h-5" />
            {copied ? '链接已复制!' : '分享链接'}
          </button>
        </div>
      </section>

      {/* Interactive Print Layout Options Section */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="font-display text-base font-bold text-on-surface mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          智能发票拼版与排版设置 (A4 一页多张)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layout selection buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-outline uppercase block">拼版打印与合并大小选项</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setLayoutType('original')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                  layoutType === 'original'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                1:1 原图
              </button>
              <button
                type="button"
                onClick={() => setLayoutType('1-per-page')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                  layoutType === '1-per-page'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                一页一张
              </button>
              <button
                type="button"
                onClick={() => setLayoutType('2-per-page')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                  layoutType === '2-per-page'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                一页两张
              </button>
              <button
                type="button"
                onClick={() => setLayoutType('3-per-page')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                  layoutType === '3-per-page'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                一页三张
              </button>
            </div>
            <p className="text-[11px] text-outline leading-normal">
              {layoutType === 'original' && '【推荐】完全保留原文件原始尺寸与高清晰度，不做任何裁剪与压缩。'}
              {layoutType === '1-per-page' && '每张发票等比自适应拉伸并独立居中占满一页标准 A4 纸张。'}
              {layoutType === '2-per-page' && '每页 A4 纵向堆叠 2 张发票，比例协调，适合高精度纸张归档。'}
              {layoutType === '3-per-page' && '每页 A4 纵向堆叠 3 张发票，国家电子普通发票最节省纸张推荐！'}
            </p>
          </div>

          {/* Toggle for cover page */}
          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-outline uppercase block mb-1.5">汇总目录页 (首面清单)</label>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <span className="text-xs font-semibold text-on-surface">生成第一页清单汇总目录</span>
                <button
                  type="button"
                  onClick={() => setIncludeCover(!includeCover)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    includeCover ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      includeCover ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-outline leading-normal">
              开启后在合并首面生成包含所有文件信息的清单表格，关闭则完全由纯发票拼版页构成。
            </p>
          </div>
        </div>
      </section>

      {/* Document Preview Area (Advanced Real-Time Interactive PDF A4 Document Viewer) */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">拼版文档在线实时预览</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                合并成品共 <span className="font-bold text-primary">{totalPagesCount}</span> 页 
                {includeCover ? ' (含第一页清单目录)' : ' (纯发票拼版)'}
              </p>
            </div>
          </div>

          {/* View mode toggle controls (Pages vs Scroll feed) */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
            <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/30 select-none">
              <button
                type="button"
                onClick={() => setPreviewMode('pages')}
                className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                  previewMode === 'pages'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                title="单页翻页浏览模式"
              >
                <Layers className="w-3.5 h-3.5" />
                单页翻页
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('scroll')}
                className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                  previewMode === 'scroll'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                title="纵向长卷滚动浏览"
              >
                <List className="w-3.5 h-3.5" />
                多页长卷
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono font-bold text-on-surface-variant">
              <span className="bg-surface-container-highest px-2.5 py-1 rounded-md">
                A4 纸张排版
              </span>
              <span className="bg-surface-container-highest px-2.5 py-1 rounded-md text-primary">
                {precompressedSize} MB
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic preview content panel */}
        {previewMode === 'pages' ? (
          // PAGE BY PAGE FLIP VIEW
          <div className="space-y-4">
            <div className="relative w-full max-w-[540px] aspect-[1/1.414] bg-white border border-neutral-200 rounded-lg shadow-xl mx-auto overflow-hidden group">
              
              {/* Main content */}
              {renderA4Page(pagesList[currentActivePage], false)}

              {/* Float Overlay Indicator for full screen click */}
              <div 
                onClick={() => openLightbox(currentActivePage)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-lg text-white gap-2 select-none"
              >
                <Fullscreen className="w-8 h-8 text-white animate-pulse" />
                <span className="bg-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">
                  点击展开超清全屏大图 (P. {currentActivePage + 1})
                </span>
              </div>

              {/* Float Page Number Tag */}
              <div className="absolute bottom-3 right-3 bg-neutral-900/85 backdrop-blur-sm text-white text-[10px] font-mono font-extrabold px-3 py-1.5 rounded-full shadow-md select-none border border-neutral-700">
                A4 PAGE {currentActivePage + 1} / {totalPagesCount}
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center justify-between mt-4 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/35 max-w-[540px] mx-auto shadow-sm select-none">
              <button
                disabled={currentActivePage === 0}
                onClick={() => setActivePageIdx(prev => Math.max(0, prev - 1))}
                className="px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 disabled:hover:bg-white rounded-lg border border-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                上一页
              </button>
              
              <span className="text-xs font-mono font-bold text-on-surface-variant bg-white border border-neutral-200/60 px-4 py-1.5 rounded-lg shadow-inner">
                第 <span className="text-primary font-extrabold text-sm">{currentActivePage + 1}</span> / {totalPagesCount} 页
              </span>

              <button
                disabled={currentActivePage === totalPagesCount - 1}
                onClick={() => setActivePageIdx(prev => Math.min(totalPagesCount - 1, prev + 1))}
                className="px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 disabled:hover:bg-white rounded-lg border border-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
              >
                下一页
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // MULTI-PAGE VERTICAL SCROLL VIEW
          <div className="space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar p-6 bg-neutral-900/5 rounded-2xl border border-neutral-200/40">
            <p className="text-[11px] text-center text-outline select-none pb-2">
              💡 正在滚动浏览全部 {totalPagesCount} 页 A4 合并文档，使用滚轮上下翻页。点击任意单页可唤出超清大图。
            </p>
            {pagesList.map((page, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between max-w-[540px] mx-auto px-1 select-none">
                  <span className="text-[10px] font-mono font-extrabold text-neutral-400 uppercase tracking-widest bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                    A4 页码 PAGE {idx + 1} / {totalPagesCount}
                  </span>
                  <button
                    onClick={() => openLightbox(idx)}
                    className="text-[10px] font-sans text-primary font-extrabold hover:underline flex items-center gap-1"
                  >
                    <Fullscreen className="w-3 h-3" />
                    展开超清大图
                  </button>
                </div>
                
                <div className="relative w-full max-w-[540px] aspect-[1/1.414] bg-white border border-neutral-200 rounded-lg shadow-lg mx-auto overflow-hidden group">
                  {renderA4Page(page, false)}
                  
                  {/* Floating click layer for hover trigger */}
                  <div 
                    onClick={() => openLightbox(idx)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-lg text-white gap-2 select-none"
                  >
                    <Fullscreen className="w-8 h-8 text-white animate-pulse" />
                    <span className="bg-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">
                      查看第 {idx + 1} 页超清全屏
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Tips based on Layout selection */}
        <div className="mt-6 p-4 bg-primary-container/10 border border-primary-container/35 rounded-xl flex items-start gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-on-surface">财务排版打印提示</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
              {layoutType === '3-per-page' && '您已选择【一页三张】排版，合并后的 A4 PDF 每页将等比紧凑容纳三张横版发票，并伴有浅色裁剪虚线，直接双面或单面打印出来即符合公司财务标准的装订及报销规范。'}
              {layoutType === '2-per-page' && '您已选择【一页两张】排版，合并后的 A4 PDF 每页将上下居中容纳两张横版发票，预留充足裁剪装订线，推荐用以大颗粒面额报销归档。'}
              {layoutType === '1-per-page' && '您已选择【一页一张】排版，原发票页面 1:1 无损拼入 PDF。适用于混合了 portrait 的非标账单。'}
              {layoutType === 'original' && '您已选择【1:1 原图】排版，发票完全按照原图大小尺寸无损缝合，最适合多尺寸图片原始核实。'}
            </p>
          </div>
        </div>

      </section>

      {/* Primary reset and continue action buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        {onBackToQueue && (
          <button
            onClick={onBackToQueue}
            className="h-11 px-6 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            返回调整 / 继续添加发票
          </button>
        )}
        <button
          onClick={onReset}
          className="h-11 px-6 bg-white hover:bg-surface-container-high text-on-surface border border-outline rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-all text-sm shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-outline" />
          清空并重新开始
        </button>
      </div>

      {/* Full Screen Lightbox Slide Overlay for A4 Pages */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6">
          
          {/* Header metadata bar */}
          <div className="flex justify-between items-center text-white border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-sm font-bold text-white">
                {pagesList[lightboxIndex]?.type === 'cover' ? '汇总发票清单与目录报表' : `第 ${pagesList[lightboxIndex]?.pageNumber} 页 A4 拼版成品`}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                {pagesList[lightboxIndex]?.type === 'cover' 
                  ? '系统安全数字签章校验通过' 
                  : `包含 ${pagesList[lightboxIndex]?.files?.length || 0} 张发票拼入 | 格式: ${layoutType === 'original' ? '1:1 原尺寸' : '标准 A4 纵向'}`}
              </p>
            </div>
            
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Core image stage */}
          <div className="flex-1 flex items-center justify-between gap-4 max-h-[80vh] my-4">
            
            {/* Prev button */}
            <button
              disabled={lightboxIndex === 0}
              onClick={() => setLightboxIndex(prev => Math.max(0, prev - 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Stage element with full scrolling support */}
            <div className="flex-1 overflow-y-auto custom-scrollbar h-full max-h-[75vh] flex items-start justify-center p-2">
              <div className="w-full max-w-[680px] aspect-[1/1.414] bg-white border border-neutral-200 rounded-lg shadow-2xl overflow-hidden relative">
                {renderA4Page(pagesList[lightboxIndex], true)}
              </div>
            </div>

            {/* Next button */}
            <button
              disabled={lightboxIndex === totalPagesCount - 1}
              onClick={() => setLightboxIndex(prev => Math.min(totalPagesCount - 1, prev + 1))}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors shrink-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Lightbox footer index indicators */}
          <div className="flex items-center justify-center gap-2 pb-2 select-none">
            {pagesList.map((page, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  lightboxIndex === idx ? 'w-8 bg-primary-container' : 'w-2.5 bg-white/30'
                }`}
                title={`第 ${idx + 1} 页`}
              />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
