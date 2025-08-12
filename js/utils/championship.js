import { simulate2v2Race } from '../utils/raceSim.js';

export function seedTopFour(schools) {
  // sort by points, tie-breaker = total 100m PR average (optional)
  return [...schools].sort((a, b) => b.points - a.points).slice(0, 4);
}

function pickRelay2(school) {
  // best two for 400m: prefer lowest 400m PR, then by Speed
  const sorted = [...school.athletes].sort((a, b) => {
    const aPR = a.prs?.['400m'], bPR = b.prs?.['400m'];
    if (aPR != null && bPR != null) return aPR - bPR;   // faster first
    if (aPR != null) return -1;
    if (bPR != null) return 1;
    return b.speed - a.speed; // fall back to speed
  });
  return sorted.slice(0, 2);
}

export function simulateTeamVsTeam(schoolA, schoolB, distMeters = 400, distLabel = '400m') {
  const teamA = pickRelay2(schoolA);
  const teamB = pickRelay2(schoolB);

  const results = simulate2v2Race(teamA, teamB, schoolA.name, schoolB.name, distMeters);

  // Winner = lower sum of times across the two athletes
  const sums = {};
  results.forEach(r => {
    sums[r.schoolName] = (sums[r.schoolName] || 0) + r.time;
    // update PRs at this distance
    const prev = r.athlete.prs[distLabel];
    if (prev === undefined || r.time < prev) r.athlete.prs[distLabel] = r.time;
  });

  const winnerName = Object.entries(sums).sort((a, b) => a[1] - b[1])[0][0];
  const winner = winnerName === schoolA.name ? schoolA : schoolB;
  const loser  = winner === schoolA ? schoolB : schoolA;

  return { results, winner, loser, sums };
}
