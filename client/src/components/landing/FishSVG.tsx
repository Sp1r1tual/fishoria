import { forwardRef } from 'react';

interface FishSVGProps {
  idPrefix?: string;
}

export const FishSVG = forwardRef<SVGSVGElement, FishSVGProps>(
  ({ idPrefix = '' }, ref) => {
    const bodyId = `${idPrefix}fishBody`;
    const scalesId = `${idPrefix}scales`;

    return (
      <svg
        ref={ref}
        viewBox="-150 -75 300 150"
        aria-hidden="true"
        role="presentation"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 5,
          display: 'none',
        }}
      >
        <defs>
          <linearGradient id={bodyId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5d23" />
            <stop offset="50%" stopColor="#c2a13e" />
            <stop offset="100%" stopColor="#e8e2c1" />
          </linearGradient>
          <pattern
            id={scalesId}
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q5 0 10 10 T20 10"
              fill="none"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Body */}
        <ellipse cx="-15" cy="0" rx="100" ry="40" fill={`url(#${bodyId})`} />
        <ellipse cx="-15" cy="0" rx="100" ry="40" fill={`url(#${scalesId})`} />

        {/* Stripes (Perch Style) */}
        <g
          fill="none"
          stroke="#2d3319"
          strokeOpacity="0.2"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M-75 -25 L-81 12" />
          <path d="M-50 -32 L-57 22" />
          <path d="M-25 -35 L-27 28" />
          <path d="M0 -35 L-3 25" />
          <path d="M25 -32 L23 18" />
          <path d="M50 -25 L48 10" />
        </g>

        {/* Fin (Top Only) */}
        <path d="M-35 -30 Q-15 -70 5 -30" fill="#cc5822" fillOpacity="0.6" />

        {/* Tail */}
        <path data-tail fill="#b34714" fillOpacity="0.8" />

        {/* Eyes */}
        <circle cx="45" cy="-5" r="12" fill="white" />
        <circle cx="50" cy="-5" r="6" fill="black" />
        <circle cx="47" cy="-8" r="2" fill="white" />
      </svg>
    );
  },
);

FishSVG.displayName = 'FishSVG';
