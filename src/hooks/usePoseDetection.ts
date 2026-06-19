import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import { useEffect, useRef } from 'react'
import type { Landmark } from '../types'
import { usePostureStore } from '../stores/postureStore'

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const intervalIdRef = useRef<number | null>(null)
  const lastVideoTimeRef = useRef(-1)
  const lastTimestampRef = useRef(0)
  const { setLandmarks, setPoseReady } = usePostureStore()

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const stopLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }

    const detectFrame = () => {
      const video = videoRef.current
      const detector = landmarkerRef.current
      if (!video || !detector || video.readyState < 2) return

      const timeAdvanced = video.currentTime !== lastVideoTimeRef.current
      const hidden = document.hidden

      // Background tabs freeze currentTime — still run detection on an interval
      if (!timeAdvanced && !hidden) return

      lastVideoTimeRef.current = video.currentTime

      const timestamp = Math.max(performance.now(), lastTimestampRef.current + 1)
      lastTimestampRef.current = timestamp

      const result = detector.detectForVideo(video, timestamp)

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

    const startLoop = () => {
      stopLoop()

      if (document.hidden) {
        intervalIdRef.current = window.setInterval(detectFrame, 200)
        return
      }

      const rafLoop = () => {
        detectFrame()
        rafIdRef.current = requestAnimationFrame(rafLoop)
      }
      rafIdRef.current = requestAnimationFrame(rafLoop)
    }

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
      startLoop()
    }

    const onVisibilityChange = () => startLoop()

    document.addEventListener('visibilitychange', onVisibilityChange)
    void start()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stopLoop()
      landmarkerRef.current?.close()
      landmarkerRef.current = null
      setPoseReady(false)
      setLandmarks([])
    }
  }, [enabled, setLandmarks, setPoseReady, videoRef])
}
