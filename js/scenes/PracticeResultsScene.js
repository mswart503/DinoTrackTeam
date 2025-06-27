import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { playBackgroundMusic } from '../utils/uiHelpers.js';
import { mapLabelToStatKey, getStatDisplay } from '../utils/statLabelMap.js';


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
        const rowHeight = 40;
        this.practiceDistances = ['100m', '200m', '400m', 'None'];

        gameState.practiceRaceAssignments = {};
        gameState.athletes.forEach((athlete, i) => {
            const x = 150 + i * colWidth;
            this.add.text(x, startY, athlete.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

            this.practiceDistances.forEach((dist, j) => {
                const y = startY + (j + 1) * rowHeight;
                const btn = this.add.text(x, y, dist, { fontSize: '18px', fill: '#0f0' })
                    .setOrigin(0.5)
                    .setInteractive()
                    .on('pointerdown', () => {
                        gameState.practiceRaceAssignments[athlete.name] = dist;
                        this.updateHighlights(athlete.name, dist);
                    });

                btn.setData('athlete', athlete.name);
                btn.setData('distance', dist);
            });
        });

        createNextButton(this, 'PracticeRaceScene', 400, 500);
    }

    updateHighlights(name, chosen) {
        this.children.list.forEach(child => {
            if (child.getData('athlete') === name) {
                const dist = child.getData('distance');
                const color = (dist === chosen) ? '#ff0' : '#0f0';
                child.setStyle({ fill: color });
            }
        });
    }
} 
