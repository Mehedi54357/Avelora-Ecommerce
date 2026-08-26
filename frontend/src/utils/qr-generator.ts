import QRCode from 'qrcode';

export interface QrOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
}

/**
 * Get canonical public storefront origin
 */
export function getStorefrontBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    'https://avelora-ecommerce.vercel.app'
  ).replace(/\/+$/, '');
}

/**
 * Build permanent Product QR resolution URL
 */
export function buildProductQrUrl(publicCode: string): string {
  const base = getStorefrontBaseUrl();
  return `${base}/q/p/${encodeURIComponent(publicCode.trim().toUpperCase())}`;
}

/**
 * Build secure Order Tracking QR URL
 */
export function buildOrderTrackingQrUrl(tokenPayload: string): string {
  const base = getStorefrontBaseUrl();
  return `${base}/q/o/${encodeURIComponent(tokenPayload.trim())}`;
}

/**
 * Generate high-resolution QR Code Data URL (PNG)
 */
export async function generateQrDataUrl(
  payload: string,
  options?: QrOptions,
): Promise<string> {
  if (!payload || typeof payload !== 'string' || payload.trim() === '') {
    throw new Error('QR payload must be a non-empty string');
  }

  const cleanPayload = payload.trim();
  const width = options?.width || 1024; // High resolution for crisp printing and display
  const margin = options?.margin !== undefined ? options.margin : 2;

  try {
    const dataUrl = await QRCode.toDataURL(cleanPayload, {
      width,
      margin,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.darkColor || '#0B0F19',
        light: options?.lightColor || '#FFFFFF',
      },
    });

    if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
      throw new Error('Generated QR data URL is empty or invalid format');
    }

    return dataUrl;
  } catch (err: any) {
    console.error('Failed to generate QR Data URL:', err);
    throw new Error(err.message || 'QR code generation failed');
  }
}

/**
 * Generate vector QR Code SVG string
 */
export async function generateQrSvg(
  payload: string,
  options?: QrOptions,
): Promise<string> {
  if (!payload || typeof payload !== 'string' || payload.trim() === '') {
    throw new Error('QR payload must be a non-empty string');
  }

  const cleanPayload = payload.trim();
  const margin = options?.margin !== undefined ? options.margin : 2;

  return QRCode.toString(cleanPayload, {
    type: 'svg',
    margin,
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    color: {
      dark: options?.darkColor || '#0B0F19',
      light: options?.lightColor || '#FFFFFF',
    },
  });
}

/**
 * Robust QR image downloader with image-load verification
 */
export async function downloadQrImage(
  dataUrlOrPayload: string,
  filename: string,
): Promise<boolean> {
  if (!dataUrlOrPayload) {
    throw new Error('Cannot download: QR code data is empty');
  }

  let finalDataUrl = dataUrlOrPayload;

  // If raw string payload was passed instead of DataURL, generate DataURL first
  if (!dataUrlOrPayload.startsWith('data:image/')) {
    finalDataUrl = await generateQrDataUrl(dataUrlOrPayload, { width: 1200 });
  }

  return new Promise((resolve, reject) => {
    // Verify image data validity in memory before triggering browser download
    const img = new Image();
    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        reject(new Error('Downloaded QR image has 0x0 dimensions (blank image)'));
        return;
      }

      try {
        const a = document.createElement('a');
        a.href = finalDataUrl;
        a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve(true);
      } catch (e: any) {
        reject(new Error(`Download trigger failed: ${e.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error('QR Data URL failed to decode as a valid PNG image'));
    };

    img.src = finalDataUrl;
  });
}
