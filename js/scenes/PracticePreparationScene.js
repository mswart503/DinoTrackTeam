import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { applyTraining } from '../utils/trainingLogic.js';

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
            { type: 'Interval', label: 'Sprint Drills', effect: '+3 Speed' },
            { type: 'Condition', label: 'Endurance Run' , effect: '+3 Stamina'},
            { type: 'HIIT', label: 'HIIT Station' , effect: '+1 Speed, +2 Stamina'},
            { type: 'Pace', label: 'Pacing Track' , effect: '+2 Speed, +1 Stamina'},
        ];


        this.trainingZones = {};

        // Drop zones
        this.trainingStations.forEach((station, i) => {
            const x = 150 + i * 180;
            const y = 150;

            const zone = this.add.zone(x, y, 100, 100)
                .setRectangleDropZone(100, 100)
                .setData('type', station.type)
                .setData('occupied', null)
                .setInteractive();

            this.add.graphics()
                .lineStyle(2, 0xffffff)
                .strokeRect(x - 50, y - 50, 100, 100);

            this.add.text(x, y + 90, station.label, {
                fontSize: '14px',
                fill: '#fff'
            }).setOrigin(0.5);
            this.add.text(x, y + 110, station.effect, {
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
        this.statLabels = ['Speed', 'Stamina'];

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
               /* this.unhighlightStats(athleteName, prevZoneType);
            */
               }

            // Assign new zone
            this.athleteAssignments[athleteName] = newZoneType;
            dropZone.setData('occupied', athlete);

            // Snap to zone center
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;

            // Highlight new training effects
            //this.highlightStats(athleteName, newZoneType);
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
           // this.tooltip.setText(this.getTrainingTooltip(dropZone.getData('type')));
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
                        applyTraining(athlete, zone.getData('type'));
                    }
                });
                this.scene.start('ChallengeSelectionScene');

                //this.scene.start('PracticeResultsScene');
            });
    }
/*
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
    }*/

    getStatDisplay(label, athlete) {
        switch (label) {
            case 'Speed': return athlete.speed.toFixed(2);
            case 'Stamina': return athlete.stamina.toFixed(0);
        }
    }

    /*
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
    }*/

   /* getTrainingTooltip(option) {
        switch (option) {
            case 'Interval': return '+3 Speed';
            case 'Condition': return '+3 Stamina';
            case 'HIIT': return '+1 Speed, +2 Stamina';
            case 'Pace': return '+2 Speed, +1 Stamina';
            default: return '';
        }
    }*/
}

function mapLabelToStatKey(label) {
    return {
        Speed: 'speed',
        Stamina: 'stamina',
    }[label];
}
