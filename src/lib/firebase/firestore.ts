import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { DailyStats, PostureSession, UserProfile } from '../../types'
import { getFirestoreDb } from './config'

const LOCAL_PROFILE_KEY = 'posture-guard-profile'
const LOCAL_SESSIONS_KEY = 'posture-guard-sessions'
const LOCAL_DAILY_KEY = 'posture-guard-daily'

export function loadLocalProfile(): UserProfile {
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
  if (raw) return JSON.parse(raw) as UserProfile

  const profile: UserProfile = {
    uid: 'local-guest',
    displayName: 'Guest',
    email: '',
    rank: 'Iron',
    rankRating: 0,
    totalGoodPostureMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    createdAt: Date.now(),
  }
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile))
  return profile
}

export function saveLocalProfile(profile: UserProfile) {
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile))
}

export function loadLocalSessions(): PostureSession[] {
  const raw = localStorage.getItem(LOCAL_SESSIONS_KEY)
  return raw ? (JSON.parse(raw) as PostureSession[]) : []
}

export function saveLocalSession(session: PostureSession) {
  const sessions = loadLocalSessions()
  sessions.unshift(session)
  localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)))
}

export function loadLocalDailyStats(): DailyStats[] {
  const raw = localStorage.getItem(LOCAL_DAILY_KEY)
  return raw ? (JSON.parse(raw) as DailyStats[]) : []
}

export function saveLocalDailyStats(stats: DailyStats[]) {
  localStorage.setItem(LOCAL_DAILY_KEY, JSON.stringify(stats))
}

export async function persistSession(session: PostureSession, profile: UserProfile) {
  saveLocalSession(session)
  saveLocalProfile(profile)

  const db = getFirestoreDb()
  if (!db || profile.uid === 'local-guest') return

  await setDoc(doc(db, 'users', profile.uid, 'sessions', session.id), session)
  await setDoc(doc(db, 'users', profile.uid), profile)
}

export async function fetchRecentSessions(userId: string, days = 30): Promise<PostureSession[]> {
  const db = getFirestoreDb()
  if (!db || userId === 'local-guest') return loadLocalSessions().slice(0, days)

  const q = query(
    collection(db, 'users', userId, 'sessions'),
    orderBy('startTime', 'desc'),
    limit(days),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => docSnap.data() as PostureSession)
}

export function aggregateDailyStats(sessions: PostureSession[]): DailyStats[] {
  const map = new Map<string, DailyStats>()

  for (const session of sessions) {
    const date = new Date(session.startTime).toISOString().slice(0, 10)
    const existing = map.get(date) ?? {
      date,
      averageScore: 0,
      goodMinutes: 0,
      badMinutes: 0,
      sessionCount: 0,
    }

    existing.sessionCount += 1
    existing.goodMinutes += session.goodPostureMs / 60_000
    existing.badMinutes += session.badPostureMs / 60_000
    existing.averageScore =
      (existing.averageScore * (existing.sessionCount - 1) + session.averageScore) /
      existing.sessionCount

    map.set(date, existing)
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function updateDailyStatsCache(sessions: PostureSession[]) {
  const stats = aggregateDailyStats(sessions)
  saveLocalDailyStats(stats)
  return stats
}

export async function syncFirestore(
  _db: Firestore,
  userId: string,
): Promise<{ sessions: PostureSession[]; profile: UserProfile | null }> {
  const sessions = await fetchRecentSessions(userId)
  return { sessions, profile: loadLocalProfile() }
}
