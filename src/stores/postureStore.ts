import { create } from 'zustand'
import type { Landmark, PostureMetrics, PostureState } from '../types'

interface PostureStore {
  landmarks: Landmark[]
  metrics: PostureMetrics | null
  frameScore: number
  postureState: PostureState
  isMonitoring: boolean
  isPoseReady: boolean
  cameraError: string | null
  badPostureDurationMs: number
  lastAlertAt: number | null
  showAlert: boolean
  setLandmarks: (landmarks: Landmark[]) => void
  setMetrics: (metrics: PostureMetrics | null, frameScore: number, postureState: PostureState) => void
  setMonitoring: (value: boolean) => void
  setPoseReady: (value: boolean) => void
  setCameraError: (error: string | null) => void
  setBadPostureDuration: (ms: number) => void
  triggerAlert: () => void
  clearAlert: () => void
}

export const usePostureStore = create<PostureStore>((set) => ({
  landmarks: [],
  metrics: null,
  frameScore: 0,
  postureState: 'unknown',
  isMonitoring: false,
  isPoseReady: false,
  cameraError: null,
  badPostureDurationMs: 0,
  lastAlertAt: null,
  showAlert: false,
  setLandmarks: (landmarks) => set({ landmarks }),
  setMetrics: (metrics, frameScore, postureState) => set({ metrics, frameScore, postureState }),
  setMonitoring: (isMonitoring) => set({ isMonitoring }),
  setPoseReady: (isPoseReady) => set({ isPoseReady }),
  setCameraError: (cameraError) => set({ cameraError }),
  setBadPostureDuration: (badPostureDurationMs) => set({ badPostureDurationMs }),
  triggerAlert: () =>
    set(() => ({
      showAlert: true,
      lastAlertAt: Date.now(),
      badPostureDurationMs: 0,
    })),
  clearAlert: () => set({ showAlert: false }),
}))
