import { addText, createNextButton } from '../utils/uiHelpers.js';
import { gameState, hardResetGameState } from '../gameState.js';

export default class PodiumScene extends Phaser.Scene {
  constructor() { super('PodiumScene'); }

  create() {
    const { first, second, third } = gameState.championship?.podium || {};
    addText(this, 400, 80, '🏆 State Champions 🏆', { fontSize: '32px' }).setOrigin(0.5);

    // Simple podium (center-high, left-mid, right-low)
    const baseY = 400;
    const colX = { second: 300, first: 400, third: 500 };
    const heights = { first: 160, second: 120, third: 90 };

    this.add.rectangle(colX.second, baseY - heights.second / 2, 120, heights.second, 0x8888ff).setOrigin(0.5);
    this.add.rectangle(colX.first,  baseY - heights.first  / 2, 140, heights.first,  0xffdd55).setOrigin(0.5);
    this.add.rectangle(colX.third,  baseY - heights.third  / 2, 120, heights.third,  0xcccccc).setOrigin(0.5);

    addText(this, colX.first,  baseY - heights.first  - 20,  first  || '—', { fontSize: '20px' }).setOrigin(0.5);
    addText(this, colX.second, baseY - heights.second - 20, second || '—', { fontSize: '16px' }).setOrigin(0.5);
    addText(this, colX.third,  baseY - heights.third  - 20, third  || '—', { fontSize: '16px' }).setOrigin(0.5);

    // New Run button
    const newRun = addText(this, 400, 520, 'Start New Run', { fontSize: '22px', fill: '#0f0', backgroundColor: '#222', padding: 6 })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        if (typeof hardResetGameState === 'function') {
          hardResetGameState(); // see below
          this.scene.start('SeasonOverviewScene'); // fresh loop
        } else {
          // ultimate fallback
          window.location.reload();
        }
      });
  }
}
