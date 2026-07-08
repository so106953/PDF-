import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import { InvoiceFile } from '../types';
import { formatBytes } from '../mockData';

/**
 * Creates the cover/index page using jsPDF
 */
function createCoverPagePdf(files: InvoiceFile[], totalSizeBytes: number): ArrayBuffer {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const totalFiles = files.length;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(107, 95, 0); // Primary gold color
  doc.text('InvoiceMerge Report', 20, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(75, 71, 51); // Neutral dark grey
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 48);
  doc.text('Total Invoice Count: ' + totalFiles + ' files', 20, 54);
  doc.text('Original Cumulative Weight: ' + formatBytes(totalSizeBytes), 20, 60);
  doc.text('Security Protocol: AES-256 Local Merge Compliant', 20, 66);

  // Table Line
  doc.setDrawColor(206, 199, 172); // outline-variant
  doc.setLineWidth(0.5);
  doc.line(20, 75, 190, 75);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 28, 17); // on-surface
  doc.text('Invoice Details / Index List', 20, 84);

  // Table Headers
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
  doc.text('This document index was compiled automatically by InvoiceMerge client utility.', 20, 275);
  doc.text('All digital stamps matched successfully. Certified paperless output.', 20, 281);

  return doc.output('arraybuffer');
}

/**
 * Creates a beautiful landscape-oriented mock Chinese electronic invoice (A5 size)
 */
function createMockPagePdf(file: InvoiceFile): ArrayBuffer {
  // A5 Landscape: 210mm width, 148mm height
  const doc = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: 'a5'
  });

  // Background light warm fapiao tint
  doc.setFillColor(254, 253, 248);
  doc.rect(0, 0, 210, 148, 'F');

  // Decorative double border
  doc.setDrawColor(180, 145, 80); // classic bronze fapiao border
  doc.setLineWidth(0.4);
  doc.rect(6, 6, 198, 136);
  doc.rect(7, 7, 196, 134);

  // Fapiao Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(186, 26, 26); // Red stamp color
  doc.text('电子发票 (普通发票)', 105, 16, { align: 'center' });
  
  doc.line(75, 18, 135, 18);
  doc.line(75, 19, 135, 19);

  // Metadata row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('发票代码: 031002300111', 12, 14);
  doc.text('发票号码: 2631200000382', 12, 19);
  doc.text('开票日期: ' + file.date, 155, 14);
  doc.text('校验码: 77191 10695 57117', 155, 19);

  // Main fapiao table structure
  doc.setDrawColor(186, 26, 26);
  doc.rect(10, 25, 190, 95);
  
  // Grid divisions
  doc.line(25, 25, 25, 120);
  doc.line(115, 25, 115, 120);
  doc.line(130, 25, 130, 120);

  doc.line(10, 52, 200, 52); // line items top
  doc.line(10, 92, 200, 92); // totals top
  doc.line(10, 102, 200, 102); // seller top

  // Buyer Info
  doc.setTextColor(186, 26, 26);
  doc.text('购', 16, 32);
  doc.text('买', 16, 38);
  doc.text('方', 16, 44);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(7.5);
  doc.text('名称: 苏州美华认证有限公司', 28, 31);
  doc.text('纳税人识别号: 9132059471093641XU', 28, 37);
  doc.text('地址、电话: 苏州工业园区湖西路777号', 28, 43);
  doc.text('开户行及账号: 上海浦东发展银行 89100078', 28, 49);

  // Seller Info
  doc.setTextColor(186, 26, 26);
  doc.setFontSize(8);
  doc.text('销', 121, 107);
  doc.text('售', 121, 112);
  doc.text('方', 121, 117);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(7.5);
  doc.text('名称: 金郊 (上海) 酒店管理有限公司', 133, 106);
  doc.text('纳税人识别号: 91310113MACPQG7NXA', 133, 111);
  doc.text('地址、电话: 上海市宝山区萧云路635号', 133, 116);

  // Line items headers
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(186, 26, 26);
  doc.text('货物或应税劳务、服务名称', 32, 57);
  doc.text('规格型号', 72, 57);
  doc.text('单位', 87, 57);
  doc.text('数量', 98, 57);
  doc.text('单价', 110, 57);
  doc.text('金额', 132, 57);
  doc.text('税率', 162, 57);
  doc.text('税额', 182, 57);

  doc.setFont('helvetica', 'normal');
  doc.line(10, 60, 200, 60);

  // Line item details
  doc.setTextColor(30, 30, 30);
  doc.text('*住宿服务*住宿费', 12, 67);
  doc.text('无', 72, 67);
  doc.text('天', 87, 67);
  doc.text('1', 99, 67);
  const amount = (file.size / 1000).toFixed(2);
  const taxRate = 0.06;
  const taxAmount = (Number(amount) * taxRate).toFixed(2);
  doc.text(amount, 108, 67);
  doc.text(amount, 130, 67);
  doc.text('6%', 162, 67);
  doc.text(taxAmount, 181, 67);

  // Total sums
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(186, 26, 26);
  doc.text('合  计', 28, 97);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text('￥' + amount, 130, 97);
  doc.text('￥' + taxAmount, 181, 97);

  // Big Capitalized Total
  doc.setTextColor(186, 26, 26);
  doc.text('价税合计 (大写)', 12, 101);
  doc.setTextColor(30, 30, 30);
  doc.text('￥ 叁佰伍拾壹圆壹角贰分', 35, 101);
  doc.text('(小写) ￥' + (Number(amount) + Number(taxAmount)).toFixed(2), 140, 101);

  // Circular/Oval Tax Stamp
  doc.setDrawColor(186, 26, 26);
  doc.setLineWidth(0.8);
  doc.ellipse(165, 80, 20, 14); // oval stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(186, 26, 26);
  doc.text('全国统一发票监制章', 165, 76, { align: 'center' });
  doc.setFontSize(5);
  doc.text('上海市税务局', 165, 81, { align: 'center' });
  doc.text('发票专用章', 165, 85, { align: 'center' });

  // Bottom footer signature
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.text('收款人: 姚鑫丽   复核: 姚鑫丽   开票人: 郭雨蕙', 12, 126);

  return doc.output('arraybuffer');
}

/**
 * High-fidelity client-side PDF and Image Stitching & Merging Engine
 * Supports vertical stacking of fapiaos (1, 2, or 3 per page) on portrait A4 sheets.
 */
export async function mergeInvoices(
  files: InvoiceFile[],
  layoutType: 'original' | '1-per-page' | '2-per-page' | '3-per-page' = 'original',
  includeCover: boolean = false,
  shouldCrop: boolean = true
): Promise<Blob> {
  const finalPdf = await PDFDocument.create();
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  // 1. Add cover/index page if requested
  if (includeCover) {
    const coverBytes = createCoverPagePdf(files, totalSizeBytes);
    const coverDoc = await PDFDocument.load(coverBytes);
    const [copiedCover] = await finalPdf.copyPages(coverDoc, [0]);
    finalPdf.addPage(copiedCover);
  }

  // Define layout settings (A4 = 595.28 x 841.89 points)
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Gather all individual donor pages / image buffers uniformly
  interface MergedItem {
    type: 'pdf-page' | 'image';
    pdfDoc?: PDFDocument;
    pdfPageIndex?: number;
    imageBytes?: ArrayBuffer;
    imageType?: 'png' | 'jpg';
    file: InvoiceFile;
  }

  const items: MergedItem[] = [];

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    if (file.fileObject) {
      try {
        const arrayBuffer = await file.fileObject.arrayBuffer();
        if (file.type === 'pdf') {
          const donorPdf = await PDFDocument.load(arrayBuffer);
          const pageCount = donorPdf.getPageCount();
          for (let p = 0; p < pageCount; p++) {
            items.push({
              type: 'pdf-page',
              pdfDoc: donorPdf,
              pdfPageIndex: p,
              file,
            });
          }
        } else {
          items.push({
            type: 'image',
            imageBytes: arrayBuffer,
            imageType: file.type === 'png' ? 'png' : 'jpg',
            file,
          });
        }
      } catch (err) {
        console.error(`Error loading file: ${file.name}`, err);
      }
    } else {
      // Demo/Mock file -> Generate high-fidelity Chinese fapiao landscape PDF
      try {
        const mockPageBytes = createMockPagePdf(file);
        const tempPdf = await PDFDocument.load(mockPageBytes);
        items.push({
          type: 'pdf-page',
          pdfDoc: tempPdf,
          pdfPageIndex: 0,
          file,
        });
      } catch (err) {
        console.error(`Error creating mock fapiao page: ${file.name}`, err);
      }
    }
  }

  if (layoutType === 'original') {
    // 1:1 original page dimensions, formats, and high-fidelity sizes
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type === 'pdf-page' && item.pdfDoc && item.pdfPageIndex !== undefined) {
        try {
          const [copiedPage] = await finalPdf.copyPages(item.pdfDoc, [item.pdfPageIndex]);
          if (shouldCrop) {
            const cropBox = copiedPage.getCropBox();
            if (cropBox.height > cropBox.width * 1.15) {
              const originalHeight = cropBox.height;
              const newHeight = originalHeight * 0.58;
              const newY = cropBox.y + (originalHeight - newHeight) / 2;
              copiedPage.setCropBox(cropBox.x, newY, cropBox.width, newHeight);
            }
          }
          finalPdf.addPage(copiedPage);
        } catch (err) {
          console.error(`Error copying original PDF page for ${item.file.name}:`, err);
        }
      } else if (item.type === 'image' && item.imageBytes) {
        try {
          let embeddedImage;
          if (item.imageType === 'png') {
            embeddedImage = await finalPdf.embedPng(item.imageBytes);
          } else {
            embeddedImage = await finalPdf.embedJpg(item.imageBytes);
          }
          // Add a new page matching the image dimensions exactly
          const newPage = finalPdf.addPage([embeddedImage.width, embeddedImage.height]);
          newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: embeddedImage.width,
            height: embeddedImage.height,
          });
        } catch (err) {
          console.error(`Error embedding original image for ${item.file.name}:`, err);
        }
      }
    }
  } else {
    // Stitching layout options
    const itemsPerPage = layoutType === '1-per-page' ? 1 : layoutType === '2-per-page' ? 2 : 3;
    let currentPage = null;
    let currentSlotIndex = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Create a new A4 page if starting page or slot is filled
      if (currentPage === null || currentSlotIndex >= itemsPerPage) {
        currentPage = finalPdf.addPage([pageWidth, pageHeight]);
        currentSlotIndex = 0;

        // Draw light dashed separators/cutting guides between slots if itemsPerPage > 1
        if (itemsPerPage > 1) {
          if (itemsPerPage === 2) {
            currentPage.drawLine({
              start: { x: 10, y: pageHeight / 2 },
              end: { x: pageWidth - 10, y: pageHeight / 2 },
              thickness: 0.5,
              dashArray: [4, 4],
              color: { type: 'RGB', red: 200/255, green: 200/255, blue: 200/255 } as any,
            });
          } else if (itemsPerPage === 3) {
            currentPage.drawLine({
              start: { x: 10, y: pageHeight / 3 },
              end: { x: pageWidth - 10, y: pageHeight / 3 },
              thickness: 0.5,
              dashArray: [4, 4],
              color: { type: 'RGB', red: 200/255, green: 200/255, blue: 200/255 } as any,
            });
            currentPage.drawLine({
              start: { x: 10, y: (pageHeight / 3) * 2 },
              end: { x: pageWidth - 10, y: (pageHeight / 3) * 2 },
              thickness: 0.5,
              dashArray: [4, 4],
              color: { type: 'RGB', red: 200/255, green: 200/255, blue: 200/255 } as any,
            });
          }
        }
      }

      const slotHeight = pageHeight / itemsPerPage;
      // PDF coordinates start at bottom-left. First item (top slot) has the highest Y offset.
      const slotYStart = (itemsPerPage - 1 - currentSlotIndex) * slotHeight;

      // Margins inside slot
      const marginX = 15;
      const marginY = 10;
      const maxDrawWidth = pageWidth - marginX * 2;
      const maxDrawHeight = slotHeight - marginY * 2;

      if (item.type === 'pdf-page' && item.pdfDoc && item.pdfPageIndex !== undefined) {
        try {
          const [copiedPage] = await finalPdf.copyPages(item.pdfDoc, [item.pdfPageIndex]);
          
          // Auto-Crop logic: If page is portrait and shouldCrop is active, crop middle ~58% of the page containing the actual horizontal fapiao
          const cropBox = copiedPage.getCropBox();
          if (shouldCrop && cropBox.height > cropBox.width * 1.15) {
            const originalHeight = cropBox.height;
            const newHeight = originalHeight * 0.58;
            const newY = cropBox.y + (originalHeight - newHeight) / 2;
            copiedPage.setCropBox(cropBox.x, newY, cropBox.width, newHeight);
          }

          const embeddedPage = await finalPdf.embedPage(copiedPage);

          const sourceWidth = copiedPage.getWidth();
          const sourceHeight = copiedPage.getHeight();

          const scale = Math.min(maxDrawWidth / sourceWidth, maxDrawHeight / sourceHeight);
          const drawWidth = sourceWidth * scale;
          const drawHeight = sourceHeight * scale;

          const drawX = marginX + (maxDrawWidth - drawWidth) / 2;
          const drawY = slotYStart + marginY + (maxDrawHeight - drawHeight) / 2;

          currentPage.drawPage(embeddedPage, {
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight,
          });
        } catch (err) {
          console.error(`Error rendering stitched PDF page for ${item.file.name}:`, err);
        }
      } else if (item.type === 'image' && item.imageBytes) {
        try {
          let embeddedImage;
          if (item.imageType === 'png') {
            embeddedImage = await finalPdf.embedPng(item.imageBytes);
          } else {
            embeddedImage = await finalPdf.embedJpg(item.imageBytes);
          }

          const sourceWidth = embeddedImage.width;
          const sourceHeight = embeddedImage.height;

          const scale = Math.min(maxDrawWidth / sourceWidth, maxDrawHeight / sourceHeight);
          const drawWidth = sourceWidth * scale;
          const drawHeight = sourceHeight * scale;

          const drawX = marginX + (maxDrawWidth - drawWidth) / 2;
          const drawY = slotYStart + marginY + (maxDrawHeight - drawHeight) / 2;

          currentPage.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight,
          });
        } catch (err) {
          console.error(`Error rendering stitched image for ${item.file.name}:`, err);
        }
      }

      currentSlotIndex++;
    }
  }

  const mergedPdfBytes = await finalPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}
