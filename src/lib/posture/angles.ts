import type { Landmark } from '../../types'

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let degrees = Math.abs((radians * 180) / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

export function calculateCVA(ear: Landmark, shoulder: Landmark): number {
  const horizontal: Landmark = { x: shoulder.x + 1, y: shoulder.y, z: shoulder.z }
  return calculateAngle(horizontal, shoulder, ear)
}

export function calculateTorsoLean(shoulder: Landmark, hip: Landmark): number {
  const vertical: Landmark = { x: hip.x, y: hip.y - 1, z: hip.z }
  return calculateAngle(vertical, hip, shoulder)
}

export function calculateShoulderAsymmetry(left: Landmark, right: Landmark): number {
  return Math.abs(left.y - right.y)
}
