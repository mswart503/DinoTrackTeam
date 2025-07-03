// src/Scenes/ChallengeRaceScene.js
import { advanceDay, createNextButton, getNextScene } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';

const finishLine = 700;
const SPEED_MULTIPLIER = 2.5;

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
        this.add.text(400, 40, `${this.distanceLabel} Challenge!`, {
            fontSize: '32px', fill: '#fff'
        }).setOrigin(0.5);

        // draw finish line
        this.add.line(finishLine, 100, 0, 0, 0, 300, 0xffffff).setOrigin(0.5, 0);

        // build two runners
        const distance = parseInt(this.distanceLabel);
        this.runners = [this.playerAthlete, this.challenger].map((athlete, i) => {
            const y = 150 + i * 100;
            const sprite = this.add.sprite(100, y, athlete.spriteKey).setScale(2);
            this.anims.create({
                key: `${athlete.spriteKey}-run`,
                frames: this.anims.generateFrameNumbers(athlete.spriteKey, { start: 4, end: 10 }),
                frameRate: 10, repeat: -1
            });
            sprite.play(`${athlete.spriteKey}-run`);

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

        this.simulateOneOnOne(distance);
    }

    simulateOneOnOne(distance) {
        let resultsShown = false;
        this.time.addEvent({
            delay: 100, loop: true, callback: () => {
                const timeStep = 0.1 * SPEED_MULTIPLIER;
                let allDone = true;

                this.runners.forEach(runner => {
                    if (runner.finished) return;
                    allDone = false;

                    // 1) drain stamina
                    runner.stamina = Math.max(0, runner.stamina - timeStep);
                    const ratio = runner.stamina / runner.athlete.stamina;

                    // 2) calc speed: 20% floor + 80% scaled + ±0.5 variation
                    const maxS = runner.athlete.speed;
                    const base = maxS * 0.2 + (maxS * 0.8 * ratio);
                    const varn = (Math.random() - 0.5);
                    const actual = Math.max(0, base + varn);

                    // 3) advance
                    runner.timeElapsed += timeStep;
                    runner.distanceLeft -= actual * timeStep;
                    runner.xPos += (finishLine - 100) * (actual * timeStep / distance);
                    runner.sprite.x = runner.xPos;

                    // 4) update bar
                    runner.staminaBar.width = (runner.stamina / runner.athlete.stamina) * 60;
                    runner.staminaBar.fillColor = runner.stamina / runner.athlete.stamina < 0.3
                        ? 0xff0000
                        : (runner.stamina / runner.athlete.stamina < 0.6 ? 0xffff00 : 0x00ff00);

                    // 5) finish
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
