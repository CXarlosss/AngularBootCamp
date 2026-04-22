import { useState, useEffect } from 'react';
import { imageCache } from '@/core/services/imageCache';

export function useCachedImage(url: string | undefined): string | undefined {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setCachedUrl(undefined);
      return;
    }
    
    let objectUrl: string | undefined;
    let isMounted = true;

    imageCache.getImageUrl(url).then((resolvedUrl) => {
      if (isMounted) {
        objectUrl = resolvedUrl;
        setCachedUrl(resolvedUrl);
      }
    });

    return () => {
      isMounted = false;
      if (objectUrl && objectUrl !== url) {
        imageCache.revokeUrl(objectUrl);
      }
    };
  }, [url]);

  return cachedUrl;
}
