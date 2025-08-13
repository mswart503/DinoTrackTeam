import { addText, createNextButton, getNextWeeklyScene } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { applyTraining } from '../utils/trainingLogic.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { simulate2v2Race } from '../utils/raceSim.js';
import { getWeeklyRaceDistance, metersFromLabel } from '../utils/balance.js';




//import Phaser from 'phaser'; // for Phaser.Utils.Array.Shuffle


export default class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }

    create() {

        if (!this.scene.isActive('HUDScene')) {
            this.scene.launch('HUDScene');
        }
        this.scene.bringToTop('HUDScene');

        addBackground(this);
        this.justLeveled = false;

        this.xpSquaresByAthlete = {};

        this.athleteSprites = {};

        this.shopContainer = this.add.container(0, 0);

        // one tooltip for everything
        this.tooltip = addText(this, 0, 0, '', {
            fontSize: '14px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setVisible(false);

        // Titles
        addText(this, 600, 370, 'Drag Athletes \nto Workouts', {
            fontSize: '20px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);

        addText(this, 190, 400, 'Student Store', {
            fontSize: '20px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);

        // --- 1) Draw 4 training‐machine zones at y=250, x=120+i*180 ---
        this.trainingZones = {};
        this.machineLabels = [];
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
                const btn = addText(this, x, y, `Unlock $${slotCost[i]}`, {
                    fontSize: '14px', fill: '#ff0', backgroundColor: '#222', padding: 4
                })
                    .setOrigin(0.5)
                    .setInteractive()
                    .on('pointerdown', () => {
                        if (gameState.money >= slotCost[i]) {
                            gameState.money -= slotCost[i];
                            gameState.trainingSlotsUnlocked = i + 1;
                            this.updateMachineLabel(idx);
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
            //this.machineLabels = [];
            for (let i = 0; i < 4; i++) {
                const x = 120 + i * 180, y = 250;   // same coords you used
                const label = this.drawMachineEffectLabel(x, y + 60, i);
                this.machineLabels[i] = label;
            }
            // upgrade button under that
            addText(this, x, y + 80, 'Upgrade $10', {
                fontSize: '12px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.showUpgradeMenu(i));
        }

        // --- 2) Reroll shop button at upper‐right of shop area ---
        addText(this, 190, 435, 'Reroll $2', {
            fontSize: '16px', fill: '#0f0', backgroundColor: '#222', padding: 4
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (gameState.money >= 2) {
                    gameState.money -= 2;
                    this.initDailyShop();
                    this.drawShop(105, 500);
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

            this.athleteSprites[ath.name] = spr;

            // b) tell the input plugin “this sprite is draggable”
            this.input.setDraggable(spr);
            const unavailable = gameState.unavailableThisWeek && gameState.unavailableThisWeek[ath.name];
            if (unavailable) {
                spr.setAlpha(0.5).disableInteractive();
                addText(this, spr.x, spr.y, 'Unavailable', { fontSize: '10px', fill: '#f66' }).setOrigin(0.5);
            }

            // c) store which athlete this is
            spr.setData('athlete', ath);
            addText(this, x, y + 40, ath.name, {
                fontSize: '16px', fill: '#000'
            }).setOrigin(0.5);
            /*this.add.text(x, y + 60, gradeLevels[ath.grade], {
                fontSize: '14px', fill: '#000'
            }).setOrigin(0.5);*/
            addText(this, x - 10, y + 60, "Abils:", {
                fontSize: '12px', fill: '#000'
            }).setOrigin(0.5);

            this.statLabels.forEach((lbl, si) => {
                const val = this.getStatDisplay(lbl, ath);
                addText(this, x, y + 80 + si * 20, `${lbl}: ${val}`, {
                    fontSize: '12px', fill: '#000'
                }).setOrigin(0.5)
                    .setName(`${ath.name}-${lbl}`);
            });
            // after your statLabels.forEach…
            // ─── 3) XP squares ───
            const xpSquares = [];
            const needed = ath.level + 1;      // e.g. 2 squares at level 1
            const size = 8;
            const totalW = needed * (size + 2);
            const baseY = y + 26;            // tweak vertical offset as you like

            for (let j = 0; j < needed; j++) {
                const localX = x - totalW / 2 + j * (size + 2);
                const filled = ath.exp.xp > j;
                const sq = this.add
                    .rectangle(localX, baseY, size, size, filled ? 0x00ddff : 0x555555)
                    .setOrigin(0, 0.5);
                xpSquares.push(sq);
            }
            this.xpSquaresByAthlete[ath.name] = xpSquares;

            const abilityIcons = [];

            ath.abilities.forEach((ab, j) => {
                // position these relative to the sprite:
                const icon = addText(this,
                    spr.x + 40 + (j - ath.abilities.length / 2) * 24, // spread them vertically
                    spr.y + 60,
                    ab.code,
                    { fontSize: '12px', fill: '#ff0', backgroundColor: '#222', padding: 2 }
                )
                    .setOrigin(0.5)
                    .setInteractive()
                    .setDepth(100);

                // hover → show tooltip
                icon.on('pointerover', () => {
                    this.tooltip
                        .setText(`${ab.name}\n${ab.desc}`)
                        .setPosition(icon.x - 110, icon.y + 15)
                        .setVisible(true)
                        .setDepth(100);
                });
                icon.on('pointerout', () => {
                    this.tooltip.setVisible(false);
                });

                abilityIcons.push(icon);
            });

            // store for any future flashes
            spr.abilityIcons = abilityIcons;
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
            const slotAthlete = dropZone.getData('athlete');

            // If that slot already has someone else, reject and snap to edge
            if (slotAthlete && slotAthlete !== sprite.getData('athlete')) {
                const { x: zx, y: zy } = dropZone;
                // zone dimensions
                const w = dropZone.input.hitArea.width;
                const h = dropZone.input.hitArea.height;

                // four edge‐points
                const edges = [
                    { x: zx - w / 2, y: zy }, // left
                    { x: zx + w / 2, y: zy }, // right
                    { x: zx, y: zy - h / 2 }, // top
                    { x: zx, y: zy + h / 2 }  // bottom
                ];

                // pick nearest edge
                let best = edges[0];
                let minD = Phaser.Math.Distance.Between(pointer.x, pointer.y, best.x, best.y);
                edges.forEach(pt => {
                    const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, pt.x, pt.y);
                    if (d < minD) {
                        best = pt;
                        minD = d;
                    }
                });

                // snap sprite there
                sprite.x = best.x;
                sprite.y = best.y;
                sprite.setDepth(0);

                // show popup
                this.showSlotError(pointer.x, pointer.y);
                return;
            }

            // otherwise clear old slot & assign into this one
            Object.values(this.trainingZones).forEach(z => {
                if (z.getData('athlete') === sprite.getData('athlete')) {
                    z.setData('athlete', null);
                }
            });
            dropZone.setData('athlete', sprite.getData('athlete'));

            // snap to center
            sprite.x = dropZone.x;
            sprite.y = dropZone.y;
            sprite.setDepth(0);
        });


        // 2d) dragend — pointer released, whether dropped on a zone or not
        this.input.on('dragend', (pointer, sprite, dropped) => {
            if (!dropped) {
                // ─── remove them from any slot that still thinks they're in it ───
                Object.values(this.trainingZones).forEach(zone => {
                    if (zone.getData('athlete') === sprite.getData('athlete')) {
                        zone.setData('athlete', null);
                    }
                });
                // you let go outside any dropZone:
                // just leave it where you released, and reset depth
                sprite.setDepth(0);
                sprite.x = pointer.x;
                sprite.y = pointer.y;
            }
        });

        // 1) register your resume listener once, up here
        this.events.on('resume', () => {
            if (this.justLeveled) {
                this.justLeveled = false;
                processAllWeeklyMatches();
                this.scene.start(getNextWeeklyScene(this.scene.key));
            }
        });

        // --- 6) “Start Training” button at (550,170) ---
        const startBtn = addText(this, 550, 170, 'Start Training', {
            fontSize: '24px',
            fill: '#0f0'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                // 1) Apply each slot’s base + upgrade, *times* any buffNextTraining
                Object.entries(this.trainingZones).forEach(([i, zone]) => {
                    const ath = zone.getData('athlete');
                    if (!ath) return;
                    const idx = parseInt(i, 10);
                    const upg = gameState.machineUpgrades[idx] || {};

                    // base gains
                    const baseSpeedGain = idx === 0 ? 1 : 0;
                    const baseStmGain = idx === 1 ? 1 : 0;
                    const baseXpGain = idx === 2 ? 1 : 0;


                    // collect any *nextTraining buffs* for this athlete
                    let speedFactor = 1;
                    let stmFactor = 1;
                    gameState.activeBuffs.forEach(b => {
                        if (b.type === 'buffNextTraining' && b.athleteName === ath.name) {
                            if (b.buff === 'speedGain') speedFactor *= b.amount;
                            if (b.buff === 'staminaGain') stmFactor *= b.amount;
                        }
                    });

                    // total gains
                    ath.speed += (baseSpeedGain + (upg.speed || 0)) * speedFactor;
                    ath.stamina += (baseStmGain + (upg.stamina || 0)) * stmFactor;
                    const xpGain = (baseXpGain + (upg.xp || 0));
                    ath.exp.xp += xpGain;
                    ath.lastTrainingType = `slot${idx + 1}`;
                });

                // 2) Clear out all the buffNextTraining entries so they only apply once
                gameState.activeBuffs = gameState.activeBuffs.filter(b => b.type !== 'buffNextTraining');

                // 3) CHECK FOR LEVEL-UPS
                // find first athlete who leveled
                let leveledAthlete = null;
                gameState.athletes.forEach(a => {
                    let needed = a.level + 1;
                    while (!leveledAthlete && a.exp.xp >= needed) {
                        a.exp.xp -= needed;
                        a.level++;
                        leveledAthlete = a;
                        needed = a.level + 1;
                    }
                });

                if (leveledAthlete) {
                    // pause and launch ability select
                    this.scene.pause();
                    this.justLeveled = true;
                    this.scene.launch('AbilitySelectionScene', { athleteName: leveledAthlete.name });
                    return;  // stop here until ability is chosen
                }

                // 4) Continue to your race or next scene
                processAllWeeklyMatches();
                this.scene.start(getNextWeeklyScene(this.scene.key));
            });


        // --- ensure we have 3 shop items stored ---
        if (!gameState.dailyItems.length) {
            this.initDailyShop();
        }
    }

    /**
 * Show a transient “only one athlete” message.
 * @param {number} x  pointer X
 * @param {number} y  pointer Y
 */
    showSlotError(x, y) {
        const msg = this.add
            .text(x, y - 20, '        Nice Try :)\nOnly one Athlete per slot', {
                fontSize: '18px',
                fill: '#fff',
                backgroundColor: '#000',
                padding: { x: 6, y: 4 }
            })
            .setOrigin(0.5);
        this.time.delayedCall(2000, () => msg.destroy());
    }

    // helper to show current machine effect text
    drawMachineEffectLabel(x, y, idx) {
        const upg = gameState.machineUpgrades[idx] || {};
        const baseSpd = idx === 0 ? 1 : 0;   // e.g. slot 0 = speed machine
        const baseStm = idx === 1 ? 1 : 0;   // slot 1 = stamina machine
        const baseXp = idx === 2 ? 1 : 0;   // slot 2 = XP machine

        const totSpd = baseSpd + (upg.speed || 0);
        const totStm = baseStm + (upg.stamina || 0);
        const totXp = baseXp + (upg.xp || 0);

        // Build only the parts that are > 0
        const parts = [];
        if (totSpd > 0) parts.push(`Speed: +${totSpd}`);
        if (totStm > 0) parts.push(`Stamina: +${totStm}`);
        if (totXp > 0) parts.push(`XP: +${totXp}`);

        // If absolutely nothing, show a dash (or leave empty string if you prefer)
        const text = parts.length ? parts.join('  ') : '—';

        return addText(this, x, y, text, {
            fontSize: '12px', fill: '#0f0'
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
        const b1 = addText(this, cx - 60, cy, '+1 Speed', { fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4 }).setInteractive();
        const b2 = addText(this, cx + 60, cy, '+1 Stamina', { fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4 }).setInteractive();

        const cleanup = () => { ov.destroy(); b1.destroy(); b2.destroy(); };

        b1.on('pointerdown', () => {
            gameState.machineUpgrades[idx].speed++;
            cleanup(); this.updateMachineLabel(idx);

        });
        b2.on('pointerdown', () => {
            gameState.machineUpgrades[idx].stamina++;
            cleanup(); this.updateMachineLabel(idx);

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

        if (this.shopContainer.list.length) {
            this.shopContainer.removeAll(true);
        }
        const spacing = 165;
        gameState.dailyItems.forEach((item, i) => {
            const base = item.cost;
            const discount = gameState.shopDiscountToday || 0;
            const price = Math.max(0, base - discount);
            const x = startX + i * spacing, y = startY;
            const nameTxt = addText(this, x, y - 10, item.name, {
                fontSize: '12px', fill: '#fff', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5);
            const descTxt = addText(this, x, y + 21, item.description, {
                fontSize: '10px', fill: '#fff', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5);

            const btn = addText(this, x, y + 50, `Buy $${price}`, {
                fontSize: '12px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    if (gameState.money < price) return;
                    gameState.money -= price;
                    btn.disableInteractive().setText('BOUGHT');

                    // **NEW**—show athlete chooser
                    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
                        .setDepth(1000)
                        .setInteractive(); // block input behind

                    const menuTexts = [];
                    gameState.athletes.forEach((ath, idx) => {
                        const tx = addText(this, 140, 460 + idx * 30, ath.name, {
                            fontSize: '18px', fill: '#fff', backgroundColor: '#222', padding: 4
                        })
                            .setDepth(1001)
                            .setInteractive()
                            .on('pointerdown', () => {
                                // clean up menu
                                overlay.destroy();
                                menuTexts.forEach(t => t.destroy());
                                // 1) Apply & display immediately
                                this.applyItemToAthlete(item, ath.name);

                            });
                        menuTexts.push(tx);
                    });
                });
            // add all three into the shopContainer
            this.shopContainer.add([nameTxt, descTxt, btn]);
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
        if (gameState.money < price) {

            return;
        }

        // Deduct
        gameState.money -= price;

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
        // Now update XP squares:
        Object.entries(this.xpSquaresByAthlete).forEach(([name, squares]) => {
            const a = gameState.athletes.find(x => x.name === name);
            squares.forEach((sq, idx) => {
                sq.fillColor = (a.exp.xp > idx) ? 0x00ddff : 0x555555;
            });
        });
    };

    promptAssignItem(item) {
        // create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6);

        // instructions
        const promptText = addText(this,
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
            const name = addText(this, x, y + 60, athlete.name, {
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
        //this.scene.bringToTop('PracticePreparationScene'); // ensure HUD is on top
        console.log('Mapped sprite for', athleteName, this.athleteSprites[athleteName]);

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



        const spr = this.athleteSprites[athleteName];
        if (spr) {
            let popupHightAdj = 0;
            if (spr.stat === 'speed') {
                popupHightAdj = 100;
            }
            else if (spr.stat === 'stamina') {
                popupHightAdj = 120;
            }


            const popup = addText(this,
                spr.x, spr.y - spr.displayHeight / 2 + popupHightAdj,
                `+${item.amount}`,
                { fontSize: '20px', fill: '#0f0' }
            ).setOrigin(0.5).setDepth(1000);
            console.log('Popup created at', popup.x, popup.y, 'depth', popup.depth);

            this.tweens.add({
                targets: popup,
                y: popup.y - 20,
                alpha: 0,
                duration: 3000,
                ease: 'Cubic.easeOut',
                onComplete: () => popup.destroy()
            });
        }
        this.refreshStatsDisplay();


    }

    updateMachineLabel(idx) {
        const old = this.machineLabels[idx];
        if (!old) return;
        const { x, y } = old;
        old.destroy();
        this.machineLabels[idx] = this.drawMachineEffectLabel(x, y, idx); // <- keep same y
    }

}

function processAllWeeklyMatches() {
    const week = gameState.currentWeek;
    const pairs = gameState.schedule[week];

    // distance for THIS week
    const distLabel = getWeeklyRaceDistance(week); // '100m' | '200m' | '400m'
    const distMeters = metersFromLabel(distLabel);  // 100 | 200 | 400

    pairs.forEach(([teamA, teamB]) => {
        const schoolA = gameState.schools.find(s => s.name === teamA);
        const schoolB = gameState.schools.find(s => s.name === teamB);

        const athsA = Phaser.Utils.Array.Shuffle([...schoolA.athletes]).slice(0, 2);
        const athsB = Phaser.Utils.Array.Shuffle([...schoolB.athletes]).slice(0, 2);

        // Only auto-sim if it's not the player's matchup
        if (teamA !== gameState.playerSchool && teamB !== gameState.playerSchool) {
            const simResults = simulate2v2Race(athsA, athsB, teamA, teamB, distMeters);

            // write PRs to the correct distance key
            simResults.forEach(r => {
                const prev = r.athlete.prs[distLabel];
                if (prev === undefined || r.time < prev) {
                    r.athlete.prs[distLabel] = r.time;
                }
            });

            awardPoints(simResults);
        }
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