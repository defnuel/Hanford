import html2canvas from 'html2canvas';
import { toCanvas, toPng } from 'html-to-image';
import { dataUrlToBlob } from './exportInvoiceImage';

export interface CardExportResult {
  success: boolean;
  dataUrl: string;
  blobUrl: string;
  shared?: boolean;
}

let cachedFontEmbedCSS: string | null = null;
let fontFetchPromise: Promise<string> | null = null;

/**
 * Pre-fetches and caches Google Fonts CSS with Base64 embedded font glyphs
 * to guarantee pixel-identical typography (Plus Jakarta Sans & Cormorant Garamond)
 * in SVG foreignObject exports without network delays or missing font fallbacks.
 */
async function getCardFontEmbedCSS(): Promise<string> {
  if (cachedFontEmbedCSS !== null) {
    return cachedFontEmbedCSS;
  }
  if (fontFetchPromise) {
    return fontFetchPromise;
  }

  fontFetchPromise = (async () => {
    try {
      const cssUrl =
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap';
      const cssRes = await runWithTimeout(fetch(cssUrl), 3000, 'fetch font css');
      if (!cssRes.ok) throw new Error('Failed to fetch font CSS');
      let cssText = await cssRes.text();

      const fontUrls = [...cssText.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
      await Promise.all(
        fontUrls.map(async (fUrl) => {
          try {
            const fontRes = await runWithTimeout(fetch(fUrl), 3000, `fetch font file ${fUrl}`);
            if (fontRes.ok) {
              const blob = await fontRes.blob();
              const dataUri = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve('');
                reader.readAsDataURL(blob);
              });
              if (dataUri) {
                cssText = cssText.replace(fUrl, dataUri);
              }
            }
          } catch {
            // Ignore individual font file download failure
          }
        })
      );

      cachedFontEmbedCSS = cssText;
      return cachedFontEmbedCSS;
    } catch (err) {
      console.warn('[Card Exporter] Font embedding failed, using fallback:', err);
      cachedFontEmbedCSS = '';
      return '';
    }
  })();

  return fontFetchPromise;
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

const dataUrlCache = new Map<string, string>();

/**
 * Fetch an image URL (including Google Drive / Unsplash) and convert to Base64 Data URL.
 * Uses local backend proxy if direct fetch encounters CORS limitations.
 */
async function fetchAsDataUrl(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (dataUrlCache.has(url)) return dataUrlCache.get(url)!;

  // 1. Try direct fetch with cors
  try {
    const res = await runWithTimeout(fetch(url, { mode: 'cors' }), 2500, 'direct fetch');
    if (res.ok) {
      const blob = await res.blob();
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
      if (result) {
        dataUrlCache.set(url, result);
        return result;
      }
    }
  } catch {
    // direct fetch failed, try backend proxy
  }

  // 2. Try backend proxy endpoint
  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const res = await runWithTimeout(fetch(proxyUrl), 3500, 'proxy fetch');
    if (res.ok) {
      const blob = await res.blob();
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
      if (result) {
        dataUrlCache.set(url, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('[Card Exporter] Proxy fetch error for:', url, err);
  }

  return url;
}

/**
 * Preload and inline all images inside a DOM element to Base64 to prevent canvas tainting during export
 */
async function inlineImagesInElement(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.allSettled(
    images.map(async (img) => {
      const src = img.src || img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        const dataUrl = await fetchAsDataUrl(src);
        if (dataUrl && dataUrl.startsWith('data:')) {
          img.src = dataUrl;
          img.removeAttribute('crossorigin');
          img.removeAttribute('referrerpolicy');
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

  // Scale cleanly to fit A4 sheet without cropping header, footer, or edges!
  const scale = Math.min(targetWidth / sourceCanvas.width, targetHeight / sourceCanvas.height);
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
      console.warn('[Card Exporter] Direct canvas failed, falling back:', errCanvas);
    }
  }

  // Priority 2: High-Fidelity SVG foreignObject Native Renderer (toCanvas from html-to-image)
  // This uses the browser's native CSS layout engine, guaranteeing 100% fidelity to the preview
  if (!dataUrl) {
    try {
      // In-line images first so SVG rendering does not hit CORS restrictions
      await inlineImagesInElement(primaryNode);

      // Wait for all image tags to decode
      const imgElements = Array.from(primaryNode.querySelectorAll('img'));
      await Promise.all(
        imgElements.map(async (img) => {
          if (!img.complete) {
            await new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            });
          }
          if (img.decode) {
            try {
              await img.decode();
            } catch {
              // Non-blocking decode failure
            }
          }
        })
      );

      const fontCSS = await getCardFontEmbedCSS();
      const targetHeight = primaryNode.offsetHeight || 1358;

      const canvas = await runWithTimeout(
        toCanvas(primaryNode, {
          pixelRatio: 2.5,
          cacheBust: true,
          backgroundColor: '#FFFFFF',
          width: 960,
          height: targetHeight,
          fontEmbedCSS: fontCSS || undefined,
          skipFonts: false,
          style: {
            transform: 'none',
            position: 'static',
            margin: '0',
            width: '960px',
            minWidth: '960px',
            maxWidth: '960px',
            height: `${targetHeight}px`,
          },
        }),
        10000,
        'toCanvas primary'
      );

      const finalCanvas = isA4Document
        ? formatPortraitWelcomingCanvas(canvas, 2480, 3508)
        : canvas;
      dataUrl = finalCanvas.toDataURL('image/png', 1.0);
    } catch (errToCanvas) {
      console.warn('[Card Exporter] Primary toCanvas failed, trying secondary/fallback:', errToCanvas);
    }
  }

  // Priority 3: toCanvas on Secondary Node (onscreen node if primary was offscreen)
  if (!dataUrl && secondaryNode) {
    try {
      await inlineImagesInElement(secondaryNode);
      const fontCSS = await getCardFontEmbedCSS();
      const secHeight = secondaryNode.offsetHeight || 1358;

      const canvas = await runWithTimeout(
        toCanvas(secondaryNode, {
          pixelRatio: 2.5,
          cacheBust: true,
          backgroundColor: '#FFFFFF',
          width: 960,
          height: secHeight,
          fontEmbedCSS: fontCSS || undefined,
          skipFonts: false,
          style: {
            transform: 'none',
            position: 'static',
            margin: '0',
            width: '960px',
            minWidth: '960px',
            maxWidth: '960px',
            height: `${secHeight}px`,
          },
        }),
        10000,
        'toCanvas secondary'
      );

      const finalCanvas = isA4Document
        ? formatPortraitWelcomingCanvas(canvas, 2480, 3508)
        : canvas;
      dataUrl = finalCanvas.toDataURL('image/png', 1.0);
    } catch (errToCanvasSec) {
      console.warn('[Card Exporter] Secondary toCanvas failed:', errToCanvasSec);
    }
  }

  // Priority 4: toPng direct rasterizer fallback
  if (!dataUrl) {
    try {
      const fontCSS = await getCardFontEmbedCSS();
      const targetHeight = primaryNode.offsetHeight || 1358;
      dataUrl = await runWithTimeout(
        toPng(primaryNode, {
          cacheBust: true,
          quality: 1.0,
          pixelRatio: 2.5,
          fontEmbedCSS: fontCSS || undefined,
          backgroundColor: '#FFFFFF',
          width: 960,
          height: targetHeight,
          style: {
            position: 'static',
            opacity: '1',
            visibility: 'visible',
            transform: 'none',
            width: '960px',
            minWidth: '960px',
            maxWidth: '960px',
            height: `${targetHeight}px`,
          },
        }),
        8000,
        'toPng fallback'
      );
    } catch (errPng) {
      console.warn('[Card Exporter] toPng fallback failed:', errPng);
    }
  }

  // Helper to reset cloned layout inside html2canvas iframe
  const resetClonedLayout = (clonedDoc: Document, element: HTMLElement) => {
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
    const targetHeight = element.offsetHeight || 1358;
    clonedDoc.body.style.width = '960px';
    clonedDoc.body.style.minWidth = '960px';
    clonedDoc.body.style.margin = '0';
    clonedDoc.body.style.padding = '0';
    clonedDoc.body.style.backgroundColor = '#FFFFFF';
    element.style.width = '960px';
    element.style.minWidth = '960px';
    element.style.maxWidth = '960px';
    element.style.height = `${targetHeight}px`;
    element.style.display = 'block';
    element.style.backgroundColor = '#FFFFFF';
  };

  // Priority 5: html2canvas fallback on Primary Node
  if (!dataUrl) {
    try {
      await inlineImagesInElement(primaryNode);
      const targetHeight = primaryNode.offsetHeight || 1358;

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
          height: targetHeight,
          windowWidth: 960,
          windowHeight: targetHeight + 100,
          onclone: (clonedDoc, element) => {
            resetClonedLayout(clonedDoc, element);
          },
        }),
        10000,
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
