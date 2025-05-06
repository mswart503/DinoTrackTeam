import { createNextButton } from '../utils/uiHelpers.js';

export default class MorningScene extends Phaser.Scene {
    constructor() {
        super('MorningScene');
    }

    create() {
        this.add.text(400, 300, 'Morning Time', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'PracticePreparationScene');
    }
}
