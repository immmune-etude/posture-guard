import { useEffect, useRef } from 'react'
import { SKELETON_CONNECTIONS } from '../lib/posture/landmarks'
import { usePostureStore } from '../stores/postureStore'
import { useSettingsStore } from '../stores/settingsStore'

interface SkeletonOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
}

const JOINT_INDICES = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

function getPostureColor(postureState: string) {
  if (postureState === 'bad') return '#ff4444'
  if (postureState === 'warning') return '#fbbf24'
  return '#00ff88'
}

export function SkeletonOverlay({ videoRef }: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const landmarks = usePostureStore((state) => state.landmarks)
  const postureState = usePostureStore((state) => state.postureState)
  const skeletonColor = useSettingsStore((state) => state.skeletonColor)
  const dynamicSkeletonColor = useSettingsStore((state) => state.dynamicSkeletonColor)

  useEffect(() => {
    let frameId = 0

    const draw = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) {
        frameId = requestAnimationFrame(draw)
        return
      }

      const width = video.videoWidth || 640
      const height = video.videoHeight || 480

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        frameId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)

      if (landmarks.length > 0) {
        const color = dynamicSkeletonColor
          ? getPostureColor(postureState)
          : skeletonColor

        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.strokeStyle = color
        ctx.fillStyle = color

        for (const [start, end] of SKELETON_CONNECTIONS) {
          const a = landmarks[start]
          const b = landmarks[end]
          if (!a || !b) continue
          if ((a.visibility ?? 1) < 0.35 || (b.visibility ?? 1) < 0.35) continue

          ctx.beginPath()
          ctx.moveTo(a.x * width, a.y * height)
          ctx.lineTo(b.x * width, b.y * height)
          ctx.stroke()
        }

        for (const index of JOINT_INDICES) {
          const point = landmarks[index]
          if (!point || (point.visibility ?? 1) < 0.35) continue
          ctx.beginPath()
          ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2)
          ctx.fill()
        }

        const nose = landmarks[0]
        const leftShoulder = landmarks[11]
        const rightShoulder = landmarks[12]
        const leftHip = landmarks[23]
        const rightHip = landmarks[24]

        if (nose && leftShoulder && rightShoulder && leftHip && rightHip) {
          const shoulderMidX = ((leftShoulder.x + rightShoulder.x) / 2) * width
          const shoulderMidY = ((leftShoulder.y + rightShoulder.y) / 2) * height
          const hipMidX = ((leftHip.x + rightHip.x) / 2) * width
          const hipMidY = ((leftHip.y + rightHip.y) / 2) * height

          ctx.beginPath()
          ctx.moveTo(nose.x * width, nose.y * height)
          ctx.lineTo(shoulderMidX, shoulderMidY)
          ctx.lineTo(hipMidX, hipMidY)
          ctx.stroke()
        }
      }

      frameId = requestAnimationFrame(draw)
    }

    frameId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameId)
  }, [dynamicSkeletonColor, landmarks, postureState, skeletonColor, videoRef])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]"
    />
  )
}
