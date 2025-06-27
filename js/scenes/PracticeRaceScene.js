import { createNextButton, getNextScene, advanceDay } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';

const finishLine = 700;
let leaderboardActive = false;
const SPEED_MULTIPLIER = 2.5; // Try 2.5x faster, tweak to taste


export default class PracticeRaceScene extends Phaser.Scene {
    constructor() {
        super('PracticeRaceScene');
        this.distances = ['100m', '200m', '400m'];
        this.currentIndex = 0;
    }

    create() {
        leaderboardActive = false;
        this.distanceGroups = {
            '100m': [],
            '200m': [],
            '400m': []
        };

        // Group athletes by assigned distance
        gameState.athletes.forEach(athlete => {
            const assigned = gameState.practiceRaceAssignments[athlete.name];
            if (this.distanceGroups[assigned]) {
                this.distanceGroups[assigned].push(athlete);
            }
        });

        this.distancesToRun = this.distances.filter(dist => this.distanceGroups[dist].length > 0);
        this.currentIndex = 0;

        advanceDay();
        this.runNextRace();
    }

    runNextRace() {
        leaderboardActive = false;

        if (this.currentIndex >= this.distancesToRun.length) {
            const nextScene = getNextScene();
            createNextButton(this, nextScene, 400, 500);
            return;
        }

        const distance = this.distancesToRun[this.currentIndex];
        this.runRace(distance);
        this.currentIndex++;
    }

    runRace(distanceLabel) {
        this.children.removeAll();
        this.add.text(400, 40, `${distanceLabel} Practice Race`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.line(finishLine, 100, 0, 0, 0, 300, 0xffffff).setOrigin(0.5, 0);

        const distance = parseInt(distanceLabel);
        const athletes = this.distanceGroups[distanceLabel];

        this.runners = athletes.map((athlete, i) => {
            const sprite = this.add.sprite(100, 150 + i * 80, athlete.spriteKey).setScale(2);
            const staminaBarBg = this.add.rectangle(100, 130 + i * 80, 60, 8, 0x555555).setOrigin(0.5);
            const staminaBar = this.add.rectangle(100, 130 + i * 80, 60, 8, 0x00ff00).setOrigin(0.5);
            const nameText = this.add.text(100, 150 + i * 80 - 40, `${athlete.name}`, {
                fontSize: '14px',
                fill: '#fff'
            }).setOrigin(0.5);

            const prKey = this.distances[this.currentIndex];
            const prTime = athlete.prs[prKey]?.toFixed(1) || '—';
            const prText = this.add.text(100, 150 + i * 80 - 30, `PR: ${prTime}s`, {
                fontSize: '12px',
                fill: '#aaa'
            }).setOrigin(0.5);
            const prCountdown = this.add.text(100, 35, '', {
                fontSize: '12px',
                fill: '#ff0'
            }).setOrigin(0.5);


            this.anims.create({
                key: `${athlete.spriteKey}-run`,
                frames: this.anims.generateFrameNumbers(athlete.spriteKey, { start: 4, end: 10 }),
                frameRate: 10,
                repeat: -1,
            });
            sprite.play(`${athlete.spriteKey}-run`);

            return {
                athlete,
                sprite,
                staminaBar,
                prCountdown,
                xPos: 100,
                yPos: 150 + i * 80,
                stamina: athlete.stamina,
                strideFreq: 0,
                distanceLeft: distance,
                timeElapsed: 0,
                finished: false,
                label: distanceLabel
            };
        });

        this.simulateRace();
    }

    simulateRace() {
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                let allFinished = true;
                const timeStep = 0.1 * SPEED_MULTIPLIER;
    
                this.runners.forEach(runner => {
                    if (runner.finished) return;
                    allFinished = false;
    
                    // Update display timer
                    runner.timeElapsed += timeStep;
                    runner.prCountdown.setText(`Time: ${runner.timeElapsed.toFixed(1)}s`);
    
                    // Color timer red if exceeding PR
                    const prKey = this.distances[this.currentIndex];
                    const prTime = runner.athlete.prs[prKey];
                    if (prTime && runner.timeElapsed > prTime) {
                        runner.prCountdown.setFill('#f00');
                    } else {
                        runner.prCountdown.setFill('#ff0');
                    }
    
                    // Drain stamina
                    runner.stamina -= timeStep;
                    runner.stamina = Math.max(0, runner.stamina);
                    const staminaRatio = runner.stamina / runner.athlete.stamina;
    
                    // Calculate speed with 20% minimum
                    const maxSpeed = runner.athlete.speed;
                    const reducedPortion = maxSpeed * 0.8;
                    const baseSpeed = maxSpeed * 0.2 + (reducedPortion * staminaRatio);
                    const variation = (Math.random() * 1.0) - 0.5;
                    const actualSpeed = Math.max(0, baseSpeed + variation);
    
                    // Move runner
                    runner.distanceLeft -= actualSpeed * timeStep;
                    runner.xPos += (finishLine - 100) * (actualSpeed * timeStep / parseInt(runner.label));
                    runner.sprite.x = runner.xPos;
    
                    // Update stamina bar
                    runner.staminaBar.width = (runner.stamina / runner.athlete.stamina) * 60;
                    if (runner.stamina / runner.athlete.stamina < 0.3) {
                        runner.staminaBar.fillColor = 0xff0000;
                    } else if (runner.stamina / runner.athlete.stamina < 0.6) {
                        runner.staminaBar.fillColor = 0xffff00;
                    }
    
                    // Finish
                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.sprite.x = finishLine;
                        runner.finishTime = runner.timeElapsed;
    
                        if (!runner.athlete.prs[prKey] || runner.finishTime < runner.athlete.prs[prKey]) {
                            runner.athlete.prs[prKey] = runner.finishTime;
                            runner.athlete.setNewPR = true;
                        } else {
                            runner.athlete.setNewPR = false;
                        }
    
                        this.anims.create({
                            key: `${runner.athlete.spriteKey}-jump`,
                            frames: this.anims.generateFrameNumbers(runner.athlete.spriteKey, { start: 0, end: 3 }),
                            frameRate: 5,
                            repeat: -1,
                        });
                        runner.sprite.play(`${runner.athlete.spriteKey}-jump`);
    
                        this.tweens.add({
                            targets: runner.sprite,
                            y: runner.yPos - 10,
                            yoyo: true,
                            repeat: -1,
                            duration: 300,
                        });
                    }
                });
    
                if (allFinished && !leaderboardActive) {
                    const distanceStr = this.distances[this.currentIndex];
                    this.showLeaderboard(this.runners, distanceStr);
                }
            }
        });
    }

    showLeaderboard(runners, distanceStr) {
        if (leaderboardActive) return; // ❌ Skip if already shown
        leaderboardActive = true;

        const sorted = [...runners].sort((a, b) => a.finishTime - b.finishTime);
        sorted.forEach((runner, i) => {
            const pr = runner.athlete.prs[distanceStr];
            const note = runner.athlete.setNewPR
                ? '✨ NEW PR!'
                : (pr ? ` (PR: ${pr.toFixed(1)}s)` : ' (No PR)');

            this.add.text(400, 450 + i * 25,
                `${i + 1}. ${runner.athlete.name} - ${runner.finishTime.toFixed(1)}s ${note}`,
                { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        });

        // 🔁 Ensure we move to the next race after a short delay
        this.time.delayedCall(2000, () => {
            this.runNextRace();
        });
    }

}
