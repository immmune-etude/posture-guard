import { useEffect, useRef } from 'react'
import {
  calculateCVA,
  calculateShoulderAsymmetry,
  calculateTorsoLean,
} from '../lib/posture/angles'
import { getKeyLandmarks } from '../lib/posture/landmarks'
import { calculateFrameScore, scoreToPostureState } from '../lib/posture/scoring'
import { POSTURE_THRESHOLDS } from '../lib/posture/thresholds'
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

    const key = getKeyLandmarks(landmarks)
    if (!key.visible) {
      setMetrics(null, 0, 'unknown')
      return
    }

    const metrics = {
      cva: calculateCVA(key.headRef!, key.shoulderMid),
      torsoLean:
        key.mode === 'full'
          ? calculateTorsoLean(key.shoulderMid, key.hipMid)
          : 0,
      shoulderAsymmetry: calculateShoulderAsymmetry(key.leftShoulder, key.rightShoulder),
      analysisMode: key.mode === 'full' ? ('full' as const) : ('upper' as const),
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
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [enabled, lastAlertAt, setBadPostureDuration, triggerAlert])
}
