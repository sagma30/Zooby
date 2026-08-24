import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PawPrint {
  id: number;
  x: number;
  y: number;
  angle: number;
  isLeftPaw: boolean;
  createdAt: number;
  scale: number;
}

interface PawCursorHeroTrailProps {
  /** The ref of the hero container to bound the cursor tracking */
  heroContainerRef: React.RefObject<HTMLElement | null>;
  /** Optional custom class name */
  className?: string;
}

export const PawCursorHeroTrail: React.FC<PawCursorHeroTrailProps> = ({
  heroContainerRef,
  className = ''
}) => {
  const [paws, setPaws] = useState<PawPrint[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLeftPawRef = useRef(false);
  const pawIdCounter = useRef(0);
  const maxPaws = 14;
  const distanceThreshold = 28; // Distance in pixels before spawning next paw

  // Check for desktop fine pointer and reduced-motion preference
  useEffect(() => {
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIsEnabled(hasFinePointer && !prefersReducedMotion);

    const handleMediaChange = () => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEnabled(fine && !reduced);
    };

    const mediaFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    mediaFine.addEventListener('change', handleMediaChange);
    mediaReduced.addEventListener('change', handleMediaChange);

    return () => {
      mediaFine.removeEventListener('change', handleMediaChange);
      mediaReduced.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Handle cursor movement inside the hero container
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isEnabled || !heroContainerRef.current) return;

      const heroRect = heroContainerRef.current.getBoundingClientRect();

      // Check if cursor is inside the hero container viewport
      if (
        e.clientX < heroRect.left ||
        e.clientX > heroRect.right ||
        e.clientY < heroRect.top ||
        e.clientY > heroRect.bottom
      ) {
        return;
      }

      // Position relative to hero container
      const relativeX = e.clientX - heroRect.left;
      const relativeY = e.clientY - heroRect.top;

      if (!lastPosRef.current) {
        lastPosRef.current = { x: relativeX, y: relativeY };
        return;
      }

      const dx = relativeX - lastPosRef.current.x;
      const dy = relativeY - lastPosRef.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= distanceThreshold) {
        // Calculate movement angle in degrees
        const movementAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Alternate left and right paws with a natural tilt angle
        const isLeft = !isLeftPawRef.current;
        isLeftPawRef.current = isLeft;

        // Add slight alternating tilt: -12 deg for left paw, +12 deg for right paw
        const tiltOffset = isLeft ? -10 : 10;
        const finalAngle = movementAngle + 90 + tiltOffset;

        // Place paw slightly trailing behind movement vector (6-10px behind)
        const lagDistance = 8;
        const normDx = dx / distance;
        const normDy = dy / distance;
        const spawnX = relativeX - normDx * lagDistance;
        const spawnY = relativeY - normDy * lagDistance;

        const newPaw: PawPrint = {
          id: ++pawIdCounter.current,
          x: spawnX,
          y: spawnY,
          angle: finalAngle,
          isLeftPaw: isLeft,
          createdAt: Date.now(),
          scale: 0.95 + Math.random() * 0.1
        };

        setPaws((prev) => {
          const updated = [...prev, newPaw];
          return updated.length > maxPaws ? updated.slice(updated.length - maxPaws) : updated;
        });

        lastPosRef.current = { x: relativeX, y: relativeY };
      }
    },
    [isEnabled, heroContainerRef]
  );

  // Bind mousemove listener
  useEffect(() => {
    if (!isEnabled) return;
    const heroEl = heroContainerRef.current;
    if (!heroEl) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEnabled, handleMouseMove, heroContainerRef]);

  // Clean up expired paws periodically (every 100ms)
  useEffect(() => {
    if (paws.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setPaws((prev) => prev.filter((paw) => now - paw.createdAt < 950));
    }, 100);

    return () => clearInterval(interval);
  }, [paws.length]);

  if (!isEnabled) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none z-20 ${className}`}
      aria-hidden="true"
    >
      {paws.map((paw) => {
        const ageMs = Date.now() - paw.createdAt;
        const lifeFraction = Math.min(1, ageMs / 950);

        return (
          <div
            key={paw.id}
            className="absolute transition-transform duration-75"
            style={{
              left: `${paw.x}px`,
              top: `${paw.y}px`,
              transform: `translate(-50%, -50%) rotate(${paw.angle}deg) scale(${
                paw.scale * (1 - lifeFraction * 0.2)
              })`,
              opacity: Math.max(0, 0.7 * (1 - Math.pow(lifeFraction, 1.4)))
            }}
          >
            {/* Elegant Pet Paw Print SVG */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              className="drop-shadow-2xs select-none"
              style={{ filter: 'drop-shadow(0 1px 1px rgba(137, 81, 0, 0.15))' }}
            >
              {/* Main Pad (Metacarpal pad) */}
              <path
                d="M12 11.5 C9.5 11.5 7.5 13.5 7.5 16.5 C7.5 19 9.2 21 12 21 C14.8 21 16.5 19 16.5 16.5 C16.5 13.5 14.5 11.5 12 11.5 Z"
                fill="#895100"
              />
              {/* Top Left Outer Toe */}
              <ellipse
                cx="5.8"
                cy="9.2"
                rx="2.1"
                ry="3"
                transform="rotate(-25 5.8 9.2)"
                fill="#895100"
              />
              {/* Top Middle-Left Toe */}
              <ellipse
                cx="9.8"
                cy="5.8"
                rx="2.1"
                ry="3.2"
                transform="rotate(-8 9.8 5.8)"
                fill="#895100"
              />
              {/* Top Middle-Right Toe */}
              <ellipse
                cx="14.2"
                cy="5.8"
                rx="2.1"
                ry="3.2"
                transform="rotate(8 14.2 5.8)"
                fill="#895100"
              />
              {/* Top Right Outer Toe */}
              <ellipse
                cx="18.2"
                cy="9.2"
                rx="2.1"
                ry="3"
                transform="rotate(25 18.2 9.2)"
                fill="#895100"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
