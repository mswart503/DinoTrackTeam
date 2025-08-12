import { addText, createNextButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { seedTopFour, simulateTeamVsTeam } from '../utils/championship.js';

export default class StateChampionshipScene extends Phaser.Scene {
  constructor() { super('StateChampionshipScene'); }

  create() {
    // Seed
    const seeds = seedTopFour(gameState.schools);
    if (!gameState.championship) gameState.championship = {};
    gameState.championship.seeds = seeds.map(s => s.name);

    // Semis
    const A = seeds[0], B = seeds[3]; // 1 v 4
    const C = seeds[1], D = seeds[2]; // 2 v 3
    const semi1 = simulateTeamVsTeam(A, B, 400, '400m');
    const semi2 = simulateTeamVsTeam(C, D, 400, '400m');

    // Final
    const finalRes = simulateTeamVsTeam(semi1.winner, semi2.winner, 400, '400m');

    // 3rd place: better (lower) semifinal losing sum
    const third = (semi1.sums[semi1.loser.name] < semi2.sums[semi2.loser.name])
      ? semi1.loser : semi2.loser;

    // Save bracket
    gameState.championship = {
      seeds: seeds.map(s => s.name),
      semis: [
        { A: A.name, B: B.name, winner: semi1.winner.name, sums: semi1.sums },
        { A: C.name, B: D.name, winner: semi2.winner.name, sums: semi2.sums },
      ],
      final: { A: semi1.winner.name, B: semi2.winner.name, winner: finalRes.winner.name, sums: finalRes.sums },
      podium: { first: finalRes.winner.name, second: (finalRes.winner.name === semi1.winner.name ? semi2.winner.name : semi1.winner.name), third: third.name }
    };

    // --- Simple bracket UI ---
    addText(this, 400, 60, 'State Championship (400m)', { fontSize: '28px' }).setOrigin(0.5);

    const rowY = [160, 240, 320, 400];
    addText(this, 140, rowY[0], `1) ${A.name}`, { fontSize: '16px' }).setOrigin(0, 0.5);
    addText(this, 140, rowY[1], `4) ${B.name}`, { fontSize: '16px' }).setOrigin(0, 0.5);
    addText(this, 140, rowY[2], `2) ${C.name}`, { fontSize: '16px' }).setOrigin(0, 0.5);
    addText(this, 140, rowY[3], `3) ${D.name}`, { fontSize: '16px' }).setOrigin(0, 0.5);

    addText(this, 400, 200, `Winner: ${semi1.winner.name}`, { fontSize: '14px', fill: '#0f0' }).setOrigin(0.5);
    addText(this, 400, 360, `Winner: ${semi2.winner.name}`, { fontSize: '14px', fill: '#0f0' }).setOrigin(0.5);

    addText(this, 640, 280, `Final: ${finalRes.winner.name}`, { fontSize: '18px', fill: '#ff0' }).setOrigin(0.5);
    addText(this, 640, 320, `Runner-up: ${gameState.championship.podium.second}`, { fontSize: '14px' }).setOrigin(0.5);
    addText(this, 640, 350, `Third: ${gameState.championship.podium.third}`, { fontSize: '14px' }).setOrigin(0.5);

    createNextButton(this, 'PodiumScene', 720, 560);
  }
}
