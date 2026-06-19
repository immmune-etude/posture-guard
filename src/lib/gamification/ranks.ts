import type { RankTier, UserProfile } from '../../types'

export interface RankTierConfig {
  name: RankTier
  minRR: number
  color: string
  icon: string
  description: string
}

export const RANK_TIERS: RankTierConfig[] = [
  { name: 'Iron', minRR: 0, color: '#8B7355', icon: '⚙', description: 'Starting your posture journey' },
  { name: 'Bronze', minRR: 150, color: '#CD7F32', icon: '🥉', description: 'Building awareness' },
  { name: 'Silver', minRR: 400, color: '#C0C0C0', icon: '🥈', description: 'Consistent improvement' },
  { name: 'Gold', minRR: 800, color: '#FFD700', icon: '🥇', description: 'Strong daily habits' },
  { name: 'Platinum', minRR: 1400, color: '#00CED1', icon: '💎', description: 'Elite alignment' },
  { name: 'Diamond', minRR: 2200, color: '#B9F2FF', icon: '💠', description: 'Near-perfect form' },
  { name: 'Master', minRR: 3200, color: '#A855F7', icon: '⚔', description: 'Posture mastery' },
  { name: 'Champion', minRR: 4500, color: '#FF4500', icon: '👑', description: 'Legendary posture' },
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

export function getRankIndex(rank: RankTier): number {
  return RANK_TIERS.findIndex((tier) => tier.name === rank)
}

export function formatDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function updateProfileAfterSession(
  profile: UserProfile,
  nextRR: number,
  sessionDate: string,
): UserProfile {
  const nextTier = getRankTier(nextRR)
  const previousDate = profile.lastSessionDate
  let currentStreak = profile.currentStreak

  if (previousDate !== sessionDate) {
    const yesterday = new Date(sessionDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = formatDateKey(yesterday)

    if (previousDate === yesterdayKey) currentStreak += 1
    else currentStreak = 1
  }

  const rankChanged = nextTier.name !== profile.rank
  const history = [...profile.rankHistory]

  if (rankChanged || history.length === 0) {
    const last = history[history.length - 1]
    if (!last || last.rank !== nextTier.name || last.date !== sessionDate) {
      history.push({ date: sessionDate, rank: nextTier.name, rankRating: nextRR })
    }
  }

  return {
    ...profile,
    rankRating: nextRR,
    rank: nextTier.name,
    currentStreak,
    longestStreak: Math.max(profile.longestStreak, currentStreak),
    lastSessionDate: sessionDate,
    rankHistory: history.slice(-30),
  }
}
