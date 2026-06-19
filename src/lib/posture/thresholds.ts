export const POSTURE_THRESHOLDS = {
  // CVA — higher is better (degrees)
  cvaIdeal: 58,
  cvaWarning: 52,
  cvaBad: 48,

  // Neck angle from vertical — lower is better (degrees)
  neckIdeal: 8,
  neckWarning: 15,
  neckBad: 22,

  // Forward head horizontal offset — lower is better (normalized 0-1)
  forwardHeadIdeal: 0.02,
  forwardHeadWarning: 0.05,
  forwardHeadBad: 0.09,

  // Spine curvature at shoulder — closer to 180° is straighter
  spineIdeal: 165,
  spineWarning: 150,
  spineBad: 135,

  // Torso lean from vertical — lower is better
  torsoLeanIdeal: 5,
  torsoLeanWarning: 10,
  torsoLeanBad: 16,

  shoulderAsymmetryIdeal: 0.015,
  shoulderAsymmetryWarning: 0.03,
  shoulderAsymmetryBad: 0.05,

  badPostureAlertMs: 20_000,
  alertCooldownMs: 45_000,
  frameScoreGood: 72,
  frameScoreWarning: 45,
  minLandmarkVisibility: 0.35,
} as const
