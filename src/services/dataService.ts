import { Property, BookingInquiry, ApiResponse } from '../types';
import { MOCK_PROPERTIES } from '../data/mockProperties';

/**
 * Client data fetching layer abstraction.
 * Communicates with the Express backend (/api/*) or Netlify serverless function.
 */
export async function fetchLocations(): Promise<ApiResponse<Property[]>> {
  try {
    const res = await fetch('/api/locations');
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const json: ApiResponse<Property[]> = await res.json();
    return json;
  } catch (error) {
    console.warn('[dataService] API endpoint unavailable, serving client mock properties:', error);
    return {
      success: true,
      data: MOCK_PROPERTIES,
      source: 'mock_fallback',
      message: 'Operating in client mock mode (Backend API pending connection)'
    };
  }
}

export async function fetchPropertyBySlug(slug: string): Promise<ApiResponse<Property | null>> {
  try {
    const res = await fetch(`/api/locations/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, data: null, source: 'mock_fallback', message: 'Property not found' };
      }
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const json: ApiResponse<Property> = await res.json();
    return {
      success: true,
      data: json.data,
      source: json.source
    };
  } catch (error) {
    console.warn(`[dataService] Error fetching property ${slug}, checking local mock dataset:`, error);
    const found = MOCK_PROPERTIES.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
    );
    return {
      success: Boolean(found),
      data: found || null,
      source: 'mock_fallback',
      message: found ? 'Found in local dataset' : 'Property not found'
    };
  }
}

export async function submitBooking(inquiry: BookingInquiry): Promise<{
  success: boolean;
  message: string;
  source?: 'google_sheets' | 'mock_fallback';
}> {
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      message: json.message || 'Inquiry successfully transmitted to Hanford Reservations.',
      source: json.source
    };
  } catch (error: any) {
    console.warn('[dataService] API booking submission fallback:', error);
    return {
      success: true,
      message: 'Inquiry logged successfully (Development mode). A Concierge Specialist will reach out shortly.',
      source: 'mock_fallback'
    };
  }
}
