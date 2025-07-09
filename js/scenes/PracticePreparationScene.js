import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { applyTraining } from '../utils/trainingLogic.js';
//import Phaser from 'phaser'; // for Phaser.Utils.Array.Shuffle


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
            { type: 'Condition', label: 'Endurance Run', effect: '+3 Stamina' },
            { type: 'HIIT', label: 'HIIT Station', effect: '+1 Speed, +2 Stamina' },
            { type: 'Pace', label: 'Pacing Track', effect: '+2 Speed, +1 Stamina' },
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

        this.shopItems = [
            { name: 'Gel Pack', description: '+1 Stamina', cost: 2, type: 'permanent', stat: 'stamina', amount: 1 },
            { name: 'Electrolyte Drink', description: '+3 Stamina next race', cost: 2, type: 'buffNextRace', stat: 'stamina', amount: 3 },
            { name: 'New Spikes', description: '+1 Speed', cost: 2, type: 'permanent', stat: 'speed', amount: 1 },
            { name: 'Towel', description: '-15% drain next race', cost: 2, type: 'buffNextRace', buff: 'drainReduce', amount: 0.15 },
            { name: 'Weighted Vest', description: '×2 Stamina gain next training', cost: 2, type: 'buffNextTraining', buff: 'staminaGain', amount: 2 },
            { name: 'Energy Drink', description: '+3 Speed next race', cost: 2, type: 'buffNextRace', stat: 'speed', amount: 3 },
            { name: 'Ankle Bracers', description: 'No drain first 2s next race', cost: 2, type: 'buffNextRace', buff: 'noDrainFirst', amount: 2 },
            { name: 'Weighted Anklets', description: '×2 Speed gain next training', cost: 2, type: 'buffNextTraining', buff: 'speedGain', amount: 2 },
            { name: 'Protein Shake', description: '+2 Stamina', cost: 2, type: 'permanent', stat: 'stamina', amount: 2 },
            { name: 'Shoe Upgrade', description: '+2 Speed', cost: 2, type: 'permanent', stat: 'speed', amount: 2 },
        ];

        // pick 3 random items
        const dailyItems = Phaser.Utils.Array.Shuffle(this.shopItems).slice(0, 3);

        // 3) Ensure the buff array exists
        gameState.activeBuffs = gameState.activeBuffs || [];

        // 4) Draw the shop UI (2 rows of 5)
        const startX = 100;
        const startY = 450;
        const xSpacing = 240;
        const ySpacing = 100;

        dailyItems.forEach((item, idx) => {
            const x = startX + idx * xSpacing;
            const y = startY;

            // name & description
            this.add.text(x+50, y, item.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            this.add.text(x+50, y + 20, item.description, { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);

            // buy button
            const btn = this.add.text(x+50, y + 45, `Buy $${item.cost}`, {
                fontSize: '14px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.purchaseItem(item, btn));
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

    purchaseItem(item, btn) {
        // Not enough money?
        if (gameState.money < item.cost) {

            return;
        }

        // Deduct
        gameState.money -= item.cost;

        // Disable button
        btn.setText('Purchased').setStyle({ fill: '#888' }).disableInteractive();

        this.promptAssignItem(item);
    };

    refreshStatsDisplay() {
        // Re-read each athlete’s Speed & Stamina and update the on-screen texts
        this.statLabels.forEach(label => {
          gameState.athletes.forEach(athlete => {
            const textObj = this.children.getByName(`${athlete.name}-${label}`);
            if (textObj) {
              const value = this.getStatDisplay(label, athlete);
              textObj.setText(`${label}: ${value}`);
            }
          });
        });
      };

    promptAssignItem(item) {
        // create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);
      
        // instructions
        const promptText = this.add.text(
          400, 200,
          `Who should receive\n${item.name}?`,
          { fontSize: '20px', fill: '#fff', align: 'center' }
        ).setOrigin(0.5);
      
        // hold created elements so we can destroy them after choosing
        const holders = [overlay, promptText];
      
        // layout each athlete as a selection button
        const startX = 150, spacing = 200, y = 350;
        gameState.athletes.forEach((athlete, i) => {
          const x = startX + i * spacing;
      
          // sprite
          const sprite = this.add.sprite(x, y, athlete.spriteKey)
            .setScale(1.5)
            .setInteractive();
          holders.push(sprite);
      
          // name label
          const name = this.add.text(x, y + 60, athlete.name, {
            fontSize: '16px', fill: '#fff'
          }).setOrigin(0.5);
          holders.push(name);
      
          // click handler
          sprite.on('pointerdown', () => {
            // apply to only this athlete
            this.applyItemToAthlete(item, athlete.name);
      
            // clean up prompt
            holders.forEach(el => el.destroy());
          });
      
          // hover feedback
          sprite.on('pointerover', () => sprite.setTint(0x8888ff));
          sprite.on('pointerout',  () => sprite.clearTint());
        });
      }
      
      // 3) Apply the item’s effect to a single athlete
      applyItemToAthlete(item, athleteName) {
        const athlete = gameState.athletes.find(a => a.name === athleteName);
        if (!athlete) return;
      
        if (item.type === 'permanent') {
          // permanent stat boost
          athlete[item.stat] = (athlete[item.stat] || 0) + item.amount;
        } else {
          // queue up a buff for that athlete only
          gameState.activeBuffs.push({
            athleteName,
            name:   item.name,
            type:   item.type,     // 'buffNextRace' or 'buffNextTraining'
            buff:   item.buff,     // e.g. 'drainReduce', 'noDrainFirst'
            stat:   item.stat,     // for those that affect speed/stamina directly
            amount: item.amount
          });
        }
        this.refreshStatsDisplay();
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
