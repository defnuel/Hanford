import React from 'react';

export const DEFAULT_KEYCARD_BG = 'https://lh3.googleusercontent.com/d/1xF4361TyyrgDCeoFveQ49owPfOnY1xQ1';

export interface GuestKeyCardCanvasProps {
  guestName: string;
  roomNumbers: string[];
  locationName: string;
  locationShort?: string;
  backgroundImageUrl?: string;
  id?: string;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export const GuestKeyCardCanvas: React.FC<GuestKeyCardCanvasProps> = ({
  guestName,
  roomNumbers,
  locationName,
  locationShort,
  backgroundImageUrl = DEFAULT_KEYCARD_BG,
  id = 'hanford-key-card-canvas',
  canvasRef,
}) => {
  // Extract short location name (e.g. "ULUWATU")
  const displayLocationShort =
    locationShort ||
    (locationName
      ? locationName
          .replace(/Hanford\s+(Eco\s+Resort|Grand\s+Hotel|Hotel\s+&\s+Resort|Resort\s+&\s+Spa)?/gi, '')
          .replace(/,\s*Indonesia|,\s*Bali|,\s*South\s*Korea|,\s*United\s*States|,\s*Greece/gi, '')
          .trim()
          .toUpperCase() || 'ULUWATU'
      : 'ULUWATU');

  const displayGuestName = guestName.trim() ? guestName.trim().toUpperCase() : 'GAVIN ELIAN BASKORO';

  // Format room numbers cleanly (empty array if no rooms provided)
  const formattedRooms =
    roomNumbers && roomNumbers.length > 0
      ? roomNumbers.map((r) => r.trim()).filter(Boolean)
      : [];

  // Helper to space out characters like "P M V - 0 3 - A"
  const formatRoomDisplay = (rm: string) => {
    if (!rm) return '';
    if (rm.includes(' ') && rm.length > 8) return rm;
    if (rm.toUpperCase().startsWith('PMV') || rm.includes('-')) {
      return rm
        .split('')
        .map((c) => (c === ' ' ? ' ' : c))
        .join(' ')
        .replace(/\s+/g, ' ');
    }
    return rm;
  };

  return (
    <div
      id={id}
      ref={canvasRef as any}
      data-guest-name={displayGuestName}
      data-room-number={formattedRooms.length > 0 ? formatRoomDisplay(formattedRooms[0]) : ''}
      data-location-short={displayLocationShort}
      data-bg-url={backgroundImageUrl || DEFAULT_KEYCARD_BG}
      className="relative w-full max-w-[1020px] aspect-[16/9] mx-auto select-none overflow-hidden shadow-2xl rounded-2xl bg-[#EDE4D6]"
      style={{
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.25)',
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="goldTextShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 1. Permanent High-Resolution Background Picture Template */}
        <image
          href={backgroundImageUrl || DEFAULT_KEYCARD_BG}
          x="0"
          y="0"
          width="1920"
          height="1080"
          preserveAspectRatio="xMidYMid slice"
          crossOrigin="anonymous"
        />

        {/* ========================================================================= */}
        {/* 2. DYNAMIC FIELD 1: ROOM NUMBER(S) ON LEFT IVORY INSERT CARD              */}
        {/* (Centered horizontally, positioned comfortably between title & notch)     */}
        {/* ========================================================================= */}
        {formattedRooms.length === 1 ? (
          <text
            x="600"
            y="215"
            textAnchor="middle"
            fontFamily="'Times New Roman', Georgia, serif"
            fontSize="21"
            fontWeight="600"
            letterSpacing="0.26em"
            fill="#18212C"
          >
            {formatRoomDisplay(formattedRooms[0])}
          </text>
        ) : formattedRooms.length === 2 ? (
          <g>
            <text
              x="600"
              y="204"
              textAnchor="middle"
              fontFamily="'Times New Roman', Georgia, serif"
              fontSize="16.5"
              fontWeight="600"
              letterSpacing="0.18em"
              fill="#18212C"
            >
              {formattedRooms[0]}
            </text>
            <text
              x="600"
              y="226"
              textAnchor="middle"
              fontFamily="'Times New Roman', Georgia, serif"
              fontSize="16.5"
              fontWeight="600"
              letterSpacing="0.18em"
              fill="#18212C"
            >
              {formattedRooms[1]}
            </text>
          </g>
        ) : formattedRooms.length > 2 ? (
          <text
            x="600"
            y="215"
            textAnchor="middle"
            fontFamily="'Times New Roman', Georgia, serif"
            fontSize="15.5"
            fontWeight="500"
            letterSpacing="0.14em"
            fill="#18212C"
          >
            {formattedRooms.slice(0, 3).join(' • ')}
          </text>
        ) : null}

        {/* ========================================================================= */}
        {/* 3. DYNAMIC FIELD 2: GUEST NAME ON TOP RIGHT                               */}
        {/* (Scaled cleanly directly below "GUEST NAME :")                           */}
        {/* ========================================================================= */}
        <text
          x="1046"
          y="192"
          textAnchor="start"
          fontFamily="'Times New Roman', Georgia, serif"
          fontSize="26"
          fontWeight="400"
          letterSpacing="0.14em"
          fill="#18212C"
        >
          {displayGuestName}
        </text>

        {/* ========================================================================= */}
        {/* 4. DYNAMIC FIELD 3: LOCATION ON RIGHT NAVY SMART CARD                     */}
        {/* (Centered directly below "HOTEL & RESORT")                                */}
        {/* ========================================================================= */}
        <text
          x="1274"
          y="788"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
          fontSize="23"
          fontWeight="700"
          letterSpacing="0.26em"
          fill="#F5D68B"
          filter="url(#goldTextShadow)"
        >
          {displayLocationShort}
        </text>
      </svg>
    </div>
  );
};
