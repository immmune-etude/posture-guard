import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { loadLocalDailyStats } from '../../lib/firebase/firestore'

export function HistoryChart() {
  const stats = loadLocalDailyStats().slice(-7)

  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Complete a session to start building your posture history.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Average Score (7 days)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats}>
            <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 12 }} />
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

      <ChartCard title="Good vs Bad Minutes">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats}>
            <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
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
