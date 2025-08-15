import { gameState } from '../gameState.js';
import { npcAutoTrainForNewWeek } from './balance.js';


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
  fontSize: '20px',
  fill: '#fff'
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

    npcAutoTrainForNewWeek({});

    // apply returns scheduled for this week
    gameState.pendingReturns = gameState.pendingReturns.filter(ret => {
      if (ret.week === gameState.currentWeek) {
        const a = gameState.athletes.find(x => x.name === ret.name);
        if (a) {
          a.speed += ret.speedGain;
          a.stamina += ret.staminaGain;
        }
        return false; // remove from queue
      }
      return true;
    });

    // clear daily flags
    gameState.shopDiscountToday = 0;
    gameState.unavailableThisWeek = {};

    if (gameState.currentWeek >= gameState.schedule.length) {
      // all 14 weeks done
      return 'StateChampionshipScene';
    }
    else {
      return 'SeasonOverviewScene';

    }
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
    .setInteractive(); button.on('pointerdown', () => {
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

/*
export function getNextScene() {
  const isMeetDay = gameState.daysOfWeek[gameState.currentDayIndex] === 'Saturday';

  if (isMeetDay) {
    return 'EndOfWeekScene';
  } else {
    return 'SeasonOverviewScene';
  }
}
*/

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
          duration: 200,
        });
      }
    });
  } else {
    gameState.currentMusic = scene.sound.add(key, { loop: true, volume: 0.5 });
    gameState.currentMusic.play();
  }
}

export function addAthleteHUD(scene, x, y, athlete) {
  // 1) sum up any buffNextRace for speed/stamina
    const speedBuff = gameState.activeBuffs
    .filter(b => b.athleteName === athlete.name && b.type === 'buffNextRace' && b.stat === 'speed')
    .reduce((sum, b) => sum + b.amount, 0);

  const stmBuff = gameState.activeBuffs
    .filter(b => b.athleteName === athlete.name && b.type === 'buffNextRace' && b.stat === 'stamina')
    .reduce((sum, b) => sum + b.amount, 0);

  const displaySpeed = athlete.speed + speedBuff;
  const displayStm   = athlete.stamina + stmBuff;

  // Container ~30px behind sprite
  const c = scene.add.container(x - 30, y);

  // HUD background
  const bg = scene.add.rectangle(0, 0, 170, 66, 0x222222).setOrigin(0.5);
  c.add(bg);

  // Speed text
  const speedText = scene.add
    .text(-75, -10, `Spd ${displaySpeed.toFixed(1)}`, { fontSize: '14px', fill: '#fff' })
    .setOrigin(0, 0.5);

  // Stamina bar + text
  const stmBg   = scene.add.rectangle(-45, 10, 80, 6, 0x555555).setOrigin(0, 0.5);
  const stmBarW = 80 * (Math.min(displayStm, athlete.stamina) / Math.max(1, athlete.stamina));
  const stmBar  = scene.add.rectangle(-45, 10, stmBarW, 6, 0x44c236).setOrigin(0, 0.5);
  const stmLbl  = scene.add.text(-75, 10, 'Stm', { fontSize: '14px', fill: '#fff' }).setOrigin(0, 0.5);
  const stmText = scene.add.text(40, 10, `${Math.round(displayStm)}/${athlete.stamina}`, { fontSize: '14px', fill: '#fff' }).setOrigin(0, 0.5);
  const xpText = scene.add.text(-75, 25, `XP`, { fontSize: '14px', fill: '#fff' }).setOrigin(0, 0.5);
  const ablText = scene.add.text(15, -25, `Abils:`, { fontSize: '14px', fill: '#fff' }).setOrigin(0, 0.5);

  c.add([speedText, stmBg, stmBar, stmText, stmLbl, xpText, ablText]);

  // ---------- Ability slots (top row) ----------
  athlete.maxAbilitySlots ||= 1;
  athlete.abilities       ||= [];

  const slotsY  = -10;          // row for slots (raised a bit)
  const gap     = 18;
  const slotsN  = Math.max(1, athlete.maxAbilitySlots);
  const slotsW  = (slotsN - 1) * gap;
  const startX  = -slotsW / 2;

  const slots = [];
  for (let i = 0; i < slotsN; i++) {
    const rect = scene.add.rectangle(startX+20 + i * gap, slotsY, 14, 14, 0x000000, 0.4)
      .setStrokeStyle(1, 0xaaaaaa)
      .setOrigin(0.5)
      .setInteractive({ dropZone: true })
      .setData('type', 'abilitySlot')
      .setData('athleteName', athlete.name)
      .setData('slotIndex', i);

    c.add(rect);
    slots.push(rect);

    const equipped = athlete.abilities[i];
    if (equipped) {
      const t = scene.add.text(rect.x, rect.y, equipped.code, {
        fontSize: '10px', fill: '#ff0', backgroundColor: '#222', padding: 1
      }).setOrigin(0.5);
      c.add(t);
      rect.setData('label', t);
      rect.setData('instId', equipped.instId);
    }
  }

  // ---------- XP squares (bottom row) ----------
  const xpSquares = [];
  // If you intend "xp needed = level + 1", use athlete.level; if you really want grade-based, keep your old calc.
  const needed   = (athlete.level ?? 1) + 1;  // or: athlete.grade + 2
  const size     = 6;
  const gapX     = 2;
  const xpY      = 28; // lower than slots to avoid overlap
  const totalW   = needed * (size + gapX);

  for (let i = 0; i < needed; i++) {
    const localX = -totalW / 2 + i * (size + gapX);
    const filled = (athlete.exp?.xp ?? 0) > i;
    const sq = scene.add.rectangle(localX-35, xpY-5, size, size, filled ? 0x00ddff : 0x555555)
      .setOrigin(0, 0.5);
    c.add(sq);
    xpSquares.push(sq);
  }

  return { container: c, speedText, stmBar, stmText, xpSquares, slots };
}

