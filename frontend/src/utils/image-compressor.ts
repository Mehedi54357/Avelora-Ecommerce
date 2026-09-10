/**
 * AVELORA High-Fidelity Image Processing Pipeline
 * Preserves original master quality while ensuring graceful browser memory and network performance.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  originalSize: number;
}

const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

export async function processImageForUpload(
  file: File,
  maxDimension = 2500,
  quality = 0.94,
): Promise<ProcessedImageResult> {
  // 1. Validation: MIME Type
  if (!SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(
      `Unsupported file type "${file.type}". Please upload JPG, PNG, WebP, or AVIF images.`,
    );
  }

  // 2. Validation: File Size limit (50MB max per file to support any professional DSLR / iPhone RAW)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('Image file exceeds 50MB. Please choose a smaller image.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('Failed to read image file data.'));
      }

      const img = new Image();
      img.src = rawDataUrl;

      img.onload = () => {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        // Zero-dimension check
        if (origWidth === 0 || origHeight === 0) {
          return reject(new Error('Corrupted image with zero dimensions detected.'));
        }

        // Always apply smart web optimization (max 1400px, quality 0.82) to prevent MongoDB 16MB document size overflow
        let targetWidth = origWidth;
        let targetHeight = origHeight;
        const targetMaxDimension = Math.min(maxDimension, 1400);

        if (targetWidth > targetMaxDimension || targetHeight > targetMaxDimension) {
          if (targetWidth >= targetHeight) {
            targetHeight = Math.round((targetHeight * targetMaxDimension) / targetWidth);
            targetWidth = targetMaxDimension;
          } else {
            targetWidth = Math.round((targetWidth * targetMaxDimension) / targetHeight);
            targetHeight = targetMaxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: rawDataUrl,
            width: origWidth,
            height: origHeight,
            format: file.type,
            originalSize: file.size,
          });
        }

        // High-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Try WebP first for optimal lossless/lossy compression, fallback to JPEG
        let finalDataUrl = '';
        let finalFormat = 'image/webp';
        try {
          finalDataUrl = canvas.toDataURL('image/webp', quality);
          if (!finalDataUrl.startsWith('data:image/webp')) {
            finalDataUrl = canvas.toDataURL('image/jpeg', quality);
            finalFormat = 'image/jpeg';
          }
        } catch {
          finalDataUrl = canvas.toDataURL('image/jpeg', quality);
          finalFormat = 'image/jpeg';
        }

        resolve({
          dataUrl: finalDataUrl,
          width: targetWidth,
          height: targetHeight,
          format: finalFormat,
          originalSize: file.size,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image. The file may be corrupted.'));
    };

    reader.onerror = () => reject(new Error('Failed to read image file from disk.'));
  });
}

// Backward-compatible alias for existing imports
export async function compressImage(file: File, maxWidth = 2500, quality = 0.94): Promise<string> {
  const res = await processImageForUpload(file, maxWidth, quality);
  return res.dataUrl;
}
