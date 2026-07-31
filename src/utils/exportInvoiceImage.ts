import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

/**
 * Robustly exports a DOM node as a PNG image for download on both Desktop & Mobile (Chrome/Safari).
 */
export async function exportInvoiceAsImage(
  exportNode: HTMLElement | null,
  onscreenNode: HTMLElement | null,
  fileName: string
): Promise<void> {
  const targetEl = exportNode || onscreenNode;
  if (!targetEl) {
    throw new Error('No valid invoice element found to export.');
  }

  let dataUrl = '';

  // Helper with timeout to prevent infinite hanging on mobile browsers
  const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms: ${label}`));
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
  };

  // Attempt 1: html2canvas on primary export target
  try {
    const canvas = await withTimeout(
      html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        onclone: (clonedDoc, element) => {
          // Ensure cloned element is visible for canvas rendering
          element.style.opacity = '1';
          element.style.visibility = 'visible';
          element.style.position = 'relative';
          element.style.left = '0';
          element.style.top = '0';
        }
      }),
      6000,
      'html2canvas export'
    );
    dataUrl = canvas.toDataURL('image/png', 0.95);
  } catch (err1) {
    console.warn('Attempt 1 (html2canvas on export node) failed/timed out:', err1);

    // Attempt 2: html2canvas on onscreen node if available
    if (onscreenNode && onscreenNode !== targetEl) {
      try {
        const canvas = await withTimeout(
          html2canvas(onscreenNode, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false,
          }),
          5000,
          'html2canvas onscreen export'
        );
        dataUrl = canvas.toDataURL('image/png', 0.95);
      } catch (err2) {
        console.warn('Attempt 2 (html2canvas on onscreen node) failed:', err2);
      }
    }

    // Attempt 3: Fallback to html-to-image (toPng)
    if (!dataUrl) {
      try {
        dataUrl = await withTimeout(
          toPng(targetEl, {
            cacheBust: true,
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#FFFFFF',
            skipFonts: true,
            fontEmbedCSS: '',
            style: {
              opacity: '1',
              visibility: 'visible',
            },
          }),
          5000,
          'toPng fallback'
        );
      } catch (err3) {
        console.warn('Attempt 3 (toPng) failed:', err3);
        if (onscreenNode && onscreenNode !== targetEl) {
          dataUrl = await withTimeout(
            toPng(onscreenNode, {
              cacheBust: true,
              quality: 0.95,
              pixelRatio: 2,
              backgroundColor: '#FFFFFF',
              skipFonts: true,
              fontEmbedCSS: '',
            }),
            5000,
            'toPng onscreen fallback'
          );
        }
      }
    }
  }

  if (!dataUrl) {
    throw new Error('Could not generate PNG data from invoice layout.');
  }

  // Download trigger optimized for mobile browsers
  triggerMobileFriendlyDownload(dataUrl, fileName);
}

function triggerMobileFriendlyDownload(dataUrl: string, fileName: string): void {
  try {
    // Convert Base64 Data URL to Blob for better browser compatibility on mobile Chrome/Safari
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after 10 seconds
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  } catch (err) {
    console.warn('Blob download failed, falling back to direct link download:', err);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
