import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

export interface ExportResult {
  success: boolean;
  dataUrl: string;
  blobUrl: string;
  shared?: boolean;
}

/**
 * Helper to convert Base64 Data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Timeout wrapper to prevent rendering engines from hanging indefinitely on Mobile browsers.
 */
function runWithTimeout<T>(promise: Promise<T>, ms: number, stepLabel: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms in ${stepLabel}`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Exports the 800px desktop-format invoice layout as a PNG image for direct download on Mobile & Desktop.
 */
export async function exportInvoiceAsImage(
  exportNode: HTMLElement | null,
  onscreenNode: HTMLElement | null,
  fileName: string
): Promise<ExportResult> {
  // Always target exportNode first to guarantee the wide 800px Desktop format layout
  const primaryNode = exportNode || onscreenNode;
  const secondaryNode = onscreenNode && onscreenNode !== primaryNode ? onscreenNode : null;

  if (!primaryNode) {
    throw new Error('Tidak ditemukan elemen invoice untuk diunduh.');
  }

  let dataUrl = '';

  // Strategy 1: html2canvas on Desktop-Format (800px) node
  try {
    const canvas = await runWithTimeout(
      html2canvas(primaryNode, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 2000,
        onclone: (_, element) => {
          element.style.position = 'static';
          element.style.left = '0';
          element.style.top = '0';
          element.style.transform = 'none';
          element.style.opacity = '1';
          element.style.visibility = 'visible';
          element.style.width = '800px';
        }
      }),
      4000,
      'html2canvas primary'
    );
    dataUrl = canvas.toDataURL('image/png', 0.95);
  } catch (err1) {
    console.warn('Strategy 1 (html2canvas primary) failed or timed out:', err1);

    // Strategy 2: toPng (html-to-image) on primary node
    try {
      dataUrl = await runWithTimeout(
        toPng(primaryNode, {
          cacheBust: true,
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#FFFFFF',
          skipFonts: true,
          fontEmbedCSS: '',
          style: {
            position: 'static',
            opacity: '1',
            visibility: 'visible',
            transform: 'none',
            width: '800px'
          }
        }),
        4000,
        'toPng primary'
      );
    } catch (err2) {
      console.warn('Strategy 2 (toPng primary) failed:', err2);

      // Strategy 3: Fallback on secondary node if available
      if (secondaryNode) {
        try {
          const canvas = await runWithTimeout(
            html2canvas(secondaryNode, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#FFFFFF',
              logging: false,
              imageTimeout: 2000,
            }),
            4000,
            'html2canvas secondary'
          );
          dataUrl = canvas.toDataURL('image/png', 0.95);
        } catch (err3) {
          console.warn('Strategy 3 (html2canvas secondary) failed:', err3);
        }
      }
    }
  }

  if (!dataUrl || dataUrl.length < 100) {
    throw new Error('Gagal merender gambar invoice PNG.');
  }

  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = URL.createObjectURL(blob);

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let shared = false;

  // 1. Mobile Web Share API
  if (isMobile && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice Hanford Hotels & Resorts',
          text: `Invoice #${fileName.replace(/\.png$/i, '')}`,
        });
        shared = true;
      }
    } catch (shareErr) {
      console.warn('Web Share was cancelled or failed:', shareErr);
    }
  }

  // 2. Direct Anchor Click Download
  if (!shared) {
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (dlErr) {
      console.warn('Direct anchor download failed, attempting window fallback:', dlErr);
      if (isMobile) {
        window.open(blobUrl, '_blank');
      }
    }
  }

  // Revoke Blob URL after 30 seconds
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30000);

  return { success: true, dataUrl, blobUrl, shared };
}
