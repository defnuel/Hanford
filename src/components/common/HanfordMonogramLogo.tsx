import React from 'react';

interface HanfordMonogramLogoProps {
  className?: string;
  variant?: 'gold' | 'debossed' | 'white' | 'dark';
  width?: number | string;
  height?: number | string;
}

export const HanfordMonogramLogo: React.FC<HanfordMonogramLogoProps> = ({
  className = '',
  variant = 'gold',
  width = '100%',
  height = '100%',
}) => {
  // Determine color scheme based on variant
  const outerRingColor =
    variant === 'gold'
      ? '#D8B365'
      : variant === 'debossed'
      ? '#101622'
      : variant === 'white'
      ? '#FFFFFF'
      : '#1B2433';

  const innerRingColor =
    variant === 'gold'
      ? '#C9A352'
      : variant === 'debossed'
      ? '#0D121B'
      : variant === 'white'
      ? '#F5F5F5'
      : '#2B374A';

  const letterFill =
    variant === 'gold'
      ? '#ECC876'
      : variant === 'debossed'
      ? '#0E131E'
      : variant === 'white'
      ? '#FFFFFF'
      : '#1B2433';

  const filterId = variant === 'debossed' ? 'deboss-shadow' : variant === 'gold' ? 'gold-glow' : undefined;

  return (
    <svg
      viewBox="0 0 200 300"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {variant === 'gold' && (
          <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E2A8" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#ECC876" />
            <stop offset="100%" stopColor="#B38A28" />
          </linearGradient>
        )}
        {variant === 'debossed' && (
          <filter id="deboss-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="1.5" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="#000000" floodOpacity="0.8" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        )}
      </defs>

      <g filter={filterId ? `url(#${filterId})` : undefined}>
        {/* Outer Oval Stadium Ring */}
        <rect
          x="12"
          y="12"
          width="176"
          height="276"
          rx="88"
          ry="88"
          stroke={variant === 'gold' ? 'url(#goldLinear)' : outerRingColor}
          strokeWidth="3.2"
          fill="none"
        />

        {/* Inner Concentric Oval Stadium Ring */}
        <rect
          x="20"
          y="20"
          width="160"
          height="260"
          rx="80"
          ry="80"
          stroke={variant === 'gold' ? 'url(#goldLinear)' : innerRingColor}
          strokeWidth="1.8"
          strokeOpacity={variant === 'gold' ? 0.85 : 0.7}
          fill="none"
        />

        {/* HR Monogram Centerpiece (Faithful to HnR_3_TP@1.25x.png) */}
        <g id="HR-monogram">
          {/* Left vertical stem of 'H' */}
          {/* Top bracketed serif */}
          <path
            d="M 52 110 L 74 110 L 74 114 L 66 114 L 66 186 L 74 186 L 74 190 L 52 190 L 52 186 L 60 186 L 60 114 L 52 114 Z"
            fill={variant === 'gold' ? 'url(#goldLinear)' : letterFill}
          />

          {/* Right vertical stem of 'H' / Left stem of 'R' */}
          <path
            d="M 82 110 L 104 110 L 104 114 L 96 114 L 96 186 L 104 186 L 104 190 L 82 190 L 82 186 L 90 186 L 90 114 L 82 114 Z"
            fill={variant === 'gold' ? 'url(#goldLinear)' : letterFill}
          />

          {/* Connecting Crossbar of 'H' connecting straight across to 'R' */}
          <rect
            x="60"
            y="147"
            width="55"
            height="6"
            fill={variant === 'gold' ? 'url(#goldLinear)' : letterFill}
          />

          {/* 'R' Upper Loop */}
          <path
            d="M 96 110 L 126 110 C 142 110 148 119 148 131 C 148 143 140 152 125 152 L 96 152 L 96 146 L 124 146 C 135 146 141 140 141 131 C 141 122 135 116 124 116 L 96 116 Z"
            fill={variant === 'gold' ? 'url(#goldLinear)' : letterFill}
          />

          {/* 'R' Diagonal Leg with elegant terminal curve */}
          <path
            d="M 116 150 C 122 150 128 155 132 163 L 144 186 C 146 189 149 190 153 190 L 158 190 L 158 186 C 154 186 150 183 147 178 L 136 157 C 132 150 125 147 116 147 Z"
            fill={variant === 'gold' ? 'url(#goldLinear)' : letterFill}
          />
        </g>
      </g>
    </svg>
  );
};
