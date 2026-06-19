import { RANK_TIERS } from '../lib/gamification/ranks'

interface RankBadgeProps {
  rank: string
}

export function RankBadge({ rank }: RankBadgeProps) {
  const tier = RANK_TIERS.find((entry) => entry.name === rank) ?? RANK_TIERS[0]

  return (
    <div
      className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{ borderColor: tier.color, color: tier.color }}
    >
      {tier.name}
    </div>
  )
}
