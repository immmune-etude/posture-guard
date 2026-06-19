import { getNextRankTier, getRankProgress, getRankTier } from '../../lib/gamification/ranks'
import type { UserProfile } from '../../types'
import { RankBadge } from '../RankBadge'

interface ProgressViewProps {
  profile: UserProfile
}

export function ProgressView({ profile }: ProgressViewProps) {
  const currentTier = getRankTier(profile.rankRating)
  const nextTier = getNextRankTier(profile.rankRating)
  const progress = getRankProgress(profile.rankRating)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Current Rank</p>
        <div className="mt-6 flex justify-center">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full border-4 text-2xl font-bold"
            style={{ borderColor: currentTier.color, color: currentTier.color }}
          >
            {currentTier.name}
          </div>
        </div>
        <p className="mt-6 font-mono text-3xl text-neon">{profile.rankRating} RR</p>
        <div className="mx-auto mt-6 max-w-md">
          <div className="h-3 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: currentTier.color }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            {nextTier
              ? `${progress}% progress to ${nextTier.name}`
              : 'Maximum rank achieved'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold">Career Stats</h3>
        <div className="mt-4 space-y-4">
          <StatRow label="Total Sessions" value={profile.totalSessions.toString()} />
          <StatRow
            label="Good Posture Hours"
            value={(profile.totalGoodPostureMinutes / 60).toFixed(1)}
          />
          <StatRow label="Current Streak" value={`${profile.currentStreak} days`} />
          <StatRow label="Longest Streak" value={`${profile.longestStreak} days`} />
          <StatRow label="Rank Badge" value={<RankBadge rank={profile.rank} />} />
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
