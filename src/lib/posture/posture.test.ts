import { describe, expect, it } from 'vitest'
import {
  calculateAngle,
  calculateCVA,
  calculateForwardHeadOffset,
  calculateNeckAngle,
  calculateShoulderAsymmetry,
  calculateSpineCurvature,
  calculateTorsoLean,
} from './angles'
import { analyzePosture } from './analyze'
import { getKeyLandmarks } from './landmarks'
import { calculateFrameScore, calculateSessionScore, scoreToPostureState } from './scoring'
import { getRankTier } from '../gamification/ranks'

const point = (x: number, y: number, visibility = 1, z = 0) => ({ x, y, z, visibility })

describe('posture angles', () => {
  it('calculates a right angle', () => {
    expect(calculateAngle(point(0, 0), point(0, 1), point(1, 1))).toBeCloseTo(90, 1)
  })

  it('detects forward head posture with low CVA', () => {
    const shoulder = point(0.5, 0.4)
    const ear = point(0.62, 0.38)
    expect(calculateCVA(ear, shoulder)).toBeLessThan(50)
  })

  it('detects upright posture with higher CVA', () => {
    const shoulder = point(0.5, 0.4)
    const ear = point(0.5, 0.25)
    expect(calculateCVA(ear, shoulder)).toBeGreaterThan(55)
  })

  it('detects text-neck via neck angle', () => {
    const shoulder = point(0.5, 0.5)
    const head = point(0.58, 0.42)
    expect(calculateNeckAngle(head, shoulder)).toBeGreaterThan(20)
  })

  it('measures forward head offset', () => {
    expect(calculateForwardHeadOffset(point(0.58, 0.3), point(0.5, 0.4))).toBeCloseTo(0.08, 2)
  })

  it('measures spine curvature collapse', () => {
    const neck = point(0.62, 0.32)
    const shoulder = point(0.5, 0.4)
    const hip = point(0.46, 0.72)
    expect(calculateSpineCurvature(neck, shoulder, hip)).toBeLessThan(140)
  })

  it('measures torso lean', () => {
    const hip = point(0.5, 0.7)
    const shoulder = point(0.62, 0.4)
    expect(calculateTorsoLean(shoulder, hip)).toBeGreaterThan(10)
  })
})

describe('posture scoring', () => {
  const ideal = {
    cva: 62,
    neckAngle: 6,
    forwardHeadOffset: 0.01,
    spineCurvature: 170,
    shoulderRoll: 0.01,
    torsoLean: 4,
    shoulderAsymmetry: 0.01,
    analysisMode: 'full' as const,
  }

  const slouched = {
    cva: 42,
    neckAngle: 28,
    forwardHeadOffset: 0.11,
    spineCurvature: 128,
    shoulderRoll: 0.08,
    torsoLean: 22,
    shoulderAsymmetry: 0.06,
    analysisMode: 'full' as const,
  }

  it('scores ideal posture highly', () => {
    expect(calculateFrameScore(ideal)).toBeGreaterThan(85)
  })

  it('scores slouched posture near 20%', () => {
    expect(calculateFrameScore(slouched)).toBeLessThan(30)
  })

  it('maps score to posture state strictly', () => {
    expect(scoreToPostureState(85)).toBe('good')
    expect(scoreToPostureState(55)).toBe('warning')
    expect(scoreToPostureState(20)).toBe('bad')
  })

  it('calculates session score from durations', () => {
    expect(calculateSessionScore(60000, 0, 0)).toBe(100)
  })
})

describe('landmark analysis', () => {
  it('supports upper-body scoring when hips are out of frame', () => {
    const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0))
    landmarks[0] = point(0.5, 0.25, 1)
    landmarks[7] = point(0.48, 0.24, 1)
    landmarks[11] = point(0.42, 0.4, 1)
    landmarks[12] = point(0.58, 0.4, 1)
    landmarks[23] = point(0.42, 0.8, 0.1)
    landmarks[24] = point(0.58, 0.8, 0.1)

    const key = getKeyLandmarks(landmarks)
    expect(key.visible).toBe(true)
    expect(key.mode).toBe('upper')

    const metrics = analyzePosture(landmarks)
    expect(metrics).not.toBeNull()
    expect(metrics!.analysisMode).toBe('upper')
  })
})

describe('rank tiers', () => {
  it('returns Iron for new users', () => {
    expect(getRankTier(0).name).toBe('Iron')
  })

  it('promotes to Gold at 800 RR', () => {
    expect(getRankTier(850).name).toBe('Gold')
  })

  it('includes Champion at top tier', () => {
    expect(getRankTier(5000).name).toBe('Champion')
  })
})
