import React, { useState, Suspense, lazy } from 'react';
import { EquipmentType } from '../types';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

// Dynamic import for heavy EquipmentSketchVector fallback component
const EquipmentSketchVector = lazy(() =>
  import('./EquipmentSketchVector').then((m) => ({ default: m.EquipmentSketchVector }))
);

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  equipmentType?: EquipmentType;
  onError?: () => void;
  aspectRatio?: string;
}

/**
 * Optimized Image Component following Lighthouse Best Practices:
 * 1. Explicit width & height to prevent Cumulative Layout Shifts (CLS)
 * 2. loading="lazy" (or "eager" for priority LCP assets)
 * 3. decoding="async" for smooth non-blocking main-thread image parsing
 * 4. Automatic WebP query formatting & srcset generator with long-term browser cache parameters
 * 5. Reserved container aspect-ratio with shimmer skeleton fallback & dynamic import vector sketch
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden bg-[#0f172a]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  equipmentType,
  onError,
  aspectRatio,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Convert Unsplash or generic image URLs to WebP format with caching parameters & responsive srcset
  const getWebpUrl = (url: string, targetWidth: number) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?fm=webp&w=${targetWidth}&q=80&auto=format&fit=crop&cache=31536000`;
    }
    return url;
  };

  const webpSrc = getWebpUrl(src, width);
  const webpSrcSet = src.includes('images.unsplash.com')
    ? `${getWebpUrl(src, 300)} 300w, ${getWebpUrl(src, 600)} 600w, ${getWebpUrl(src, 1200)} 1200w`
    : undefined;

  const handleImageError = () => {
    setHasError(true);
    if (onError) onError();
  };

  const calculatedAspectRatio = aspectRatio || `${width}/${height}`;

  return (
    <div
      className={containerClassName}
      style={{ aspectRatio: calculatedAspectRatio }}
    >
      {/* Shimmer / Skeleton Loading State before image loads */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#1e293b] animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-6 h-6 text-slate-600 animate-spin" />
        </div>
      )}

      {/* Fallback to Equipment Vector Sketch on error or empty URL */}
      {hasError || !src ? (
        equipmentType ? (
          <Suspense fallback={<div className="w-full h-full bg-[#0f172a]" />}>
            <EquipmentSketchVector type={equipmentType} />
          </Suspense>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f172a] text-[#94a3b8] p-3 text-center">
            <AlertCircle className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Image Unavailable</span>
          </div>
        )
      ) : (
        <img
          src={webpSrc}
          srcSet={webpSrcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

