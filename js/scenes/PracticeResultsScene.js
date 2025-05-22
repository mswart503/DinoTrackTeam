import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { playBackgroundMusic } from '../utils/uiHelpers.js';
import { mapLabelToStatKey, getStatDisplay } from '../utils/statLabelMap.js';
import { trainingEffects } from '../config.js';


export default class PracticeResultsScene extends Phaser.Scene {
    constructor() {
        super('PracticeResultsScene');
    }

    create() {
        playBackgroundMusic(this, 'raceMusic');
        this.add.text(400, 40, 'Practice Results', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        const startX = 150;
        const startY = 100;
        const colWidth = 200;
        const rowHeight = 30;
        //const arrow = effect[statKey] ? '↑' : (recentlyLost[statKey] ? '↓' : '');



        // Draw athlete headers horizontally
        gameState.athletes.forEach((athlete, index) => {
            const xPos = startX + index * colWidth;

            // Image (dino sprite)
            this.add.sprite(xPos, startY, athlete.spriteKey).setScale(2);

            // Name
            this.add.text(xPos, startY + 40, athlete.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

            // Grade
            this.add.text(xPos, startY + 60, gradeLevels[athlete.grade], { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);

            // Archetype
            this.add.text(xPos, startY + 80, `Type: ${athlete.archetype}`, { fontSize: '14px', fill: '#888' }).setOrigin(0.5);

            // Stats block
            //*const stats = [
              //  `Stride Len: ${athlete.strideLength.toFixed(2)}`,
              //  `Stride Freq: ${athlete.strideFrequency.toFixed(2)}`,
              //  `Accel: ${athlete.acceleration.toFixed(2)}`,
              //  `Stamina: ${athlete.stamina.toFixed(1)}`,
              //  `Eff: ${athlete.staminaEfficiency.toFixed(2)}`,
                //`Pace Acc: ${athlete.paceAccuracy.toFixed(2)}`,
              //  `PR: ${athlete.personalRecord ? athlete.personalRecord.toFixed(1) + 's' : 'N/A'}`
            //];
            

           // stats.forEach((line, statIdx) => {
           //     this.add.text(xPos, startY + 100 + statIdx * rowHeight, line, { fontSize: '16px', fill: '#0f0' }).setOrigin(0.5);
           // });

            const labels = ['StrideLen', 'StrideFreq', 'Accel', 'Stamina', 'Eff', 'Pace'];

            labels.forEach((label, statIdx) => {
                gameState.athletes.forEach((athlete, i) => {
                    const xPos = startX + i * colWidth;
                    const statKey = mapLabelToStatKey(label);
                    const value = getStatDisplay(label, athlete);
                    const effect = trainingEffects[athlete.lastTrainingType];  // you store this in applyTraining()
    
                    const arrow = effect[statKey] ? '↑' : '';
                    this.add.text(xPos, startY + 100 + statIdx * 20, `${label}: ${value} ${arrow}`, { fontSize: '14px', fill: '#0f0' }).setOrigin(0.5);
                });
            });
        });

        

        createNextButton(this, 'PracticeRaceScene');
    }
}
