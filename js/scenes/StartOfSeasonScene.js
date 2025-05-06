import { createNextButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';

export default class StartOfSeasonScene extends Phaser.Scene {
    constructor() {
        super('StartOfSeasonScene');
    }

    create() {
        gameState.currentWeek = 1;
        gameState.currentDayIndex = 0;  // 0 = Monday, 5 = Saturday
        gameState.madeState = false;
        this.add.text(400, 300, 'A New Season Starts!', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'SeasonOverviewScene');
    }
}
