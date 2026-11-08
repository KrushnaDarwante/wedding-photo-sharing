import React, { useState, useEffect } from 'react';
import { generateIndianRoyalSvgFallback } from '../../utils/indianWeddingAssets';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  ritualCategory?: string;
  coupleNames?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  aspectRatioClass = 'aspect-[4/3]',
  ritualCategory = 'Wedding',
  coupleNames = 'Aarav & Maya',
  loading = 'lazy',
  onClick
}) => {
  // Normalize legacy `/src/assets/images/` paths to `/images/`
  const normalizeUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('/src/assets/images/')) {
      return rawUrl.replace('/src/assets/images/', '/images/');
    }
    return rawUrl;
  };

  const initialUrl = normalizeUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const nextUrl = normalizeUrl(src);
    setCurrentSrc(nextUrl);
    setIsLoading(true);
    setHasError(false);

    // Do not leave the gallery cover stuck on a spinner if a remote image
    // takes too long to respond. Show the branded fallback after 12 seconds.
    const timeoutId = window.setTimeout(() => {
      setIsLoading((stillLoading) => {
        if (stillLoading) {
          setHasError(true);
          setCurrentSrc(generateIndianRoyalSvgFallback(ritualCategory, alt, coupleNames));
          return false;
        }
        return stillLoading;
      });
    }, 12000);

    return () => window.clearTimeout(timeoutId);
  }, [src, ritualCategory, alt, coupleNames]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Seamlessly switch to royal Indian cultural SVG fallback
      setCurrentSrc(generateIndianRoyalSvgFallback(ritualCategory, alt, coupleNames));
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      onClick={onClick}
      className={`relative w-full ${aspectRatioClass} overflow-hidden bg-[#FBF6EC] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Shimmer skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#F5EFE6] via-[#EBDDC8] to-[#F5EFE6] animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#800020] animate-spin" />
        </div>
      )}

      {/* Target Image with strict cover and aspect consistency */}
      <img
        src={currentSrc || generateIndianRoyalSvgFallback(ritualCategory, alt, coupleNames)}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
        } ${className}`}
      />
    </div>
  );
};
