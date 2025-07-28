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
export function simulate2v2Race(teamA, teamB, nameA, nameB) {
  const entrants = [];

  function simulateAthlete(athlete, schoolName) {
    const distance = 100;
    let time = 0;
    let stamina = athlete.stamina;
    const speed = athlete.speed;

    // simple step simulation
    while (stamina > 0 && speed * time < distance) {
      time += 0.1;
      stamina -= 0.1;
    }
    const covered = speed * time;
    if (covered < distance) {
      // half speed once stamina runs out
      time += (distance - covered) / (speed / 2);
    }
    return { athlete, schoolName, time };
  }

  // simulate all four
  teamA.forEach(a => entrants.push(simulateAthlete(a, nameA)));
  teamB.forEach(a => entrants.push(simulateAthlete(a, nameB)));

  // sort by time
  return entrants.sort((a, b) => a.time - b.time);
}
