import type { Landmark } from '../../types'

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let degrees = Math.abs((radians * 180) / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

/** Craniovertebral angle — ear/neck relative to horizontal through shoulder */
export function calculateCVA(neck: Landmark, shoulder: Landmark): number {
  const horizontal: Landmark = { x: shoulder.x + 1, y: shoulder.y, z: shoulder.z }
  return calculateAngle(horizontal, shoulder, neck)
}

/** Neck flexion angle from vertical — text-neck indicator */
export function calculateNeckAngle(neck: Landmark, shoulder: Landmark): number {
  const vertical: Landmark = { x: shoulder.x, y: shoulder.y - 1, z: shoulder.z }
  return calculateAngle(vertical, shoulder, neck)
}

/** How far the head sits forward of the shoulder line */
export function calculateForwardHeadOffset(head: Landmark, shoulder: Landmark): number {
  return Math.max(0, Math.abs(head.x - shoulder.x))
}

/** Spine alignment — angle at shoulder between neck and hip (180° = straight) */
export function calculateSpineCurvature(
  neck: Landmark,
  shoulder: Landmark,
  hip: Landmark,
): number {
  return calculateAngle(neck, shoulder, hip)
}

export function calculateTorsoLean(shoulder: Landmark, hip: Landmark): number {
  const vertical: Landmark = { x: hip.x, y: hip.y - 1, z: hip.z }
  return calculateAngle(vertical, hip, shoulder)
}

export function calculateShoulderAsymmetry(left: Landmark, right: Landmark): number {
  return Math.abs(left.y - right.y)
}

/** Depth-based shoulder rounding proxy */
export function calculateShoulderRoll(left: Landmark, right: Landmark): number {
  return Math.abs((left.z ?? 0) - (right.z ?? 0))
}
