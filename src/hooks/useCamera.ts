import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  isActive: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsActive(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setIsActive(true)
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Enable camera access in your browser settings.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : 'Unable to access the camera.'
      setError(message)
      setIsActive(false)
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  return {
    videoRef,
    stream: streamRef.current,
    isActive,
    error,
    start,
    stop,
  }
}
