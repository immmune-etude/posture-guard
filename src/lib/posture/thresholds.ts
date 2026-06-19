export const POSTURE_THRESHOLDS = {
  cvaBad: 50,
  cvaWarning: 55,
  torsoLeanBad: 15,
  torsoLeanWarning: 10,
  shoulderAsymmetry: 0.03,
  badPostureAlertMs: 30_000,
  alertCooldownMs: 60_000,
  frameScoreGood: 70,
  frameScoreWarning: 40,
  minLandmarkVisibility: 0.35,
} as const
