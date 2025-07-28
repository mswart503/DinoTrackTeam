import { createNextButton } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { applyTraining } from '../utils/trainingLogic.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { getNextWeeklyScene } from '../utils/uiHelpers.js';
import { simulate2v2Race } from '../utils/raceSim.js';



//import Phaser from 'phaser'; // for Phaser.Utils.Array.Shuffle


export default class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }

    create() {
        // bring HUD on top and draw background
        this.scene.bringToTop('HUDScene');
        addBackground(this);

        // one tooltip for everything
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setVisible(false);

        // Titles
        this.add.text(600, 370, 'Drag Athletes to Workouts', {
            fontSize: '26px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);

        this.add.text(190, 400, 'Buy Items for Athletes', {
            fontSize: '26px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);

        // --- 1) Draw 4 training‐machine zones at y=250, x=120+i*180 ---
        this.trainingZones = {};
        const slotCost = [null, null, 50, 100];
        for (let i = 0; i < 4; i++) {
            const x = 120 + i * 180, y = 250;

            // draw border
            const g = this.add.graphics();
            g.lineStyle(2, 0xffffff).strokeRect(x - 50, y - 50, 100, 100);

            // locked?
            if (i >= gameState.trainingSlotsUnlocked) {
                // gray fill
                g.fillStyle(0x000000, 0.6).fillRect(x - 50, y - 50, 100, 100);

                // buy‑slot button
                const btn = this.add.text(x, y, `Unlock $${slotCost[i]}`, {
                    fontSize: '14px', fill: '#ff0', backgroundColor: '#222', padding: 4
                })
                    .setOrigin(0.5)
                    .setInteractive()
                    .on('pointerdown', () => {
                        if (gameState.money >= slotCost[i]) {
                            gameState.money -= slotCost[i];
                            gameState.trainingSlotsUnlocked = i + 1;
                            this.scene.restart();
                        }
                    });
                continue;
            }

            // unlocked: real drop‑zone
            const zone = this.add.zone(x, y, 100, 100)
                .setRectangleDropZone(100, 100)
                .setData('slot', i)
                .setData('athlete', null)
                .setInteractive();
            this.trainingZones[i] = zone;

            // green border to show unlocked
            g.lineStyle(2, 0x00ff00).strokeRectShape(zone.getBounds());

            // label under machine
            this.drawMachineEffectLabel(x, y + 60, i);

            // upgrade button under that
            this.add.text(x, y + 80, 'Upgrade $10', {
                fontSize: '12px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.showUpgradeMenu(i));
        }

        // --- 2) Reroll shop button at upper‐right of shop area ---
        this.add.text(190, 435, '🔄 Reroll $2', {
            fontSize: '16px', fill: '#0f0', backgroundColor: '#222', padding: 4
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (gameState.money >= 2) {
                    gameState.money -= 2;
                    this.initDailyShop();
                    this.scene.restart();
                }
            });

        // --- 3) Draw shop items from gameState.dailyItems at (60,500) spaced by 170px ---
        /*if (!gameState.dailyItems.length) {
            this.initDailyShop();
        }*/
        this.initDailyShop();
        this.drawShop(105, 500);


        // 1) Create each athlete sprite and make it draggable
        this.statLabels = ['Speed', 'Stamina'];
        gameState.athletes.forEach((ath, i) => {
            const x = 495 + i * 115;
            const y = 460;

            // a) create and make interactive
            const spr = this.add.sprite(x, y, ath.spriteKeyx2)
                .setInteractive();

            // b) tell the input plugin “this sprite is draggable”
            this.input.setDraggable(spr);

            // c) store which athlete this is
            spr.setData('athlete', ath);
            this.add.text(x, y + 40, ath.name, {
                fontSize: '16px', fill: '#000'
            }).setOrigin(0.5);
            this.add.text(x, y + 60, gradeLevels[ath.grade], {
                fontSize: '14px', fill: '#000'
            }).setOrigin(0.5);

            this.statLabels.forEach((lbl, si) => {
                const val = this.getStatDisplay(lbl, ath);
                this.add.text(x, y + 80 + si * 20, `${lbl}: ${val}`, {
                    fontSize: '12px', fill: '#000'
                }).setOrigin(0.5)
                    .setName(`${ath.name}-${lbl}`);
            });
        });

        // 2) Register your drag/drop handlers *once*, globally

        // 2a) dragstart — when pointer first clicks on a draggable sprite
        this.input.on('dragstart', (pointer, sprite) => {
            // bring it above everything else
            sprite.setDepth(1);
        });

        // 2b) drag — every time the pointer moves while holding the sprite
        this.input.on('drag', (pointer, sprite, dragX, dragY) => {
            // move it to follow the pointer
            sprite.x = dragX;
            sprite.y = dragY;
        });

        // 2c) drop — when you release over a dropZone
        this.input.on('drop', (pointer, sprite, dropZone) => {
            // your existing logic to clear any previous occupant:
            Object.values(this.trainingZones).forEach(z => {
                if (z.getData('athlete') === sprite.getData('athlete')) {
                    z.setData('athlete', null);
                }
            });

            // assign into this dropZone
            dropZone.setData('athlete', sprite.getData('athlete'));

            // snap to its center
            sprite.x = dropZone.x;
            sprite.y = dropZone.y;

            // send it back under everything
            sprite.setDepth(0);
        });

        // 2d) dragend — pointer released, whether dropped on a zone or not
        this.input.on('dragend', (pointer, sprite, dropped) => {
            if (!dropped) {
                // you let go outside any dropZone:
                // just leave it where you released, and reset depth
                sprite.setDepth(0);
                sprite.x = pointer.x;
                sprite.y = pointer.y;
            }
        });


        // --- 6) “Start Training” button at (550,170) ---
        createNextButton(this, 'ChallengeSelectionScene', 550, 170)
            .on('pointerdown', () => {
                // for each unlocked machine slot that has an athlete:
                Object.entries(this.trainingZones).forEach(([i, zone]) => {
                    const ath = zone.getData('athlete');
                    if (!ath) return;
                    const idx = parseInt(i, 10);
                    // base +1: slot0 = +1 speed; slot1=+1 stamina
                    const upg = gameState.machineUpgrades[idx];
                    ath.speed += (idx === 0 ? 1 : 0) + (upg.speed || 0);
                    ath.stamina += (idx === 1 ? 1 : 0) + (upg.stamina || 0);
                    ath.lastTrainingType = `slot${idx + 1}`;
                });

                processAllWeeklyMatches();

                this.scene.start(getNextWeeklyScene(this.scene.key));
            });

        // --- ensure we have 3 shop items stored ---
        if (!gameState.dailyItems.length) {
            this.initDailyShop();
        }
    }

    // helper to show current machine effect text
    drawMachineEffectLabel(x, y, idx) {
        const upg = gameState.machineUpgrades[idx] || {};
        // base: slot 0 → +1 spd, slot 1 → +1 stm, others → 0/0
        const baseSpd = idx === 0 ? 1 : 0;
        const baseStm = idx === 1 ? 1 : 0;
        const totSpd = baseSpd + (upg.speed || 0);
        const totStm = baseStm + (upg.stamina || 0);

        this.add.text(x, y, `Spd: ${totSpd}   Stm: ${totStm}`, {
            fontSize: '12px',
            fill: '#0f0'
        }).setOrigin(0.5);
    }

    // opens a tiny menu to spend $10 on spd or stm
    showUpgradeMenu(idx) {
        if (gameState.money < 10) return;
        gameState.money -= 10;

        const cx = 400, cy = 300;
        // dark overlay
        const ov = this.add.rectangle(400, 300, 800, 600, 0x000, 0.7).setInteractive();
        // two buttons
        const b1 = this.add.text(cx - 60, cy, '+1 Speed', { fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4 }).setInteractive();
        const b2 = this.add.text(cx + 60, cy, '+1 Stamina', { fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4 }).setInteractive();

        const cleanup = () => { ov.destroy(); b1.destroy(); b2.destroy(); };

        b1.on('pointerdown', () => {
            gameState.machineUpgrades[idx].speed++;
            cleanup(); this.scene.restart();
        });
        b2.on('pointerdown', () => {
            gameState.machineUpgrades[idx].stamina++;
            cleanup(); this.scene.restart();
        });
    }

    initDailyShop() {
        // pop‑in 3 unique random items
        const all = [
            { name: 'Gel Pack', description: '+1 Stamina', cost: 2, type: 'permanent', stat: 'stamina', amount: 1 },
            { name: 'Electrolyte Drink', description: '+3 Stamina next race', cost: 2, type: 'buffNextRace', stat: 'stamina', amount: 3 },
            { name: 'New Spikes', description: '+1 Speed', cost: 2, type: 'permanent', stat: 'speed', amount: 1 },
            { name: 'Towel', description: '-15% drain next race', cost: 2, type: 'buffNextRace', buff: 'drainReduce', amount: 0.15 },
            { name: 'Weighted Vest', description: '×2 Stamina gain\nnext training', cost: 2, type: 'buffNextTraining', buff: 'staminaGain', amount: 2 },
            { name: 'Energy Drink', description: '+3 Speed next race', cost: 2, type: 'buffNextRace', stat: 'speed', amount: 3 },
            { name: 'Ankle Bracers', description: 'No drain first\n2s next race', cost: 2, type: 'buffNextRace', buff: 'noDrainFirst', amount: 2 },
            { name: 'Weighted Anklets', description: '×2 Speed gain\nnext training', cost: 2, type: 'buffNextTraining', buff: 'speedGain', amount: 2 },
            { name: 'Protein Shake', description: '+2 Stamina', cost: 2, type: 'permanent', stat: 'stamina', amount: 2 },
            { name: 'Shoe Upgrade', description: '+2 Speed', cost: 2, type: 'permanent', stat: 'speed', amount: 2 },
        ];
        gameState.dailyItems = Phaser.Utils.Array.Shuffle(all).slice(0, 2);
    }

    drawShop(startX, startY) {
        const spacing = 165;
        gameState.dailyItems.forEach((item, i) => {
            const x = startX + i * spacing, y = startY;
            this.add.text(x, y-10, item.name, {
                fontSize: '14px', fill: '#fff', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5);
            this.add.text(x, y + 21, item.description, {
                fontSize: '12px', fill: '#aaa', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5);

            const btn = this.add.text(x, y + 50, `Buy $${item.cost}`, {
                fontSize: '12px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    if (gameState.money < item.cost) return;
                    gameState.money -= item.cost;
                    btn.disableInteractive().setText('✔');

                    // **NEW**—show athlete chooser
                    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
                        .setDepth(1000)
                        .setInteractive(); // block input behind

                    const menuTexts = [];
                    gameState.athletes.forEach((ath, idx) => {
                        const tx = this.add.text(140, 460 + idx * 30, ath.name, {
                            fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4
                        })
                            .setDepth(1001)
                            .setInteractive()
                            .on('pointerdown', () => {
                                // apply the item to this athlete:
                                if (item.type === 'permanent') {
                                    ath[item.stat] = (ath[item.stat] || 0) + item.amount;
                                } else {
                                    gameState.activeBuffs.push({
                                        athleteName: ath.name,
                                        type: item.type,
                                        buff: item.buff,
                                        stat: item.stat,
                                        amount: item.amount
                                    });
                                }
                                // clean up menu
                                overlay.destroy();
                                menuTexts.forEach(t => t.destroy());
                            });
                        menuTexts.push(tx);
                    });
                });
        });
    }




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
            const sprite = this.add.sprite(x, y, athlete.spriteKeyx2)
                .setScale(1.5)
                .setInteractive();
            holders.push(sprite);
            this.input.setDraggable(sprite);


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
            sprite.on('pointerout', () => sprite.clearTint());
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
                name: item.name,
                type: item.type,     // 'buffNextRace' or 'buffNextTraining'
                buff: item.buff,     // e.g. 'drainReduce', 'noDrainFirst'
                stat: item.stat,     // for those that affect speed/stamina directly
                amount: item.amount
            });
        }
        this.refreshStatsDisplay();
    }

    
}

function processAllWeeklyMatches() {
  const week = gameState.currentWeek;
  const pairs = gameState.schedule[week];  // e.g. [ ['A','B'], ['C','D'], … ]

  pairs.forEach(([team1, team2]) => {
    const school1 = gameState.schools.find(s => s.name === team1);
    const school2 = gameState.schools.find(s => s.name === team2);

    // pick 2 athletes for each side:
    const oppAths = Phaser.Utils.Array.Shuffle(school2.athletes).slice(0, 2);
    const ourAths = (team1 === gameState.playerSchool)
       ? gameState.athletes.slice(0,2)   // or however you pick your two
       : Phaser.Utils.Array.Shuffle(school1.athletes).slice(0,2);

    // if neither is the player, both sides are AI:
    if (team1 !== gameState.playerSchool && team2 !== gameState.playerSchool) {
      // simulate AI vs AI
      const results = simulate2v2Race(oppAths, 
                                      Phaser.Utils.Array.Shuffle(school1.athletes).slice(0,2),
                                      team2, team1);
      awardPoints(results);
    }
    // else the one that includes the player, UI will handle in ChallengeRaceScene
  });
}

function awardPoints(entrants) {
  const pts = [4, 2, 1, 0];
  entrants.forEach((r, i) => {
    const school = gameState.schools.find(s => s.name === r.schoolName);
    if (school) school.points += pts[i];
  });
}

function mapLabelToStatKey(label) {
    return {
        Speed: 'speed',
        Stamina: 'stamina',
    }[label];
}