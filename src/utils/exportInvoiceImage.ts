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

  // Ensure all web fonts (Plus Jakarta Sans, Cormorant Garamond, etc.) are loaded before rendering
  try {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await (document as any).fonts.ready;
    }
  } catch (fontErr) {
    console.warn('Waiting for fonts failed or not supported:', fontErr);
  }

  let dataUrl = '';

  // Helper to reset parent layout in cloned document so html2canvas renders at (0, 0)
  const resetClonedLayout = (clonedDoc: Document, element: HTMLElement) => {
    // Ensure the iframe document and body evaluate as wide desktop viewport (>= 820px)
    if (clonedDoc.documentElement) {
      clonedDoc.documentElement.style.width = '820px';
      clonedDoc.documentElement.style.minWidth = '820px';
    }
    if (clonedDoc.body) {
      clonedDoc.body.style.width = '820px';
      clonedDoc.body.style.minWidth = '820px';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';
    }

    let current: HTMLElement | null = element;
    while (current && current !== clonedDoc.body) {
      current.style.position = 'static';
      current.style.left = '0';
      current.style.top = '0';
      current.style.transform = 'none';
      current.style.opacity = '1';
      current.style.visibility = 'visible';
      current.style.overflow = 'visible';
      current = current.parentElement;
    }
    element.style.width = '800px';
    element.style.minWidth = '800px';
    element.style.maxWidth = '800px';
    element.style.display = 'block';
    element.style.backgroundColor = '#FFFFFF';
    element.style.boxSizing = 'border-box';

    // Ensure status stamps/badges never wrap words or break onto two lines during canvas capture
    clonedDoc.querySelectorAll('*').forEach((node: Element) => {
      const el = node as HTMLElement;
      const text = el.textContent ? el.textContent.trim() : '';
      if (
        text === 'PAID IN FULL' ||
        text.includes('PAID IN FULL') ||
        text.includes('UNPAID - INVOICE PENDING') ||
        text.includes('OFFICIAL RECEIPT')
      ) {
        el.style.whiteSpace = 'nowrap';
        el.style.wordBreak = 'keep-all';
        el.style.overflowWrap = 'normal';
        if (el.tagName === 'SPAN') {
          el.style.display = 'inline-block';
        } else if (el.tagName === 'DIV') {
          el.style.display = 'inline-flex';
          el.style.flexWrap = 'nowrap';
          el.style.alignItems = 'center';
        }
      }
    });
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
        imageTimeout: 3000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 820,
        width: 800,
        onclone: (clonedDoc, element) => {
          resetClonedLayout(clonedDoc, element);
        }
      }),
      6000,
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
            imageTimeout: 3000,
          }),
          4000,
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
            width: 800,
            style: {
              position: 'static',
              opacity: '1',
              visibility: 'visible',
              transform: 'none',
              width: '800px',
              minWidth: '800px',
              maxWidth: '800px'
            }
          }),
          4000,
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
