// src/utils/raceSim.js
//import { Phaser } from 'phaser';

/**
 * Simulate a 2v2 100 m race.
 *
 * @param {Athlete[]} teamA — exactly 2 athletes for “your” side
 * @param {Athlete[]} teamB — exactly 2 athletes for opponent side
 * @param {string} nameA — schoolName for teamA
 * @param {string} nameB — schoolName for teamB
 * @returns {Array<{ athlete:Athlete, schoolName:string, time:number }>}
 *          sorted ascending by finish time
 */
// utils/raceSim.js
export function simulate2v2Race(teamA, teamB, nameA, nameB, distanceMeters = 100) {
  const entrants = [];

  function simulateAthlete(athlete, schoolName) {
    const distance = distanceMeters;        // ← use the param instead of 100
    let time = 0;
    let stamina = athlete.stamina;          // stamina ~ seconds at full speed
    const speed = athlete.speed;            // speed ~ meters/second (your scale)

    // simple step simulation at full speed until stamina runs out or we finish
    while (stamina > 0 && speed * time < distance) {
      time += 0.1;
      stamina -= 0.1;
    }

    // distance covered while fresh
    const covered = speed * time;

    if (covered < distance) {
      // after stamina is gone, run at half speed for remaining distance
      const remaining = distance - covered;
      time += remaining / (speed / 2);
    }

    return { athlete, schoolName, time };
  }

  // simulate all four
  teamA.forEach(a => entrants.push(simulateAthlete(a, nameA)));
  teamB.forEach(a => entrants.push(simulateAthlete(a, nameB)));

  // sort by time (lower = faster)
  return entrants.sort((a, b) => a.time - b.time);
}

