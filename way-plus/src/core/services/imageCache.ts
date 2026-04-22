import { offlineStorage } from './offlineStorage';

export const imageCache = {
  async getImageUrl(url: string): Promise<string> {
    if (!url) return '';
    
    // Si es una URL de datos o ya está cacheada como blob, devolver directo
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;

    // 1. Intentar leer de IndexedDB
    const cachedBlob = await offlineStorage.getImage(url);
    if (cachedBlob) {
      return URL.createObjectURL(cachedBlob);
    }

    // 2. Si estamos online, descargar y cachear
    if (navigator.onLine) {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          await offlineStorage.saveImage(url, blob);
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.warn('No se pudo cachear imagen:', url);
      }
    }

    // 3. Fallback: devolver URL original (fallará graceful si no hay red)
    return url;
  },

  async prefetchImages(urls: string[]): Promise<void> {
    if (!navigator.onLine) return;
    
    const uncachedUrls = [];
    for (const url of urls) {
      const hasIt = await offlineStorage.hasImage(url);
      if (!hasIt) uncachedUrls.push(url);
    }

    // Descargar en lotes de 5 para no saturar
    const batchSize = 5;
    for (let i = 0; i < uncachedUrls.length; i += batchSize) {
      const batch = uncachedUrls.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (url) => {
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
              const blob = await res.blob();
              await offlineStorage.saveImage(url, blob);
            }
          } catch (e) {
            console.warn('Prefetch fallido:', url);
          }
        })
      );
    }
  },

  // Liberar objectURLs para evitar memory leaks
  revokeUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};
