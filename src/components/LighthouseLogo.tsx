import React from 'react';

export const LighthouseLogo: React.FC<{ className?: string; height?: number }> = ({ className = '', height = 48 }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} style={{ height }}>
      {/* Custom High-Fidelity SVG of the Lighthouse & Waves Logo */}
      <svg
        viewBox="0 0 160 120"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky / Light ray subtle arcs */}
        <path d="M 60 40 L 100 0 L 100 80 Z" fill="rgba(121, 210, 236, 0.1)" />
        <path d="M 60 40 L 40 10 L 40 80 Z" fill="rgba(121, 210, 236, 0.1)" />

        {/* Lighthouse Tower Structure */}
        {/* Dome Top Cupola */}
        <path d="M 60 25 C 60 20, 68 20, 68 25 Z" fill="#0A2540" />
        <rect x="62" y="25" width="4" height="2" fill="#79D2EC" />
        
        {/* Light Deck Cabin */}
        <rect x="58" y="27" width="12" height="6" fill="#0A2540" rx="1" />
        {/* Glow behind light */}
        <circle cx="64" cy="30" r="4" fill="#FFD700" className="animate-pulse" />
        <rect x="62" y="28" width="4" height="4" fill="#FFFFFF" />

        {/* Guard Rail / Gallery */}
        <rect x="54" y="33" width="20" height="2" fill="#0A2540" />
        <line x1="56" y1="31" x2="56" y2="33" stroke="#0A2540" strokeWidth="1" />
        <line x1="64" y1="31" x2="64" y2="33" stroke="#0A2540" strokeWidth="1" />
        <line x1="72" y1="31" x2="72" y2="33" stroke="#0A2540" strokeWidth="1" />

        {/* Deep navy tapered main tower body */}
        <path d="M 57 35 L 71 35 L 75 80 L 53 80 Z" fill="#0A2540" />

        {/* White spiral accent stripes (Negative Space) */}
        <path d="M 55 45 L 69 53 L 71 58 L 56 50 Z" fill="#FFFFFF" />
        <path d="M 54 62 L 73 72 L 74 77 L 53 67 Z" fill="#FFFFFF" />

        {/* Tower Door and Window Details */}
        <rect x="62" y="42" width="4" height="6" rx="1" fill="#0A2540" />
        <path d="M 61 72 L 67 72 L 67 80 L 61 80 Z" fill="#FFFFFF" />

        {/* Active oceanic waves at base */}
        <path
          d="M 20 90 C 45 75, 75 105, 110 85 C 90 95, 60 90, 40 100 C 30 105, 25 100, 20 90 Z"
          fill="#009FB7"
        />
        <path
          d="M 25 98 C 50 83, 80 113, 115 93 C 95 103, 65 98, 45 108 C 35 113, 30 108, 25 98 Z"
          fill="#11B5E4"
        />
        <path
          d="M 33 103 C 58 92, 85 118, 122 100 C 102 110, 72 104, 52 114 C 42 119, 38 114, 33 103 Z"
          fill="#79D2EC"
        />
      </svg>
      
      {/* Brand Wording */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-sans font-black tracking-wider text-2xl text-[#0A2540]">
            LIGHTHOUSE
          </span>
          <span className="font-sans font-black text-3xl text-[#E52323]">
            橋
          </span>
        </div>
        <span className="font-mono text-[7px] text-[#4A607A] tracking-[0.2em] font-medium uppercase mt-1 leading-none">
          PROTOTYPE SOFTWARE PIPELINE
        </span>
      </div>
    </div>
  );
};
