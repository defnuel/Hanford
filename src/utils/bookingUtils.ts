import { BookingInquiry } from '../types';

/**
 * Returns consistent Booking Type label for invoices and reservation views.
 *
 * Rules:
 * - Room Stay -> "Room Only"
 * - Event Location -> "Event Location"
 * - Both Room & Event Location -> "Room & Event"
 * - Meeting with Accomodation -> "Meeting and Room Accomodation"
 * - Meeting without Accomodation -> "Meeting Room Only"
 */
export function getBookingTypeLabel(booking: Partial<BookingInquiry>): string {
  const opt = (booking.bookOption || '').toLowerCase().trim();
  const acc = (booking.accommodationOption || '').toLowerCase().trim();

  // 0. Product & Service Only
  if (opt === 'custom_only' || opt === 'product_service' || opt === 'custom' || opt === 'none') {
    return 'Product & Service Only';
  }

  // 1. Meeting with Accommodation
  if (
    opt === 'room_meeting' ||
    opt === 'meeting_with_accommodation' ||
    (opt === 'meeting' && acc === 'with')
  ) {
    return 'Meeting and Room Accomodation';
  }

  // 2. Meeting without Accommodation
  if (
    (opt === 'meeting' && (acc === 'without' || !acc)) ||
    opt === 'meeting_without_accommodation'
  ) {
    return 'Meeting Room Only';
  }

  // Fallback for meeting strings
  if (opt.includes('meeting')) {
    if (acc === 'with' || opt.includes('room') || opt.includes('accomodation') || opt.includes('accommodation')) {
      return 'Meeting and Room Accomodation';
    }
    return 'Meeting Room Only';
  }

  // 3. Both Room & Event
  if (
    opt === 'both' ||
    opt.includes('both') ||
    opt.includes('keduanya') ||
    (opt.includes('room') && opt.includes('event')) ||
    opt.includes('& event')
  ) {
    return 'Room & Event';
  }

  // 4. Event Location
  if (opt === 'event' || opt.includes('event')) {
    return 'Event Location';
  }

  // 5. Room Stay / Room Only
  if (opt === 'room' || opt === 'room_stay' || opt.includes('room') || opt.includes('stay')) {
    return 'Room Only';
  }

  return 'Room Only';
}

/**
 * Legacy alias for getBookingTypeLabel
 */
export const getBookingCategoryLabel = getBookingTypeLabel;
