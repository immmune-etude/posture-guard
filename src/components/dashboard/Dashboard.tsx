import type { AppTab } from '../../types'
import { HistoryChart } from './HistoryChart'
import { ProgressView } from './ProgressView'
import type { UserProfile } from '../../types'

interface DashboardProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  profile: UserProfile
  monitor: React.ReactNode
  sessionActive?: boolean
  onBackToLanding?: () => void
}

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'monitor', label: 'Live Monitor' },
  { id: 'history', label: 'History' },
  { id: 'progress', label: 'Progress' },
]

export function Dashboard({
  activeTab,
  onTabChange,
  profile,
  monitor,
  sessionActive = false,
  onBackToLanding,
}: DashboardProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neon">PostureGuard</p>
          <h1 className="text-3xl font-bold">Real-Time Posture Monitor</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Strict neck & spine analysis runs locally. Switch tabs freely — your session keeps
            running in the background.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-neon"
            >
              Home
            </button>
          )}
          <nav className="hidden gap-2 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-full px-4 py-2 text-sm ${
                  activeTab === tab.id
                    ? 'bg-neon/15 text-neon'
                    : 'border border-border text-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {sessionActive && activeTab !== 'monitor' && (
        <div className="flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/5 px-4 py-3 text-sm text-neon">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-neon" />
          Session active — camera is still monitoring your posture
        </div>
      )}

      {activeTab === 'monitor' && monitor}
      {activeTab === 'history' && <HistoryChart />}
      {activeTab === 'progress' && <ProgressView profile={profile} />}
    </div>
  )
}
