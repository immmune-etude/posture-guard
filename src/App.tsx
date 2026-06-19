import { useEffect, useState } from 'react'
import { AlertManager } from './components/AlertManager'
import { CameraPreview } from './components/CameraPreview'
import { Dashboard } from './components/dashboard/Dashboard'
import { HiddenVideoSource } from './components/HiddenVideoSource'
import { LandingPage } from './components/LandingPage'
import { MetricsPanel } from './components/MetricsPanel'
import { SkeletonSettings } from './components/SkeletonSettings'
import { useCamera } from './hooks/useCamera'
import { useCameraKeepAlive } from './hooks/useCameraKeepAlive'
import { usePoseDetection } from './hooks/usePoseDetection'
import { usePostureMonitor } from './hooks/usePostureMonitor'
import { useSessionTracker } from './hooks/useSessionTracker'
import {
  isBackgroundMode,
  isExtensionContext,
  startBackgroundMonitoring,
  stopBackgroundMonitoring,
} from './lib/extension/messaging'
import { usePostureStore } from './stores/postureStore'
import type { AppTab } from './types'

function App() {
  const backgroundMode = isBackgroundMode()
  const [view, setView] = useState<'landing' | 'app'>(backgroundMode ? 'app' : 'landing')
  const [activeTab, setActiveTab] = useState<AppTab>('monitor')
  const [backgroundMonitoring, setBackgroundMonitoring] = useState(false)

  const { videoRef, isActive, error, start, stop, reattachStream } = useCamera()
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

  const sessionRunning = isMonitoring && isActive

  usePoseDetection(videoRef, sessionRunning)
  usePostureMonitor(sessionRunning)
  useCameraKeepAlive(videoRef, sessionRunning, reattachStream, activeTab)

  useEffect(() => {
    setCameraError(error)
  }, [error, setCameraError])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!backgroundMode) return
    void (async () => {
      await start()
      setMonitoring(true)
      startSession()
    })()
  }, [backgroundMode, setMonitoring, start, startSession])

  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      if (backgroundMonitoring && isExtensionContext()) {
        await stopBackgroundMonitoring()
        setBackgroundMonitoring(false)
      }
      if (isSessionActive) await endSession()
      stop()
      setMonitoring(false)
      return
    }

    await start()
    setMonitoring(true)
    startSession()
  }

  const handleBackgroundToggle = async () => {
    if (!isExtensionContext()) return

    if (backgroundMonitoring) {
      await stopBackgroundMonitoring()
      setBackgroundMonitoring(false)
      return
    }

    if (!isMonitoring) {
      await start()
      setMonitoring(true)
      startSession()
    }

    await startBackgroundMonitoring()
    setBackgroundMonitoring(true)
  }

  if (view === 'landing' && !backgroundMode) {
    return <LandingPage onLaunchDemo={() => setView('app')} />
  }

  const monitor = (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        {!backgroundMode && (
          <div className="relative">
            <CameraPreview videoRef={videoRef} isActive={isActive} />
          </div>
        )}

        {backgroundMode && (
          <div className="rounded-2xl border border-neon/20 bg-neon/5 p-4 text-sm text-neon">
            Background monitoring active. You will receive notifications when posture slips.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!backgroundMode && (
            <button
              type="button"
              onClick={handleToggleMonitoring}
              className="rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          )}

          {isExtensionContext() && !backgroundMode && (
            <button
              type="button"
              onClick={handleBackgroundToggle}
              className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                backgroundMonitoring
                  ? 'bg-warning/20 text-warning'
                  : 'border border-border text-muted hover:border-neon/30 hover:text-neon'
              }`}
            >
              {backgroundMonitoring ? 'Background On' : 'Monitor in Background'}
            </button>
          )}

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

        {!backgroundMode && <SkeletonSettings />}
      </div>

      {!backgroundMode && (
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
      )}
    </div>
  )

  if (backgroundMode) {
    return (
      <>
        <AlertManager />
        {sessionRunning && <HiddenVideoSource videoRef={videoRef} />}
      </>
    )
  }

  return (
    <>
      <AlertManager />
      {sessionRunning && <HiddenVideoSource videoRef={videoRef} />}
      <Dashboard
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        sessionActive={isMonitoring && isSessionActive}
        onBackToLanding={() => setView('landing')}
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
