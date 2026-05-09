/**
 * Preloads an image to the browser cache.
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => reject();
  });
}

/**
 * Preloads multiple images.
 */
export async function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(url => preloadImage(url)));
}
