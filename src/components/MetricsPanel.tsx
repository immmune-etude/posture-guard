import { getRankProgress, getNextRankTier } from '../lib/gamification/ranks'
import type { PostureMetrics, PostureState } from '../types'
import { RankBadge } from './RankBadge'

interface MetricsPanelProps {
  metrics: PostureMetrics | null
  frameScore: number
  postureState: PostureState
  sessionScore: number
  elapsedMs: number
  badPostureDurationMs: number
  rank: string
  rankRating: number
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const stateStyles: Record<PostureState, string> = {
  good: 'text-neon',
  warning: 'text-warning',
  bad: 'text-danger',
  unknown: 'text-muted',
}

export function MetricsPanel({
  metrics,
  frameScore,
  postureState,
  sessionScore,
  elapsedMs,
  badPostureDurationMs,
  rank,
  rankRating,
}: MetricsPanelProps) {
  const nextTier = getNextRankTier(rankRating)
  const progress = getRankProgress(rankRating)

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Live Monitor</p>
          <h2 className="text-xl font-semibold">Posture Metrics</h2>
        </div>
        <RankBadge rank={rank} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Frame Score" value={`${frameScore}%`} highlight className={stateStyles[postureState]} />
        <MetricCard label="Session Score" value={`${sessionScore}%`} />
        <MetricCard
          label="Posture State"
          value={postureState}
          className={stateStyles[postureState]}
        />
        <MetricCard label="Session Time" value={formatDuration(elapsedMs)} />
      </div>

      {metrics ? (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-bg/60 p-4 text-sm">
          <MetricRow
            label="Analysis"
            value={metrics.analysisMode === 'full' ? 'Full body' : 'Upper body'}
          />
          <MetricRow label="CVA (neck)" value={`${metrics.cva.toFixed(1)}°`} />
          <MetricRow label="Neck angle" value={`${metrics.neckAngle.toFixed(1)}°`} />
          <MetricRow label="Forward head" value={metrics.forwardHeadOffset.toFixed(3)} />
          {metrics.analysisMode === 'full' && (
            <>
              <MetricRow label="Spine curve" value={`${metrics.spineCurvature.toFixed(1)}°`} />
              <MetricRow label="Torso lean" value={`${metrics.torsoLean.toFixed(1)}°`} />
            </>
          )}
          <MetricRow label="Shoulder roll" value={metrics.shoulderRoll.toFixed(3)} />
          <MetricRow label="Bad posture timer" value={formatDuration(badPostureDurationMs)} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          Position your shoulders, neck, and head in frame for strict posture analysis.
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Rank Rating</span>
          <span className="font-mono text-neon">{rankRating} RR</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full bg-neon transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextTier && (
          <p className="mt-2 text-xs text-muted">
            {progress}% to {nextTier.name}
          </p>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight = false,
  className = '',
}: {
  label: string
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border p-3 ${
        highlight ? 'bg-neon/10' : 'bg-bg/60'
      }`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${className}`}>{value}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
