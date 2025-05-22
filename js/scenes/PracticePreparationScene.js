import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { trainingEffects } from '../config.js';

export default class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }

    create() {
        this.add.text(400, 40, 'Practice Prep', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.tooltip = this.add.text(0, 0, '', { fontSize: '14px', fill: '#fff', backgroundColor: '#000' }).setVisible(false);

        const trainingOptions = ['Interval', 'Condition', 'HIIT', 'Pace'];
        const selectedTrainings = {};

        this.startX = 150;
        this.startY = 100;
        this.colWidth = 200;
        const rowHeight = 40;

        // Draw athlete names across the top
        gameState.athletes.forEach((athlete, index) => {
            this.add.image(this.startX + index * this.colWidth, this.startY - 30, athlete.spriteKey).setScale(1.5);
            this.add.text(this.startX + index * this.colWidth, this.startY, athlete.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            this.add.text(this.startX + index * this.colWidth, this.startY + 20, gradeLevels[athlete.grade], { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);
            this.add.text(this.startX + index * this.colWidth, this.startY + 40, `Type: ${athlete.archetype}`, { fontSize: '14px', fill: '#888' }).setOrigin(0.5);

        });

        this.statLabels = ['StrideLen', 'StrideFreq', 'Accel', 'Stamina', 'Eff', 'Pace'];

        this.statLabels.forEach((label, statIdx) => {
            gameState.athletes.forEach((athlete, i) => {
                const xPos = this.startX + i * this.colWidth;
                const statValue = getStatDisplay(label, athlete);
                this.add.text(xPos, this.startY + 60 + statIdx * 18, `${label}: ${statValue}`, {
                    fontSize: '14px',
                    fill: '#0f0'
                })
                .setOrigin(0.5)
                .setName(`${athlete.name}-${label}`);
                            });
        });

        function getStatDisplay(label, athlete) {
            switch (label) {
                case 'StrideLen': return athlete.strideLength.toFixed(2);
                case 'StrideFreq': return athlete.strideFrequency.toFixed(2);
                case 'Accel': return athlete.acceleration.toFixed(2);
                case 'Stamina': return athlete.stamina.toFixed(0);
                case 'Eff': return athlete.staminaEfficiency.toFixed(2);
                case 'Pace': return athlete.paceAccuracy.toFixed(2);
            }
        }

        // Draw training options under each athlete
        trainingOptions.forEach((option, optIndex) => {
            gameState.athletes.forEach((athlete, index) => {
                const btn = this.add.text(
                    this.startX + index * this.colWidth,
                    this.startY + (optIndex + 1) * rowHeight + 160,
                    option,
                    { fontSize: '18px', fill: '#0f0' }
                )
                    .setOrigin(0.5)
                    .setInteractive()
                    .on('pointerdown', () => {
                        selectedTrainings[athlete.name] = option;
                        this.highlightSelection(athlete.name, option);
                    });
                btn.on('pointerover', () => {
                    this.tooltip.setText(this.getTrainingTooltip(option));
                    this.tooltip.setPosition(btn.x + 50, btn.y);
                    this.tooltip.setVisible(true);
                })
                    .on('pointerout', () => {
                        this.tooltip.setVisible(false);
                    });
                btn.setData('athlete', athlete.name);
                btn.setData('option', option);
            });
        });

        const nextButton = this.add.text(400, this.startY + (trainingOptions.length + 2) * rowHeight+120, 'Next', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                gameState.athletes.forEach(athlete => {
                    const chosen = selectedTrainings[athlete.name];
                    if (chosen) {
                        athlete.applyTraining(chosen);
                    }
                });
                this.scene.start('PracticeResultsScene');
            });
    }

    highlightSelection(athleteName, selectedOption) {
        this.children.list.forEach(child => {
            if (child.getData('athlete') === athleteName) {
                const color = (child.getData('option') === selectedOption) ? '#ff0' : '#0f0';
                child.setStyle({ fill: color });
            }
        });

        // Highlight affected stats
        const effect = trainingEffects[selectedOption];
        this.statLabels.forEach((label, idx) => {
            const statKey = mapLabelToStatKey(label);
            gameState.athletes.forEach((athlete, i) => {
                if (athlete.name === athleteName) {
                    const xPos = this.startX + i * this.colWidth;
                    const statText = this.children.getByName(`${athlete.name}-${label}`);
                    if (statText) {
                        const color = effect[statKey] ? '#ff0' : '#0f0';
                        statText.setStyle({ fill: color });
                    }
                }
            });
        });
    }

    
    getTrainingTooltip(option) {
        switch (option) {
            case 'Interval': return 'Boost stride frequency + acceleration';
            case 'Condition': return 'Boost stamina + efficiency';
            case 'HIIT': return 'Boost acceleration + efficiency';
            case 'Pace': return 'Boost pace control + stamina';
            case 'Strides': return 'Boost stride length + frequency';
            default: return '';
        }
    }

}

function mapLabelToStatKey(label) {
    return {
        StrideLen: 'strideLength',
        StrideFreq: 'strideFrequency',
        Accel: 'acceleration',
        Stamina: 'stamina',
        Eff: 'staminaEfficiency',
        Pace: 'paceAccuracy',
    }[label];
}