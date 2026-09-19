import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { dataUrlToBlob } from './exportInvoiceImage';

export interface CardExportResult {
  success: boolean;
  dataUrl: string;
  blobUrl: string;
  shared?: boolean;
}

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
 * Convert a blob safely to a JPEG Data URL via FileReader or Canvas fallback
 */
async function blobToSafeDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    if (blob.type === 'image/jpeg' || blob.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
      return;
    }

    // If AVIF, WebP, or other format, convert through canvas to safe JPEG Data URL
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width || 880;
        c.height = img.naturalHeight || img.height || 568;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const safeDataUrl = c.toDataURL('image/jpeg', 0.95);
          URL.revokeObjectURL(blobUrl);
          resolve(safeDataUrl);
          return;
        }
      } catch (e) {
        console.warn('[Card Exporter] Canvas convert error:', e);
      }
      URL.revokeObjectURL(blobUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    };
    img.src = blobUrl;
  });
}

/**
 * Fetch an image URL (including Google Drive / Unsplash) and convert to Base64 Data URL.
 * Routes external remote URLs through local proxy to eliminate CORS & enforce standard JPEG/PNG format.
 */
async function fetchAsDataUrl(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  // If it's a local path (e.g. /logo-hanford.svg)
  if (url.startsWith('/')) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        return await blobToSafeDataUrl(blob);
      }
    } catch {}
  }

  // 1. Try backend proxy first for remote URLs to eliminate CORS and guarantee JPEG
  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      const safeUrl = await blobToSafeDataUrl(blob);
      if (safeUrl) return safeUrl;
    }
  } catch (err) {
    console.warn('[Card Exporter] Proxy fetch error for:', url, err);
  }

  // 2. Direct fetch fallback with cors
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await blobToSafeDataUrl(blob);
    }
  } catch {}

  return '';
}

/**
 * Preload and inline all images inside a DOM element to Base64 to prevent canvas tainting during export
 */
async function inlineImagesInElement(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      const src = img.src || img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        try {
          const dataUrl = await fetchAsDataUrl(src);
          if (dataUrl) {
            img.src = dataUrl;
            img.removeAttribute('crossorigin');
            img.removeAttribute('referrerpolicy');
            if ('decode' in img) {
              await img.decode().catch(() => {});
            }
          }
        } catch (e) {
          console.warn('[Card Exporter] Failed inlining image:', src, e);
        }
      }
    })
  );
}

/**
 * Direct 1920x1080 Canvas renderer for Hanford Guest Key Card.
 * Guarantees 100% pixel-identical output across all platforms.
 */
async function renderKeyCardToCanvas(targetElement: HTMLElement): Promise<string> {
  const bgUrl =
    targetElement.getAttribute('data-bg-url') ||
    'https://lh3.googleusercontent.com/d/1xF4361TyyrgDCeoFveQ49owPfOnY1xQ1';
  const guestName = (targetElement.getAttribute('data-guest-name') || 'GAVIN ELIAN BASKORO').toUpperCase();
  const roomNumber = (targetElement.getAttribute('data-room-number') || '').toUpperCase();
  const locationShort = (targetElement.getAttribute('data-location-short') || 'ULUWATU').toUpperCase();

  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Convert background image to Base64 to guarantee untainted canvas
  const bgDataUrl = (await fetchAsDataUrl(bgUrl)) || bgUrl;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to load background template image'));
    img.src = bgDataUrl;
  });

  // 1. Draw Background
  ctx.drawImage(img, 0, 0, 1920, 1080);

  // 2. Draw Room Number (Centered under GUEST KEY CARD on ivory insert) if present
  if (roomNumber.trim()) {
    ctx.save();
    ctx.fillStyle = '#18212C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '600 21px "Times New Roman", Georgia, serif';
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = '5.5px';
    }
    ctx.fillText(roomNumber, 600, 215);
    ctx.restore();
  }

  // 3. Draw Guest Name (Left aligned under GUEST NAME :)
  ctx.save();
  ctx.fillStyle = '#18212C';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '400 26px "Times New Roman", Georgia, serif';
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '3.6px';
  }
  ctx.fillText(guestName, 1046, 192);
  ctx.restore();

  // 4. Draw Location (Centered under HOTEL & RESORT on navy card)
  ctx.save();
  ctx.fillStyle = '#F5D68B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 23px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1.5;
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = '6px';
  }
  ctx.fillText(locationShort, 1274, 788);
  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Formats a canvas into exact standard A4 portrait dimensions (2480px width x 3508px height @ 300 DPI).
 */
function formatPortraitWelcomingCanvas(
  sourceCanvas: HTMLCanvasElement,
  targetWidth = 2480,
  targetHeight = 3508
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill A4 sheet cleanly
  const scale = Math.max(targetWidth / sourceCanvas.width, targetHeight / sourceCanvas.height);
  const drawW = Math.round(sourceCanvas.width * scale);
  const drawH = Math.round(sourceCanvas.height * scale);
  const drawX = Math.round((targetWidth - drawW) / 2);
  const drawY = Math.round((targetHeight - drawH) / 2);

  ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, drawX, drawY, drawW, drawH);
  return outCanvas;
}

/**
 * High-resolution PNG Exporter for Hanford Guest Key Cards, Welcoming Cards, and Accommodation Gallery Cards.
 * Guarantees wide 960px landscape/portrait web view layout on both Mobile and Desktop.
 */
export async function exportCardAsImage(
  exportNode: HTMLElement | null,
  onscreenNode: HTMLElement | null,
  fileName: string
): Promise<CardExportResult> {
  const primaryNode = exportNode || onscreenNode;
  const secondaryNode = onscreenNode && onscreenNode !== primaryNode ? onscreenNode : null;

  if (!primaryNode) {
    throw new Error('Tidak ditemukan elemen kartu untuk diunduh.');
  }

  const isA4Document =
    primaryNode.id.includes('welcome') ||
    primaryNode.id.includes('gallery') ||
    fileName.toLowerCase().includes('welcome') ||
    fileName.toLowerCase().includes('gallery') ||
    (secondaryNode && (secondaryNode.id.includes('welcome') || secondaryNode.id.includes('gallery')));

  let dataUrl = '';

  // Ensure all web fonts are completely loaded before capturing canvas
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-blocking fallback
    }
  }

  // Priority 1: Key Card Direct Canvas Renderer
  if (primaryNode.id.includes('key-card') || primaryNode.hasAttribute('data-guest-name')) {
    try {
      dataUrl = await runWithTimeout(renderKeyCardToCanvas(primaryNode), 6000, 'direct canvas render');
    } catch (errCanvas) {
      console.warn('[Card Exporter] Direct canvas failed, falling back to html2canvas:', errCanvas);
    }
  }

  // Helper to reset cloned layout inside html2canvas iframe
  const resetClonedLayout = (clonedDoc: Document, element: HTMLElement) => {
    // 1. Force wide desktop layout on iframe root and body
    if (clonedDoc.documentElement) {
      clonedDoc.documentElement.style.width = '1200px';
      clonedDoc.documentElement.style.minWidth = '1200px';
    }
    if (clonedDoc.body) {
      clonedDoc.body.style.width = '1200px';
      clonedDoc.body.style.minWidth = '1200px';
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
      clonedDoc.body.style.backgroundColor = '#FFFFFF';
    }

    // 2. Isolate target element directly to body to bypass any offscreen/flex parent quirks
    clonedDoc.body.innerHTML = '';
    clonedDoc.body.appendChild(element);
    element.style.position = 'relative';
    element.style.left = '0';
    element.style.top = '0';
    element.style.margin = '0 auto';
    element.style.transform = 'none';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.overflow = 'visible';
    element.style.width = '960px';
    element.style.minWidth = '960px';
    element.style.maxWidth = '960px';
    element.style.display = 'block';
    element.style.backgroundColor = '#FFFFFF';

    // 3. Ensure element styles and child elements render without wrapping
    clonedDoc.querySelectorAll('*').forEach((node: Element) => {
      const el = node as HTMLElement;

      // Ensure containers with aspect-ratio or banner heights don't collapse to 0
      if (el.className && typeof el.className === 'string') {
        if (el.className.includes('aspect-[1.55/1]') || el.className.includes('h-[568px]')) {
          el.style.height = '568px';
          el.style.minHeight = '568px';
        }
        if (el.className.includes('aspect-[16/10.2]') || el.className.includes('aspect-[16/10.5]')) {
          const w = el.offsetWidth || 280;
          el.style.height = `${Math.round((w * 10.2) / 16)}px`;
        }
        if (el.className.includes('aspect-[16/9.5]')) {
          const w = el.offsetWidth || 430;
          el.style.height = `${Math.round((w * 9.5) / 16)}px`;
        }
      }

      // Ensure all images are block and fully visible
      if (el.tagName === 'IMG') {
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }

      // Enforce nowrap and keep-all on headers, labels, badges, stamps, and footer
      const text = el.textContent ? el.textContent.trim() : '';
      if (
        text.includes('HANFORD HOTELS & RESORTS') ||
        text.includes('WELCOME TO') ||
        text.includes('FEATURED PROPERTY') ||
        text.includes('VERIFIED DESTINATION') ||
        text.includes('ISSUED BY HANFORD') ||
        text.includes('Central Reservations') ||
        text.includes('GUEST INFORMATION') ||
        text.includes('GUEST FULL NAME') ||
        text.includes('RESERVATION DETAILS') ||
        text.includes('BOOKING TYPE') ||
        text.includes('EVENT DATE') ||
        text.includes('STAY DATES') ||
        text.includes('ALLOCATED ROOM') ||
        text.includes('RESERVED ACCOMMODATION') ||
        text.includes('ROOM TYPE')
      ) {
        el.style.whiteSpace = 'nowrap';
        el.style.wordBreak = 'keep-all';
        el.style.overflowWrap = 'normal';
      }
    });
  };

  // Priority 2: html2canvas on Primary Node with Base64 inlining and onclone layout reset
  if (!dataUrl) {
    try {
      // In-line images first so html2canvas doesn't fail on CORS
      await inlineImagesInElement(primaryNode);

      const canvas = await runWithTimeout(
        html2canvas(primaryNode, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          imageTimeout: 5000,
          scrollX: 0,
          scrollY: 0,
          width: 960,
          windowWidth: 1200,
          onclone: (clonedDoc, element) => {
            resetClonedLayout(clonedDoc, element);
          },
        }),
        9000,
        'html2canvas primary'
      );
      const finalCanvas = isA4Document
        ? formatPortraitWelcomingCanvas(canvas, 2480, 3508)
        : canvas;
      dataUrl = finalCanvas.toDataURL('image/png', 1.0);
    } catch (errPrimary) {
      console.warn('[Card Exporter] Primary html2canvas failed:', errPrimary);
    }
  }

  // Priority 3: html2canvas on Secondary Node if available
  if (!dataUrl && secondaryNode) {
    try {
      await inlineImagesInElement(secondaryNode);
      const canvas = await runWithTimeout(
        html2canvas(secondaryNode, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          imageTimeout: 5000,
          scrollX: 0,
          scrollY: 0,
          width: 960,
          windowWidth: 1200,
          onclone: (clonedDoc, element) => {
            resetClonedLayout(clonedDoc, element);
          },
        }),
        9000,
        'html2canvas secondary'
      );
      const finalCanvas = isA4Document
        ? formatPortraitWelcomingCanvas(canvas, 2480, 3508)
        : canvas;
      dataUrl = finalCanvas.toDataURL('image/png', 1.0);
    } catch (errSec) {
      console.warn('[Card Exporter] Secondary html2canvas failed:', errSec);
    }
  }

  // Priority 4: toPng fallback
  if (!dataUrl) {
    try {
      dataUrl = await runWithTimeout(
        toPng(primaryNode, {
          cacheBust: true,
          quality: 1.0,
          pixelRatio: 2.0,
          skipFonts: true,
          fontEmbedCSS: '',
          backgroundColor: '#FFFFFF',
          width: 960,
          style: {
            position: 'static',
            opacity: '1',
            visibility: 'visible',
            transform: 'none',
            width: '960px',
            minWidth: '960px',
          },
        }),
        6000,
        'toPng fallback'
      );
    } catch (errPng) {
      console.warn('[Card Exporter] toPng fallback failed:', errPng);
    }
  }

  if (!dataUrl || dataUrl.length < 100) {
    throw new Error('Gagal merender gambar kartu PNG.');
  }

  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = URL.createObjectURL(blob);

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
          title: 'Hanford Hotels & Resorts - Card',
          text: `Hanford Guest Card: ${fileName.replace(/\.png$/i, '')}`,
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
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 300);
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
        }, 300);
      } catch (dataErr) {
        console.warn('DataUrl fallback failed, opening new tab:', dataErr);
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
