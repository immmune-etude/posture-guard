import type { AppTab } from '../../types'
import { HistoryChart } from './HistoryChart'
import { ProgressView } from './ProgressView'
import type { UserProfile } from '../../types'

interface DashboardProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  profile: UserProfile
  monitor: React.ReactNode
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
}: DashboardProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neon">PostureGuard</p>
          <h1 className="text-3xl font-bold">Real-Time Posture Monitor</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            All pose detection runs locally in your browser. No video ever leaves your device.
          </p>
        </div>
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
      </header>

      {activeTab === 'monitor' && monitor}
      {activeTab === 'history' && <HistoryChart />}
      {activeTab === 'progress' && <ProgressView profile={profile} />}
    </div>
  )
}
