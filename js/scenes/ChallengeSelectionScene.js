// src/Scenes/ChallengeSelectionScene.js
//import Phaser from 'phaser';
import { gameState } from '../gameState.js';

export default class ChallengeSelectionScene extends Phaser.Scene {
  constructor() {
    super('ChallengeSelectionScene');
  }

  create() {
    // ——— 1) Determine this week’s opponent from the schedule ———
    const round = gameState.schedule[gameState.currentWeek];
    const pair = round.find(p => p.includes(gameState.playerSchool));
    const opponentName = pair[0] === gameState.playerSchool ? pair[1] : pair[0];

    const opponentSchool = gameState.schools.find(s => s.name === opponentName);
    const opponentAthletes = Phaser.Utils.Array.Shuffle(opponentSchool.athletes).slice(0, 2);

    // Initialize challenge data
    gameState.currentChallenge = {
      opponentName,
      opponentAthletes,
      playerAthletes: []
    };

    // ——— 2) (Optional) pick a distance ———
    // Here we keep only 100m for speed
    this.distanceLabel = '100m';

    // ——— 3) Header & Opponent Info ———
    this.add.text(400, 40, `Week ${gameState.currentWeek + 1} Challenge`, {
      fontSize: '32px', fill: '#fff'
    }).setOrigin(0.5);

    this.add.text(400, 80, `Opponent: ${opponentName}`, {
      fontSize: '20px', fill: '#fff'
    }).setOrigin(0.5);

    // show their two runners
    opponentAthletes.forEach((ath, i) => {
      const x = 300 + i * 200;
      const y = 140;
      this.add.sprite(x, y, ath.spriteKey).setScale(2).setOrigin(0.5);
      this.add.text(x, y + 60, ath.name, {
        fontSize: '16px', fill: '#fff'
      }).setOrigin(0.5);
    });

    this.add.text(400, 260, `Distance: ${this.distanceLabel}`, {
      fontSize: '18px', fill: '#aaa'
    }).setOrigin(0.5);

    // ——— 4) Prompt & Player selection ———
    this.add.text(400, 300, 'Select 2 of your athletes:', {
      fontSize: '20px', fill: '#fff'
    }).setOrigin(0.5);

    const picks = [];
    const startX = 150;
    const spacing = 200;
    gameState.athletes.forEach((ath, i) => {
      const x = startX + i * spacing;
      const y = 360;

      const sprite = this.add.sprite(x, y, ath.spriteKey)
        .setScale(2)
        .setInteractive();

      // name label
      this.add.text(x, y + 60, ath.name, {
        fontSize: '16px', fill: '#fff'
      }).setOrigin(0.5);

      // click to pick / unpick
      sprite.on('pointerdown', () => {
        if (picks.includes(ath)) {
          // deselect
          picks.splice(picks.indexOf(ath), 1);
          sprite.clearTint();
        } else if (picks.length < 2) {
          // select
          picks.push(ath);
          sprite.setTint(0x00ff00);
        }
        // update gameState and Next button
        gameState.currentChallenge.playerAthletes = [...picks];
        const ready = picks.length === 2;
        this.nextBtn.setAlpha(ready ? 1 : 0.5);
        this.nextBtn[ ready ? 'setInteractive' : 'disableInteractive' ]();
      });

      // hover feedback
      sprite.on('pointerover', () => sprite.setTint(0x8888ff));
      sprite.on('pointerout',  () => {
        if (!picks.includes(ath)) sprite.clearTint();
      });
    });

    // ——— 5) Next button (disabled until 2 picks) ———
    this.nextBtn = this.add.text(400, 500, 'Next', {
      fontSize: '24px', fill: '#0f0'
    })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .disableInteractive()
      .on('pointerdown', () => {
        this.scene.start('ChallengeRaceScene', {
          distance:      this.distanceLabel,
          playerAthletes: gameState.currentChallenge.playerAthletes,
          opponentAthletes
        });
      });
  }
}
