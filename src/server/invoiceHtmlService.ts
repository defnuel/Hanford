import { BookingInquiry } from '../types';

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBookingTypeLabel(bookOption?: string): string {
  switch (bookOption) {
    case 'room': return 'Room Stay / Reservation';
    case 'event': return 'Event & Catering';
    case 'both': return 'Room Stay & Event';
    case 'meeting': return 'Meeting Room Rental';
    case 'room_meeting': return 'Room & Meeting Room';
    case 'custom_only': return 'Product & Service Only';
    default: return bookOption || 'General Reservation';
  }
}

/**
 * Generates an HTML page representing a printable/downloadable Invoice (PAID or UNPAID version)
 */
export function generateInvoiceHtml(booking: BookingInquiry, requestedStatus?: 'PAID' | 'UNPAID'): string {
  const isPaid = (requestedStatus || booking.paymentStatus || 'UNPAID').toUpperCase() === 'PAID';
  const statusLabel = isPaid ? 'PAID' : 'UNPAID';
  const bookingId = booking.bookingId || booking.id || 'HNF-2026-INV';
  const guestName = booking.guestName || 'Valued Guest';
  const xUsername = booking.xUsername && booking.xUsername.trim() ? booking.xUsername.trim() : null;
  const propertyName = booking.propertyName || booking.propertySlug || 'Hanford Hotels & Resorts Sanctuary';
  const bookingType = getBookingTypeLabel(booking.bookOption);

  const checkIn = booking.checkInDate || 'TBD';
  const checkOut = booking.checkOutDate || 'TBD';
  const eventDate = booking.eventDate || null;

  const totalAmountNum = Number(booking.totalAmount) || 0;
  const subtotalNum = booking.subtotalBeforeTax || Math.round(totalAmountNum / 1.1);
  const taxNum = booking.taxAmount || (totalAmountNum - subtotalNum);

  const issueDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${escapeHtml(bookingId)} - ${statusLabel} | Hanford Hotels & Resorts</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #1E293B;
      padding: 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }
    .action-bar {
      background: #0F172A;
      color: #FFFFFF;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1E293B;
    }
    .action-bar h2 {
      font-size: 15px;
      font-weight: 500;
      color: #94A3B8;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .btn-print {
      background-color: #C5A880;
      color: #1E293B;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .btn-print:hover {
      background-color: #B29368;
    }
    .invoice-content {
      padding: 40px;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 80px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.08;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
      color: ${isPaid ? '#10B981' : '#F59E0B'};
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-family: Georgia, serif;
      font-size: 24px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #0F172A;
      font-weight: 700;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748B;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .invoice-title-block {
      text-align: right;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: 0.05em;
    }
    .badge-status {
      display: inline-block;
      margin-top: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background-color: ${isPaid ? '#DEF7EC' : '#FEF3C7'};
      color: ${isPaid ? '#03543F' : '#92400E'};
      border: 1px solid ${isPaid ? '#84E1BC' : '#FDE68A'};
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .details-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 18px;
    }
    .details-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #64748B;
      margin-bottom: 10px;
    }
    .details-box p {
      font-size: 14px;
      color: #1E293B;
      margin-bottom: 4px;
    }
    .details-box strong {
      color: #0F172A;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .table th {
      background: #F1F5F9;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #E2E8F0;
    }
    .table td {
      padding: 14px 16px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 14px;
      color: #334155;
    }
    .table .text-right { text-align: right; }
    .totals-block {
      max-width: 320px;
      margin-left: auto;
      margin-bottom: 32px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #64748B;
    }
    .total-row.grand-total {
      border-top: 2px solid #0F172A;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
    }
    .footer-note {
      border-top: 1px solid #E2E8F0;
      padding-top: 20px;
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
    }

    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; max-width: 100%; }
      .no-print { display: none !important; }
      .invoice-content { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="action-bar no-print">
      <h2>Hanford Hotels &amp; Resorts Invoice Viewer</h2>
      <button class="btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <div class="invoice-content">
      <div class="watermark">${statusLabel}</div>

      <div class="header">
        <div>
          <div class="brand-title">HANFORD</div>
          <div class="brand-subtitle">Hotels &amp; Resorts</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
            Central Reservations &amp; Billing Office
          </div>
        </div>

        <div class="invoice-title-block">
          <div class="invoice-title">INVOICE</div>
          <div style="font-size: 14px; font-weight: 600; color: #475569; margin-top: 2px;">
            #${escapeHtml(bookingId)}
          </div>
          <div class="badge-status">
            ${isPaid ? '✓ OFFICIAL RECEIPT (PAID)' : '⏳ PAYMENT PENDING (UNPAID)'}
          </div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-box">
          <h3>Billed To (Guest Details)</h3>
          <p><strong>Name:</strong> ${escapeHtml(guestName)}</p>
          ${xUsername ? `<p><strong>X Handle:</strong> ${escapeHtml(xUsername)}</p>` : ''}
          <p><strong>Issued Date:</strong> ${escapeHtml(issueDate)}</p>
        </div>

        <div class="details-box">
          <h3>Reservation &amp; Property</h3>
          <p><strong>Location:</strong> ${escapeHtml(propertyName)}</p>
          <p><strong>Booking Type:</strong> ${escapeHtml(bookingType)}</p>
          <p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}</p>
          ${eventDate ? `<p><strong>Event Date:</strong> ${escapeHtml(eventDate)}</p>` : ''}
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Type / Quantity</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${escapeHtml(propertyName)}</strong><br>
              <span style="font-size: 12px; color: #64748B;">${escapeHtml(bookingType)}</span>
            </td>
            <td>${escapeHtml(checkIn)} - ${escapeHtml(checkOut)}</td>
            <td class="text-right">$${subtotalNum.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-block">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${subtotalNum.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Government Tax &amp; Service (10%):</span>
          <span>$${taxNum.toLocaleString()}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total ${isPaid ? 'Paid' : 'Due'}:</span>
          <span>$${totalAmountNum.toLocaleString()} USD</span>
        </div>
      </div>

      <div class="footer-note">
        <p>Thank you for choosing Hanford Hotels &amp; Resorts.</p>
        <p>For questions or custom billing adjustments, please contact billing@hanfordhotels.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
