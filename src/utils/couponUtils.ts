import { Property } from '../types';

export interface CouponValidationResult {
  isValid: boolean;
  percent: number;
  matchedCode: string | null;
  message?: string;
}

/**
 * Validates an input coupon code against a specific property's active discount codes from Google Sheets.
 * Supports comma-separated codes (e.g. "HERJEJ2026, HHR2026") and corresponding percents (e.g. "50, 40" or 50).
 */
export function validatePropertyCoupon(
  property: Property | null | undefined,
  inputCode: string | undefined | null
): CouponValidationResult {
  if (!inputCode || !inputCode.trim()) {
    return { isValid: false, percent: 0, matchedCode: null };
  }

  const cleanInput = inputCode.trim().replace(/['"]/g, '').toUpperCase();

  if (!property) {
    return {
      isValid: false,
      percent: 0,
      matchedCode: null,
      message: 'Pilih lokasi terlebih dahulu.'
    };
  }

  if (!property.discountCode || !String(property.discountCode).trim()) {
    return {
      isValid: false,
      percent: 0,
      matchedCode: null,
      message: `Lokasi ${property.name} saat ini tidak memiliki kode diskon aktif.`
    };
  }

  // Split discount codes by comma, semicolon, or newline
  const rawCodes = String(property.discountCode)
    .split(/[,;\n]+/)
    .map((c) => c.replace(/['"]/g, '').trim().toUpperCase())
    .filter(Boolean);

  // Split discount percents by comma, semicolon, or newline
  let rawPercents: number[] = [];
  if (typeof property.discountPercent === 'number') {
    rawPercents = [property.discountPercent];
  } else if (property.discountPercent) {
    rawPercents = String(property.discountPercent)
      .split(/[,;\n]+/)
      .map((p) => {
        const cleaned = p.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned);
      })
      .filter((n) => !isNaN(n) && n > 0);
  }

  // Find index of matching code
  const matchIndex = rawCodes.findIndex((c) => c === cleanInput);

  if (matchIndex !== -1) {
    // Pick corresponding percent for the code, or fallback to first percent
    const percent = rawPercents[matchIndex] !== undefined
      ? rawPercents[matchIndex]
      : (rawPercents[0] || 0);

    return {
      isValid: true,
      percent,
      matchedCode: rawCodes[matchIndex],
      message: `Kupon ${rawCodes[matchIndex]} berhasil digunakan (${percent}% OFF)`
    };
  }

  return {
    isValid: false,
    percent: 0,
    matchedCode: null,
    message: `Kode diskon "${cleanInput}" tidak berlaku untuk lokasi ${property.name}.`
  };
}
