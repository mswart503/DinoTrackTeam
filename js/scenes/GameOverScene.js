import { createNextButton } from '../utils/uiHelpers.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'TitleScene');
    }
}
