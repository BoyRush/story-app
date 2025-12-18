import { subscribeNotification, unsubscribeNotification } from '../data/story-api';
import { getAuthToken } from '../data/auth-store';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getCurrentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function enablePush() {
  const token = getAuthToken();
  if (!token) throw new Error('Silakan login terlebih dahulu.');

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await subscribeNotification({ subscription, token });
  return subscription;
}

export async function disablePush() {
  const token = getAuthToken();
  if (!token) throw new Error('Silakan login terlebih dahulu.');

  const subscription = await getCurrentSubscription();
  if (!subscription) return;

  await unsubscribeNotification({ endpoint: subscription.endpoint, token });
  await subscription.unsubscribe();
}
