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
  // Always target exportNode first to guarantee the wide 800px Desktop format layout, or fallback to onscreenNode
  const primaryNode = exportNode || onscreenNode;
  const secondaryNode = onscreenNode && onscreenNode !== primaryNode ? onscreenNode : null;

  if (!primaryNode) {
    throw new Error('Tidak ditemukan elemen invoice untuk diunduh.');
  }

  let dataUrl = '';

  // Helper to reset parent layout in cloned document so html2canvas renders at (0, 0)
  const resetClonedLayout = (clonedDoc: Document, element: HTMLElement) => {
    let current: HTMLElement | null = element;
    while (current && current !== clonedDoc.body) {
      current.style.position = 'static';
      current.style.left = '0';
      current.style.top = '0';
      current.style.transform = 'none';
      current.style.opacity = '1';
      current.style.visibility = 'visible';
      current = current.parentElement;
    }
    element.style.width = '800px';
    element.style.display = 'block';
    element.style.backgroundColor = '#FFFFFF';
  };

  // Strategy 1: html2canvas on Primary Node with cloned layout reset
  try {
    const canvas = await runWithTimeout(
      html2canvas(primaryNode, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 2000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        onclone: (clonedDoc, element) => {
          resetClonedLayout(clonedDoc, element);
        }
      }),
      4000,
      'html2canvas primary'
    );
    dataUrl = canvas.toDataURL('image/png', 0.95);
  } catch (err1) {
    console.warn('Strategy 1 (html2canvas primary) failed or timed out:', err1);

    // Strategy 2: Direct html2canvas on onscreenNode if available
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
          3000,
          'html2canvas secondary'
        );
        dataUrl = canvas.toDataURL('image/png', 0.95);
      } catch (err2) {
        console.warn('Strategy 2 (html2canvas secondary) failed:', err2);
      }
    }

    // Strategy 3: toPng (html-to-image) on primary node
    if (!dataUrl) {
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
          3000,
          'toPng primary'
        );
      } catch (err3) {
        console.warn('Strategy 3 (toPng primary) failed:', err3);
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
      // Do NOT set link.target = '_blank' as modern browsers block async popup or ignore download attribute
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 200);
    } catch (dlErr) {
      console.warn('Direct anchor download failed, attempting dataUrl fallback:', dlErr);
      try {
        const linkData = document.createElement('a');
        linkData.href = dataUrl;
        linkData.download = fileName;
        document.body.appendChild(linkData);
        linkData.click();
        setTimeout(() => {
          if (document.body.contains(linkData)) {
            document.body.removeChild(linkData);
          }
        }, 200);
      } catch (dataErr) {
        console.warn('DataUrl download fallback failed, opening window:', dataErr);
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
