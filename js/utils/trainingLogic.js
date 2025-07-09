// utils/trainingLogic.js
import { gameState } from '../gameState.js';

export function applyTraining(athlete, type) {
  // 1) Grab & clear any “next training” buffs for this athlete
  const trainingBuffs = gameState.activeBuffs.filter(b =>
    b.athleteName === athlete.name && b.type === 'buffNextTraining'
  );
  gameState.activeBuffs = gameState.activeBuffs.filter(b =>
    !(b.athleteName === athlete.name && b.type === 'buffNextTraining')
  );

  // 2) Build multipliers
  let speedMultiplier   = 1;
  let staminaMultiplier = 1;
  trainingBuffs.forEach(b => {
    if (b.buff === 'speedGain')   speedMultiplier   *= b.amount;
    if (b.buff === 'staminaGain') staminaMultiplier *= b.amount;
  });

  // 3) Apply base gains × multipliers
  let baseSpeedGain   = 0;
  let baseStaminaGain = 0;
  switch (type) {
    case 'Interval':
      baseSpeedGain   = 3;
      break;
    case 'Condition':
      baseStaminaGain = 3;
      break;
    case 'HIIT':
      baseSpeedGain   = 1;
      baseStaminaGain = 2;
      break;
    case 'Pace':
      baseSpeedGain   = 2;
      baseStaminaGain = 1;
      break;
  }

  athlete.speed   = (athlete.speed   || 0) + baseSpeedGain   * speedMultiplier;
  athlete.stamina = (athlete.stamina || 0) + baseStaminaGain * staminaMultiplier;

  athlete.lastTrainingType = type;
}
