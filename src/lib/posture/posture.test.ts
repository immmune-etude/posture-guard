import { describe, expect, it } from 'vitest'
import { calculateAngle, calculateCVA, calculateShoulderAsymmetry, calculateTorsoLean } from './angles'
import { getKeyLandmarks } from './landmarks'
import { calculateFrameScore, calculateSessionScore, scoreToPostureState } from './scoring'
import { getRankTier } from '../gamification/ranks'

const point = (x: number, y: number, visibility = 1) => ({ x, y, z: 0, visibility })

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

  it('measures torso lean', () => {
    const hip = point(0.5, 0.7)
    const shoulder = point(0.62, 0.4)
    expect(calculateTorsoLean(shoulder, hip)).toBeGreaterThan(10)
  })

  it('measures shoulder asymmetry', () => {
    expect(calculateShoulderAsymmetry(point(0.4, 0.4), point(0.6, 0.45))).toBeCloseTo(0.05)
  })
})

describe('posture scoring', () => {
  it('scores perfect posture highly', () => {
    expect(
      calculateFrameScore({
        cva: 60,
        torsoLean: 5,
        shoulderAsymmetry: 0.01,
        analysisMode: 'full',
      }),
    ).toBe(100)
  })

  it('scores slouching poorly', () => {
    expect(
      calculateFrameScore({
        cva: 40,
        torsoLean: 20,
        shoulderAsymmetry: 0.05,
        analysisMode: 'full',
      }),
    ).toBeLessThan(40)
  })

  it('skips torso lean penalty in upper-body mode', () => {
    expect(
      calculateFrameScore({
        cva: 60,
        torsoLean: 25,
        shoulderAsymmetry: 0.01,
        analysisMode: 'upper',
      }),
    ).toBe(100)
  })

  it('maps score to posture state', () => {
    expect(scoreToPostureState(85)).toBe('good')
    expect(scoreToPostureState(55)).toBe('warning')
    expect(scoreToPostureState(20)).toBe('bad')
  })

  it('calculates session score from durations', () => {
    expect(calculateSessionScore(60000, 0, 0)).toBe(100)
    expect(calculateSessionScore(30000, 30000, 0)).toBe(75)
  })
})

describe('landmark analysis', () => {
  it('supports upper-body scoring when hips are out of frame', () => {
    const landmarks = Array.from({ length: 33 }, () => point(0, 0, 0))
    landmarks[0] = point(0.5, 0.25, 1)
    landmarks[11] = point(0.42, 0.4, 1)
    landmarks[12] = point(0.58, 0.4, 1)
    landmarks[23] = point(0.42, 0.8, 0.1)
    landmarks[24] = point(0.58, 0.8, 0.1)

    const key = getKeyLandmarks(landmarks)
    expect(key.visible).toBe(true)
    expect(key.mode).toBe('upper')
  })
})

describe('rank tiers', () => {
  it('returns Iron for new users', () => {
    expect(getRankTier(0).name).toBe('Iron')
  })

  it('promotes to Gold at 600 RR', () => {
    expect(getRankTier(650).name).toBe('Gold')
  })
})
