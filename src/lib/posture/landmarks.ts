import type { Landmark } from '../../types'
import { POSTURE_THRESHOLDS } from './thresholds'

export const PoseLandmarkIndex = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const

export const SKELETON_CONNECTIONS: Array<[number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
]

export type AnalysisMode = 'full' | 'upper' | 'none'

export function midpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  }
}

export function isLandmarkVisible(
  landmark: Landmark | undefined,
  minVisibility = POSTURE_THRESHOLDS.minLandmarkVisibility,
): boolean {
  return Boolean(landmark && (landmark.visibility ?? 1) >= minVisibility)
}

function pickNeckReference(
  leftEar: Landmark | undefined,
  rightEar: Landmark | undefined,
  nose: Landmark | undefined,
): Landmark | null {
  const candidates: Landmark[] = []
  if (leftEar && isLandmarkVisible(leftEar)) candidates.push(leftEar)
  if (rightEar && isLandmarkVisible(rightEar)) candidates.push(rightEar)
  if (candidates.length === 0 && nose && isLandmarkVisible(nose)) candidates.push(nose)
  if (candidates.length === 0) return null

  return candidates.reduce((best, candidate) =>
    (candidate.visibility ?? 1) > (best.visibility ?? 1) ? candidate : best,
  )
}

function pickHeadReference(
  nose: Landmark | undefined,
  leftEar: Landmark | undefined,
  rightEar: Landmark | undefined,
): Landmark | null {
  const candidates: Landmark[] = []
  if (nose && isLandmarkVisible(nose)) candidates.push(nose)
  if (leftEar && isLandmarkVisible(leftEar)) candidates.push(leftEar)
  if (rightEar && isLandmarkVisible(rightEar)) candidates.push(rightEar)
  if (candidates.length === 0) return null

  return candidates.reduce((best, candidate) =>
    (candidate.visibility ?? 1) > (best.visibility ?? 1) ? candidate : best,
  )
}

export function getKeyLandmarks(landmarks: Landmark[]) {
  const leftShoulder = landmarks[PoseLandmarkIndex.LEFT_SHOULDER]
  const rightShoulder = landmarks[PoseLandmarkIndex.RIGHT_SHOULDER]
  const leftEar = landmarks[PoseLandmarkIndex.LEFT_EAR]
  const rightEar = landmarks[PoseLandmarkIndex.RIGHT_EAR]
  const leftHip = landmarks[PoseLandmarkIndex.LEFT_HIP]
  const rightHip = landmarks[PoseLandmarkIndex.RIGHT_HIP]
  const nose = landmarks[PoseLandmarkIndex.NOSE]

  const shoulderMid = midpoint(leftShoulder, rightShoulder)
  const hipMid = midpoint(leftHip, rightHip)
  const neckRef = pickNeckReference(leftEar, rightEar, nose)
  const headRef = pickHeadReference(nose, leftEar, rightEar)

  const shouldersVisible =
    isLandmarkVisible(leftShoulder) && isLandmarkVisible(rightShoulder)
  const hipsVisible = isLandmarkVisible(leftHip) && isLandmarkVisible(rightHip)

  let mode: AnalysisMode = 'none'
  if (shouldersVisible && neckRef && headRef) {
    mode = hipsVisible ? 'full' : 'upper'
  }

  return {
    nose,
    neckRef,
    headRef,
    shoulderMid,
    hipMid,
    leftShoulder,
    rightShoulder,
    mode,
    visible: mode !== 'none',
  }
}
