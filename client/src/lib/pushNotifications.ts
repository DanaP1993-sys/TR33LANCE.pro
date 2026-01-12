async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch('/api/push/vapid-key');
    if (response.ok) {
      const data = await response.json();
      return data.publicKey || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function registerPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidKey = await getVapidPublicKey();
      if (vapidKey) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }
    }

    if (subscription) {
      await sendSubscriptionToServer(subscription);
    }

    return subscription;
  } catch (error) {
    console.error('Push registration failed:', error);
    return null;
  }
}

export async function registerDeviceToken(token: string, userId?: string): Promise<boolean> {
  try {
    const response = await fetch('/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        userId,
        platform: detectPlatform(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenWidth: screen.width,
          screenHeight: screen.height
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to register device token:', error);
    return false;
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const token = JSON.stringify(subscription);
  await registerDeviceToken(token);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function detectPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows/.test(ua)) return 'windows';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  return 'web';
}

export async function unregisterPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/unregister-token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: JSON.stringify(subscription) })
        });
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to unregister:', error);
    return false;
  }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
