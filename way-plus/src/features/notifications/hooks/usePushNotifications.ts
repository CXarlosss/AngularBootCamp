import { useState, useEffect } from 'react';
import { supabase } from '@/core/services/supabaseClient';

const VAPID_PUBLIC_KEY = 'BKqtpVO0-WKMpbMWmrNmoZ62z1I4-7u9mVMaRA7YBMxSsv2qiwvWJHY26lrv8qAUEVQlz3Gf2cLCJwIJ9afOH4w';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) return false;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.error('Permiso de notificaciones denegado');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubscription(sub);

      if (!supabase) {
        console.error('Supabase client is not available');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .upsert({ 
            user_id: user.id, 
            subscription: JSON.parse(JSON.stringify(sub)) 
          }, { onConflict: 'user_id' });
      }

      return true;
    } catch (error) {
      console.error('Error al suscribirse a push:', error);
      return false;
    }
  };

  return { isSupported, permission, subscription, subscribe };
}
