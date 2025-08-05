// src/Scenes/AbilitySelectionScene.js
//import Phaser from 'phaser';
import { addBackground } from '../utils/sceneHelpers.js';
import { addText } from '../utils/uiHelpers.js';
import { ALL_ABILITIES } from '../utils/abilities.js';
import { gameState } from '../gameState.js';

export default class AbilitySelectionScene extends Phaser.Scene {
  constructor() {
    super('AbilitySelectionScene');
  }

  create(data) {
    const { athleteName } = data || {};
    const athlete = gameState.athletes.find(a => a.name === athleteName);
    if (!athlete) {
      this.scene.resume('PracticePreparationScene');
      return;
    }

    // base background
    addBackground(this);

    // translucent overlay to dim gym
    this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.6)
      .setOrigin(0.5)
      .setDepth(1);

    // header text
    addText(this, 400, 60, `${athleteName} Leveled Up!`, {
      fontSize: '32px', fill: '#fff'
    })
      .setOrigin(0.5)
      .setDepth(2);

    // jumping sprite animation
    const key = athlete.spriteKeyx2;
    // create jump animation if not exists
    if (!this.anims.exists(`jump-${key}`)) {
      this.anims.create({
        key: `jump-${key}`,
        frames: this.anims.generateFrameNumbers(key, { start: 1, end: 4 }),
        frameRate: 6,
        repeat: -1
      });
    }
    const jumper = this.add
      .sprite(400, 150, key)
      .setScale(2)
      .setDepth(2);
    jumper.play(`jump-${key}`);

    // tooltip for ability descriptions
    this.tooltip = addText(this, 0, 0, '', {
      fontSize: '14px', fill: '#fff', backgroundColor: '#000',
      padding: { x: 4, y: 2 }
    })
      .setVisible(false)
      .setDepth(10);

    // pick three random abilities the athlete doesn't already have
    const available = ALL_ABILITIES.filter(ab =>
      !athlete.abilities.some(a2 => a2.code === ab.code)
    );
    Phaser.Utils.Array.Shuffle(available);
    const picks = available.slice(0, 3);

    // layout choice squares
    const startX = 200;
    const gapX = 200;
    const yPos = 300;

    picks.forEach((ab, i) => {
      const x = startX + i * gapX;

      // square background
      const square = this.add
        .rectangle(x, yPos, 80, 80, 0x333333)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2);

      // code label
      addText(this, x, yPos, ab.code, {
        fontSize: '24px', fill: '#fff'
      })
        .setOrigin(0.5)
        .setDepth(3);

      // hover tooltip
      square.on('pointerover', () => {
        this.tooltip
          .setText(`${ab.name}\n${ab.desc}`)
          .setPosition(x-100, yPos + 50)
          .setVisible(true);
      });
      square.on('pointerout', () => {
        this.tooltip.setVisible(false);
      });

      // click to select
      square.on('pointerdown', () => {
        athlete.abilities.push(ab);
        this.scene.stop();
        this.scene.resume('PracticePreparationScene');
      });
    });
  }
}
