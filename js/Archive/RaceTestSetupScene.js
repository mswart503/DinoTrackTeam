import { gameState } from '../gameState.js';
import TestPracticeRaceScene from './TestPracticeRaceScene.js';

export default class RaceTestSetupScene extends Phaser.Scene {
    constructor() {
        super('RaceTestSetupScene');
    }

    create() {
        this.add.text(400, 40, 'Race Test Setup', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        //this.scene.launch('HUDScene');
        const statsList = ['strideLength', 'strideFrequency', 'acceleration', 'stamina', 'staminaEfficiency', 'paceAccuracy'];
        const startX = 150;
        const startY = 100;
        const colWidth = 230;
        const rowHeight = 50;

        gameState.athletes.forEach((athlete, index) => {
            const xPos = startX + index * colWidth;

            // Athlete name
            this.add.text(xPos, startY, athlete.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

            statsList.forEach((stat, statIdx) => {
                const statY = startY + 40 + statIdx * rowHeight;

                // Display stat value
                const valueText = this.add.text(xPos, statY, `${stat}: ${athlete[stat].toFixed(2)}`, { fontSize: '16px', fill: '#0f0' }).setOrigin(0.5);

                // + Button
                this.add.text(xPos + 50, statY + 10, '+', { fontSize: '20px', fill: '#0f0' })
                    .setInteractive()
                    .on('pointerdown', () => {
                        athlete[stat] += (stat.includes('Efficiency') || stat.includes('Accuracy')) ? -0.05 : 0.1;  // efficiency/accuracy improve when lower
                        if (athlete[stat] < 0.1) athlete[stat] = 0.1;
                        valueText.setText(`${stat}: ${athlete[stat].toFixed(2)}`);
                    });

                // – Button
                this.add.text(xPos - 50, statY + 10, '-', { fontSize: '20px', fill: '#0f0' })
                    .setInteractive()
                    .on('pointerdown', () => {
                        athlete[stat] -= (stat.includes('Efficiency') || stat.includes('Accuracy')) ? -0.05 : 0.1;
                        valueText.setText(`${stat}: ${athlete[stat].toFixed(2)}`);
                    });
            });
        });

        // Start Race button
        this.add.text(400, startY + 40 + statsList.length * rowHeight, 'Start Race', { fontSize: '28px', fill: '#ff0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('TestPracticeRaceScene');
            });


        this.add.text(400, startY + 80 + statsList.length * rowHeight, 'Randomize Stats', { fontSize: '24px', fill: '#ff0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                gameState.athletes.forEach(athlete => {
                    athlete.strideLength = Phaser.Math.FloatBetween(1.0, 2.0);
                    athlete.strideFrequency = Phaser.Math.FloatBetween(3.0, 5.0);
                    athlete.acceleration = Phaser.Math.FloatBetween(0.5, 1.5);
                    athlete.stamina = Phaser.Math.Between(80, 150);
                    athlete.staminaEfficiency = Phaser.Math.FloatBetween(0.7, 1.0);
                    athlete.paceAccuracy = Phaser.Math.FloatBetween(0.3, 1.0);
                });
                this.scene.restart();
            });

        this.add.text(400, startY + 120 + statsList.length * rowHeight, `Distance: ${gameState.testRaceDistance}m`, { fontSize: '24px', fill: '#fff' })
            .setOrigin(0.5)
            .setName('distanceText');

        this.add.text(260, startY + 120 + statsList.length * rowHeight, '-', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (gameState.testRaceDistance > 50) gameState.testRaceDistance -= 50;
                this.children.getByName('distanceText').setText(`Distance: ${gameState.testRaceDistance}m`);
            });

        this.add.text(540, startY + 120 + statsList.length * rowHeight, '+', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                gameState.testRaceDistance += 50;
                this.children.getByName('distanceText').setText(`Distance: ${gameState.testRaceDistance}m`);
            });

    }
}
