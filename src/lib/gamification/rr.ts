export function calculateRRDelta(
  goodMs: number,
  warningMs: number,
  alertCount: number,
  dailyBonus = false,
  streakBonus = false,
): number {
  const goodMinutes = goodMs / 60_000
  const warningMinutes = warningMs / 60_000

  let delta = Math.floor(goodMinutes * 5) + Math.floor(warningMinutes * 2)
  delta -= alertCount * 3
  if (dailyBonus) delta += 25
  if (streakBonus) delta += 50

  return delta
}

export function applyRR(current: number, delta: number): number {
  return Math.max(0, current + delta)
}
