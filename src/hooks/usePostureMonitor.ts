import { useEffect, useRef } from 'react'
import { analyzePosture } from '../lib/posture/analyze'
import { calculateFrameScore, scoreToPostureState } from '../lib/posture/scoring'
import { POSTURE_THRESHOLDS } from '../lib/posture/thresholds'
import { sendExtensionMessage } from '../lib/extension/messaging'
import { usePostureStore } from '../stores/postureStore'

export function usePostureMonitor(enabled: boolean) {
  const landmarks = usePostureStore((state) => state.landmarks)
  const lastAlertAt = usePostureStore((state) => state.lastAlertAt)
  const setMetrics = usePostureStore((state) => state.setMetrics)
  const setBadPostureDuration = usePostureStore((state) => state.setBadPostureDuration)
  const triggerAlert = usePostureStore((state) => state.triggerAlert)

  const postureStateRef = useRef(usePostureStore.getState().postureState)
  const badDurationRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    return usePostureStore.subscribe((state) => {
      postureStateRef.current = state.postureState
    })
  }, [])

  useEffect(() => {
    if (!enabled || landmarks.length === 0) {
      setMetrics(null, 0, 'unknown')
      badDurationRef.current = 0
      setBadPostureDuration(0)
      lastTickRef.current = null
      return
    }

    const metrics = analyzePosture(landmarks)
    if (!metrics) {
      setMetrics(null, 0, 'unknown')
      return
    }

    const frameScore = calculateFrameScore(metrics)
    const state = scoreToPostureState(frameScore)
    setMetrics(metrics, frameScore, state)
  }, [enabled, landmarks, setBadPostureDuration, setMetrics])

  useEffect(() => {
    if (!enabled) {
      badDurationRef.current = 0
      setBadPostureDuration(0)
      lastTickRef.current = null
      return
    }

    const interval = window.setInterval(() => {
      const now = Date.now()
      const previous = lastTickRef.current ?? now
      const delta = now - previous
      lastTickRef.current = now

      if (postureStateRef.current !== 'bad') {
        badDurationRef.current = 0
        setBadPostureDuration(0)
        return
      }

      badDurationRef.current += delta
      setBadPostureDuration(badDurationRef.current)

      const cooldownPassed =
        !lastAlertAt || now - lastAlertAt >= POSTURE_THRESHOLDS.alertCooldownMs

      if (
        badDurationRef.current >= POSTURE_THRESHOLDS.badPostureAlertMs &&
        cooldownPassed
      ) {
        badDurationRef.current = 0
        triggerAlert()
        sendExtensionMessage({
          type: 'POSTURE_ALERT',
          body: 'Sit up straight! Your neck and spine alignment need correction.',
        })
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [enabled, lastAlertAt, setBadPostureDuration, triggerAlert])
}
