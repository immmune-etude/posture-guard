import { useEffect } from 'react'

export function useCameraKeepAlive(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  reattachStream: () => Promise<void>,
  refreshKey?: string | number,
) {
  useEffect(() => {
    if (!enabled) return

    const resume = async () => {
      await reattachStream()
    }

    const onVisibilityChange = () => {
      if (!document.hidden) void resume()
    }

    const onPause = () => {
      if (enabled) void resume()
    }

    const onStalled = () => {
      void resume()
    }

    const video = videoRef.current
    video?.addEventListener('pause', onPause)
    video?.addEventListener('stalled', onStalled)
    video?.addEventListener('emptied', onStalled)
    document.addEventListener('visibilitychange', onVisibilityChange)

    let wakeLock: WakeLockSentinel | null = null

    const acquireWakeLock = async () => {
      if (!('wakeLock' in navigator) || document.hidden) return
      try {
        await wakeLock?.release().catch(() => undefined)
        wakeLock = await navigator.wakeLock.request('screen')
      } catch {
        // optional
      }
    }

    void acquireWakeLock()
    void resume()

    const keepAliveInterval = window.setInterval(() => {
      const el = videoRef.current
      if (!el) return

      if (el.paused || el.videoWidth === 0) {
        void resume()
      }
    }, 2000)

    const wakeLockInterval = window.setInterval(() => {
      if (!document.hidden) void acquireWakeLock()
    }, 30_000)

    return () => {
      video?.removeEventListener('pause', onPause)
      video?.removeEventListener('stalled', onStalled)
      video?.removeEventListener('emptied', onStalled)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(keepAliveInterval)
      window.clearInterval(wakeLockInterval)
      wakeLock?.release().catch(() => undefined)
    }
  }, [enabled, reattachStream, refreshKey, videoRef])

  useEffect(() => {
    if (enabled && refreshKey !== undefined) {
      void reattachStream()
    }
  }, [enabled, refreshKey, reattachStream])
}
