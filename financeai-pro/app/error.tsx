'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative rounded-full bg-red-500/10 border border-red-500/30 p-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-white">Bir Hata Oluştu</h1>
          <p className="text-gray-400">
            Sayfayı yüklerken beklenmeyen bir sorun yaşandı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-red-500/20">
              <p className="text-xs text-red-400 font-mono break-words">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={reset}
            className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <RotateCcw className="h-4 w-4" />
            Sayfayı Yenile
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="flex-1 border-cyan-500/20 text-gray-300 hover:bg-cyan-500/5"
          >
            Kontrol Paneline Git
          </Button>
        </div>
      </div>
    </div>
  )
}
