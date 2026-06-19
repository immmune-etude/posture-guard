interface LandingPageProps {
  onLaunchDemo: () => void
}

const features = [
  {
    title: 'Strict Neck & Spine Analysis',
    body: 'Tracks CVA, neck angle, forward head offset, spine curvature, and shoulder roll — not just head position.',
  },
  {
    title: '100% On-Device AI',
    body: 'MediaPipe pose detection runs in your browser. No video ever leaves your device.',
  },
  {
    title: 'Background Alerts',
    body: 'Chrome extension monitors posture while you browse and sends notifications when you slouch.',
  },
  {
    title: 'Ranked Progression',
    body: 'Climb from Iron to Champion with date-tracked streaks, RR points, and a full rank ladder.',
  },
]

export function LandingPage({ onLaunchDemo }: LandingPageProps) {
  return (
    <div className="min-h-full bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neon">PostureGuard</p>
          <p className="text-sm text-muted">Real-time posture intelligence</p>
        </div>
        <button
          type="button"
          onClick={onLaunchDemo}
          className="rounded-full border border-neon/30 px-4 py-2 text-sm text-neon hover:bg-neon/10"
        >
          Launch Demo
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Sit up straight.
              <span className="block text-neon">Level up your posture.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              PostureGuard uses AI pose tracking to analyze your neck, spine, and shoulders in
              real time — then gamifies improvement with ranks, streaks, and alerts.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onLaunchDemo}
                className="rounded-xl bg-neon px-6 py-3 font-semibold text-bg transition hover:opacity-90"
              >
                Try Live Demo
              </button>
              <a
                href="https://github.com/immmune-etude/posture-guard"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border px-6 py-3 text-sm text-muted hover:border-neon/30 hover:text-neon"
              >
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-xs text-muted">
              Camera required · Processing stays local · Free to demo
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_0_60px_rgba(0,255,136,0.08)]">
            <div className="aspect-[4/3] rounded-2xl border border-neon/20 bg-[linear-gradient(180deg,rgba(0,255,136,0.08),rgba(10,10,15,0.9))] p-6">
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-2 w-24 rounded-full bg-neon/40" />
                  <div className="h-2 w-40 rounded-full bg-neon/20" />
                  <div className="h-2 w-32 rounded-full bg-neon/20" />
                </div>
                <div className="mx-auto h-40 w-24 rounded-full border-2 border-neon/60 shadow-[0_0_20px_#00ff88]" />
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-bg/60 p-2">
                    <p className="text-muted">Score</p>
                    <p className="font-mono text-neon">87%</p>
                  </div>
                  <div className="rounded-lg bg-bg/60 p-2">
                    <p className="text-muted">Rank</p>
                    <p className="font-mono text-warning">Gold</p>
                  </div>
                  <div className="rounded-lg bg-bg/60 p-2">
                    <p className="text-muted">Streak</p>
                    <p className="font-mono text-neon">5d</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to showcase better posture?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Launch the live demo to test strict scoring, background notifications, and the full
          rank progression system.
        </p>
        <button
          type="button"
          onClick={onLaunchDemo}
          className="mt-6 rounded-xl bg-neon px-8 py-3 font-semibold text-bg"
        >
          Open PostureGuard Demo
        </button>
      </section>
    </div>
  )
}
