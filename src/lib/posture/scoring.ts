import type { PostureMetrics, PostureState } from '../../types'
import { POSTURE_THRESHOLDS as T } from './thresholds'

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Map a value into 0–100 where higher input = higher score */
function scoreHigherIsBetter(value: number, ideal: number, warn: number, bad: number): number {
  if (value >= ideal) return 100
  if (value <= bad) return 15
  if (value <= warn) return 15 + ((value - bad) / (warn - bad)) * 35
  return 50 + ((value - warn) / (ideal - warn)) * 50
}

/** Map a value into 0–100 where lower input = higher score */
function scoreLowerIsBetter(value: number, ideal: number, warn: number, bad: number): number {
  if (value <= ideal) return 100
  if (value >= bad) return 15
  if (value >= warn) return 15 + ((bad - value) / (bad - warn)) * 35
  return 50 + ((warn - value) / (warn - ideal)) * 50
}

export function calculateFrameScore(metrics: PostureMetrics): number {
  const cvaScore = scoreHigherIsBetter(metrics.cva, T.cvaIdeal, T.cvaWarning, T.cvaBad)
  const neckScore = scoreLowerIsBetter(
    metrics.neckAngle,
    T.neckIdeal,
    T.neckWarning,
    T.neckBad,
  )
  const forwardHeadScore = scoreLowerIsBetter(
    metrics.forwardHeadOffset,
    T.forwardHeadIdeal,
    T.forwardHeadWarning,
    T.forwardHeadBad,
  )
  const shoulderScore = scoreLowerIsBetter(
    metrics.shoulderAsymmetry,
    T.shoulderAsymmetryIdeal,
    T.shoulderAsymmetryWarning,
    T.shoulderAsymmetryBad,
  )
  const rollScore = scoreLowerIsBetter(metrics.shoulderRoll, 0.02, 0.05, 0.1)

  const spineScore =
    metrics.analysisMode === 'full'
      ? scoreHigherIsBetter(
          metrics.spineCurvature,
          T.spineIdeal,
          T.spineWarning,
          T.spineBad,
        )
      : Math.round((neckScore + cvaScore) / 2)

  const torsoScore =
    metrics.analysisMode === 'full'
      ? scoreLowerIsBetter(
          metrics.torsoLean,
          T.torsoLeanIdeal,
          T.torsoLeanWarning,
          T.torsoLeanBad,
        )
      : 80

  const weighted =
    cvaScore * 0.18 +
    neckScore * 0.26 +
    forwardHeadScore * 0.24 +
    shoulderScore * 0.08 +
    rollScore * 0.06 +
    spineScore * 0.1 +
    torsoScore * 0.08

  return clamp(weighted)
}

export function scoreToPostureState(score: number): PostureState {
  if (score >= T.frameScoreGood) return 'good'
  if (score >= T.frameScoreWarning) return 'warning'
  return 'bad'
}

export function calculateSessionScore(goodMs: number, warningMs: number, badMs: number): number {
  const activeMs = goodMs + warningMs + badMs
  if (activeMs === 0) return 0
  const weighted = goodMs + warningMs * 0.4
  return Math.round((weighted / activeMs) * 100)
}
