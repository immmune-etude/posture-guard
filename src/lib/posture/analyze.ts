import type { Landmark, PostureMetrics } from '../../types'
import {
  calculateCVA,
  calculateForwardHeadOffset,
  calculateNeckAngle,
  calculateShoulderAsymmetry,
  calculateShoulderRoll,
  calculateSpineCurvature,
  calculateTorsoLean,
} from './angles'
import { getKeyLandmarks } from './landmarks'

export function analyzePosture(landmarks: Landmark[]): PostureMetrics | null {
  const key = getKeyLandmarks(landmarks)
  if (!key.visible || !key.neckRef || !key.headRef) return null

  const analysisMode = key.mode === 'full' ? ('full' as const) : ('upper' as const)

  return {
    cva: calculateCVA(key.neckRef, key.shoulderMid),
    neckAngle: calculateNeckAngle(key.neckRef, key.shoulderMid),
    forwardHeadOffset: calculateForwardHeadOffset(key.headRef, key.shoulderMid),
    spineCurvature:
      key.mode === 'full'
        ? calculateSpineCurvature(key.neckRef, key.shoulderMid, key.hipMid)
        : 170,
    shoulderRoll: calculateShoulderRoll(key.leftShoulder, key.rightShoulder),
    torsoLean:
      key.mode === 'full'
        ? calculateTorsoLean(key.shoulderMid, key.hipMid)
        : 0,
    shoulderAsymmetry: calculateShoulderAsymmetry(key.leftShoulder, key.rightShoulder),
    analysisMode,
  }
}
