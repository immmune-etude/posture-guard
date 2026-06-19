import { useEffect, useState } from 'react'
import { AlertManager } from './components/AlertManager'
import { CameraFeed } from './components/CameraFeed'
import { Dashboard } from './components/dashboard/Dashboard'
import { MetricsPanel } from './components/MetricsPanel'
import { SkeletonOverlay } from './components/SkeletonOverlay'
import { SkeletonSettings } from './components/SkeletonSettings'
import { useCamera } from './hooks/useCamera'
import { usePoseDetection } from './hooks/usePoseDetection'
import { usePostureMonitor } from './hooks/usePostureMonitor'
import { useSessionTracker } from './hooks/useSessionTracker'
import { usePostureStore } from './stores/postureStore'
import type { AppTab } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('monitor')
  const { videoRef, isActive, error, start, stop } = useCamera()
  const {
    landmarks,
    metrics,
    frameScore,
    postureState,
    badPostureDurationMs,
    isMonitoring,
    setMonitoring,
    setCameraError,
  } = usePostureStore()

  const {
    profile,
    isSessionActive,
    elapsedMs,
    sessionScore,
    startSession,
    endSession,
  } = useSessionTracker()

  usePoseDetection(videoRef, isMonitoring && isActive)
  usePostureMonitor(isMonitoring && isActive)

  useEffect(() => {
    setCameraError(error)
  }, [error, setCameraError])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [])

  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      if (isSessionActive) await endSession()
      stop()
      setMonitoring(false)
      return
    }

    await start()
    setMonitoring(true)
    startSession()
  }

  const monitor = (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="relative">
          <CameraFeed videoRef={videoRef} isActive={isActive} />
          {isActive && <SkeletonOverlay videoRef={videoRef} />}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleToggleMonitoring}
            className="rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>

          {isMonitoring && (
            <StatusPill
              label={landmarks.length > 0 ? 'Pose Detected' : 'Searching for body'}
              active={landmarks.length > 0}
            />
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        <SkeletonSettings />
      </div>

      <MetricsPanel
        metrics={metrics}
        frameScore={frameScore}
        postureState={postureState}
        sessionScore={sessionScore}
        elapsedMs={elapsedMs}
        badPostureDurationMs={badPostureDurationMs}
        rank={profile.rank}
        rankRating={profile.rankRating}
      />
    </div>
  )

  return (
    <>
      <AlertManager />
      <Dashboard
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        monitor={monitor}
      />
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
    </>
  )
}

function TabSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: AppTab
  onChange: (tab: AppTab) => void
}) {
  const tabs: AppTab[] = ['monitor', 'history', 'progress']

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full border border-border bg-surface/95 p-2 backdrop-blur md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-xs capitalize ${
            activeTab === tab ? 'bg-neon/15 text-neon' : 'text-muted'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`rounded-full px-4 py-3 text-sm ${
        active ? 'bg-neon/10 text-neon' : 'bg-surface text-muted'
      }`}
    >
      {label}
    </div>
  )
}

export default App
