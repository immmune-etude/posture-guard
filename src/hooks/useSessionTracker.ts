import { useCallback, useEffect, useRef, useState } from 'react'
import { applyRR, calculateRRDelta } from '../lib/gamification/rr'
import { getRankTier } from '../lib/gamification/ranks'
import {
  loadLocalProfile,
  persistSession,
  saveLocalProfile,
  updateDailyStatsCache,
  loadLocalSessions,
} from '../lib/firebase/firestore'
import { calculateSessionScore } from '../lib/posture/scoring'
import type { PostureSession, UserProfile } from '../types'
import { usePostureStore } from '../stores/postureStore'

interface SessionStats {
  goodMs: number
  warningMs: number
  badMs: number
  alertCount: number
  scoreSum: number
  peakScore: number
  frameCount: number
}

export function useSessionTracker() {
  const { postureState, frameScore, lastAlertAt } = usePostureStore()
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [profile, setProfile] = useState<UserProfile>(() => loadLocalProfile())
  const [lastSession, setLastSession] = useState<PostureSession | null>(null)

  const sessionRef = useRef<{
    startTime: number
    stats: SessionStats
    lastTick: number
    lastAlertTracked: number | null
  } | null>(null)

  const tickSession = useCallback(() => {
    const session = sessionRef.current
    if (!session) return

    const now = Date.now()
    const delta = now - session.lastTick
    session.lastTick = now

    if (postureState === 'good') session.stats.goodMs += delta
    else if (postureState === 'warning') session.stats.warningMs += delta
    else if (postureState === 'bad') session.stats.badMs += delta

    if (frameScore > 0) {
      session.stats.scoreSum += frameScore
      session.stats.frameCount += 1
      session.stats.peakScore = Math.max(session.stats.peakScore, frameScore)
    }

    if (lastAlertAt && lastAlertAt !== session.lastAlertTracked) {
      session.stats.alertCount += 1
      session.lastAlertTracked = lastAlertAt
    }

    setElapsedMs(now - session.startTime)
  }, [frameScore, lastAlertAt, postureState])

  useEffect(() => {
    if (!isSessionActive) return
    const interval = window.setInterval(tickSession, 250)
    return () => window.clearInterval(interval)
  }, [isSessionActive, tickSession])

  const startSession = useCallback(() => {
    const now = Date.now()
    sessionRef.current = {
      startTime: now,
      lastTick: now,
      lastAlertTracked: null,
      stats: {
        goodMs: 0,
        warningMs: 0,
        badMs: 0,
        alertCount: 0,
        scoreSum: 0,
        peakScore: 0,
        frameCount: 0,
      },
    }
    setElapsedMs(0)
    setIsSessionActive(true)
  }, [])

  const endSession = useCallback(async () => {
    const session = sessionRef.current
    if (!session) return null

    tickSession()

    const { stats, startTime } = session
    const endTime = Date.now()
    const averageScore =
      stats.frameCount > 0 ? Math.round(stats.scoreSum / stats.frameCount) : 0

    const completed: PostureSession = {
      id: crypto.randomUUID(),
      userId: profile.uid,
      startTime,
      endTime,
      durationMs: endTime - startTime,
      goodPostureMs: stats.goodMs,
      warningPostureMs: stats.warningMs,
      badPostureMs: stats.badMs,
      alertCount: stats.alertCount,
      averageScore,
      peakScore: stats.peakScore,
      frameCount: stats.frameCount,
    }

    const rrDelta = calculateRRDelta(
      stats.goodMs,
      stats.warningMs,
      stats.alertCount,
      completed.durationMs >= 15 * 60_000,
      false,
    )

    const nextRR = applyRR(profile.rankRating, rrDelta)
    const nextTier = getRankTier(nextRR)

    const updatedProfile: UserProfile = {
      ...profile,
      rankRating: nextRR,
      rank: nextTier.name,
      totalGoodPostureMinutes:
        profile.totalGoodPostureMinutes + stats.goodMs / 60_000,
      totalSessions: profile.totalSessions + 1,
    }

    await persistSession(completed, updatedProfile)
    updateDailyStatsCache(loadLocalSessions())
    saveLocalProfile(updatedProfile)

    setProfile(updatedProfile)
    setLastSession(completed)
    sessionRef.current = null
    setIsSessionActive(false)
    setElapsedMs(0)

    return completed
  }, [profile, tickSession])

  const sessionScore = sessionRef.current
    ? calculateSessionScore(
        sessionRef.current.stats.goodMs,
        sessionRef.current.stats.warningMs,
        sessionRef.current.stats.badMs,
      )
    : 0

  return {
    profile,
    isSessionActive,
    elapsedMs,
    sessionScore,
    lastSession,
    startSession,
    endSession,
  }
}
