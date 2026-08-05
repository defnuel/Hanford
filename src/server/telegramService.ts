import { BookingInquiry } from '../types';

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

  // Construct domain for invoice download links
  const domain = (baseUrl || process.env.APP_URL || 'https://ais-dev-sfkcuoclk2mqz7rx6iai42-477170986057.asia-southeast1.run.app').replace(/\/$/, '');
  const paidInvoiceUrl = `${domain}/api/invoice/${encodeURIComponent(bookingId)}?status=PAID`;
  const unpaidInvoiceUrl = `${domain}/api/invoice/${encodeURIComponent(bookingId)}?status=UNPAID`;

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

