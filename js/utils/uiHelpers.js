export function createNextButton(scene, nextSceneName, posx = 400, posy = 500) {
    const button = scene.add.text(posx, posy, 'Next', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
    button.on('pointerdown', () => {
        scene.scene.start(nextSceneName);
    });
    return button;
}

export function createSkipButton(scene, nextSceneName, posx = 500, posy = 500) {
    const button = scene.add.text(posx, posy, 'Skip', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
    button.on('pointerdown', () => {
        scene.scene.start(nextSceneName);
    });
    return button;

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

export function playBackgroundMusic(scene, key) {
    if (scene.sound && gameState.currentMusic) {
        scene.tweens.add({
            targets: gameState.currentMusic,
            volume: 0,
            duration: 200,
            onComplete: () => {
                gameState.currentMusic.stop();
                gameState.currentMusic = scene.sound.add(key, { loop: true, volume: 0 });
                gameState.currentMusic.play();

                scene.tweens.add({
                    targets: gameState.currentMusic,
                    volume: 0.5,
                    duration:200,
                });
            }
        });
    } else {
        gameState.currentMusic = scene.sound.add(key, { loop: true, volume: 0.5 });
        gameState.currentMusic.play();
    }
}
