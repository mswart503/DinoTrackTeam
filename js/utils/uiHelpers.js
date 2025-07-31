import { gameState } from '../gameState.js';

// Define the natural weekly loop:
const weeklyFlow = [
  'SeasonOverviewScene',
  'MorningScene',
  'PracticePreparationScene',
  /*'PracticeResultsScene',*/
  'ChallengeSelectionScene',
  'ChallengeRaceScene'
];

export const defaultTextStyle = {
  fontFamily: 'MyCustomFont',
  fontSize:   '20px',
  fill:       '#fff'
};

export function addText(scene, x, y, content, styleOverrides = {}) {
  return scene.add.text(x, y, content, {
    ...defaultTextStyle,
    ...styleOverrides
  });
}

export function getNextWeeklyScene(currentKey) {
  const idx = weeklyFlow.indexOf(currentKey);
  // After the last, loop back to overview
  if (idx === -1 || idx === weeklyFlow.length - 1) {
    // increment week before returning to overview
    gameState.currentWeek++;
    return 'SeasonOverviewScene';
  }
  return weeklyFlow[idx + 1];
}

export function createNextButton(scene, nextSceneName, posx = 400, posy = 500) {
  const button = addText(
    scene,
    posx,
    posy,
    'Next',
    { fontSize: '32px', fill: '#0f0' }
  )
    .setOrigin(0.5)
    .setInteractive();    button.on('pointerdown', () => {
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

// utils/uiHelpers.js
export function addAthleteHUD(scene, x, y, athlete) {
  // container 30px behind the sprite
  const c = scene.add.container(x - 30, y);

  // 1) dark box
  const bg = scene.add.rectangle(0, 0, 170, 60, 0x222222).setOrigin(0.5);
  c.add(bg);

  // 2) speed as text
  const speedText = scene.add
    .text(-50, -10, `Spd 0/${athlete.speed}`, { fontSize:'14px', fill:'#fff' })
    .setOrigin(0, 0.5);
  c.add(speedText);

  // 3) stamina bar + text
  const stmBg   = scene.add.rectangle(-45,  10, 80, 6, 0x555555).setOrigin(0,0.5);
  const stmBar  = scene.add.rectangle(-45,  10, 80, 6, 0x44c236).setOrigin(0,0.5);
  const stmLbl = scene.add
    .text(-75,  10, 'Stm', { fontSize:'14px', fill:'#fff' })
    .setOrigin(0, 0.5);
  const stmText = scene.add
    .text( 40,  10, `${athlete.stamina}/${athlete.stamina}`, { fontSize:'14px', fill:'#fff' })
    .setOrigin(0,0.5);
  c.add([stmBg, stmBar, stmText, stmLbl]);

  // 4) xp squares
  const xpSquares = [];
  const needed    = athlete.grade + 2;
  const size      = 6;
  const totalW    = needed * (size + 2);

  for (let i = 0; i < needed; i++) {
    const localX = -totalW/2 + i*(size + 2);
    const filled = athlete.exp.xp > i;
    const sq = scene.add
      .rectangle(localX, 22, size, size, filled ? 0x00ddff : 0x555555)
      .setOrigin(0, 0.5);
    xpSquares.push(sq);
    c.add(sq);
  }

  return { container: c, speedText, stmBar, stmText, xpSquares };
}

