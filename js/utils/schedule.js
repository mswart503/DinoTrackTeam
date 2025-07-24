// src/utils/schedule.js

/**
 * Given an array of team names, returns a double‑round‑robin schedule:
 * An array of “rounds,” each round is an array of [teamA, teamB] pairs.
 */
export function generateRoundRobinSchedule(teams) {
  // Make a copy
  const list = [...teams];
  // If odd, add a dummy bye
  if (list.length % 2 === 1) list.push(null);

  const rounds = [];
  const numRounds = list.length - 1;
  const half = list.length / 2;

  for (let r = 0; r < numRounds; r++) {
    const pairs = [];
    for (let i = 0; i < half; i++) {
      const A = list[i];
      const B = list[list.length - 1 - i];
      if (A && B) pairs.push([A, B]);
    }
    rounds.push(pairs);
    // rotate (keep index 0 fixed)
    list.splice(1, 0, list.pop());
  }

  // Double it for “play each twice”
  return [...rounds, ...rounds];
}
