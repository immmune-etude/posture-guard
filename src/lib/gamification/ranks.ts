import type { RankTier } from '../../types'

export interface RankTierConfig {
  name: RankTier
  minRR: number
  color: string
}

export const RANK_TIERS: RankTierConfig[] = [
  { name: 'Iron', minRR: 0, color: '#8B7355' },
  { name: 'Bronze', minRR: 100, color: '#CD7F32' },
  { name: 'Silver', minRR: 300, color: '#C0C0C0' },
  { name: 'Gold', minRR: 600, color: '#FFD700' },
  { name: 'Platinum', minRR: 1000, color: '#00CED1' },
  { name: 'Diamond', minRR: 1500, color: '#B9F2FF' },
  { name: 'Ascendant', minRR: 2200, color: '#50C878' },
  { name: 'Immortal', minRR: 3000, color: '#FF6B6B' },
  { name: 'Radiant', minRR: 4000, color: '#FF4500' },
]

export function getRankTier(rr: number): RankTierConfig {
  let current = RANK_TIERS[0]
  for (const tier of RANK_TIERS) {
    if (rr >= tier.minRR) current = tier
  }
  return current
}

export function getNextRankTier(rr: number): RankTierConfig | null {
  const current = getRankTier(rr)
  const index = RANK_TIERS.findIndex((tier) => tier.name === current.name)
  return index < RANK_TIERS.length - 1 ? RANK_TIERS[index + 1] : null
}

export function getRankProgress(rr: number): number {
  const current = getRankTier(rr)
  const next = getNextRankTier(rr)
  if (!next) return 100
  const span = next.minRR - current.minRR
  return Math.min(100, Math.round(((rr - current.minRR) / span) * 100))
}
