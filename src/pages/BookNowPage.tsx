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
    <div className="bg-[#f5f2ed] text-[#1a1a1a] pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold tracking-[0.3em] uppercase shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CENTRAL RESERVATIONS</span>
          </div>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-[#1a1a1a] font-light">
            Reserve Your Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-black/70 max-w-lg mx-auto font-light leading-relaxed">
            Please submit your itinerary details. Inquiries are logged directly to the Hanford Central Booking Register (Google Sheets Integration).
          </p>
        </div>

        {/* Success Modal / Banner */}
        {successResult ? (
          <div className="bg-[#e8e4de] border border-black/10 rounded-2xl p-10 text-center space-y-6 shadow-2xl animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center mx-auto border border-black/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.3em] text-black/60 uppercase block">
                RESERVATION INQUIRY RECORDED
              </span>
              <h2 className="font-serif italic text-3xl text-[#1a1a1a]">
                Thank You, {formData.guestName}
              </h2>
            </div>

            <p className="text-xs text-black/70 max-w-md mx-auto leading-relaxed font-light">
              {successResult.message}
            </p>

            <div className="bg-white p-6 border border-black/10 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span className="text-black/50">Sanctuary:</span>
                <strong className="text-[#1a1a1a]">{formData.propertyName}</strong>
              </div>
              <div className="flex justify-between border-b border-black/10 pb-2">
                <span className="text-black/50">Dates:</span>
                <span className="text-[#1a1a1a]">{formData.checkInDate || 'TBD'} to {formData.checkOutDate || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/50">Guests:</span>
                <span className="text-[#1a1a1a]">{formData.guestsCount} Guests</span>
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
                className="px-6 py-3 border border-black/20 text-[#1a1a1a] rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black/10 transition-colors"
              >
                SUBMIT ANOTHER INQUIRY
              </button>

              <button
                onClick={() => onNavigate('/locations')}
                className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black/80 transition-colors"
              >
                EXPLORE LOCATIONS
              </button>
            </div>
          </div>
        ) : (
          /* Form Container */
          <form
            onSubmit={handleSubmit}
            className="bg-[#e8e4de] border border-black/10 rounded-2xl p-8 sm:p-12 shadow-xl space-y-8"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Property Selection */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#1a1a1a] uppercase">
                1. SELECT SANCTUARY & DESTINATION *
              </label>

              {loadingLocations ? (
                <div className="h-10 bg-black/10 animate-pulse rounded-full" />
              ) : (
                <div className="relative">
                  <select
                    value={formData.propertySlug}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    required
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] font-medium focus:outline-none focus:border-black appearance-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.country} — {p.continent}) [{p.status}]
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Section 2: Guest Personal Information */}
            <div className="space-y-4 pt-4 border-t border-black/10">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#1a1a1a] uppercase">
                2. GUEST CONTACT INFORMATION *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lord / Lady / Mr. / Ms. Full Name"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guest@domain.com"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black/60 mb-1">
                  Telephone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Section 3: Travel Dates & Party */}
            <div className="space-y-4 pt-4 border-t border-black/10">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#1a1a1a] uppercase">
                3. DATES & PARTY DETAILS
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: parseInt(e.target.value, 10) })}
                    className="w-full px-5 py-3 bg-white border border-black/10 rounded-full text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
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
            <div className="space-y-4 pt-4 border-t border-black/10">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-[#1a1a1a] uppercase">
                4. SPECIAL REQUESTS & CONCIERGE PREFERENCES
              </label>

              <textarea
                rows={4}
                placeholder="Dietary requirements, airport transfer details, celebratory arrangements, suite preferences..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-5 py-4 bg-white border border-black/10 rounded-2xl text-xs text-[#1a1a1a] focus:outline-none focus:border-black"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-black/10">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#1a1a1a] text-white hover:bg-black/80 rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>TRANSMITTING INQUIRY...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
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
