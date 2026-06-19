import { getNextRankTier, getRankProgress, getRankTier, RANK_TIERS } from '../../lib/gamification/ranks'
import type { UserProfile } from '../../types'
import { RankBadge } from '../RankBadge'

interface ProgressViewProps {
  profile: UserProfile
}

export function ProgressView({ profile }: ProgressViewProps) {
  const currentTier = getRankTier(profile.rankRating)
  const nextTier = getNextRankTier(profile.rankRating)
  const progress = getRankProgress(profile.rankRating)
  const currentIndex = RANK_TIERS.findIndex((tier) => tier.name === currentTier.name)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Current Rank</p>
          <div className="mt-4 flex justify-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-4 text-3xl"
              style={{ borderColor: currentTier.color, color: currentTier.color }}
            >
              {currentTier.icon}
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold" style={{ color: currentTier.color }}>
            {currentTier.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{currentTier.description}</p>
          <p className="mt-4 font-mono text-3xl text-neon">{profile.rankRating} RR</p>
          <div className="mx-auto mt-4 max-w-md">
            <div className="h-3 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: currentTier.color }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {nextTier
                ? `${progress}% to ${nextTier.name} (${nextTier.minRR} RR)`
                : 'Maximum rank achieved — Champion!'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Rank Ladder</h3>
          {RANK_TIERS.map((tier, index) => {
            const unlocked = profile.rankRating >= tier.minRR
            const isCurrent = tier.name === currentTier.name
            return (
              <div
                key={tier.name}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  isCurrent
                    ? 'border-neon/40 bg-neon/10'
                    : unlocked
                      ? 'border-border bg-bg/40 opacity-100'
                      : 'border-border/50 bg-bg/20 opacity-50'
                }`}
              >
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: tier.color }}>
                      {tier.name}
                    </span>
                    <span className="font-mono text-xs text-muted">{tier.minRR} RR</span>
                  </div>
                  {isCurrent && (
                    <p className="text-xs text-neon">You are here</p>
                  )}
                  {index === currentIndex + 1 && nextTier && (
                    <p className="text-xs text-muted">
                      {nextTier.minRR - profile.rankRating} RR to unlock
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
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
            <StatRow
              label="Last Session"
              value={profile.lastSessionDate ?? 'Never'}
            />
            <StatRow label="Rank Badge" value={<RankBadge rank={profile.rank} />} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold">Rank History</h3>
          {profile.rankHistory.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Complete sessions to build your rank timeline.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {[...profile.rankHistory].reverse().slice(0, 8).map((entry) => (
                <div
                  key={`${entry.date}-${entry.rank}`}
                  className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{entry.rank}</p>
                    <p className="text-xs text-muted">{entry.date}</p>
                  </div>
                  <span className="font-mono text-neon">{entry.rankRating} RR</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
