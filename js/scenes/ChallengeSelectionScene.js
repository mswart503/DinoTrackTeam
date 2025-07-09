// src/Scenes/ChallengeSelectionScene.js
import { gameState } from '../gameState.js';

export default class ChallengeSelectionScene extends Phaser.Scene {
  constructor() {
    super('ChallengeSelectionScene');
  }

  create() {
    // 1) Pick a random challenger from another school
    const otherSchools = gameState.schools.filter(
      s => s.name !== gameState.playerSchool
    );
    const challengerSchool = Phaser.Utils.Array.GetRandom(otherSchools);
    const challenger = Phaser.Utils.Array.GetRandom(challengerSchool.athletes);

    // 2) Pick a random distance
    const distances = ['100m', /*'200m', '400m'*/]; //Temp removing 200 & 400 m so practice races are faster
    const distanceLabel = Phaser.Utils.Array.GetRandom(distances);

    // Store for later
    this.challenger = challenger;
    this.distanceLabel = distanceLabel;

    // 3) Header
    this.add
      .text(400, 40, 'Weekly Challenge', { fontSize: '32px', fill: '#fff' })
      .setOrigin(0.5);

    // 4) Challenger info
    this.add
      .text(400, 80, `From: ${challengerSchool.name}`, {
        fontSize: '20px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    this.add
      .sprite(400, 140, challenger.spriteKey)
      .setScale(2)
      .setOrigin(0.5);

    this.add
      .text(400, 200, challenger.name, {
        fontSize: '18px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    this.add
      .text(400, 230, `Distance: ${distanceLabel}`, {
        fontSize: '16px',
        fill: '#aaa',
      })
      .setOrigin(0.5);

    // 5) Prompt
    this.add
      .text(400, 280, 'Pick your athlete to race:', {
        fontSize: '20px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    // 6) Show player athletes and make them clickable
    const startX = 150;
    const colWidth = 200;
    gameState.athletes.forEach((athlete, i) => {
      const x = startX + i * colWidth;
      const y = 340;

      // Sprite
      const sprite = this.add
        .sprite(x, y, athlete.spriteKey)
        .setScale(2)
        .setInteractive();

      // Name
      this.add
        .text(x, y + 60, athlete.name, {
          fontSize: '16px',
          fill: '#fff',
        })
        .setOrigin(0.5);

      // Show PR for the selected distance, if any
      const pr = athlete.prs[distanceLabel];
      const prText = pr ? `${pr.toFixed(1)}s PR` : 'No PR';
      this.add
        .text(x, y + 80, prText, {
          fontSize: '14px',
          fill: '#aaa',
        })
        .setOrigin(0.5);

      // Selection handler
      sprite.on('pointerdown', () => {
        this.scene.start('ChallengeRaceScene', {
          playerAthleteName: athlete.name,
          challenger: challenger,
          distance: distanceLabel,
        });
      });

      // Hover feedback
      sprite.on('pointerover', () => sprite.setTint(0x8888ff));
      sprite.on('pointerout', () => sprite.clearTint());
    });
  }
}
