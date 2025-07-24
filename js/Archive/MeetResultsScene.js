import { createNextButton, advanceDay } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';

export default class MeetResultsScene extends Phaser.Scene {
    constructor() {
        super('MeetResultsScene');
    }

    create() {
        this.add.text(400, 300, 'Meet Results', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        
        let nextScene = 'SeasonOverviewScene';
        if (gameState.currentWeek > gameState.totalWeeks) {
            nextScene = gameState.madeState ? 'StateChampionshipScene' : 'OffseasonPlanningScene';
        }

        createNextButton(this, nextScene);
        advanceDay();
    }
}
