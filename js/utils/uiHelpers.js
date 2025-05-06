export function createNextButton(scene, nextSceneName, posx = 400, posy = 500) {
    const button = scene.add.text(posx, posy, 'Next', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
    button.on('pointerdown', () => {
        scene.scene.start(nextSceneName);
    });
}

import { gameState } from '../gameState.js';

export function getNextScene() {
    const isMeetDay = gameState.daysOfWeek[gameState.currentDayIndex] === 'Saturday';

    if (isMeetDay) {
        return 'EndOfWeekScene';
    } else {
        return 'SeasonOverviewScene';
    }
}

export function advanceDay() {
    gameState.currentDayIndex += 1;

    if (gameState.currentDayIndex > 5) {  // Sunday is skipped
        gameState.currentDayIndex = 0;
        gameState.currentWeek += 1;
    }
}
