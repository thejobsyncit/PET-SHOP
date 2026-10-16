import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * AnimatedDepartmentIcon Component
 * Displays photorealistic transparent pet cutouts with GSAP-powered lifelike micro-animations:
 * - Dogs: Realistic Royal French Bulldog with gold medal (head tilt & bouncy wag, "Woof! 👑")
 * - Cats: Realistic Ginger Kitten playing with cyan yarn (playful pounce & batting bounce, "Purr! 🧶")
 * - Birds: Realistic Tropical Scarlet Macaw on perch (branch hop & wing flutter, "Tweet! 🎵")
 * - Reptiles: Realistic Vibrant Corn Snake (hypnotic S-slither curve & tongue dart, "Sss! 🌽")
 * - Fish: Realistic Flowerhorn Cichlid / Floran Fish (graceful fluid swim & bubble rise, "Kok King! 👑")
 * - Veterinary Rx: Realistic 3D Gold & Navy Stethoscope (heartbeat double-thump pulse, "Healthy! 🩺")
 */
const PET_DATA = {
  dogs: {
    src: '/images/departments/dogs.png',
    alt: 'Doberman Pinscher Face Portrait',
    badge: 'Woof! 🐕‍🦺',
  },
  cats: {
    src: '/images/departments/cats.png',
    alt: 'Tabby Persian Cat Face Portrait',
    badge: 'Purr! 👑',
  },
  birds: {
    src: '/images/departments/birds.png',
    alt: 'Tropical Macaw Parrot',
    badge: 'Tweet! 🎵',
  },
  reptiles: {
    src: '/images/departments/reptiles.png',
    alt: 'Emerald Green Iguana',
    badge: 'Iguana! 🦎',
  },
  fish: {
    src: '/images/departments/fish.png',
    alt: 'Vibrant Clownfish',
    badge: 'Splash! 🐠',
  },
  veterinary: {
    src: '/images/departments/veterinary.png',
    alt: 'Gold & Navy Stethoscope',
    badge: 'Healthy! 🩺',
  },
};

const AnimatedDepartmentIcon = ({ type, isHovered }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const shadowRef = useRef(null);
  const bubble1Ref = useRef(null);
  const bubble2Ref = useRef(null);
  const bubble3Ref = useRef(null);
  const tongueRef = useRef(null);
  const glintRef = useRef(null);
  const hasHoveredRef = useRef(false);

  const pet = PET_DATA[type] || PET_DATA.dogs;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isHovered) {
        hasHoveredRef.current = true;

        // ==============================================================
        // 1. DOG: Doberman Pinscher Face Portrait
        // ==============================================================
        if (type === 'dogs') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { y: -5, scale: 1.09, rotation: 5, duration: 0.18, ease: 'sine.out' },
                { y: -1, scale: 1.05, rotation: -3, duration: 0.18, ease: 'sine.inOut' },
                { y: -6, scale: 1.1, rotation: 4, duration: 0.18, ease: 'sine.out' },
                { y: 0, scale: 1.06, rotation: 0, duration: 0.22, ease: 'sine.in' },
              ],
              repeat: -1,
            });
          }
          if (shadowRef.current) {
            gsap.to(shadowRef.current, {
              scaleX: 0.85,
              opacity: 0.4,
              yoyo: true,
              repeat: -1,
              duration: 0.2,
              ease: 'sine.inOut',
            });
          }
          if (glintRef.current) {
            gsap.fromTo(
              glintRef.current,
              { x: -20, opacity: 0 },
              { x: 30, opacity: 0.9, duration: 0.8, repeat: -1, repeatDelay: 1.2, ease: 'power2.inOut' }
            );
          }
        }

        // ==============================================================
        // 2. CAT: Persian Cat Face Portrait
        // ==============================================================
        if (type === 'cats') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { y: -4, rotation: -3, scale: 1.08, duration: 0.2, ease: 'power1.out' },
                { y: 0, rotation: 3, scale: 1.04, duration: 0.2, ease: 'power1.inOut' },
                { y: -5, rotation: -2, scale: 1.09, duration: 0.2, ease: 'power1.out' },
                { y: 0, rotation: 0, scale: 1.05, duration: 0.22, ease: 'power1.in' },
              ],
              repeat: -1,
            });
          }
          if (shadowRef.current) {
            gsap.to(shadowRef.current, {
              scaleX: 0.8,
              opacity: 0.35,
              yoyo: true,
              repeat: -1,
              duration: 0.2,
              ease: 'sine.inOut',
            });
          }
        }

        // ==============================================================
        // 3. BIRD: Tropical Scarlet Macaw
        // ==============================================================
        if (type === 'birds') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { y: -5, scaleY: 1.08, rotation: 4, duration: 0.18, ease: 'sine.out' },
                { y: 0, scaleY: 1.0, rotation: -3, duration: 0.16, ease: 'sine.in' },
                { y: -4, scaleY: 1.06, rotation: 2, duration: 0.18, ease: 'sine.out' },
                { y: 0, scaleY: 1.0, rotation: 0, duration: 0.2, ease: 'sine.in' },
              ],
              repeat: -1,
            });
          }
        }

        // ==============================================================
        // 4. REPTILE: Emerald Green Iguana
        // ==============================================================
        if (type === 'reptiles') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { y: -6, rotation: -3, scale: 1.08, duration: 0.16, ease: 'power2.out' },
                { y: 0, rotation: 0, scale: 1.04, duration: 0.12, ease: 'power1.in' },
                { y: -4, rotation: -2, scale: 1.07, duration: 0.16, ease: 'power2.out' },
                { y: 0, rotation: 0, scale: 1.04, duration: 0.32, ease: 'power1.in' },
              ],
              repeat: -1,
            });
          }
        }

        // ==============================================================
        // 5. FISH: Siamese Fighting Betta Fish
        // ==============================================================
        if (type === 'fish') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { x: 4, y: -4, rotation: -3, scale: 1.08, duration: 0.42, ease: 'sine.inOut' },
                { x: -3, y: 1, rotation: 2, scale: 1.03, duration: 0.42, ease: 'sine.inOut' },
              ],
              repeat: -1,
              yoyo: true,
            });
          }
          const bubbles = [bubble1Ref.current, bubble2Ref.current, bubble3Ref.current].filter(Boolean);
          if (bubbles.length > 0) {
            gsap.fromTo(
              bubbles,
              { y: 0, opacity: 0.8, scale: 0.5 },
              {
                y: -22,
                opacity: 0,
                scale: 1.4,
                stagger: 0.22,
                repeat: -1,
                duration: 0.8,
                ease: 'power1.out',
              }
            );
          }
        }

        // ==============================================================
        // 6. VETERINARY: Realistic Stethoscope
        // ==============================================================
        if (type === 'veterinary') {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              keyframes: [
                { scale: 1.18, y: -3, duration: 0.12, ease: 'power2.out' },
                { scale: 1.04, y: 0, duration: 0.1, ease: 'power2.in' },
                { scale: 1.14, y: -2, duration: 0.12, ease: 'power2.out' },
                { scale: 1.0, y: 0, duration: 0.42, ease: 'power2.in' },
              ],
              repeat: -1,
            });
          }
        }


      } else if (hasHoveredRef.current) {
        // Smooth return to resting state
        const targets = [imageRef.current, shadowRef.current].filter(Boolean);
        if (targets.length > 0) {
          gsap.killTweensOf(targets);
          gsap.to(imageRef.current, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            scaleY: 1,
            duration: 0.35,
            ease: 'power2.out',
          });
          if (shadowRef.current) {
            gsap.to(shadowRef.current, { scaleX: 1, opacity: 0.25, duration: 0.35 });
          }
        }



        if (tongueRef.current) {
          gsap.to(tongueRef.current, { scaleX: 0, opacity: 0, duration: 0.15 });
        }

        const bubbles = [bubble1Ref.current, bubble2Ref.current, bubble3Ref.current].filter(Boolean);
        if (bubbles.length > 0) {
          gsap.to(bubbles, { opacity: 0, y: 0, duration: 0.15 });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isHovered, type]);

  return (
    <div
      ref={containerRef}
      className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center select-none"
    >
      {/* Framed Icon Window fitting the image properly */}
      <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40 border border-amber-200/80 group-hover:border-[#D4AF37] shadow-xs group-hover:shadow-md flex items-center justify-center transition-all duration-300">
        <img
          ref={imageRef}
          src={pet.src}
          alt={pet.alt}
          className="w-full h-full object-cover pointer-events-none transition-all duration-300 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Rising Water Bubbles for Betta Fish */}
      {type === 'fish' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div
            ref={bubble1Ref}
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-cyan-200/80 border border-cyan-400 shadow-xs"
            style={{ opacity: 0 }}
          />
          <div
            ref={bubble2Ref}
            className="absolute top-0 right-4 w-2 h-2 rounded-full bg-blue-100/90 border border-blue-300 shadow-xs"
            style={{ opacity: 0 }}
          />
          <div
            ref={bubble3Ref}
            className="absolute top-3 right-5 w-1.5 h-1.5 rounded-full bg-white/80 border border-cyan-300 shadow-xs"
            style={{ opacity: 0 }}
          />
        </div>
      )}

    </div>
  );
};

export default AnimatedDepartmentIcon;
