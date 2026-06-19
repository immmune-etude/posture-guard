import type { Landmark } from '../../types'
import { SKELETON_CONNECTIONS } from '../posture/landmarks'

const JOINT_INDICES = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
  color: string,
) {
  if (landmarks.length === 0) return

  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.shadowBlur = 10
  ctx.shadowColor = color
  ctx.strokeStyle = color
  ctx.fillStyle = color

  for (const [start, end] of SKELETON_CONNECTIONS) {
    const a = landmarks[start]
    const b = landmarks[end]
    if (!a || !b) continue
    if ((a.visibility ?? 1) < 0.35 || (b.visibility ?? 1) < 0.35) continue

    ctx.beginPath()
    ctx.moveTo(a.x * width, a.y * height)
    ctx.lineTo(b.x * width, b.y * height)
    ctx.stroke()
  }

  for (const index of JOINT_INDICES) {
    const point = landmarks[index]
    if (!point || (point.visibility ?? 1) < 0.35) continue
    ctx.beginPath()
    ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const nose = landmarks[0]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]

  if (nose && leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderMidX = ((leftShoulder.x + rightShoulder.x) / 2) * width
    const shoulderMidY = ((leftShoulder.y + rightShoulder.y) / 2) * height
    const hipMidX = ((leftHip.x + rightHip.x) / 2) * width
    const hipMidY = ((leftHip.y + rightHip.y) / 2) * height

    ctx.beginPath()
    ctx.moveTo(nose.x * width, nose.y * height)
    ctx.lineTo(shoulderMidX, shoulderMidY)
    ctx.lineTo(hipMidX, hipMidY)
    ctx.stroke()
  }
}
