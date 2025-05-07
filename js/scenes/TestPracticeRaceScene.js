import { createNextButton, getNextScene, advanceDay } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import RaceTestSetupScene from './RaceTestSetupScene.js';
const finishLine = 700;
let leaderboardActive = false;

export default class TestPracticeRaceScene extends Phaser.Scene {
    constructor() {
        super('TestPracticeRaceScene');
    }

    create() {
        leaderboardActive = false;
        this.add.text(400, 40, 'Practice Race!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        this.add.line(finishLine, 100, 0, 0, 0, 300, 0xffffff).setOrigin(0.5, 0);

        let activeRunners = gameState.athletes.map((athlete, i) => {
            const sprite = this.add.sprite(100, 150 + i * 80, athlete.spriteKey).setScale(2);
            const staminaBarBg = this.add.rectangle(100, 150 + i * 80 - 20, 60, 8, 0x555555).setOrigin(0.5);
            const staminaBar = this.add.rectangle(100, 150 + i * 80 - 20, 60, 8, 0x00ff00).setOrigin(0.5);

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
                xPos: 100,
                yPos: 150 + i * 80,
                stamina: athlete.stamina,
                strideFreq: 0,
                distanceLeft: gameState.testRaceDistance,
                timeElapsed: 0,
                finished: false,
            };
        });

        // Next button
        createNextButton(this, 'RaceTestSetupScene', 700);
        this.add.text(400, 60, `Distance: ${gameState.testRaceDistance}m`, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);


        this.time.addEvent({
            delay: 100,  // every 0.1 sec
            loop: true,
            callback: () => {
                let allFinished = true;

                activeRunners.forEach(runner => {
                    if (runner.finished) return;

                    allFinished = false;

                    // Accelerate stride frequency
                    if (runner.strideFreq < runner.athlete.strideFrequency) {
                        runner.strideFreq += runner.athlete.acceleration * 0.1;
                        if (runner.strideFreq > runner.athlete.strideFrequency) {
                            runner.strideFreq = runner.athlete.strideFrequency;
                        }
                    }

                    let currentSpeed = runner.athlete.strideLength * runner.strideFreq;

                    const paceFluctuation = (Math.random() * 2 - 1) * runner.athlete.paceAccuracy;
                    let effectiveSpeed = Math.max(0, currentSpeed + paceFluctuation);

                    if (runner.stamina <= 0) {
                        effectiveSpeed /= 2;
                    }

                    runner.stamina -= effectiveSpeed * runner.athlete.staminaEfficiency * 0.1;
                    if (runner.stamina < 0) runner.stamina = 0;

                    runner.distanceLeft -= effectiveSpeed * 0.1;
                    runner.timeElapsed += 0.1;

                    // Update position
                    runner.xPos += (finishLine - 100) * (effectiveSpeed * 0.1 / 100);
                    runner.sprite.x = runner.xPos;

                    // Update stamina bar
                    runner.staminaBar.width = (runner.stamina / runner.athlete.stamina) * 60;
                    if (runner.stamina / runner.athlete.stamina < 0.3) {
                        runner.staminaBar.fillColor = 0xff0000;
                    } else if (runner.stamina / runner.athlete.stamina < 0.6) {
                        runner.staminaBar.fillColor = 0xffff00;
                    }

                    // Finish check
                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.sprite.x = finishLine;
                        runner.finishTime = runner.timeElapsed;

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
                //console.log('All finished:', allFinished);
                //console.log('Leaderboard active:', leaderboardActive);
                if (allFinished && !leaderboardActive) {
                    this.showLeaderboard(activeRunners);
                }
            },
        });

    }


    /*   showLeaderboard(raceResults) {
           const sorted = [...raceResults].sort((a, b) => a.time - b.time);
           let yPos = 450;
   
           this.add.text(400, yPos, '🏆 Leaderboard 🏆', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
           yPos += 30;
   
           sorted.forEach((result, index) => {
               const { athlete, time } = result;
               const prNote = athlete.setNewPR ? '✨ NEW PR!' : '';
               const text = `${index + 1}. ${athlete.name} — ${time.toFixed(1)}s ${prNote}`;
               this.add.text(400, yPos, text, { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5);
               yPos += 25;
           });
   */
    showLeaderboard(runners) {
        leaderboardActive = true;
        const sorted = [...runners].sort((a, b) => a.finishTime - b.finishTime);
        const places = ['1st', '2nd', '3rd'];

        sorted.forEach((runner, index) => {
            if (index < 3) {
                this.add.text(finishLine + 40, runner.yPos, places[index], { fontSize: '20px', fill: '#ff0' });
            }

            const prNote = (runner.athlete.personalRecord === null || runner.finishTime < runner.athlete.personalRecord)
                ? '✨ NEW PR!'
                : '';

            this.add.text(400, 450 + index * 30,
                `${index + 1}. ${runner.athlete.name} - ${runner.finishTime.toFixed(1)}s ${prNote}`,
                { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        });

    }


}
