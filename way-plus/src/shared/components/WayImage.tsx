import React, { useState } from 'react';
import { way } from '@/shared/lib/wayTheme';

interface WayImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  blurHash?: string; // opcional: string base64 tiny
}

export const WayImage = ({ src, alt, aspectRatio = '16/9', className, ...props }: WayImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={way('relative overflow-hidden rounded-2xl bg-slate-200/30', className)} style={{ aspectRatio }}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/10" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={way(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
};
