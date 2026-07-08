import React, { useState } from 'react';
import { Download, Share2, Eye, Fullscreen, Sparkles, RefreshCw, ShieldCheck, FileText, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatBytes } from '../mockData';
import { InvoiceFile } from '../types';

interface SharedViewProps {
  shareId: string;
  onGoToHome: () => void;
}

export default function SharedView({ shareId, onGoToHome }: SharedViewProps) {
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Generate a premium set of mock invoices for the shared link recipient
  const sharedFiles: InvoiceFile[] = [
    {
      id: 'shared-1',
      name: '阿里云计算服务账单 (Aliyun_Compute_Invoice).pdf',
      size: 1048576, // 1MB
      type: 'pdf',
      date: '2026-07-01',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      isReal: false
    },
    {
      id: 'shared-2',
      name: '滴滴出行商务行程报销 (Didi_Ride_Fapiao).jpg',
      size: 512000, // 500KB
      type: 'jpg',
      date: '2026-07-02',
      previewUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
      isReal: false
    },
    {
      id: 'shared-3',
      name: '腾讯会议企业版年度订阅 (Tencent_Meeting_Billing).png',
      size: 786432, // 768KB
      type: 'png',
      date: '2026-07-04',
      previewUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80',
      isReal: false
    }
  ];

  const totalFiles = sharedFiles.length;
  const totalSizeBytes = sharedFiles.reduce((acc, f) => acc + f.size, 0);
  const precompressedSize = (totalSizeBytes / 1024 / 1024 * 0.75).toFixed(1);

  // Core PDF Generation function for the Shared Recipient View
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Cover Page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(107, 95, 0); // Primary Gold
      doc.text('InvoiceMerge Shared Package', 20, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(75, 71, 51);
      doc.text('Shared Package ID: #' + shareId.toUpperCase(), 20, 48);
      doc.text('Export Date: ' + new Date().toLocaleDateString(), 20, 54);
      doc.text('Invoice Count: ' + totalFiles + ' pages', 20, 60);
      doc.text('Total Size: ' + formatBytes(totalSizeBytes), 20, 66);
      doc.text('Security Protocol: AES-256 Shared Stream compliant', 20, 72);

      // Table Header Line
      doc.setDrawColor(206, 199, 172);
      doc.setLineWidth(0.5);
      doc.line(20, 80, 190, 80);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 28, 17);
      doc.text('Verified Invoice List', 20, 89);

      doc.setFontSize(10);
      doc.text('#', 22, 99);
      doc.text('File Name', 32, 99);
      doc.text('Date', 125, 99);
      doc.text('Format', 155, 99);
      doc.text('Size', 172, 99);

      doc.line(20, 102, 190, 102);

      doc.setFont('helvetica', 'normal');
      let yOffset = 110;
      sharedFiles.forEach((file, idx) => {
        doc.text(String(idx + 1), 22, yOffset);
        let displayName = file.name;
        if (displayName.length > 35) {
          displayName = displayName.substring(0, 32) + '...';
        }
        doc.text(displayName, 32, yOffset);
        doc.text(file.date, 125, yOffset);
        doc.text(file.type.toUpperCase(), 155, yOffset);
        doc.text(formatBytes(file.size), 172, yOffset);
        
        doc.line(20, yOffset + 3, 190, yOffset + 3);
        yOffset += 12;
      });

      doc.setFontSize(9);
      doc.setTextColor(125, 119, 97);
      doc.text('This shared document bundle was verified and compiled by InvoiceMerge.', 20, 275);
      doc.text('Authenticity certificate matches successfully.', 20, 281);

      // Sub-pages representing actual invoices
      sharedFiles.forEach((file, idx) => {
        doc.addPage();
        
        doc.setFillColor(250, 243, 226);
        doc.rect(0, 0, 210, 16, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(107, 95, 0);
        doc.text(`InvoiceMerge Client Safe • Page ${idx + 2} of ${totalFiles + 1}`, 15, 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(125, 119, 97);
        doc.text(`File: ${file.name} | Dated: ${file.date}`, 85, 10);

        doc.setDrawColor(206, 199, 172);
        doc.rect(15, 25, 180, 250);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 28, 17);
        doc.text('CERTIFIED DIGITAL INVOICE COPY', 30, 45);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Invoice Identifier Code: #' + file.id.toUpperCase(), 30, 55);
        doc.text('Authorized Validation Timestamp: ' + file.date + ' 12:00:00 UTC', 30, 62);
        doc.text('Storage Shred Hash: SHA-256//SHARED-PREVIEW-DECK-MOCK', 30, 69);
        
        doc.line(30, 77, 180, 77);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Line Item Description', 30, 90);
        doc.text('Quantity', 120, 90);
        doc.text('Total Price', 150, 90);
        
        doc.line(30, 94, 180, 94);
        
        doc.setFont('helvetica', 'normal');
        doc.text('Shared Cloud Corporate Resources Billing Overrides', 30, 105);
        doc.text('1', 125, 105);
        doc.text('CNY ' + (file.size / 1000).toFixed(2), 150, 105);
        
        doc.line(30, 112, 180, 112);

        doc.setDrawColor(186, 26, 26);
        doc.setLineWidth(1);
        doc.rect(130, 210, 45, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(186, 26, 26);
        doc.text('VERIFIED FAPIAO', 134, 220);
        doc.setFontSize(8);
        doc.text('INVOICEMERGE CO.', 134, 228);
      });

      doc.save('Shared_Invoice_Package_' + shareId.toUpperCase() + '.pdf');
    } catch (err) {
      console.error(err);
      alert('无法生成 PDF 导出，请稍后重试。');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Welcome banner */}
      <section className="bg-gradient-to-br from-primary-container/20 to-secondary-container/5 border border-primary/20 rounded-2xl p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-primary opacity-20">
          <Sparkles className="w-16 h-16" />
        </div>

        <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm ring-4 ring-primary/5">
            <FileText className="w-8 h-8 text-primary" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
              SHARE ID: #{shareId.toUpperCase().replace('INVOICE-', '')}
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              收到了他人分享的合并发票包
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              这是您的同事或财务团队通过 InvoiceMerge 加密归档的发票报告。您可以直接在线预览每一张无损页面或一键打包下载完整 A4 PDF。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 w-full">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 h-[48px] px-6 bg-primary text-white hover:brightness-95 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-5 h-5" />
              下载合并后的 PDF 账单
            </button>
            
            <button
              onClick={handleCopyLink}
              className={`flex-1 h-[48px] px-6 font-bold rounded-xl border border-outline-variant flex items-center justify-center gap-2 active:scale-95 transition-all ${
                copied
                  ? 'bg-secondary-container text-on-secondary-container border-secondary'
                  : 'bg-white hover:bg-surface-container-low text-on-surface'
              }`}
            >
              <Share2 className="w-4 h-4" />
              {copied ? '分享链接已复制!' : '转发此分享链接'}
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Document Deck Preview */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-on-surface">文档提取明细预览</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">此发票合并包共 {totalFiles + 1} 页 (含系统生成的 A4 汇总目录清单)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-on-surface-variant">
            <span className="bg-surface-container-highest px-2.5 py-1 rounded-md">
              A4 纵向排版
            </span>
            <span className="bg-surface-container-highest px-2.5 py-1 rounded-md text-primary">
              {precompressedSize} MB
            </span>
          </div>
        </div>

        {/* Scrollable Gallery */}
        <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-4 snap-x">
          
          {/* Cover summary page */}
          <div className="flex-none snap-center">
            <div className="relative w-64 h-[360px] bg-white rounded-xl shadow-md border border-outline-variant overflow-hidden p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline-variant/35 pb-2">
                  <span className="text-[9px] font-bold text-primary font-mono uppercase">Cover Page</span>
                  <span className="text-[9px] text-outline font-mono">P. 1</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-bold text-primary">合并发票清单目录</h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    此页为智能生成的汇总清单目录，方便财务审计人员一键扫码核对。
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-1">
                  {sharedFiles.map((f, i) => (
                    <div key={f.id} className="flex justify-between text-[9px] font-mono border-b border-dashed border-outline-variant/20 pb-1">
                      <span className="truncate max-w-[130px]">{f.name}</span>
                      <span className="text-primary font-bold">{f.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-1.5 rounded border border-outline-variant/30 text-[8px] font-mono text-outline text-center">
                AES-256 SECURE SHRED ENCRYPTED
              </div>
            </div>
          </div>

          {/* Actual images */}
          {sharedFiles.map((file, idx) => (
            <div key={file.id} className="flex-none snap-center group">
              <div className="relative w-64 h-[360px] bg-white rounded-xl shadow-md border border-outline-variant overflow-hidden">
                <img
                  src={file.previewUrl}
                  alt=""
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uSnKcnc';
                  }}
                />
                
                <div 
                  onClick={() => openLightbox(idx)}
                  className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="px-3 py-1.5 bg-white rounded-lg font-bold text-xs text-on-surface shadow-md flex items-center gap-1">
                    <Fullscreen className="w-3 h-3 text-primary" />
                    全屏大图预览
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
                  P. {idx + 2}
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Platform call to action */}
      <section className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="font-sans font-bold text-base text-on-surface flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            您也想快速合并或排版发票吗？
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xl">
            InvoiceMerge 是由 Google AI Studio 提供技术支持的高精度发票处理引擎，支持批量合并、去重查重、高压缩导出，彻底解决报销排版难题。
          </p>
        </div>

        <button
          onClick={onGoToHome}
          className="px-5 py-2.5 bg-primary-container text-on-primary-container hover:brightness-95 font-extrabold rounded-xl text-sm flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-sm"
        >
          立即体验 InvoiceMerge
          <ArrowRight className="w-4 h-4 text-primary" />
        </button>
      </section>

      {/* Lightbox Slideshow Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 md:p-6 backdrop-blur-sm animate-fade-in">
          
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <h3 className="font-sans font-bold text-base">
                {lightboxIndex === -1 ? '合并发票汇总清单' : sharedFiles[lightboxIndex].name}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                {lightboxIndex === -1 
                  ? 'A4 系统生成目录' 
                  : `开票日期: ${sharedFiles[lightboxIndex].date} | 格式: ${sharedFiles[lightboxIndex].type.toUpperCase()}`}
              </p>
            </div>
            
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-between gap-4 max-h-[80vh]">
            <button
              disabled={lightboxIndex === -1}
              onClick={() => setLightboxIndex(prev => prev - 1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center h-full">
              {lightboxIndex === -1 ? (
                <div className="bg-white text-on-surface rounded-xl p-8 max-w-lg w-full aspect-[3/4] shadow-2xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="border-b-2 border-primary/20 pb-4">
                      <h4 className="font-display text-xl font-bold text-primary">InvoiceMerge 智能合并清单</h4>
                      <p className="text-xs text-on-surface-variant font-mono mt-1">UUID: #IM-REPORT-SHARED</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-on-surface font-semibold">合并文件索引表:</p>
                      <div className="space-y-2">
                        {sharedFiles.map((f, i) => (
                          <div key={f.id} className="flex justify-between items-center text-xs font-mono border-b border-dashed border-outline-variant/30 pb-1.5">
                            <span className="truncate max-w-[200px]">{f.name}</span>
                            <span className="text-primary font-bold">{f.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-outline text-center border-t border-outline-variant/30 pt-4 font-mono">
                    GENERATED BY INVOICEMERGE • DIGITAL SECURE ZERO LOG
                  </div>
                </div>
              ) : (
                <img
                  src={sharedFiles[lightboxIndex].previewUrl}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                  alt=""
                />
              )}
            </div>

            <button
              disabled={lightboxIndex === totalFiles - 1}
              onClick={() => setLightboxIndex(prev => prev + 1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pb-4">
            <button
              onClick={() => setLightboxIndex(-1)}
              className={`h-2.5 rounded-full transition-all ${
                lightboxIndex === -1 ? 'w-8 bg-primary-container' : 'w-2.5 bg-white/30'
              }`}
              title="目录页"
            />
            {sharedFiles.map((file, idx) => (
              <button
                key={file.id}
                onClick={() => setLightboxIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  lightboxIndex === idx ? 'w-8 bg-primary-container' : 'w-2.5 bg-white/30'
                }`}
                title={`第 ${idx + 2} 页`}
              />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
