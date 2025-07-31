// src/Scenes/ChallengeSelectionScene.js
//import Phaser from 'phaser';
import { gameState } from '../gameState.js';
import { addText, createNextButton, addAthleteHUD } from '../utils/uiHelpers.js';

export default class ChallengeSelectionScene extends Phaser.Scene {
  constructor() {
    super('ChallengeSelectionScene');
  }

  create() {
    // 0) Background image
    this.add
      .image(400, 300, 'bgChallengeSelect')
      .setOrigin(0.5);

    // 1) Grey overlay (800×600 is your game size)
    this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.5)
      .setOrigin(0.5);
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
    addText(this, 400, 40, `Week ${gameState.currentWeek + 1} Challenge`, {
      fontSize: '32px', fill: '#fff'
    }).setOrigin(0.5);

    addText(this, 400, 80, `Opponent: ${opponentName}`, {
      fontSize: '20px', fill: '#fff'
    }).setOrigin(0.5);

    // show their two runners
    opponentAthletes.forEach((ath, i) => {
      const x = 300 + i * 200;
      const y = 140;
      this.add.sprite(x, y, ath.spriteKeyx2).setScale(2).setOrigin(0.5);
      addText(this,x, y + 60, ath.name, {
        fontSize: '16px', fill: '#fff'
      }).setOrigin(0.5);
      // HUD under the dino
      addAthleteHUD(this, x+40, y+100, ath);

    });

    /*this.add.text(400, 260, `Distance: ${this.distanceLabel}`, {
      fontSize: '18px', fill: '#aaa'
    }).setOrigin(0.5);*/

    // ——— 4) Prompt & Player selection ———
    addText(this, 400, 300, 'Select 2 of your athletes:', {
      fontSize: '20px', fill: '#fff'
    }).setOrigin(0.5);

    const picks = [];
    const startX = 200;
    const spacing = 200;
    gameState.athletes.forEach((ath, i) => {
      const x = startX + i * spacing;
      const y = 360;

      const sprite = this.add.sprite(x, y, ath.spriteKeyx2)
        .setScale(2)
        .setInteractive();

      // name label
      addText(this, x, y + 60, ath.name, {
        fontSize: '16px', fill: '#fff'
      }).setOrigin(0.5);

      addAthleteHUD(this, x+40, y+100, ath);

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
        this.nextBtn[ready ? 'setInteractive' : 'disableInteractive']();
      });

      // hover feedback
      sprite.on('pointerover', () => sprite.setTint(0x8888ff));
      sprite.on('pointerout', () => {
        if (!picks.includes(ath)) sprite.clearTint();
      });
    });

    // ——— 5) Next button (disabled until 2 picks) ———
    this.nextBtn = addText(this, 400, 550, 'Next', {
      fontSize: '24px', fill: '#0f0'
    })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .disableInteractive()
      .on('pointerdown', () => {
        this.scene.start('ChallengeRaceScene', {
          distance: this.distanceLabel,
          playerAthletes: gameState.currentChallenge.playerAthletes,
          opponentAthletes
        });
      });
  }
}
