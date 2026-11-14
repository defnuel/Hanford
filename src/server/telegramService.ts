import { BookingInquiry, SignatureOrderReceipt } from '../types';

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getBookingTypeLabel(bookOption?: string): string {
  switch (bookOption) {
    case 'room': return 'Room Reservation / Stay';
    case 'event': return 'Event & Catering';
    case 'both': return 'Room & Event';
    case 'meeting': return 'Meeting Room';
    case 'room_meeting': return 'Room & Meeting Room';
    default: return bookOption || 'General Reservation';
  }
}

/**
 * Sends an instant booking alert message to a Telegram chat or channel via Telegram Bot API (100% Free)
 */
export async function sendTelegramBookingNotification(
  booking: BookingInquiry,
  baseUrl?: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram Bot API] Bot Token or Chat ID missing in environment variables.');
    return {
      success: false,
      message: 'Telegram Bot is not fully configured (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing).',
      error: 'Missing Telegram configuration'
    };
  }

  const bookingId = booking.bookingId || booking.id || 'N/A';
  const guestName = booking.guestName || 'Guest';
  const xUser = booking.xUsername && booking.xUsername.trim() ? ` (${booking.xUsername.trim()})` : '';
  const propertyName = booking.propertyName || booking.propertySlug || 'Hanford Sanctuary';
  const bookingType = getBookingTypeLabel(booking.bookOption);
  const dates = booking.checkInDate && booking.checkOutDate
    ? `${booking.checkInDate} to ${booking.checkOutDate}`
    : booking.checkInDate || 'Not specified';
  const eventDate = booking.eventDate ? booking.eventDate : null;
  const totalAmount = booking.totalAmount !== undefined && booking.totalAmount !== null
    ? `$${Number(booking.totalAmount).toLocaleString()}`
    : 'Custom Invoice';

  // Construct domain for Telegram invoice download links
  void baseUrl;
  const domain = (process.env.TELEGRAM_PUBLIC_URL || 'https://hanford.netlify.app').replace(/\/$/, '');
  const paidInvoiceUrl = `${domain}/telegram/invoice/${encodeURIComponent(bookingId)}?status=PAID`;
  const unpaidInvoiceUrl = `${domain}/telegram/invoice/${encodeURIComponent(bookingId)}?status=UNPAID`;

  let telegramMessage = `🔔 <b>NEW RESERVATION ALERT</b>

📋 <b>Invoice:</b> <code>#${escapeHtml(bookingId)}</code>
👤 <b>Guest:</b> ${escapeHtml(guestName)}${escapeHtml(xUser)}
🏛️ <b>Property:</b> ${escapeHtml(propertyName)}
🏷️ <b>Booking Type:</b> ${escapeHtml(bookingType)}
📅 <b>Dates:</b> ${escapeHtml(dates)}`;

  if (eventDate) {
    telegramMessage += `\n🎉 <b>Event Date:</b> ${escapeHtml(eventDate)}`;
  }

  telegramMessage += `\n💰 <b>Total:</b> <b>${escapeHtml(totalAmount)}</b>

📄 <b>Paid Invoice:</b> <a href="${paidInvoiceUrl}">Download Paid Invoice</a>
📄 <b>Unpaid Invoice:</b> <a href="${unpaidInvoiceUrl}">Download Unpaid Invoice</a>

<i>Sent automatically from Hanford Hotels & Resorts</i>`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    const resData = await response.json();

    if (response.ok && resData?.ok) {
      console.log(`[Telegram Bot API] Successfully sent booking notification (Msg ID: ${resData.result?.message_id}) to Chat ID: ${chatId}`);
      return {
        success: true,
        message: `Telegram alert sent successfully! (Message ID: ${resData.result?.message_id})`,
        data: resData.result
      };
    } else {
      console.error('[Telegram Bot API] Error response:', resData);
      return {
        success: false,
        message: `Telegram API error: ${resData?.description || 'Unknown error'}`,
        error: resData?.description || JSON.stringify(resData)
      };
    }
  } catch (err: any) {
    console.error('[Telegram Bot API] Network error:', err);
    return {
      success: false,
      message: 'Failed to send Telegram notification due to network error.',
      error: err?.message || String(err)
    };
  }
}

/**
 * Sends an instant HR Signature dining checkout alert to Telegram (hanfordhnr_bot).
 */
export async function sendTelegramDiningNotification(
  receipt: SignatureOrderReceipt,
  baseUrl?: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram Bot API] Bot Token or Chat ID missing in environment variables.');
    return {
      success: false,
      message: 'Telegram Bot is not fully configured (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing).',
      error: 'Missing Telegram configuration'
    };
  }

  void baseUrl;
  const domain = (process.env.TELEGRAM_PUBLIC_URL || 'https://hanford.netlify.app').replace(/\/$/, '');
  const receiptUrl = `${domain}/telegram/receipt/${encodeURIComponent(receipt.orderId)}`;

  const serviceLabel =
    receipt.serviceType === 'room_service' ? 'Room Service' : 'Dinner in Restaurant';
  const xHandle = receipt.xUsernameCode
    ? ` (@${receipt.xUsernameCode.replace(/^@+/, '')})`
    : '';
  const roomLine =
    receipt.serviceType === 'room_service' && receipt.roomOrTable
      ? `\n🚪 <b>Room:</b> ${escapeHtml(receipt.roomOrTable)}`
      : '';

  const itemLines = receipt.items
    .map((item) => {
      const extras: string[] = [];
      if (item.selectedVariant) extras.push(item.selectedVariant);
      if (item.selectedSecondaryVariant) extras.push(item.selectedSecondaryVariant);
      if (item.selectedEnhancements && item.selectedEnhancements.length > 0) {
        extras.push(item.selectedEnhancements.map((e) => `+${e.label}`).join(', '));
      }
      const suffix = extras.length > 0 ? ` (${extras.join(' · ')})` : '';
      return `• ${item.quantity}x ${escapeHtml(item.name)}${escapeHtml(suffix)} — $${item.lineTotal.toLocaleString()}`;
    })
    .join('\n');

  const diningPrivilegeText = receipt.isFreeDining
    ? '✅ GUEST FREE COMPLIMENTARY'
    : 'Non-Guest / Standard Billing';

  const taxAmount = receipt.taxAmount ?? Math.round(receipt.subtotal * 0.1);

  let telegramMessage = `🍽️ <b>NEW HR SIGNATURE ORDER</b>

🧾 <b>Receipt:</b> <code>#${escapeHtml(receipt.orderId)}</code>
🏛️ <b>Property:</b> ${escapeHtml(receipt.propertyName)}
🛎️ <b>Option:</b> ${escapeHtml(serviceLabel)}${roomLine}
👤 <b>Guest:</b> ${escapeHtml(receipt.guestName)}${escapeHtml(xHandle)}
🎟️ <b>Status:</b> ${diningPrivilegeText}

<b>Order Items:</b>
${itemLines}

💵 <b>Subtotal:</b> $${receipt.subtotal.toLocaleString()}
🧾 <b>Tax &amp; Service (10%):</b> $${taxAmount.toLocaleString()}`;

  if (receipt.isFreeDining) {
    telegramMessage += `\n🎁 <b>Guest Free Complimentary:</b> -$${receipt.discountAmount.toLocaleString()}`;
  }

  telegramMessage += `\n💰 <b>Total:</b> <b>$${receipt.totalAmount.toLocaleString()}</b>`;

  if (receipt.notes && receipt.notes.trim()) {
    telegramMessage += `\n📝 <b>Notes:</b> ${escapeHtml(receipt.notes.trim())}`;
  }

  telegramMessage += `\n\n📄 <b>Receipt:</b> <a href="${receiptUrl}">View &amp; Download Receipt</a>

<i>Sent from HR Signature · Hanford Hotels &amp; Resorts</i>`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    const resData = await response.json();

    if (response.ok && resData?.ok) {
      return {
        success: true,
        message: `Telegram dining alert sent! (Message ID: ${resData.result?.message_id})`,
        data: resData.result
      };
    }

    return {
      success: false,
      message: `Telegram API error: ${resData?.description || 'Unknown error'}`,
      error: resData?.description || JSON.stringify(resData)
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to send Telegram dining notification due to network error.',
      error: err?.message || String(err)
    };
  }
}


