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
import { formatDateKey } from '../gamification/ranks'
import type { DailyStats, PostureSession, UserProfile } from '../../types'
import { getFirestoreDb } from './config'

const LOCAL_PROFILE_KEY = 'posture-guard-profile'
const LOCAL_SESSIONS_KEY = 'posture-guard-sessions'
const LOCAL_DAILY_KEY = 'posture-guard-daily'

function defaultProfile(): UserProfile {
  return {
    uid: 'local-guest',
    displayName: 'Guest',
    email: '',
    rank: 'Iron',
    rankRating: 0,
    totalGoodPostureMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    lastSessionDate: null,
    rankHistory: [{ date: formatDateKey(), rank: 'Iron', rankRating: 0 }],
    createdAt: Date.now(),
  }
}

export function loadLocalProfile(): UserProfile {
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
  if (raw) {
    const profile = JSON.parse(raw) as UserProfile
    return {
      ...defaultProfile(),
      ...profile,
      rankHistory: profile.rankHistory ?? [{ date: formatDateKey(), rank: profile.rank, rankRating: profile.rankRating }],
    }
  }

  const profile = defaultProfile()
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
  localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 365)))
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

export function aggregateDailyStats(sessions: PostureSession[], profile: UserProfile): DailyStats[] {
  const map = new Map<string, DailyStats>()

  for (const session of sessions) {
    const date = formatDateKey(new Date(session.startTime))
    const existing = map.get(date) ?? {
      date,
      averageScore: 0,
      goodMinutes: 0,
      badMinutes: 0,
      sessionCount: 0,
      rankRating: profile.rankRating,
      rank: profile.rank,
    }

    existing.sessionCount += 1
    existing.goodMinutes += session.goodPostureMs / 60_000
    existing.badMinutes += session.badPostureMs / 60_000
    existing.averageScore =
      (existing.averageScore * (existing.sessionCount - 1) + session.averageScore) /
      existing.sessionCount

    map.set(date, existing)
  }

  for (const entry of profile.rankHistory) {
    const existing = map.get(entry.date)
    if (existing) {
      existing.rankRating = entry.rankRating
      existing.rank = entry.rank
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function updateDailyStatsCache(sessions: PostureSession[], profile: UserProfile) {
  const stats = aggregateDailyStats(sessions, profile)
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
