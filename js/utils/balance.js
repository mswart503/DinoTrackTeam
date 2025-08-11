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
    speedRange   = [0, 1];  
    staminaRange = [0, 1];  
  } else if (w <= 10) {
    speedRange   = [1, 2];  
    staminaRange = [1, 2];  
  } else {
    speedRange   = [1, 3];  
    staminaRange = [1, 3];  
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

// Week is 0-based (0..13). Returns 100, 200, 400.
export function raceDistanceForWeek(weekIdx) {
  if (weekIdx >= 10) return 400; // weeks 11–14
  if (weekIdx >= 5)  return 200; // weeks 6–10
  return 100;                     // weeks 1–5
}

// utils/balance.js
export function getWeeklyRaceDistance(weekIndex) {
  const w = weekIndex + 1; // 1-based
  if (w <= 5)  return '100m';
  if (w <= 10) return '200m';
  return '400m';
}
export function metersFromLabel(label) {
  return parseInt(label, 10) || 100;
}
