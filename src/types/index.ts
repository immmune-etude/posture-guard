export type PostureState = 'good' | 'warning' | 'bad' | 'unknown'

export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export interface PostureMetrics {
  cva: number
  torsoLean: number
  shoulderAsymmetry: number
  analysisMode: 'full' | 'upper'
}

export interface PostureSession {
  id: string
  userId: string
  startTime: number
  endTime: number
  durationMs: number
  goodPostureMs: number
  warningPostureMs: number
  badPostureMs: number
  alertCount: number
  averageScore: number
  peakScore: number
  frameCount: number
}

export interface DailyStats {
  date: string
  averageScore: number
  goodMinutes: number
  badMinutes: number
  sessionCount: number
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  rank: RankTier
  rankRating: number
  totalGoodPostureMinutes: number
  currentStreak: number
  longestStreak: number
  totalSessions: number
  createdAt: number
}

export type RankTier =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Ascendant'
  | 'Immortal'
  | 'Radiant'

export type AppTab = 'monitor' | 'history' | 'progress'
