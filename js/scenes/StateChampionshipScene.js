import { createNextButton } from '../utils/uiHelpers.js';

export default class StateChampionshipScene extends Phaser.Scene {
    constructor() {
        super('StateChampionshipScene');
    }

    create() {
        this.add.text(400, 300, 'State Championship', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'GameOverScene');
    }
}
