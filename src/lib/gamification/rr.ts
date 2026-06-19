export function calculateRRDelta(
  goodMs: number,
  warningMs: number,
  badMs: number,
  alertCount: number,
  dailyBonus = false,
  streakBonus = false,
): number {
  const goodMinutes = goodMs / 60_000
  const warningMinutes = warningMs / 60_000
  const badMinutes = badMs / 60_000

  let delta = Math.floor(goodMinutes * 8) + Math.floor(warningMinutes * 3)
  delta -= Math.floor(badMinutes * 2)
  delta -= alertCount * 5
  if (dailyBonus) delta += 40
  if (streakBonus) delta += 75

  return delta
}

export function applyRR(current: number, delta: number): number {
  return Math.max(0, current + delta)
}
