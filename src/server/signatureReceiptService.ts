import { BookingInquiry, SignatureBookingMatch, SignatureOrderReceipt } from '../types';

export const signatureOrdersStore = new Map<string, SignatureOrderReceipt>();

function normalizeHandle(val?: string): string {
  return String(val || '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '');
}

function normalizeSlug(val?: string): string {
  return String(val || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Matches a customer's X username and selected Property Location against Bookings from Google Sheets.
 * Prefers PAID / Confirmed bookings when multiple rows match.
 */
export function findMatchingBookingForDining(
  bookings: BookingInquiry[],
  xUsernameInput?: string,
  propertySlugInput?: string,
  propertyNameInput?: string
): SignatureBookingMatch | null {
  const targetHandle = normalizeHandle(xUsernameInput);
  if (!targetHandle || targetHandle === 'n/a' || targetHandle === 'na' || targetHandle === '-') {
    return null;
  }

  const targetSlug = normalizeSlug(propertySlugInput);
  const targetNameSlug = normalizeSlug(propertyNameInput);
  const targetNameLower = String(propertyNameInput || '').trim().toLowerCase();

  const matches = bookings.filter((b) => {
    const bookingHandle = normalizeHandle(b.xUsername);
    if (!bookingHandle || bookingHandle !== targetHandle) {
      return false;
    }

    const bookingSlug = normalizeSlug(b.propertySlug || b.propertyName);
    const bookingNameLower = String(b.propertyName || '').trim().toLowerCase();

    if (targetSlug && bookingSlug && bookingSlug === targetSlug) return true;
    if (targetNameSlug && bookingSlug && bookingSlug === targetNameSlug) return true;
    if (targetNameLower && bookingNameLower && bookingNameLower === targetNameLower) return true;
    if (targetNameLower && bookingNameLower && (bookingNameLower.includes(targetNameLower) || targetNameLower.includes(bookingNameLower))) {
      return true;
    }

    return false;
  });

  if (matches.length === 0) {
    return null;
  }

  // Prefer PAID / Confirmed bookings first
  const sorted = [...matches].sort((a, b) => {
    const aPaid = a.paymentStatus === 'PAID' || a.status === 'Confirmed' ? 1 : 0;
    const bPaid = b.paymentStatus === 'PAID' || b.status === 'Confirmed' ? 1 : 0;
    return bPaid - aPaid;
  });

  const best = sorted[0];
  return {
    bookingId: best.bookingId || best.id || 'BOOKED',
    guestName: best.guestName || 'Guest',
    xUsername: best.xUsername.startsWith('@') ? best.xUsername : `@${best.xUsername}`,
    propertyName: best.propertyName,
    propertySlug: best.propertySlug,
    checkInDate: best.checkInDate,
    checkOutDate: best.checkOutDate,
    paymentStatus: best.paymentStatus
  };
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBarcodeBarsSvg(seedText: string): string {
  const weights = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 2];
  let x = 0;
  const rects: string[] = [];
  for (let i = 0; i < 42; i++) {
    const code = seedText.charCodeAt(i % seedText.length) || 65;
    const w = weights[(code + i) % weights.length];
    const gap = ((code >> 1) + i) % 2 === 0 ? 2 : 1;
    rects.push(`<rect x="${x}" y="0" width="${w}" height="46" fill="#2C3744" />`);
    x += w + gap;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 46" style="width:100%;max-width:240px;height:46px;display:block;margin:0 auto;">${rects.join('')}</svg>`;
}

export function generateSignatureReceiptHtml(receipt: SignatureOrderReceipt): string {
  const dt = new Date(receipt.createdAt);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  const formattedDate = `${dd}/${mm} ${yyyy} ${hh}.${min}`;

  const serviceLabel =
    receipt.serviceType === 'room_service' ? 'Room Service' : 'Dinner in Restaurant';

  const itemsHtml = receipt.items
    .map((item) => {
      const details: string[] = [];
      if (item.selectedVariant) details.push(item.selectedVariant);
      if (item.selectedSecondaryVariant) details.push(item.selectedSecondaryVariant);
      if (item.selectedEnhancements && item.selectedEnhancements.length > 0) {
        details.push(item.selectedEnhancements.map((e) => `+ ${e.label}`).join(', '));
      }
      const detailsLine =
        details.length > 0
          ? `<div style="font-size:10.5px;color:#666666;margin-top:2px;">${escapeHtml(details.join(' · '))}</div>`
          : '';
      const qtyPrefix = item.quantity > 1 ? `${item.quantity}x ` : '';

      return `
        <div style="margin-bottom:12px;">
          <div style="display:flex;align-items:baseline;font-size:12px;color:#2C3744;">
            <span style="font-weight:600;max-width:65%;word-break:break-word;">${escapeHtml(qtyPrefix + item.name)}</span>
            <span style="flex:1;border-bottom:1.5px dotted #88B2AB;margin:0 8px;"></span>
            <span style="font-weight:700;color:#3A4F67;white-space:nowrap;">${item.lineTotal.toLocaleString()}$</span>
          </div>
          ${detailsLine}
        </div>
      `;
    })
    .join('');

  const taxAmount = receipt.taxAmount ?? Math.round(receipt.subtotal * 0.1);

  const summaryHtml = `
    <div style="margin-top:10px;padding-top:10px;border-top:1px dotted #CBD5E1;font-size:11.5px;color:#475569;">
      <div style="display:flex;align-items:baseline;margin-bottom:6px;">
        <span>Subtotal</span>
        <span style="flex:1;border-bottom:1.5px dotted #CBD5E1;margin:0 8px;"></span>
        <span style="font-weight:600;color:#2C3744;">${receipt.subtotal.toLocaleString()}$</span>
      </div>
      <div style="display:flex;align-items:baseline;margin-bottom:6px;">
        <span>Tax &amp; Service (10%)</span>
        <span style="flex:1;border-bottom:1.5px dotted #CBD5E1;margin:0 8px;"></span>
        <span style="font-weight:600;color:#2C3744;">${taxAmount.toLocaleString()}$</span>
      </div>
      ${receipt.isFreeDining ? `
      <div style="display:flex;align-items:baseline;color:#51867E;font-weight:700;">
        <span>Guest Free Complimentary</span>
        <span style="flex:1;border-bottom:1.5px dotted #88B2AB;margin:0 8px;"></span>
        <span>-${receipt.discountAmount.toLocaleString()}$</span>
      </div>` : ''}
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HR Signature Receipt #${escapeHtml(receipt.orderId)}</title>
  <style>
    @page {
      size: 420px auto;
      margin: 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      background-color: #EEF2F0;
      color: #2C3744;
      margin: 0;
      padding: 24px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .receipt-sheet {
      width: 380px;
      max-width: 100%;
      background: #FAFBF9;
      border: 1px solid #CBD5E1;
      padding: 28px 24px;
      box-shadow: 0 10px 25px rgba(44, 55, 68, 0.08);
    }
    .dashed-rule {
      border-top: 2px dashed #88B2AB;
      margin: 14px 0;
    }
    @media print {
      html, body {
        background: #FFFFFF !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
      .no-print { display: none !important; }
      .receipt-sheet {
        width: 380px !important;
        min-width: 380px !important;
        max-width: 380px !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        border: 1px solid #CBD5E1 !important;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-sheet">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;letter-spacing:0.08em;margin-bottom:18px;">
      <span style="color:#51867E;">RECEIPT</span>
      <span style="color:#2C3744;">No. ${escapeHtml(receipt.orderId)}</span>
    </div>

    <div style="text-align:center;margin-bottom:14px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;font-weight:700;color:#51867E;line-height:1.1;">
        HR Signature
      </div>
      <div style="font-family:sans-serif;font-size:10px;font-weight:700;letter-spacing:0.24em;color:#3A4F67;text-transform:uppercase;margin-top:4px;">
        HANFORD HOTELS &amp; RESORTS
      </div>
      <div style="font-size:10.5px;color:#475569;margin-top:10px;">
        /An Elevated Way of Staying/
      </div>
    </div>

    <div class="dashed-rule"></div>

    <div style="text-align:center;font-size:11.5px;line-height:1.65;color:#2C3744;">
      <div style="font-weight:700;letter-spacing:0.05em;">DATE: ${escapeHtml(formattedDate)}</div>
      <div style="font-size:11px;color:#3A4F67;font-weight:700;margin-top:4px;">${escapeHtml(receipt.propertyName)}</div>
      <div style="font-size:10.5px;color:#475569;">${escapeHtml(serviceLabel)}${receipt.serviceType === 'room_service' && receipt.roomOrTable ? ` · Room ${escapeHtml(receipt.roomOrTable)}` : ''}</div>
      <div style="font-size:10.5px;color:#475569;">Guest: ${escapeHtml(receipt.guestName)}${receipt.xUsernameCode ? ` (@${escapeHtml(receipt.xUsernameCode.replace(/^@+/, ''))})` : ''}</div>
    </div>

    <div class="dashed-rule"></div>

    <div style="padding:4px 0;">
      ${itemsHtml}
      ${summaryHtml}
    </div>

    ${receipt.notes ? `<div style="font-size:10.5px;color:#666666;border-top:1px dotted #CBD5E1;padding-top:8px;margin-top:6px;">Note: ${escapeHtml(receipt.notes)}</div>` : ''}

    <div class="dashed-rule"></div>

    <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:16px;font-weight:700;color:#3A4F67;padding:4px 0 16px;">
      <span>TOTAL:</span>
      <span>${receipt.totalAmount.toLocaleString()}$</span>
    </div>

    <div style="margin:6px 0 18px;">
      ${buildBarcodeBarsSvg(receipt.orderId)}
    </div>

    <div style="text-align:center;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:28px;font-weight:700;color:#51867E;margin-bottom:18px;">
      Thank You!
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:10px;">
      <span>@Hanford_HnR</span>
      <span style="letter-spacing:0.08em;">HANFORD H&amp;R</span>
    </div>
  </div>

  <div class="no-print" style="margin-top:20px;text-align:center;">
    <button onclick="window.print()" style="background:#51867E;color:#FFFFFF;border:none;border-radius:6px;padding:10px 22px;font-family:sans-serif;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Print / Save PDF Receipt</button>
  </div>
</body>
</html>`;
}
