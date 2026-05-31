import { Injectable, inject, signal, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken, Messaging } from 'firebase/messaging';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';

export type FcmPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private supabase = inject(SupabaseClient);
  private messaging: Messaging | null = null;
  private app: FirebaseApp | null = null;
  
  // Estado reactivo
  permission = signal<FcmPermissionState>('unknown');
  token = signal<string | null>(null);
  isSupported = signal<boolean>(true);
  
  // Computed: ¿debería mostrarse el banner?
  shouldShowBanner = computed(() => {
    const perm = this.permission();
    return perm === 'unknown' || perm === 'default';
  });
  
  async initialize(): Promise<void> {
    // 1. Verificar soporte de notificaciones
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      this.isSupported.set(false);
      this.permission.set('unsupported');
      return;
    }
    
    // 2. Verificar estado actual del permiso
    const currentPerm = Notification.permission;
    this.permission.set(currentPerm as FcmPermissionState);
    
    if (currentPerm === 'denied') {
      return; // Nada que hacer, usuario bloqueó permanentemente
    }
    
    // 3. Inicializar Firebase App
    this.app = initializeApp(environment.firebase);
    this.messaging = getMessaging(this.app);
    
    // 4. Si ya tiene permiso, registrar token silenciosamente
    if (currentPerm === 'granted') {
      await this.registerToken();
    }
    
    // 5. Escuchar mensajes en foreground
    this.listenToForegroundMessages();
  }
  
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported() || this.permission() === 'denied') {
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      this.permission.set(result as FcmPermissionState);
      
      if (result === 'granted') {
        await this.registerToken();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[FCM] Permission request failed:', err);
      return false;
    }
  }
  
  private async registerToken(): Promise<void> {
    if (!this.messaging) return;
    
    try {
      const currentToken = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      
      if (currentToken) {
        this.token.set(currentToken);
        await this.persistToken(currentToken);
      } else {
        console.warn('[FCM] No token available');
      }
    } catch (err) {
      console.error('[FCM] Token registration failed:', err);
    }
  }
  
  private async persistToken(token: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await this.supabase.rpc('upsert_fcm_token', {
      target_user_id: user.id,
      target_token: token,
      target_device: this.detectDeviceType()
    });
    
    if (error) {
      console.error('[FCM] Failed to persist token:', error);
    }
  }
  
  private listenToForegroundMessages(): void {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      console.log('[FCM] Foreground message:', payload);
      // Aquí integrarías tu sistema de toasts/notificaciones in-app
      // NO usar Notification API en foreground (es intrusivo)
      this.showInAppToast(payload);
    });
  }
  
  private showInAppToast(payload: any): void {
    // Integrar con tu sistema de notificaciones existente
    // O implementar un simple toast service
    console.log('[FCM] In-app toast:', payload.notification?.title, payload.notification?.body);
  }
  
  async unregister(): Promise<void> {
    if (!this.messaging || !this.token()) return;
    
    try {
      await deleteToken(this.messaging);
      this.token.set(null);
      // Opcional: llamar a RPC para desactivar token en backend
    } catch (err) {
      console.error('[FCM] Token deletion failed:', err);
    }
  }
  
  private detectDeviceType(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    return 'web';
  }
}
