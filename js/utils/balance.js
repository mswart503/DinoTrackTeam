// src/utils/balance.js
import { gameState } from '../gameState.js';

// inclusive integer helper
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Integer-only NPC scaling with 3 week bands:
 *   Weeks 1–5   : small bumps
 *   Weeks 6–10  : medium bumps
 *   Weeks 11–14 : larger bumps
 *
 * If weeks go beyond 14, we keep using the last band.
 * Assumes you call this AFTER incrementing gameState.currentWeek.
 */
export function npcAutoTrainForNewWeek() {
  const w = gameState.currentWeek; // NOTE: call this AFTER ++ so it matches UI

  // tune these ranges however you like
  let speedRange, staminaRange;
  if (w <= 5) {
    speedRange   = [1, 2];  
    staminaRange = [1, 2];  
  } else if (w <= 10) {
    speedRange   = [1, 3];  
    staminaRange = [1, 3];  
  } else {
    speedRange   = [2, 4];  
    staminaRange = [2, 4];  
  }

  gameState.schools.forEach(school => {
    if (school.name === gameState.playerSchool) return; // NPCs only
    school.athletes.forEach(a => {
      a.speed   += randInt(speedRange[0], speedRange[1]);
      a.stamina += randInt(staminaRange[0], staminaRange[1]);
      // Optional safety clamps if you want them:
      // a.speed   = Math.min(a.speed, 20);
      // a.stamina = Math.min(a.stamina, 200);
    });
  });
}
