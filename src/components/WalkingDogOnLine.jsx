import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

/**
 * WalkingDogOnLine Component
 * Renders an animated Golden/Corgi companion trotting along the bottom line of the search bar.
 * The speech badge uses the India Pet Hub Royal Navy & Gold brand styling.
 */
const WalkingDogOnLine = ({ isSearching, className = '' }) => {
  const [barks, setBarks] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const dogPhrases = [
    'Sniffing for treats... 🍖',
    'Walk with me! 🐾',
    'Find best pet food & toys 🎾',
    'Type anything to search 🐶',
    'Looking for vet care? 🩺'
  ];

  // Rotate thought bubble phrases periodically
  useEffect(() => {
    if (isSearching) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % dogPhrases.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isSearching, dogPhrases.length]);

  const handleDogClick = (e) => {
    e.stopPropagation();
    setBarks(true);
    setTimeout(() => setBarks(false), 1400);
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-500 ease-out z-10 overflow-visible ${
        isSearching
          ? 'opacity-0 scale-90 pointer-events-none'
          : 'opacity-100 scale-100'
      } ${className}`}
      aria-hidden={isSearching}
    >
      {/* Horizontal movement container walking directly along the bottom border */}
      <div className="absolute bottom-0 -mb-[1px] flex items-end animate-dog-walk-space pointer-events-none">
        
        {/* Interactive clickable container */}
        <div
          onClick={handleDogClick}
          className="relative pointer-events-auto cursor-pointer group select-none flex flex-col items-center pb-0.5"
          title="Click to pet! 🐾"
        >
          {/* =========================================================================
              INDIA PET HUB BRAND BADGE: Royal Navy Blue background & Gold text
             ========================================================================= */}
          <div className="absolute -top-7 whitespace-nowrap px-3 py-0.5 rounded-full bg-[#0c2744] border border-[#ffd000]/40 text-[9.5px] font-bold text-[#ffd000] shadow-lg flex items-center gap-1.5 transition-transform duration-200 group-hover:scale-105 pointer-events-none z-30">
            {barks ? (
              <span className="text-pink-300 font-bold flex items-center gap-1 animate-bounce">
                <Heart size={9} className="fill-pink-400 text-pink-400" /> Woof Woof!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles size={8.5} className="text-[#ffd000] animate-pulse shrink-0" />
                {dogPhrases[phraseIndex]}
              </span>
            )}
          </div>

          {/* =========================================================================
              SVG DOG GRAPHIC: Flips direction (scaleX) independently of text bubble
             ========================================================================= */}
          <div className="animate-dog-flip-graphic origin-bottom">
            <svg
              viewBox="0 0 100 60"
              className="w-12 h-7.5 md:w-13 md:h-8 drop-shadow-[0_2px_5px_rgba(245,158,11,0.4)] block"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Back Left Leg (Trotting cycle 1) */}
              <g
                className="animate-dog-leg-1"
                style={{ transformOrigin: '32px 40px' }}
              >
                <rect x="29" y="38" width="6" height="20" rx="3" fill="#B45309" />
                <ellipse cx="32" cy="58" rx="4.5" ry="2" fill="#92400E" />
              </g>

              {/* Front Left Leg (Trotting cycle 2) */}
              <g
                className="animate-dog-leg-2"
                style={{ transformOrigin: '58px 40px' }}
              >
                <rect x="55" y="38" width="6" height="20" rx="3" fill="#B45309" />
                <ellipse cx="58" cy="58" rx="4.5" ry="2" fill="#92400E" />
              </g>

              {/* Tail (Wagging) */}
              <g
                className="animate-dog-tail"
                style={{ transformOrigin: '24px 28px' }}
              >
                <path
                  d="M 25 28 C 16 22, 9 16, 12 7 C 16 7, 21 16, 27 24 Z"
                  fill="#D97706"
                />
                <circle cx="12" cy="8" r="3" fill="#FDE68A" />
              </g>

              {/* Dog Body & Torso (Bobbing) */}
              <g className="animate-dog-body">
                {/* Main Body */}
                <rect x="24" y="24" width="44" height="23" rx="11" fill="#F59E0B" />
                {/* Belly Highlight */}
                <path
                  d="M 31 38 Q 46 44 61 38"
                  stroke="#FEF08A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Back Spotted Patch */}
                <ellipse cx="38" cy="27" rx="6" ry="3.5" fill="#D97706" opacity="0.6" />

                {/* Collar */}
                <rect x="64" y="23" width="5.5" height="15" rx="2" fill="#15559C" />
                {/* Medal Tag */}
                <circle cx="67" cy="38.5" r="3.2" fill="#FFD000" stroke="#D97706" strokeWidth="0.8" />
                <circle cx="67" cy="38.5" r="1.2" fill="#B45309" />

                {/* Head */}
                <circle cx="72" cy="21" r="13.5" fill="#F59E0B" />

                {/* Snout & Muzzle */}
                <ellipse cx="82.5" cy="24.5" rx="7.5" ry="6" fill="#FEF08A" />
                {/* Nose */}
                <ellipse cx="88" cy="22" rx="2.6" ry="2.2" fill="#1F2937" />
                <circle cx="87.3" cy="21.2" r="0.8" fill="#FFFFFF" opacity="0.8" />

                {/* Smile & Tongue */}
                <path
                  d="M 83.5 26.5 Q 86.5 29.5 89.5 26.5"
                  stroke="#1F2937"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 85.5 27.5 Q 87.5 32 89.5 27.5 Z"
                  fill="#FB7185"
                />

                {/* Happy Eye */}
                <circle cx="74.5" cy="17.5" r="2.2" fill="#1F2937" />
                <circle cx="73.8" cy="16.8" r="0.9" fill="#FFFFFF" />
                {/* Eyebrow */}
                <path
                  d="M 72 13.5 Q 75 12.5 77 14"
                  stroke="#B45309"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Floppy Ear (Bobbing) */}
                <g
                  className="animate-dog-ear"
                  style={{ transformOrigin: '66px 13px' }}
                >
                  <path
                    d="M 66 13 C 63 21, 59 28, 63 32 C 67 32, 70 24, 70 15 Z"
                    fill="#D97706"
                  />
                  <path
                    d="M 65 17 C 63 23, 61 28, 64 30"
                    stroke="#B45309"
                    strokeWidth="1.2"
                    fill="none"
                  />
                </g>
              </g>

              {/* Back Right Leg (Trotting cycle 2) */}
              <g
                className="animate-dog-leg-2"
                style={{ transformOrigin: '38px 40px' }}
              >
                <rect x="35" y="38" width="6" height="20" rx="3" fill="#D97706" />
                <ellipse cx="38" cy="58" rx="4.5" ry="2" fill="#B45309" />
              </g>

              {/* Front Right Leg (Trotting cycle 1) */}
              <g
                className="animate-dog-leg-1"
                style={{ transformOrigin: '64px 40px' }}
              >
                <rect x="61" y="38" width="6" height="20" rx="3" fill="#F59E0B" />
                <ellipse cx="64" cy="58" rx="4.5" ry="2" fill="#D97706" />
              </g>

              {/* Little Heart on head during click */}
              {barks && (
                <g className="animate-ping">
                  <path
                    d="M 75 4 C 75 1, 71 1, 71 4 C 71 7, 75 9, 75 9 C 75 9, 79 7, 79 4 C 79 1, 75 1, 75 4 Z"
                    fill="#F43F5E"
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalkingDogOnLine;
