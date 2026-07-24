import React, { useState, useEffect } from 'react';
import { Property, BookingInquiry } from '../types';
import { fetchLocations, submitBooking } from '../services/dataService';
import { Calendar, CheckCircle2, Send, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface BookNowPageProps {
  initialPropertySlug?: string;
  onNavigate: (path: string) => void;
}

export const BookNowPage: React.FC<BookNowPageProps> = ({ initialPropertySlug, onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Form State
  const [formData, setFormData] = useState<BookingInquiry>({
    propertySlug: initialPropertySlug || '',
    propertyName: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 2,
    specialRequests: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    source?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations().then((res) => {
      setProperties(res.data);
      setLoadingLocations(false);

      // Pre-select property if passed in URL or state
      if (initialPropertySlug) {
        const matched = res.data.find(
          (p) => p.slug.toLowerCase() === initialPropertySlug.toLowerCase()
        );
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            propertySlug: matched.slug,
            propertyName: matched.name
          }));
        }
      } else if (res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertySlug: res.data[0].slug,
          propertyName: res.data[0].name
        }));
      }
    });
  }, [initialPropertySlug]);

  const handlePropertyChange = (slug: string) => {
    const matched = properties.find((p) => p.slug === slug);
    setFormData((prev) => ({
      ...prev,
      propertySlug: slug,
      propertyName: matched ? matched.name : slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.guestName || !formData.guestEmail || !formData.propertySlug) {
      setErrorMessage('Please complete all required fields: Name, Email, and Preferred Sanctuary.');
      return;
    }

    setSubmitting(true);
    const result = await submitBooking(formData);
    setSubmitting(false);

    if (result.success) {
      setSuccessResult({
        message: result.message,
        source: result.source
      });
    } else {
      setErrorMessage(result.message || 'Submission failed. Please try again.');
    }
  };

  return (
    <div className="bg-[#E8DAC1] text-[#1A1A1A] pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#510F23] text-[#E8DAC1] rounded-full text-[10px] font-bold tracking-[0.3em] uppercase shadow border border-[#C19F6A]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#C19F6A]" />
            <span>CENTRAL RESERVATIONS</span>
          </div>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-[#510F23] font-light">
            Reserve Your Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/80 max-w-lg mx-auto font-light leading-relaxed">
            Please submit your itinerary details. Inquiries are logged directly to the Hanford Central Booking Register (Google Sheets Integration).
          </p>
        </div>

        {/* Success Modal / Banner */}
        {successResult ? (
          <div className="bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl p-10 text-center space-y-6 shadow-2xl animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-[#510F23] text-[#C19F6A] rounded-full flex items-center justify-center mx-auto border border-[#C19F6A]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#8C8C8C] uppercase block">
                RESERVATION INQUIRY RECORDED
              </span>
              <h2 className="font-serif italic text-3xl text-[#510F23]">
                Thank You, {formData.guestName}
              </h2>
            </div>

            <p className="text-xs text-[#1A1A1A]/80 max-w-md mx-auto leading-relaxed font-light">
              {successResult.message}
            </p>

            <div className="bg-[#FAF8F5] p-6 border border-[#8C8C8C]/30 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-[#8C8C8C]/20 pb-2">
                <span className="text-[#8C8C8C]">Sanctuary:</span>
                <strong className="text-[#510F23]">{formData.propertyName}</strong>
              </div>
              <div className="flex justify-between border-b border-[#8C8C8C]/20 pb-2">
                <span className="text-[#8C8C8C]">Dates:</span>
                <span className="text-[#1A1A1A]">{formData.checkInDate || 'TBD'} to {formData.checkOutDate || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Guests:</span>
                <span className="text-[#1A1A1A]">{formData.guestsCount} Guests</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSuccessResult(null);
                  setFormData({
                    propertySlug: properties[0]?.slug || '',
                    propertyName: properties[0]?.name || '',
                    guestName: '',
                    guestEmail: '',
                    guestPhone: '',
                    checkInDate: '',
                    checkOutDate: '',
                    guestsCount: 2,
                    specialRequests: ''
                  });
                }}
                className="px-6 py-3 border border-[#8C8C8C]/40 text-[#510F23] rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#510F23]/10 transition-colors"
              >
                SUBMIT ANOTHER INQUIRY
              </button>

              <button
                onClick={() => onNavigate('/locations')}
                className="px-6 py-3 bg-[#510F23] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#3d0b1a] transition-colors border border-[#C19F6A]/30"
              >
                EXPLORE LOCATIONS
              </button>
            </div>
          </div>
        ) : (
          /* Form Container */
          <form
            onSubmit={handleSubmit}
            className="bg-[#E8DAC1] border border-[#8C8C8C]/40 rounded-2xl p-8 sm:p-12 shadow-xl space-y-8"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Property Selection */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#510F23] uppercase">
                1. SELECT SANCTUARY & DESTINATION *
              </label>

              {loadingLocations ? (
                <div className="h-10 bg-[#8C8C8C]/20 animate-pulse rounded-full" />
              ) : (
                <div className="relative">
                  <select
                    value={formData.propertySlug}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#510F23] appearance-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.country} — {p.continent}) [{p.status}]
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-[#8C8C8C] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Section 2: Guest Personal Information */}
            <div className="space-y-4 pt-4 border-t border-[#8C8C8C]/30">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#510F23] uppercase">
                2. GUEST CONTACT INFORMATION *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lord / Lady / Mr. / Ms. Full Name"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guest@domain.com"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                  Telephone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                />
              </div>
            </div>

            {/* Section 3: Travel Dates & Party */}
            <div className="space-y-4 pt-4 border-t border-[#8C8C8C]/30">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#510F23] uppercase">
                3. DATES & PARTY DETAILS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C8C8C] mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value, 10) })}
                    className="w-full px-5 py-3 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-full text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Special Requests / Concierge Notes */}
            <div className="space-y-4 pt-4 border-t border-[#8C8C8C]/30">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#510F23] uppercase">
                4. SPECIAL REQUESTS & CONCIERGE PREFERENCES
              </label>

              <textarea
                rows={4}
                placeholder="Dietary requirements, airport transfer details, celebratory arrangements, suite preferences..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-5 py-4 bg-[#FAF8F5] border border-[#8C8C8C]/30 rounded-2xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#510F23]"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-[#8C8C8C]/30">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#510F23] text-white hover:bg-[#3d0b1a] rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 border border-[#C19F6A]/30"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>TRANSMITTING INQUIRY...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#C19F6A]" />
                    <span>SUBMIT INQUIRY TO HANFORD</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
