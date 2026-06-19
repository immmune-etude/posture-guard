import { useEffect, useRef } from 'react'
import { drawSkeleton } from '../lib/camera/drawSkeleton'
import { usePostureStore } from '../stores/postureStore'
import { useSettingsStore } from '../stores/settingsStore'

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isActive: boolean
}

function getPostureColor(postureState: string) {
  if (postureState === 'bad') return '#ff4444'
  if (postureState === 'warning') return '#fbbf24'
  return '#00ff88'
}

export function CameraPreview({ videoRef, isActive }: CameraPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const landmarks = usePostureStore((state) => state.landmarks)
  const postureState = usePostureStore((state) => state.postureState)
  const skeletonColor = useSettingsStore((state) => state.skeletonColor)
  const dynamicSkeletonColor = useSettingsStore((state) => state.dynamicSkeletonColor)

  useEffect(() => {
    if (!isActive) return

    let rafId: number | null = null
    let intervalId: number | null = null

    const stopLoop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (intervalId !== null) clearInterval(intervalId)
      rafId = null
      intervalId = null
    }

    const drawFrame = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      const width = video.videoWidth || 640
      const height = video.videoHeight || 480

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      if (video.readyState >= 2 && video.videoWidth > 0) {
        ctx.save()
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, width, height)
        ctx.restore()
      }

      const color = dynamicSkeletonColor
        ? getPostureColor(postureState)
        : skeletonColor

      ctx.save()
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
      drawSkeleton(ctx, landmarks, width, height, color)
      ctx.restore()
    }

    const startLoop = () => {
      stopLoop()

      if (document.hidden) {
        intervalId = window.setInterval(drawFrame, 200)
        return
      }

      const loop = () => {
        drawFrame()
        rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
    }

    startLoop()
    document.addEventListener('visibilitychange', startLoop)

    return () => {
      document.removeEventListener('visibilitychange', startLoop)
      stopLoop()
    }
  }, [
    dynamicSkeletonColor,
    isActive,
    landmarks,
    postureState,
    skeletonColor,
    videoRef,
  ])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black">
      <canvas ref={canvasRef} className="h-full w-full object-cover" />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80 text-sm text-muted">
          Camera inactive
        </div>
      )}
    </div>
  )
}
