// src/Scenes/ChallengeRaceScene.js
import { advanceDay, createNextButton, getNextScene } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';


/*
How to tune:
STAMINA_DRAIN_RATE

Lower (<1) → stamina lasts longer than its nominal seconds.

Higher (>1) → drains faster.

STAMINA_SPEED_EFFECT

Lower (<0.8) → stamina matters less for speed (more floor).

Higher (>0.8) → stamina has bigger impact.

With these two constants you can keep your athlete’s raw stamina numbers small (say 5–8) 
but have races still feel fast. Adjust STAMINA_DRAIN_RATE until 100m takes ~8–12 s, 
and tweak STAMINA_SPEED_EFFECT so slowdown happens gradually.
*/

const finishLine = 700;
const SPEED_MULTIPLIER = 2.5;
const STAMINA_DRAIN_RATE = 0.5;  // drains at half-speed (so 10 stamina lasts 20s)
const STAMINA_SPEED_EFFECT = 0.8;  // only 80% of topSpeed is modulated by stamina
// (20% is a guaranteed floor)
export default class ChallengeRaceScene extends Phaser.Scene {
    constructor() {
        super('ChallengeRaceScene');
    }

    init(data) {
        // Expect data: { playerAthleteName, challengerName, distance: '100m'|'200m'|'400m' }
        this.playerAthlete = gameState.athletes.find(a => a.name === data.playerAthleteName);
        this.challenger = data.challenger;
        this.distanceLabel = data.distance;
    }

    create() {
        addBackground(this);

        this.add.text(400, 40, `${this.distanceLabel} Challenge!`, {
            fontSize: '32px', fill: '#fff'
        }).setOrigin(0.5);

        // draw finish line
        this.add.line(finishLine, 100, 0, 0, 0, 300, 0xffffff).setOrigin(0.5, 0);

        // build two runners
        const distance = parseInt(this.distanceLabel);
        this.runners = [this.playerAthlete, this.challenger].map((athlete, i) => {
            const y = 230 + i * 60;
            const sprite = this.add.sprite(100, y, athlete.spriteKeyx2).setScale(2);
            this.anims.create({
                key: `${athlete.spriteKeyx2}-run`,
                frames: this.anims.generateFrameNumbers(athlete.spriteKeyx2, { start: 4, end: 10 }),
                frameRate: 10, repeat: -1
            });
            sprite.play(`${athlete.spriteKeyx2}-run`);

            const barBg = this.add.rectangle(100, y - 20, 60, 8, 0x555555).setOrigin(0.5);
            const bar = this.add.rectangle(100, y - 20, 60, 8, 0x00ff00).setOrigin(0.5);

            const name = this.add.text(100, y - 40, athlete.name, {
                fontSize: '14px', fill: '#fff'
            }).setOrigin(0.5);

            return {
                athlete,
                sprite,
                staminaBar: bar,
                xPos: 100, yPos: y,
                stamina: athlete.stamina,
                timeElapsed: 0,
                distanceLeft: distance,
                finished: false
            };
        });
        // start at 1x speed
        this.speedMultiplier = 1;

        // display & buttons
        this.add.text(620, 10, 'Speed:', { fontSize: '14px', fill: '#fff' });
        this.ffLabel = this.add.text(680, 10, `${this.speedMultiplier}x`, {
            fontSize: '14px', fill: '#ff0'
        }).setOrigin(0.5);

        const dec = this.add.text(650, 30, '–', { fontSize: '18px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.speedMultiplier = Math.max(1, this.speedMultiplier - 1);
                this.ffLabel.setText(`${this.speedMultiplier}x`);
            });

        const inc = this.add.text(710, 30, '+', { fontSize: '18px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.speedMultiplier = Math.min(20, this.speedMultiplier + 1);
                this.ffLabel.setText(`${this.speedMultiplier}x`);
            });

        // After you build this.runners = [ … ] in create():
        this.runners.forEach(runner => {
            // grab & attach any next‐race buffs for this athlete
            runner.raceBuffs = gameState.activeBuffs.filter(b =>
                b.athleteName === runner.athlete.name && b.type === 'buffNextRace'
            );
        });
        // remove them so they don’t carry into the next event
        gameState.activeBuffs = gameState.activeBuffs.filter(b => b.type !== 'buffNextRace');

        this.simulateOneOnOne(distance);
    }

    simulateOneOnOne(distance) {
        let resultsShown = false;
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                const timeStep = 0.1 * this.speedMultiplier;
                let allDone = true;

                this.runners.forEach(runner => {
                    if (runner.finished) return;
                    allDone = false;

                    // --- NEW: Gather this runner’s race buffs ---
                    let drainRate = STAMINA_DRAIN_RATE;  // base drain rate
                    let noDrainSecs = 0;                   // seconds at start with zero drain
                    let speedBonus = 0;                   // flat speed bonus next race

                    runner.raceBuffs.forEach(b => {
                        if (b.buff === 'drainReduce') drainRate *= (1 - b.amount);
                        if (b.buff === 'noDrainFirst') noDrainSecs = b.amount;
                        if (b.stat === 'speed') speedBonus += b.amount;
                    });

                    // --- 1) Drain stamina (with no‐drain window) ---
                    if (runner.timeElapsed >= noDrainSecs) {
                        runner.stamina = Math.max(0, runner.stamina - timeStep * drainRate);
                    }
                    const ratio = runner.stamina / runner.athlete.stamina;

                    // --- 2) Recompute top speed including +speed buffs ---
                    const baseMax = runner.athlete.speed + speedBonus;
                    const floor = baseMax * (1 - STAMINA_SPEED_EFFECT);
                    const scaled = baseMax * STAMINA_SPEED_EFFECT * ratio;
                    const variation = (Math.random() - 0.5);
                    const actualSpeed = Math.max(0, floor + scaled + variation);

                    // --- 3) Advance as before ---
                    runner.timeElapsed += timeStep;
                    runner.distanceLeft -= actualSpeed * timeStep;
                    runner.xPos += (finishLine - 100) * (actualSpeed * timeStep / distance);
                    runner.sprite.x = runner.xPos;

                    // --- 4) Update the stamina bar & color ---
                    const pct = runner.stamina / runner.athlete.stamina;
                    runner.staminaBar.width = pct * 60;
                    runner.staminaBar.fillColor = pct < 0.3 ? 0xff0000 : (pct < 0.6 ? 0xffff00 : 0x00ff00);

                    // --- 5) Finish check (unchanged) ---
                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.finishTime = runner.timeElapsed;
                        runner.sprite.x = finishLine;
                    }
                });


                if (allDone && !resultsShown) {
                    resultsShown = true;
                    this.showResult();
                }
            }
        });
    }

    showResult() {
        // sort by finishTime
        const [first, second] = this.runners.sort((a, b) => a.finishTime - b.finishTime);
        const playerWon = first.athlete.name === this.playerAthlete.name;

        // award money
        if (playerWon) gameState.money = (gameState.money || 0) + 5;

        // display outcome
        const msg = playerWon
            ? `You win! +$5  ( ${first.finishTime.toFixed(1)}s vs ${second.finishTime.toFixed(1)}s )`
            : `You lose... ( ${first.finishTime.toFixed(1)}s vs ${second.finishTime.toFixed(1)}s )`;
        this.add.text(400, 450, msg, { fontSize: '20px', fill: playerWon ? '#0f0' : '#f00' })
            .setOrigin(0.5);

        // next button
        this.time.delayedCall(1500, () => {
            advanceDay();
            createNextButton(this, getNextScene(), 400, 520);
        });
    }
}
