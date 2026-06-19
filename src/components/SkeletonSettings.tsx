import { SKELETON_COLOR_PRESETS, useSettingsStore } from '../stores/settingsStore'

export function SkeletonSettings() {
  const { skeletonColor, dynamicSkeletonColor, setSkeletonColor, setDynamicSkeletonColor } =
    useSettingsStore()

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Skeleton Style</h3>
          <p className="text-xs text-muted">Customize your overlay color</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={dynamicSkeletonColor}
            onChange={(event) => setDynamicSkeletonColor(event.target.checked)}
            className="accent-neon"
          />
          Color by posture
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SKELETON_COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.name}
            onClick={() => {
              setSkeletonColor(preset.value)
              setDynamicSkeletonColor(false)
            }}
            className={`h-8 w-8 rounded-full border-2 transition ${
              skeletonColor === preset.value && !dynamicSkeletonColor
                ? 'border-white scale-110'
                : 'border-border'
            }`}
            style={{
              backgroundColor: preset.value,
              boxShadow: `0 0 10px ${preset.value}55`,
            }}
          />
        ))}

        <label className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted">
          Custom
          <input
            type="color"
            value={skeletonColor}
            onChange={(event) => {
              setSkeletonColor(event.target.value)
              setDynamicSkeletonColor(false)
            }}
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
        </label>
      </div>
    </div>
  )
}
