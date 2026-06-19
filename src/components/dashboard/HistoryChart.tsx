import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { loadLocalDailyStats, loadLocalProfile } from '../../lib/firebase/firestore'
import { RANK_TIERS } from '../../lib/gamification/ranks'
import type { RankTier } from '../../types'

export function HistoryChart() {
  const stats = loadLocalDailyStats().slice(-14)
  const profile = loadLocalProfile()

  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Complete a session to start building your posture history and rank progression.
      </div>
    )
  }

  const rrData: Array<{ date: string; rr: number; rank: RankTier }> =
    profile.rankHistory.slice(-14).map((entry) => ({
      date: entry.date.slice(5),
      rr: entry.rankRating,
      rank: entry.rank,
    }))

  const chartData =
    rrData.length > 0
      ? rrData
      : [{ date: '—', rr: profile.rankRating, rank: profile.rank }]

  return (
    <div className="grid gap-6">
      <ChartCard title="Daily Posture Score">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats}>
            <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 12 }} />
            <ReferenceLine y={72} stroke="#00ff88" strokeDasharray="4 4" label="Good" />
            <ReferenceLine y={45} stroke="#fbbf24" strokeDasharray="4 4" label="Warning" />
            <Tooltip
              contentStyle={{
                background: '#12121a',
                border: '1px solid #1e1e2e',
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="averageScore"
              stroke="#00ff88"
              strokeWidth={3}
              dot={{ fill: '#00ff88' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Good vs Bad Minutes">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats}>
              <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid #1e1e2e',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="goodMinutes" fill="#00ff88" radius={[6, 6, 0, 0]} />
              <Bar dataKey="badMinutes" fill="#ff4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rank Rating Progress">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
              {RANK_TIERS.slice(1).map((tier) => (
                <ReferenceLine
                  key={tier.name}
                  y={tier.minRR}
                  stroke={tier.color}
                  strokeDasharray="2 6"
                  label={{ value: tier.name, fill: tier.color, fontSize: 10 }}
                />
              ))}
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid #1e1e2e',
                  borderRadius: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rr"
                stroke="#A855F7"
                strokeWidth={3}
                dot={{ fill: '#A855F7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  )
}
