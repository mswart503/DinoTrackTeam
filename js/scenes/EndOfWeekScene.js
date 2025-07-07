import { createNextButton, advanceDay } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';

export default class EndOfWeekScene extends Phaser.Scene {
    constructor() {
        super('EndOfWeekScene');
    }

    create() {
        this.add.text(400, 300, `End of Week ${gameState.currentWeek}`, { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        
        let nextScene;
        if (gameState.currentWeek === gameState.totalWeeks) {
            if (gameState.madeState) {
                gameState.totalWeeks += gameState.stateWeeks;
                nextScene = 'SeasonOverviewScene';
            } else {
                nextScene = 'OffseasonPlanningScene';
            }
        } else if (gameState.currentWeek > gameState.totalWeeks) {
            nextScene = 'OffseasonPlanningScene';
        } else {
            nextScene = 'SeasonOverviewScene';
        }
        gameState.money = (gameState.money||0) + 10;

        createNextButton(this, nextScene);
        advanceDay();
    }
}
