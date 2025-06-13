import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { trainingEffects } from '../config.js';

export default class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }

    create() {
        this.athleteAssignments = {}; // athleteName → zoneType

        this.add.text(400, 40, 'Assign Training', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000'
        }).setVisible(false);

        this.trainingStations = [
            { type: 'Interval', label: 'Sprint Drills' },
            { type: 'Condition', label: 'Endurance Run' },
            { type: 'HIIT', label: 'HIIT Station' },
            { type: 'Pace', label: 'Pacing Track' },
        ];

        this.trainingZones = {};

        // Drop zones
        this.trainingStations.forEach((station, i) => {
            const x = 150 + i * 180;
            const y = 150;

            const zone = this.add.zone(x, y, 140, 140)
                .setRectangleDropZone(140, 140)
                .setData('type', station.type)
                .setData('occupied', null)
                .setInteractive();

            this.add.graphics()
                .lineStyle(2, 0xffffff)
                .strokeRect(x - 70, y - 70, 140, 140);

            this.add.text(x, y + 90, station.label, {
                fontSize: '14px',
                fill: '#fff'
            }).setOrigin(0.5);

            this.trainingZones[station.type] = zone;

            // Add a label placeholder inside the box
            const nameLabel = this.add.text(x, y + 30, '', {
                fontSize: '14px',
                fill: '#fff'
            }).setOrigin(0.5);

            zone.setData('label', nameLabel);
        });

        // Show athletes and stat display
        this.statLabels = ['StrideLen', 'StrideFreq', 'Accel', 'Stamina', 'Eff', 'Pace'];

        gameState.athletes.forEach((athlete, i) => {
            const x = 150 + i * 200;
            const sprite = this.add.sprite(x, 300, athlete.spriteKey).setScale(2)
                .setInteractive({ draggable: true });

            sprite.setData('athlete', athlete);

            this.add.text(x, 340, athlete.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            this.add.text(x, 360, gradeLevels[athlete.grade], { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);
            this.add.text(x, 380, `Type: ${athlete.archetype}`, { fontSize: '14px', fill: '#888' }).setOrigin(0.5);

            // Stat display
            this.statLabels.forEach((label, statIdx) => {
                const statValue = this.getStatDisplay(label, athlete);
                this.add.text(x, 400 + statIdx * 18, `${label}: ${statValue}`, {
                    fontSize: '14px',
                    fill: '#0f0'
                })
                    .setOrigin(0.5)
                    .setName(`${athlete.name}-${label}`);
            });
        });

        // Drag events
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            const athlete = gameObject.getData('athlete');
            const athleteName = athlete.name;
            const newZoneType = dropZone.getData('type');

            // Remove athlete from previous zone if they had one
            const prevZoneType = this.athleteAssignments[athleteName];
            if (prevZoneType && this.trainingZones[prevZoneType]) {
                this.trainingZones[prevZoneType].setData('occupied', null);
                this.unhighlightStats(athleteName, prevZoneType);
            }

            // Assign new zone
            this.athleteAssignments[athleteName] = newZoneType;
            dropZone.setData('occupied', athlete);

            // Snap to zone center
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;

            // Highlight new training effects
            this.highlightStats(athleteName, newZoneType);
            // Clear previous zone's label

            if (prevZoneType && this.trainingZones[prevZoneType]) {
                const prevLabel = this.trainingZones[prevZoneType].getData('label');
                if (prevLabel) prevLabel.setText('');
            }

            // Update new zone's label
            const nameLabel = dropZone.getData('label');
            if (nameLabel) nameLabel.setText(athleteName);
            if (nameLabel) {
                nameLabel.setText(athleteName);
                nameLabel.setOrigin(0.5);
            }

        });

        this.input.on('drag', (pointer, gameObject) => {
            gameObject.setDepth(1);
            gameObject.x = pointer.x;
            gameObject.y = pointer.y;
        });

        this.input.on('dragstart', (pointer, gameObject) => {
            this.tooltip.setVisible(false);
        });

        this.input.on('dragenter', (pointer, gameObject, dropZone) => {
            this.tooltip.setText(this.getTrainingTooltip(dropZone.getData('type')));
            this.tooltip.setPosition(dropZone.x + 60, dropZone.y);
            this.tooltip.setVisible(true);
        });

        this.input.on('dragleave', () => {
            this.tooltip.setVisible(false);
        });

        this.input.on('drop', () => {
            this.tooltip.setVisible(false);
        });


        // Next button
        this.add.text(400, 550, 'Start Training', {
            fontSize: '28px',
            fill: '#0f0',
            backgroundColor: '#111'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                Object.values(this.trainingZones).forEach(zone => {
                    const athlete = zone.getData('occupied');
                    if (athlete) {
                        athlete.applyTraining(zone.getData('type'));
                    }
                });
                this.scene.start('PracticeResultsScene');
            });
    }

    unhighlightStats(athleteName, trainingType) {
        const effect = trainingEffects[trainingType];
        this.statLabels.forEach((label) => {
            const statKey = mapLabelToStatKey(label);
            const statText = this.children.getByName(`${athleteName}-${label}`);
            if (statText) {
                const defaultColor = '#0f0';
                statText.setStyle({ fill: defaultColor });
            }
        });
    }

    getStatDisplay(label, athlete) {
        switch (label) {
            case 'StrideLen': return athlete.strideLength.toFixed(2);
            case 'StrideFreq': return athlete.strideFrequency.toFixed(2);
            case 'Accel': return athlete.acceleration.toFixed(2);
            case 'Stamina': return athlete.stamina.toFixed(0);
            case 'Eff': return athlete.staminaEfficiency.toFixed(2);
            case 'Pace': return athlete.paceAccuracy.toFixed(2);
        }
    }

    highlightStats(athleteName, trainingType) {
        const effect = trainingEffects[trainingType];
        this.statLabels.forEach((label) => {
            const statKey = mapLabelToStatKey(label);
            const statText = this.children.getByName(`${athleteName}-${label}`);
            if (statText) {
                const color = effect[statKey] ? '#ff0' : '#0f0';
                statText.setStyle({ fill: color });
            }
        });
    }

    getTrainingTooltip(option) {
        switch (option) {
            case 'Interval': return 'Boost stride frequency + acceleration';
            case 'Condition': return 'Boost stamina + efficiency';
            case 'HIIT': return 'Boost acceleration + efficiency';
            case 'Pace': return 'Boost pace control + stamina';
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
