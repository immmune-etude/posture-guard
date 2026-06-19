import { create } from 'zustand'

const STORAGE_KEY = 'posture-guard-settings'

export const SKELETON_COLOR_PRESETS = [
  { name: 'Neon Green', value: '#00ff88' },
  { name: 'Cyber Cyan', value: '#00e5ff' },
  { name: 'Electric Purple', value: '#b44aff' },
  { name: 'Hot Pink', value: '#ff4fd8' },
  { name: 'Solar Gold', value: '#ffd166' },
  { name: 'Ice White', value: '#f8fafc' },
] as const

interface SettingsState {
  skeletonColor: string
  dynamicSkeletonColor: boolean
  setSkeletonColor: (color: string) => void
  setDynamicSkeletonColor: (enabled: boolean) => void
}

function loadSettings(): Pick<SettingsState, 'skeletonColor' | 'dynamicSkeletonColor'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { skeletonColor: SKELETON_COLOR_PRESETS[0].value, dynamicSkeletonColor: true }
    }
    const parsed = JSON.parse(raw) as Partial<Pick<SettingsState, 'skeletonColor' | 'dynamicSkeletonColor'>>
    return {
      skeletonColor: parsed.skeletonColor ?? SKELETON_COLOR_PRESETS[0].value,
      dynamicSkeletonColor: parsed.dynamicSkeletonColor ?? true,
    }
  } catch {
    return { skeletonColor: SKELETON_COLOR_PRESETS[0].value, dynamicSkeletonColor: true }
  }
}

function persistSettings(state: Pick<SettingsState, 'skeletonColor' | 'dynamicSkeletonColor'>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const initial = loadSettings()

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initial,
  setSkeletonColor: (skeletonColor) =>
    set((state) => {
      const next = { skeletonColor, dynamicSkeletonColor: state.dynamicSkeletonColor }
      persistSettings(next)
      return next
    }),
  setDynamicSkeletonColor: (dynamicSkeletonColor) =>
    set((state) => {
      const next = { skeletonColor: state.skeletonColor, dynamicSkeletonColor }
      persistSettings(next)
      return next
    }),
}))
