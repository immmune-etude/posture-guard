export type PostureState = 'good' | 'warning' | 'bad' | 'unknown'

export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export interface PostureMetrics {
  cva: number
  neckAngle: number
  forwardHeadOffset: number
  spineCurvature: number
  shoulderRoll: number
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
  rankRating: number
  rank: RankTier
}

export interface RankHistoryEntry {
  date: string
  rank: RankTier
  rankRating: number
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
  lastSessionDate: string | null
  rankHistory: RankHistoryEntry[]
  createdAt: number
}

export type RankTier =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Champion'

export type AppTab = 'monitor' | 'history' | 'progress'
export type AppView = 'landing' | 'app'
