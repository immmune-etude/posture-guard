import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useEffect, useRef } from 'react'
import type { Landmark } from '../types'
import { usePostureStore } from '../stores/postureStore'

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const lastVideoTimeRef = useRef(-1)
  const { setLandmarks, setPoseReady } = usePostureStore()

  useEffect(() => {
    if (!enabled || !videoRef.current) return

    let cancelled = false

    const start = async () => {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/mediapipe/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      if (cancelled) {
        landmarker.close()
        return
      }

      landmarkerRef.current = landmarker
      setPoseReady(true)

      const detect = () => {
        const video = videoRef.current
        const detector = landmarkerRef.current

        if (!video || !detector || video.readyState < 2) {
          frameIdRef.current = requestAnimationFrame(detect)
          return
        }

        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime
          const result = detector.detectForVideo(video, performance.now())

          if (result.landmarks[0]) {
            const landmarks: Landmark[] = result.landmarks[0].map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
              visibility: point.visibility,
            }))
            setLandmarks(landmarks)
          }
        }

        frameIdRef.current = requestAnimationFrame(detect)
      }

      frameIdRef.current = requestAnimationFrame(detect)
    }

    void start()

    return () => {
      cancelled = true
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
      landmarkerRef.current?.close()
      landmarkerRef.current = null
      setPoseReady(false)
      setLandmarks([])
    }
  }, [enabled, setLandmarks, setPoseReady, videoRef])
}
