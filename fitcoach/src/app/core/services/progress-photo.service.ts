import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class ProgressPhotoService {
  private sb = supabase;
  
  // Cache en memoria de URLs firmadas (evita re-firmar cada vez)
  private urlCache = new Map<string, { url: string; expiresAt: number }>();
  
  async getSignedUrl(storagePath: string, ttlSeconds = 3600): Promise<string> {
    const cached = this.urlCache.get(storagePath);
    if (cached && cached.expiresAt > Date.now() + 60000) { // Reutilizar si expira en >1 min
      return cached.url;
    }
    
    const { data, error } = await this.sb
      .storage
      .from('progress-photos')
      .createSignedUrl(storagePath, ttlSeconds);
      
    if (error) {
      console.error('[ProgressPhotoService] Error signing URL:', error);
      throw error;
    }
    
    const url = data.signedUrl;
    this.urlCache.set(storagePath, { url, expiresAt: Date.now() + (ttlSeconds * 1000) });
    return url;
  }
  
  // Batch de URLs para comparación
  async getComparisonUrls(paths: { before: string; after: string }) {
    const [before, after] = await Promise.all([
      this.getSignedUrl(paths.before),
      this.getSignedUrl(paths.after)
    ]);
    return { before, after };
  }
}
