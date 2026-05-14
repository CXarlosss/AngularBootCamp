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
  const start = performance.now();
  console.log(`[Preload] 🚀 Iniciando precarga de ${urls.length} imágenes...`);
  
  return Promise.all(urls.map(url => 
    preloadImage(url).catch(err => {
      console.warn(`[Preload] ❌ Error cargando: ${url}`);
      throw err;
    })
  )).then(results => {
    const end = performance.now();
    console.log(`[Preload] ✅ Precarga completada en ${(end - start).toFixed(2)}ms`);
    return results;
  });
}
