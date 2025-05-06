import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';

export default class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }

    create() {
        this.add.text(400, 40, 'Practice Prep', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.tooltip = this.add.text(0, 0, '', { fontSize: '14px', fill: '#fff', backgroundColor: '#000' }).setVisible(false);

        const trainingOptions = ['Interval', 'Condition', 'HIIT', 'Pace'];
        const selectedTrainings = {};

        const startX = 150;
        const startY = 100;
        const colWidth = 200;
        const rowHeight = 40;

        // Draw athlete names across the top
        gameState.athletes.forEach((athlete, index) => {
            this.add.image(startX + index * colWidth, startY - 30, athlete.spriteKey).setScale(1.5);
            this.add.text(startX + index * colWidth, startY, athlete.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            this.add.text(startX + index * colWidth, startY + 20, gradeLevels[athlete.grade], { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);

        });

        // Draw training options under each athlete
        trainingOptions.forEach((option, optIndex) => {
            gameState.athletes.forEach((athlete, index) => {
                const btn = this.add.text(
                    startX + index * colWidth,
                    startY + (optIndex + 1) * rowHeight,
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

        const nextButton = this.add.text(400, startY + (trainingOptions.length + 2) * rowHeight, 'Next', { fontSize: '28px', fill: '#0f0' })
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
    }

    getTrainingTooltip(option) {
        switch(option) {
            case 'interval': return 'Boost stride frequency + acceleration';
            case 'conditioning': return 'Boost stamina + efficiency';
            case 'hiit': return 'Boost acceleration + efficiency';
            case 'pace': return 'Boost pace control + stamina';
            case 'strides': return 'Boost stride length + frequency';
            default: return '';
        }
    }
    
}