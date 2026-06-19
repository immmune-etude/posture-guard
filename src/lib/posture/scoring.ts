import type { PostureMetrics, PostureState } from '../../types'
import { POSTURE_THRESHOLDS } from './thresholds'

export function calculateFrameScore(metrics: PostureMetrics): number {
  let score = 100

  if (metrics.cva < POSTURE_THRESHOLDS.cvaBad) score -= 40
  else if (metrics.cva < POSTURE_THRESHOLDS.cvaWarning) score -= 20

  if (metrics.analysisMode === 'full') {
    if (metrics.torsoLean > POSTURE_THRESHOLDS.torsoLeanBad) score -= 30
    else if (metrics.torsoLean > POSTURE_THRESHOLDS.torsoLeanWarning) score -= 15
  }

  if (metrics.shoulderAsymmetry > POSTURE_THRESHOLDS.shoulderAsymmetry) score -= 10

  return Math.max(0, score)
}

export function scoreToPostureState(score: number): PostureState {
  if (score >= POSTURE_THRESHOLDS.frameScoreGood) return 'good'
  if (score >= POSTURE_THRESHOLDS.frameScoreWarning) return 'warning'
  return 'bad'
}

export function calculateSessionScore(goodMs: number, warningMs: number, badMs: number): number {
  const activeMs = goodMs + warningMs + badMs
  if (activeMs === 0) return 0
  const weighted = goodMs + warningMs * 0.5
  return Math.round((weighted / activeMs) * 100)
}
