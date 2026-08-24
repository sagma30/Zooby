import React from 'react';
import zoobyLogoAsset from '../../assets/zooby-logo.jpg';

export interface ZoobyLogoProps {
  /** Size variant or specific pixel dimension for the logo image */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Whether to show the text 'Zooby' next to the logo */
  showText?: boolean;
  /** Optional subtitle or role text underneath or beside the brand */
  subtitle?: string;
  /** Optional role badge text */
  badgeText?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'stone';
  /** Text styling override */
  textClassName?: string;
  /** Container custom classes */
  className?: string;
  /** Image container custom classes */
  imageContainerClassName?: string;
  /** Image element custom classes */
  imageClassName?: string;
  /** Rounded corner style for the image container */
  rounded?: 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  /** Click handler */
  onClick?: () => void;
  /** Whether the logo is clickable / shows pointer */
  clickable?: boolean;
  /** Theme variant */
  variant?: 'light' | 'dark' | 'auto';
  /** Subtitle class */
  subtitleClassName?: string;
}

export const ZoobyLogo: React.FC<ZoobyLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  badgeText,
  badgeColor = 'amber',
  textClassName = '',
  className = '',
  imageContainerClassName = '',
  imageClassName = '',
  rounded = 'xl',
  onClick,
  clickable = !!onClick,
  variant = 'auto',
  subtitleClassName = ''
}) => {
  // Dimension mapping
  let dimensionPx = 40;
  let textScaleClass = 'text-xl';
  let containerRadiusClass = 'rounded-xl';

  if (typeof size === 'number') {
    dimensionPx = size;
    containerRadiusClass = dimensionPx >= 48 ? 'rounded-2xl' : 'rounded-xl';
  } else {
    switch (size) {
      case 'xs':
        dimensionPx = 28;
        textScaleClass = 'text-base';
        containerRadiusClass = 'rounded-lg';
        break;
      case 'sm':
        dimensionPx = 36;
        textScaleClass = 'text-lg';
        containerRadiusClass = 'rounded-xl';
        break;
      case 'md':
        dimensionPx = 44;
        textScaleClass = 'text-2xl';
        containerRadiusClass = 'rounded-xl';
        break;
      case 'lg':
        dimensionPx = 54;
        textScaleClass = 'text-2xl sm:text-3xl';
        containerRadiusClass = 'rounded-2xl';
        break;
      case 'xl':
        dimensionPx = 68;
        textScaleClass = 'text-3xl sm:text-4xl';
        containerRadiusClass = 'rounded-2xl';
        break;
    }
  }

  // Override rounded if explicitly specified
  if (rounded === 'lg') containerRadiusClass = 'rounded-lg';
  if (rounded === 'xl') containerRadiusClass = 'rounded-xl';
  if (rounded === '2xl') containerRadiusClass = 'rounded-2xl';
  if (rounded === '3xl') containerRadiusClass = 'rounded-3xl';
  if (rounded === 'full') containerRadiusClass = 'rounded-full';

  // Badge styling
  const badgeColors = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-[#ffdcbc] text-[#895100] border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    stone: 'bg-stone-200 text-stone-800 border-stone-300'
  };

  const isDark = variant === 'dark';

  const content = (
    <div
      className={`inline-flex items-center gap-3 transition-transform duration-200 ${
        clickable ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Official Custom Zooby Logo Container */}
      <div
        className={`relative overflow-hidden shrink-0 shadow-xs border border-[#895100]/20 bg-[#2d1c0c] flex items-center justify-center ${containerRadiusClass} ${imageContainerClassName}`}
        style={{ width: `${dimensionPx}px`, height: `${dimensionPx}px` }}
      >
        <img
          src={zoobyLogoAsset}
          alt="Zooby Official Brand Logo"
          className={`w-full h-full object-cover select-none transition-transform duration-300 ${imageClassName}`}
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-quicksand font-bold tracking-tight leading-tight select-none ${
                textClassName
                  ? textClassName
                  : isDark
                  ? 'text-white'
                  : 'text-[#895100]'
              } ${textScaleClass}`}
            >
              Zooby
            </span>

            {badgeText && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${badgeColors[badgeColor]}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <span
              className={`text-xs font-semibold leading-tight select-none ${
                subtitleClassName
                  ? subtitleClassName
                  : isDark
                  ? 'text-stone-300/80'
                  : 'text-[#877462]'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return content;
};
