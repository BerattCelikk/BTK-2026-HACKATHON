// Client-side push notification utilities

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    })
    
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

export async function registerPushOnServer(subscription: any) {
  try {
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    })
    return res.ok
  } catch (error) {
    console.error('Failed to register push on server:', error)
    return false
  }
}

export function showLocalNotification(title: string, body: string, data?: any) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: data || {}
      })
    })
  }
}
