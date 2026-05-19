// Mobile-specific analytics and monitoring

export function trackPWAEvent(event: string, properties?: any) {
  console.log(`[PWA Analytics] ${event}`, properties)
  
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', { name: event, data: properties })
  }
}

export function initMobileAnalytics() {
  if (typeof window === 'undefined') return

  // Track App Installs
  window.addEventListener('appinstalled', () => {
    trackPWAEvent('app_installed', {
      platform: getMobilePlatform(),
      timestamp: new Date().toISOString()
    })
  })

  // Track Online/Offline
  window.addEventListener('online', () => trackPWAEvent('network_status', { status: 'online' }))
  window.addEventListener('offline', () => trackPWAEvent('network_status', { status: 'offline' }))

  // Track Standalone Mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    trackPWAEvent('app_open', { mode: 'standalone' })
  } else {
    trackPWAEvent('app_open', { mode: 'browser' })
  }
}

function getMobilePlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  if (/android/i.test(userAgent)) return 'android'
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'ios'
  return 'unknown'
}
