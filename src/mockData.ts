import { InvoiceFile } from './types';

export const PREVIEW_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFzcy0VZ5-hJTVBFOEfDNRBm8AJKIMfo3DygYCz9-vRWWnUatVSOnR82M-JKgxWwBMJ-lytpR-WwMjchCSC_W_O9lA1c3D05Oh5fQOWNYj_n9CbF5tPrsV6scDG4zRB9wMOjcGvm7dwdU3gtmaSPmRsRMrJlF1qejM2BIMb1DVsETKjJUcls4ZOozfjxij0u80mhZlKfKiCRZI_dojkU7ABLOmrUOPoQtvReZFO-w7ToaI18kH46i9k9D0PRHZenWx9uSnKcnc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB6x1JQsbhlxyNnuCZckJFBe5xvjQsi2ygMSXuS8V7-B_-N1ffkf4gzjwtfFh4vynZ6foa_LX3-ziat0CDTdpx8Y7msFKpVWWQjfWjzoNiNlvzfYwQxV2WFICE83ypQUGruPMs2aatYGdB2pPzAzQ9mcOO0wgWjvWolZ-FbeDz5-E9J4nbZg8RE8RXUoUWaKyUwDe0DUB1Eyuwmj1nfaaROvuz-CYyeuIJ4cruHwRGfciTcmHm5o_P8C8tKoXu_OcyEKdZNfWQRC0U',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCzP7i_K3wB8Xy3WoCxLXJzLOrQDpaKjB-WnoUIxHX4udh_YsDyPcZ3KsDlLROPIyGFVfyZYoTDpkL0OwhEB1MApaJBxwsAPiz3I19yUYgdQkahxv1Q_vqyjCBujb4dPscsxxF3croKL_FiRjCYBsQmJegAyVE5gog_-0S7lpbLfJTQdPRCIMFA0fTNh6yaXdayD49Ja5ibVlDFUguFrlsX4rRWUMsRtuuCugNKS2B-ywERWuSDsjdNkJN-AgOMX9E7F72tEPXFK9o',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Iuus1maB6wxrACjmez6CNDJu3CQ4pG6HlqlAxbYTp3inha_jMaHm_-4aqITCHeynquKu9wH2T1cY8nZQp2lTd-q5P7eX-6EY6q_WwwmIKsw98sYvJ6S6ea4SQFmP7BmTApZrRmgrCO13F73ELypHr5q4Isn2foUgFyhkGadvANWh4bot0gbhcNKqiFZk5PppRLtoZb80irZ5eBkJ0VudW-LQN2EVwNoI9h_M315BuiFDmClH2Ppd49UWtK7_v8vda-9CWYA2OQc'
];

export const INITIAL_MOCK_FILES: InvoiceFile[] = [
  {
    id: 'mock-1',
    name: 'AWS_Invoice_Oct_2023.pdf',
    size: 1.2 * 1024 * 1024, // 1.2 MB
    type: 'pdf',
    date: '2023-10-15',
    previewUrl: PREVIEW_IMAGES[0],
    isReal: false
  },
  {
    id: 'mock-2',
    name: 'Google_Cloud_Billing_Sept.pdf',
    size: 840 * 1024, // 840 KB
    type: 'pdf',
    date: '2023-09-30',
    previewUrl: PREVIEW_IMAGES[1],
    isReal: false
  },
  {
    id: 'mock-3',
    name: 'Uber_Business_Travel_Q3.pdf',
    size: 2.4 * 1024 * 1024, // 2.4 MB
    type: 'pdf',
    date: '2023-10-02',
    previewUrl: PREVIEW_IMAGES[2],
    isReal: false
  },
  {
    id: 'mock-4',
    name: 'Microsoft_Azure_10293.pdf',
    size: 3.1 * 1024 * 1024, // 3.1 MB
    type: 'pdf',
    date: '2023-11-01',
    previewUrl: PREVIEW_IMAGES[3],
    isReal: false
  }
];

const EXTRA_NAMES = [
  'Alibaba_Cloud_ECS_Invoice.pdf',
  'WeChat_Pay_Taxi_Receipt.jpg',
  'China_Telecom_Monthly_Bill.png',
  'GitHub_CoPilot_Subscription.pdf',
  'Figma_Team_Seat_Billing.pdf',
  'SF_Express_Logistics_Receipt.png',
  'Starbucks_Coffee_Fapiao.jpg',
  'Hilton_Hotel_Stay_Folio.pdf'
];

export function generateRandomMockFile(): InvoiceFile {
  const id = 'mock-' + Math.random().toString(36).substring(2, 9);
  const nameIndex = Math.floor(Math.random() * EXTRA_NAMES.length);
  const name = EXTRA_NAMES[nameIndex];
  const extension = name.split('.').pop() as 'pdf' | 'png' | 'jpg';
  
  // Random size between 100KB and 4MB
  const size = Math.floor(Math.random() * 3.9 * 1024 * 1024) + 100 * 1024;
  
  // Random date in 2023
  const year = 2023;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  
  // Choose one of the 4 gorgeous invoice preview images
  const previewUrl = PREVIEW_IMAGES[Math.floor(Math.random() * PREVIEW_IMAGES.length)];
  
  return {
    id,
    name,
    size,
    type: extension,
    date,
    previewUrl,
    isReal: false
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
