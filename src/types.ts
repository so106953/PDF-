export interface InvoiceFile {
  id: string;
  name: string;
  size: number; // in bytes
  type: 'pdf' | 'png' | 'jpg';
  date: string; // YYYY-MM-DD
  previewUrl: string;
  isReal: boolean;
  fileObject?: File;
}

export type AppStep = 'home' | 'queue' | 'merging' | 'success';

export interface MergedResult {
  pdfUrl: string;
  pdfBlob?: Blob;
  fileName: string;
  fileSize: string;
  totalPages: number;
  previewPages: string[]; // hotlinked page previews or uploaded canvas base64s
}
