import React, { useEffect } from 'react';

/**
 * FlyingMacawMessenger Component
 * Renders a Blue-and-Gold Macaw (Ara ararauna) gliding gracefully across the screen
 * carrying the adoption application letter in its beak at a leisurely, majestic pace.
 */
const FlyingMacawMessenger = ({ onComplete }) => {
  // Lifecycle timer matching the slower 8.5s flight animation
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 8500);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      
      {/* Trajectory Flight Wrapper */}
      <div className="absolute animate-macaw-swoop-path w-full h-full pointer-events-none">
        
        {/* Bird Graphic Container */}
        <div className="relative inline-flex flex-col items-center">
          
          {/* =========================================================================
              BLUE-AND-GOLD MACAW (ARA ARARAUNA) GLIDING WITH ADOPTION LETTER
             ========================================================================= */}
          <div className="relative w-40 h-40 md:w-52 md:h-52 drop-shadow-[0_14px_28px_rgba(2,132,199,0.45)]">
            <svg
              viewBox="0 0 175 155"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Cobalt Royal Blue Feather Gradient */}
                <linearGradient id="bgmBlue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="35%" stopColor="#0284C7" />
                  <stop offset="75%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>

                {/* Warm Golden-Yellow Breast Gradient */}
                <linearGradient id="bgmGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="35%" stopColor="#FACC15" />
                  <stop offset="75%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                {/* Lime Emerald Forehead Patch Gradient */}
                <linearGradient id="bgmGreen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="50%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>

                {/* Envelope Golden Gradient */}
                <linearGradient id="letterGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FEF3C7" />
                </linearGradient>
              </defs>

              {/* LONG SWEEPING DUAL-TONE TAIL FEATHERS */}
              <g className="animate-macaw-tail" style={{ transformOrigin: '50px 92px' }}>
                {/* Underside Golden Tail Feather */}
                <path
                  d="M 52 88 Q 36 118 16 150 Q 30 125 56 92 Z"
                  fill="url(#bgmGold)"
                />
                {/* Main Central Royal Cobalt Blue Tail Feather */}
                <path
                  d="M 48 86 Q 25 115 6 148 Q 20 124 52 90 Z"
                  fill="url(#bgmBlue)"
                />
                {/* Outer Azure Accent Feather */}
                <path
                  d="M 54 89 Q 42 114 30 138 Q 42 116 58 92 Z"
                  fill="#0284C7"
                />
              </g>

              {/* TOP FLAPPING WING (Upper Flight Stroke - Radiant Cobalt Blue) */}
              <g className="animate-macaw-wing-flap" style={{ transformOrigin: '80px 60px' }}>
                {/* Wing Base */}
                <path
                  d="M 80 60 Q 96 22 135 15 Q 118 42 90 68 Z"
                  fill="url(#bgmBlue)"
                />
                {/* Middle Wing Covert Layers */}
                <path
                  d="M 90 50 Q 112 20 148 12 Q 128 44 98 71 Z"
                  fill="url(#bgmBlue)"
                />
                {/* Primary Flight Feathers */}
                <path
                  d="M 100 42 Q 128 10 162 8 Q 138 42 104 74 Z"
                  fill="#1E40AF"
                />
                {/* Feather Separations */}
                <path
                  d="M 135 15 Q 122 34 106 50 M 148 12 Q 134 36 114 58 M 162 8 Q 144 36 122 64"
                  stroke="#93C5FD"
                  strokeWidth="0.9"
                  strokeOpacity="0.6"
                  strokeLinecap="round"
                />
              </g>

              {/* MACAW BODY & TORSO */}
              <g>
                {/* Warm Golden Breast & Underbelly */}
                <ellipse cx="76" cy="70" rx="23" ry="16" transform="rotate(-15 76 70)" fill="url(#bgmGold)" />
                
                {/* Back / Mantle (Cobalt Blue) */}
                <path
                  d="M 60 62 Q 78 52 95 56 Q 88 74 65 78 Z"
                  fill="url(#bgmBlue)"
                />

                {/* Head (Golden with Blue Nape) */}
                <circle cx="100" cy="56" r="16" fill="url(#bgmGold)" />
                <path
                  d="M 94 42 Q 106 42 110 52 Q 95 52 86 58 Z"
                  fill="url(#bgmBlue)"
                />

                {/* Forehead Emerald / Lime Green Patch */}
                <path
                  d="M 104 43 Q 113 45 113 51 Q 107 51 101 47 Z"
                  fill="url(#bgmGreen)"
                />

                {/* White Bare Facial Skin Patch with Black Stipples */}
                <path
                  d="M 102 48 Q 112 50 112 59 Q 104 63 98 61 Q 96 52 102 48 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 101 51 Q 105 53 108 51 M 101 54 Q 106 56 109 54 M 100 57 Q 104 59 107 58"
                  stroke="#1E293B"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />

                {/* Black Throat / Chin Collar */}
                <path
                  d="M 102 62 Q 108 65 106 70 Q 99 68 98 63 Z"
                  fill="#0F172A"
                />

                {/* Eye (Pale Yellow-Grey with Black Pupil) */}
                <circle cx="102" cy="53" r="3.2" fill="#E2E8F0" />
                <circle cx="102" cy="53" r="2.1" fill="#0F172A" />
                <circle cx="101.2" cy="52.2" r="0.9" fill="#FFFFFF" />

                {/* Jet-Black Sturdy Curved Upper Beak */}
                <path
                  d="M 110 52 Q 128 56 125 72 Q 117 63 110 61 Z"
                  fill="#0F172A"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                {/* Upper Beak Highlight */}
                <path
                  d="M 112 54 Q 123 57 122 66"
                  stroke="#64748B"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Black Lower Beak */}
                <path
                  d="M 110 61 Q 118 63 117 70 Q 111 69 109 65 Z"
                  fill="#0F172A"
                />
              </g>

              {/* =========================================================================
                  PROMINENT ADOPTION LETTER / ENVELOPE HELD IN BEAK
                 ========================================================================= */}
              <g transform="translate(115, 62) rotate(16)">
                {/* Drop Shadow */}
                <rect x="1" y="2" width="30" height="20" rx="3" fill="#000000" opacity="0.2" />
                
                {/* Letter Body */}
                <rect x="0" y="0" width="30" height="20" rx="2.5" fill="url(#letterGrad)" stroke="#D97706" strokeWidth="1.3" />
                
                {/* Envelope Flap Lines */}
                <path d="M 0 0 L 15 11 L 30 0" stroke="#CA8A04" strokeWidth="1.1" fill="#FEF3C7" />
                <path d="M 0 20 L 11 10 M 30 20 L 19 10" stroke="#D97706" strokeWidth="0.8" />
                
                {/* Peeking White Adoption Document Border */}
                <path d="M 6 0 L 15 6.5 L 24 0" fill="#FFFFFF" />

                {/* Red Wax Heart Seal */}
                <circle cx="15" cy="10.5" r="4.5" fill="#E11D48" stroke="#9F1239" strokeWidth="0.7" />
                <path
                  d="M 15 8.5 C 15 7.4, 13 7.4, 13 8.7 C 13 10.3, 15 12, 15 12 C 15 12, 17 10.3, 17 8.7 C 17 7.4, 15 7.4, 15 8.5 Z"
                  fill="#FFFFFF"
                />
              </g>

              {/* BOTTOM / SECONDARY UNDERWING FEATHERS (Golden Yellow Underwing) */}
              <g className="animate-macaw-wing-flap-bottom" style={{ transformOrigin: '70px 74px' }}>
                <path
                  d="M 70 74 Q 86 96 115 108 Q 96 86 74 70 Z"
                  fill="url(#bgmGold)"
                  opacity="0.95"
                />
                <path
                  d="M 72 73 Q 85 89 104 98 Q 89 81 74 70 Z"
                  fill="#0284C7"
                  opacity="0.85"
                />
              </g>
            </svg>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FlyingMacawMessenger;
