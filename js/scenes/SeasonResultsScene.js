// src/Scenes/SeasonResultsScene.js
import { addText } from '../utils/uiHelpers.js';
import { gameState, resetGameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';

export default class SeasonResultsScene extends Phaser.Scene {
  constructor() {
    super('SeasonResultsScene');
  }

  create() {
    addBackground(this);
    this.scene.bringToTop('HUDScene');

    // Final standings (desc)
    const sorted = [...gameState.schools].sort((a, b) => b.points - a.points);
    const playerIdx = sorted.findIndex(s => s.name === gameState.playerSchool);
    const youWon = playerIdx === 0;

    // Title
    addText(this, 400, 60, 'Final Standings', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);

    // Win/Lose banner
    addText(
      this, 400, 110,
      youWon ? 'You won!' : 'Better luck next year',
      { fontSize: '22px', fill: youWon ? '#0f0' : '#ff0' }
    ).setOrigin(0.5);

    // Standings list
    const startY = 160;
    const rowH = 36;
    sorted.forEach((school, i) => {
      const color = (school.name === gameState.playerSchool) ? '#ffea00' : '#ffffff';
      addText(
        this,
        400, startY + i * rowH,
        `${i + 1}. ${school.name} — ${school.points} pts`,
        { fontSize: '18px', fill: color }
      ).setOrigin(0.5);
    });

    // Restart button
    addText(this, 400, 520, 'Start New Run', {
      fontSize: '22px', fill: '#0f0', backgroundColor: '#222', padding: 6
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        resetGameState();                // wipe back to day 1
        this.scene.start('SeasonOverviewScene'); // begin again
      });

    // Optional: small tip
    addText(this, 400, 560, 'Tip: tweak difficulty in balance.js', {
      fontSize: '12px', fill: '#aaa'
    }).setOrigin(0.5);
  }
}
