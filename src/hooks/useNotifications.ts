let permissionRequested = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (permissionRequested) return Notification.permission === 'granted';

  permissionRequested = true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function sendNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  // Send via service worker if available, otherwise fallback to direct
  const registration = await navigator.serviceWorker?.ready;
  if (registration) {
    registration.showNotification(title, {
      body,
      icon: '/shrimp-mode/favicon.svg',
      badge: '/shrimp-mode/favicon.svg',
      tag: 'shrimp-reminder',
      requireInteraction: false,
      silent: false,
    });
  } else {
    new Notification(title, { body, icon: '/shrimp-mode/favicon.svg' });
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
