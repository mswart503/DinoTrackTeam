import { createNextButton, getNextScene, advanceDay } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
//import RaceTestSetupScene from './RaceTestSetupScene.js';
let leaderboardActive = false;
const finishLine = 700;

export default class TestPracticeRaceScene extends Phaser.Scene {
    constructor() {
        super('TestPracticeRaceScene');
    }

    create() {
        this.add.image(400, 300, 'trackBg');
        this.bg = this.add.tileSprite(400, 300, 800, 1400, 'trackBg');



        leaderboardActive = false;
        createNextButton(this, 'RaceTestSetupScene', 700);
        this.add.text(400, 80, `Distance: ${gameState.testRaceDistance}m`, { fontSize: '28px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' }).setOrigin(0.5);
        this.add.text(400, 40, 'Practice Race!', { fontSize: '32px', fill: '#fff', backgroundColor: 'rgba(0,0,0,0.7)' }).setOrigin(0.5);
        const baseX = 150;
        const maxOffset = 400;  // how far right the lead runner can appear


        let activeRunners = gameState.athletes.map((athlete, i) => {
            const sprite = this.add.sprite(baseX, 150 + i * 80, athlete.spriteKey).setScale(2);
    
            const staminaBarBg = this.add.rectangle(baseX, 150 + i * 80 - 20, 60, 8, 0x555555).setOrigin(0.5);
            const staminaBar = this.add.rectangle(baseX, 150 + i * 80 - 20, 60, 8, 0x00ff00).setOrigin(0.5);
    
            this.anims.create({
                key: `${athlete.spriteKey}-run`,
                frames: this.anims.generateFrameNumbers(athlete.spriteKey, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1,
            });
            sprite.play(`${athlete.spriteKey}-run`);
    
            return {
                athlete,
                sprite,
                staminaBar,
                yPos: 150 + i * 80,
                stamina: athlete.stamina,
                strideFreq: 0,
                distanceLeft: gameState.testRaceDistance,
                timeElapsed: 0,
                finished: false,
            };
        });
    
        // Add finish line marker (optional: use sprite if you have a flag image)
        const finishLineMarker = this.add.rectangle(finishLine, 100, 4, 300, 0xffffff).setOrigin(0.5, 0);
    
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                let allFinished = true;
                let leadProgress = 0;
    
                // Find the lead runner’s progress
                activeRunners.forEach(runner => {
                    const progress = gameState.testRaceDistance - runner.distanceLeft;
                    if (progress > leadProgress) leadProgress = progress;
                });
    
                // Scroll background based on lead runner
                const scrollPercent = leadProgress / gameState.testRaceDistance;
                this.bg.tilePositionX = scrollPercent * 300;
                //finishLineMarker.x = baseX + scrollPercent * maxOffset;
    
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
    
                    // Update horizontal offset relative to lead
                    const progressPercent = (gameState.testRaceDistance - runner.distanceLeft) / gameState.testRaceDistance;
                    runner.sprite.x = baseX + progressPercent * maxOffset;
    
                    // Update stamina bar
                    const staminaRatio = runner.stamina / runner.athlete.stamina;
                    runner.staminaBar.width = staminaRatio * 60;
                    if (staminaRatio < 0.3) {
                        runner.staminaBar.fillColor = 0xff0000;
                    } else if (staminaRatio < 0.6) {
                        runner.staminaBar.fillColor = 0xffff00;
                    }
    
                    // Finish check
                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.sprite.x = finishLineMarker.x;
                        runner.finishTime = runner.timeElapsed;
    
                        // Jump animation
                        this.anims.create({
                            key: `${runner.athlete.spriteKey}-jump`,
                            frames: this.anims.generateFrameNumbers(runner.athlete.spriteKey, { start: 4, end: 5 }),
                            frameRate: 5,
                            repeat: -1,
                        });
                        runner.sprite.play(`${runner.athlete.spriteKey}-jump`);
    
                        this.tweens.add({
                            targets: runner.sprite,
                            y: runner.yPos - 20,
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
                this.add.text(finishLine + 40, runner.yPos, places[index], { fontSize: '20px', fill: '#ff0', backgroundColor: 'rgba(0,0,0,0.7)' });
            }

            const prNote = (runner.athlete.personalRecord === null || runner.finishTime < runner.athlete.personalRecord)
                ? '✨ NEW PR!'
                : '';

            this.add.text(400, 450 + index * 30,
                `${index + 1}. ${runner.athlete.name} - ${runner.finishTime.toFixed(1)}s ${prNote}`,
                { fontSize: '18px', fill: '#fff' , backgroundColor: 'rgba(0,0,0,0.7)'}).setOrigin(0.5);
        });

    }


}
