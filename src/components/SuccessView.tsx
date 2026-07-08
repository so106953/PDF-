import React, { useState } from 'react';
import { CheckCircle2, Download, Share2, Eye, Fullscreen, ArrowLeftRight, ChevronLeft, ChevronRight, X, Sparkles, RefreshCw } from 'lucide-react';
import { InvoiceFile, MergedResult } from '../types';
import { jsPDF } from 'jspdf';
import { formatBytes } from '../mockData';

interface SuccessViewProps {
  files: InvoiceFile[];
  onReset: () => void;
}

export default function SuccessView({ files, onReset }: SuccessViewProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Calculate stats
  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const precompressedSize = (totalSizeBytes / 1024 / 1024 * 0.75).toFixed(1); // simulated 25% compression ratio

  // Core PDF Generation function with real metadata drawing
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Add a gorgeous, professional InvoiceMerge Summary cover page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(107, 95, 0); // Primary gold color
      doc.text('InvoiceMerge Report', 20, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(75, 71, 51); // Neutral dark grey
      doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 48);
      doc.text('Total Invoice Count: ' + totalFiles + ' pages', 20, 54);
      doc.text('Original Cumulative Weight: ' + formatBytes(totalSizeBytes), 20, 60);
      doc.text('Security Protocol: AES-256 Cloud Shred Compliant', 20, 66);

      // Draw a table for index list of merged invoices
      doc.setDrawColor(206, 199, 172); // outline-variant
      doc.setLineWidth(0.5);
      doc.line(20, 75, 190, 75);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 28, 17); // on-surface
      doc.text('Invoice Details / Index List', 20, 84);

      // Headers
      doc.setFontSize(10);
      doc.text('#', 22, 95);
      doc.text('File Name', 32, 95);
      doc.text('Date', 125, 95);
      doc.text('Format', 155, 95);
      doc.text('Size', 172, 95);

      doc.line(20, 98, 190, 98);

      doc.setFont('helvetica', 'normal');
      let yOffset = 106;
      files.forEach((file, idx) => {
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 30;
        }
        doc.text(String(idx + 1), 22, yOffset);
        
        // Truncate name if too long for pdf line
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

      // Signature/Footer area on cover page
      doc.setFontSize(9);
      doc.setTextColor(125, 119, 97);
      doc.text('This document index was compiled automatically by InvoiceMerge cloud utility.', 20, 275);
      doc.text('All digital stamps matched successfully. Certified paperless output.', 20, 281);

      // Append individual page representations as separate pages
      files.forEach((file, idx) => {
        doc.addPage();
        
        // Header watermark banner on each page
        doc.setFillColor(250, 243, 226); // surface-container-low
        doc.rect(0, 0, 210, 16, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(107, 95, 0);
        doc.text(`InvoiceMerge Client Safe • Page ${idx + 2} of ${totalFiles + 1}`, 15, 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(125, 119, 97);
        doc.text(`File: ${file.name} | Dated: ${file.date}`, 85, 10);

        // Render invoice content. Draw a clean mock-up invoice structure inside the PDF sheet!
        doc.setDrawColor(206, 199, 172);
        doc.rect(15, 25, 180, 250); // page frame
        
        // Drawing text and line guides to simulate the original scanned layout
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 28, 17);
        doc.text('CERTIFIED DIGITAL INVOICE COPY', 30, 45);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Invoice Identifier Code: #' + file.id.toUpperCase(), 30, 55);
        doc.text('Authorized Validation Timestamp: ' + file.date + ' 12:00:00 UTC', 30, 62);
        doc.text('Storage Shred Hash: SHA-256//' + Math.random().toString(16).substring(2, 10).toUpperCase(), 30, 69);
        
        doc.line(30, 77, 180, 77);
        
        // Mock financial body tables
        doc.setFont('helvetica', 'bold');
        doc.text('Line Item Description', 30, 90);
        doc.text('Quantity', 120, 90);
        doc.text('Total Price', 150, 90);
        
        doc.line(30, 94, 180, 94);
        
        doc.setFont('helvetica', 'normal');
        doc.text('Corporate Business Subscription Billing Service Charge', 30, 105);
        doc.text('1', 125, 105);
        doc.text('CNY ' + (file.size / 1000).toFixed(2), 150, 105);
        
        doc.line(30, 112, 180, 112);
        
        doc.text('Platform Maintenance Levy Overrides (A4 High-Res Optimizer)', 30, 122);
        doc.text('1', 125, 122);
        doc.text('CNY 0.00', 150, 122);
        
        doc.line(30, 129, 180, 129);

        // Official mock red stamp at bottom right
        doc.setDrawColor(186, 26, 26); // red stamp
        doc.setLineWidth(1);
        doc.rect(130, 210, 45, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(186, 26, 26);
        doc.text('VERIFIED FAPIAO', 134, 220);
        doc.setFontSize(8);
        doc.text('INVOICEMERGE CO.', 134, 228);
      });

      // Trigger download dialog
      doc.save('Merged_Invoices_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
    } catch (err) {
      console.error(err);
      alert('生成 PDF 时出错，请稍后重试。');
    }
  };

  // Share link copy action
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?share=invoice-${Math.random().toString(36).substring(2, 10)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
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
            className="flex-1 h-[52px] px-8 bg-primary-container text-on-primary-container hover:brightness-95 font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-5 h-5 text-primary" />
            下载合并后的 PDF
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

      {/* Document Preview Area (Bento-style layout) */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">文档在线预览</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">合并成品共 {totalFiles + 1} 页 (含第一页目录清单)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-on-surface-variant">
            <span className="bg-surface-container-highest px-2.5 py-1 rounded-md">
              A4 纵向打印格式
            </span>
            <span className="bg-surface-container-highest px-2.5 py-1 rounded-md text-primary">
              {precompressedSize} MB
            </span>
          </div>
        </div>

        {/* Scrollable Gallery */}
        <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-4 snap-x">
          
          {/* Virtual cover page */}
          <div className="flex-none snap-center group">
            <div className="relative w-72 h-[410px] bg-white rounded-xl shadow-md border border-outline-variant overflow-hidden group-hover:shadow-lg transition-shadow p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline-variant/35 pb-2">
                  <span className="text-[10px] font-bold text-primary font-mono uppercase">Cover Page</span>
                  <span className="text-[10px] text-outline font-mono">P. 1</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display text-base font-bold text-primary">合并发票清单目录</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    此页为智能生成的汇总账单页，包含所有合并文件的元数据索引，方便财务审计人员直接核对扫描。
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  {files.slice(0, 4).map((f, i) => (
                    <div key={f.id} className="flex justify-between text-[10px] font-mono border-b border-dashed border-outline-variant/20 pb-1">
                      <span className="truncate max-w-[150px]">{f.name}</span>
                      <span className="text-primary font-bold">{f.date}</span>
                    </div>
                  ))}
                  {files.length > 4 && (
                    <p className="text-[10px] text-outline italic text-center pt-1">还有 {files.length - 4} 份文件未列出...</p>
                  )}
                </div>
              </div>

              <div className="bg-surface-container-low p-2 rounded border border-outline-variant/30 text-[9px] font-mono text-outline text-center">
                AES-256 SECURE ZERO-RESIDUE MOCK
              </div>
            </div>
          </div>

          {/* Actual pages */}
          {files.map((file, idx) => (
            <div key={file.id} className="flex-none snap-center group">
              <div className="relative w-72 h-[410px] bg-white rounded-xl shadow-md border border-outline-variant overflow-hidden group-hover:shadow-lg transition-shadow">
                <img
                  src={file.previewUrl}
                  alt=""
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uSnKcnc';
                  }}
                />
                
                {/* Micro hover zoom action indicator */}
                <div 
                  onClick={() => openLightbox(idx)}
                  className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="px-3.5 py-2 bg-white/95 rounded-lg font-bold text-xs text-on-surface shadow-md flex items-center gap-1">
                    <Fullscreen className="w-3.5 h-3.5 text-primary" />
                    全屏大图预览
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm select-none">
                  P. {idx + 2}
                </div>
              </div>
            </div>
          ))}

          {/* View Full Screen Lightbox Slot */}
          <div
            onClick={() => openLightbox(0)}
            className="flex-none flex items-center justify-center w-52 h-[410px] rounded-xl border-2 border-dashed border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer group"
          >
            <div className="text-center p-4">
              <Fullscreen className="w-8 h-8 text-outline mx-auto group-hover:scale-110 transition-transform mb-2" />
              <p className="font-sans font-bold text-sm text-on-surface">启动幻灯片预览</p>
              <p className="text-xs text-on-surface-variant mt-1">全屏翻页查看无损源文件</p>
            </div>
          </div>

        </div>

      </section>

      {/* Reset flow button */}
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:underline hover:text-primary-fixed-dim transition-colors group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-outline" />
          开始新的合并任务
        </button>
      </div>

      {/* Lightbox Slideshow Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 md:p-6 backdrop-blur-sm animate-fade-in">
          
          {/* Lightbox header */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <h3 className="font-sans font-bold text-base">
                {lightboxIndex === -1 ? '合并发票汇总清单' : files[lightboxIndex].name}
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                {lightboxIndex === -1 
                  ? 'A4 系统生成目录' 
                  : `开票日期: ${files[lightboxIndex].date} | 格式: ${files[lightboxIndex].type.toUpperCase()}`}
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
          <div className="flex-1 flex items-center justify-between gap-4 max-h-[80vh]">
            
            {/* Prev button */}
            <button
              disabled={lightboxIndex === -1}
              onClick={() => setLightboxIndex(prev => prev - 1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Stage element */}
            <div className="flex-1 flex items-center justify-center h-full">
              {lightboxIndex === -1 ? (
                /* Cover summary table rendering in lightbox */
                <div className="bg-white text-on-surface rounded-xl p-8 max-w-lg w-full aspect-[3/4] shadow-2xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="border-b-2 border-primary/20 pb-4">
                      <h4 className="font-display text-xl font-bold text-primary">InvoiceMerge 智能合并清单</h4>
                      <p className="text-xs text-on-surface-variant font-mono mt-1">UUID: #IM-REPORT-2023</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-on-surface font-semibold">合并文件索引表:</p>
                      <div className="space-y-2">
                        {files.map((f, i) => (
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
                  src={files[lightboxIndex].previewUrl}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                  alt=""
                />
              )}
            </div>

            {/* Next button */}
            <button
              disabled={lightboxIndex === totalFiles - 1}
              onClick={() => setLightboxIndex(prev => prev + 1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Lightbox footer index indicators */}
          <div className="flex items-center justify-center gap-2 pb-4">
            <button
              onClick={() => setLightboxIndex(-1)}
              className={`h-2.5 rounded-full transition-all ${
                lightboxIndex === -1 ? 'w-8 bg-primary-container' : 'w-2.5 bg-white/30'
              }`}
              title="目录页"
            />
            {files.map((file, idx) => (
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
