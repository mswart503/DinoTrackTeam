import { addText, createNextButton, getNextWeeklyScene, addAthleteHUD } from '../utils/uiHelpers.js';
import { gameState, gradeLevels } from '../gameState.js';
import { applyTraining } from '../utils/trainingLogic.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { simulate2v2Race } from '../utils/raceSim.js';
import { getWeeklyRaceDistance, metersFromLabel } from '../utils/balance.js';
import { ALL_ABILITIES } from '../utils/abilities.js'; // your abilities catalog




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

        // === ability + HUD wiring ===
        this.huds = {};                       // name -> {container, speedText, stmBar, stmText, xpSquares}
        this.slotLabelsByAthlete = {};        // name -> [Text,...] for each ability slot label
        this.slotZonesByAthlete = {};         // name -> [Zone,...] drop zones over each slot
        this.inventoryContainer = null;       // holds ability chips
        this.abilityChips = [];               // all chip Texts
        this.inventoryDropZone = null;        // zone to drop unequipped abilities


        this.justLeveled = false;

        this.xpSquaresByAthlete = {};

        this.athleteSprites = {};

        this.shopContainer = this.add.container(0, 0);

        // one tooltip for everything
        this.tooltip = addText(this, 0, 0, '', {
            fontSize: '14px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setVisible(false);

        // Titles
        addText(this, 500, 130, 'Drag Athletes to Workouts', {
            fontSize: '18px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);

        /*addText(this, 100, 180, 'Student Store', {
            fontSize: '18px', fill: '#fff', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5);
*/
        // --- 1) Draw 4 training‐machine zones at y=250, x=120+i*180 ---
        this.trainingZones = {};
        this.machineLabels = [];
        const slotCost = [null, null, 50, 100];
        for (let i = 0; i < 3; i++) {
            const x = 320 + i * 180, y = 200;

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

                .setData('type', 'trainingSlot')   // <-- add this
                .setInteractive();
            this.trainingZones[i] = zone;

            // green border to show unlocked
            g.lineStyle(2, 0x00ff00).strokeRectShape(zone.getBounds());

            // label under machine
            //this.machineLabels = [];
            for (let i = 0; i < 4; i++) {
                const x = 320 + i * 180, y = 200;   // same coords you used
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
        addText(this, 110, 180, 'Reroll $2', {
            fontSize: '16px', fill: '#0f0', backgroundColor: '#222', padding: 4
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                if (gameState.money >= 2) {
                    gameState.money -= 2;
                    this.initDailyShop();
                    this.drawShop();
                }
            });

        // --- 3) Draw shop items from gameState.dailyItems at (60,500) spaced by 170px ---
        /*if (!gameState.dailyItems.length) {
            this.initDailyShop();
        }*/
        this.initDailyShop();
        this.drawShop();

        addText(this, 260, 160, 'Abilities (drag to slot)', { fontSize: '12px', fill: '#fff' }).setOrigin(0, 0.5);
        this.abilityPanel = this.add.container(60, 470);

        this.drawAbilityInventory = () => {
            this.abilityPanel.removeAll(true);
            addText(this, 0, -30, 'Ability Chips', { fontSize: '16px', fill: '#fff', backgroundColor: '#111', padding: 4 })
                .setOrigin(0, 0.5)
                .setDepth(1)
                .setScrollFactor(0);
            const chips = gameState.abilityInventory;
            chips.forEach((chip, i) => {
                const x = 0 + (i % 2) * 80;
                const y = 0 + Math.floor(i / 2) * 26;

                const t = addText(this, x, y, chip.code, { fontSize: '12px', fill: chip.assignedTo ? '#aaa' : '#ff0', backgroundColor: '#222', padding: 2 })
                    .setOrigin(0, 0.5).setInteractive();
                this.input.setDraggable(t);
                t.setData('chipId', chip.id);

                // optional sell button
                const sell = addText(this, x + 40, y, '$', { fontSize: '12px', fill: '#0f0', backgroundColor: '#111', padding: 2 })
                    .setOrigin(0, 0.5).setInteractive()
                    .on('pointerdown', () => {
                        if (chip.assignedTo) return; // don’t sell equipped
                        gameState.money += 2;        // your price
                        gameState.abilityInventory = gameState.abilityInventory.filter(c => c.id !== chip.id);
                        this.drawAbilityInventory();
                    });

                this.abilityPanel.add([t, sell]);
            });
        };
        this.drawAbilityInventory();

        // 1) Create each athlete sprite and make it draggable
        //this.statLabels = ['Speed', 'Stamina'];
        this.hudsByAthlete = {};
        gameState.athletes.forEach((ath, i) => {
            const x = 325 + i * 190;
            const y = 400;

            // a) create and make interactive
            const spr = this.add.sprite(x, y, ath.spriteKeyx4)
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
            spr.setData('dragType', 'athlete');   // <-- add this
            // === Shared HUD just behind the runner (follows the sprite) ===
            const hud = addAthleteHUD(this, spr.x + 30, spr.y + 120, ath);
            hud.container.setDepth(1);
            this.huds[ath.name] = hud;

            // === Ability slots under the HUD ===
            this.drawAbilitySlotsFor(ath, spr);
            addText(this, x, y + 70, ath.name, {
                fontSize: '16px', fill: '#000'
            }).setOrigin(0.5);
            /*this.add.text(x, y + 60, gradeLevels[ath.grade], {
                fontSize: '14px', fill: '#000'
            }).setOrigin(0.5);
            addText(this, x - 10, y + 60, "Abils:", {
                fontSize: '12px', fill: '#000'
            }).setOrigin(0.5);*/

        });



        // Helper: remember original position for chips/labels
        function rememberHome(obj) {
            obj.setData('_homeX', obj.x);
            obj.setData('_homeY', obj.y);
        }

        // DRAG START
        this.input.on('dragstart', (pointer, obj) => {
            const dragType = obj.getData('dragType'); // 'athlete' | 'chip' | 'slotLabel'
            if (dragType === 'chip' || dragType === 'slotLabel') {
                obj.setDepth(3000).setAlpha(0.9);
            } else {
                obj.setDepth(1); // athlete sprite path
            }
        });
        // DRAG
        this.input.on('drag', (pointer, obj, dragX, dragY) => {
            const dragType = obj.getData('dragType'); // 'athlete' | 'chip' | 'slotLabel'
            if (dragType === 'chip') {
                // chip is a child of abilityPanel; use panel-relative coords
                obj.x = dragX - this.abilityPanel.x;
                obj.y = dragY - this.abilityPanel.y;
            } else {
                // athlete or slot label (usually world space)
                obj.x = dragX;
                obj.y = dragY;
            }
        });

        // drop (ability → slot)
        this.input.on('drop', (pointer, obj, dropZone) => {
            const dragType = obj.getData('dragType');          // <-- consistent key
            const zoneType = dropZone?.getData('type');

            // === Ability chip -> ability slot ===
            if (dragType === 'chip' && zoneType === 'abilitySlot') {
                const athName = dropZone.getData('athleteName');
                const slotIdx = dropZone.getData('slotIndex');
                const chipId = obj.getData('chipId');

                // Route to your real equip function (whatever it's named)
                this._equipFn(athName, slotIdx, chipId);

                // Remove the token UI; your inventory redraw will re-create if needed
                obj.destroy();

                // If you keep slot labels, refresh them:
                this.refreshAbilitySlotsFor?.(athName);
                this.drawAbilityInventory?.();
                return;
            }

            // === Slot label -> inventory zone ===
            if (dragType === 'slotLabel' && zoneType === 'inventoryZone') {
                const athName = obj.getData('athleteName');
                const slotIdx = obj.getData('slotIndex');
                this._unequipFn(athName, slotIdx);
                this.refreshAbilitySlotsFor?.(athName);
                this.drawAbilityInventory?.();
                return;
            }

            // === Athlete -> training zone (your existing logic) ===
            if (dragType === 'athlete' && dropZone && dropZone.getData('slot') !== undefined) {
                const sprite = obj;
                const slotAthlete = dropZone.getData('athlete');

                if (slotAthlete && slotAthlete !== sprite.getData('athlete')) {
                    const { x: zx, y: zy } = dropZone;
                    const w = dropZone.input.hitArea.width;
                    const h = dropZone.input.hitArea.height;
                    const edges = [
                        { x: zx - w / 2, y: zy }, { x: zx + w / 2, y: zy },
                        { x: zx, y: zy - h / 2 }, { x: zx, y: zy + h / 2 },
                    ];
                    let best = edges[0];
                    let minD = Phaser.Math.Distance.Between(pointer.x, pointer.y, best.x, best.y);
                    edges.forEach(pt => {
                        const d = Phaser.Math.Distance.Between(pointer.x, pointer.y, pt.x, pt.y);
                        if (d < minD) { best = pt; minD = d; }
                    });
                    sprite.x = best.x; sprite.y = best.y; sprite.setDepth(0);
                    this.showSlotError(pointer.x, pointer.y);
                    return;
                }

                // clear old slot & assign
                Object.values(this.trainingZones).forEach(z => {
                    if (z.getData('athlete') === obj.getData('athlete')) z.setData('athlete', null);
                });
                dropZone.setData('athlete', obj.getData('athlete'));
                obj.x = dropZone.x; obj.y = dropZone.y; obj.setDepth(0);

                // move HUD + slots for THIS athlete (use the same map everywhere)
                const ath = obj.getData('athlete');
                const hud = this.hudsByAthlete?.[ath.name]?.container;    // <-- use hudsByAthlete
                if (hud) { hud.x = obj.x; hud.y = obj.y + 120; }
                this.refreshAbilitySlotsFor?.(ath.name);
                return;
            }
        });

        // DRAG END (snap back chips / labels if not dropped anywhere)
        this.input.on('dragend', (pointer, obj, dropped) => {
            const dragType = obj.getData('dragType');   // <-- consistent key

            // Chips: snap back if not dropped
            if (dragType === 'chip') {
                obj.setAlpha(1).setDepth(0);
                if (!dropped) {
                    // use the same keys you set when creating the token
                    const homeX = obj.getData('homeX');
                    const homeY = obj.getData('homeY');
                    obj.x = homeX;
                    obj.y = homeY;
                }
                return; // chips handled
            }

            // Athlete: your normal behavior
            if (dragType === 'athlete') {
                if (!dropped) {
                    obj.setDepth(0);
                    obj.x = pointer.x;
                    obj.y = pointer.y;
                }
                const ath = obj.getData('athlete');
                const hud = this.hudsByAthlete?.[ath.name]?.container;  // <-- consistent map
                if (hud) { hud.x = obj.x; hud.y = obj.y + 120; }
                this.refreshAbilitySlotsFor?.(ath.name);
            }

            // Slot label (if you made them draggable): snap back if needed
            if (dragType === 'slotLabel' && !dropped) {
                const homeX = obj.getData('homeX');
                const homeY = obj.getData('homeY');
                obj.x = homeX; obj.y = homeY;
            }
        });



        // --- 6) “Start Training” button at (350,70) ---
        const startBtn = addText(this, 400, 70, 'Start Training', {
            fontSize: '32px',
            fill: '#0f0',
            backgroundColor: '#222',
            padding: { x: 6, y: 4 },

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
        const consumables = [
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
        // --- convert abilities into “shop items” (type = 'abilityItem') ---
        // Pick a few random abilities; you can filter duplicates if desired
        const abilityPicks = Phaser.Utils.Array.Shuffle([...ALL_ABILITIES]).slice(0, 3).map(ab => ({
            type: 'abilityItem',
            name: ab.name || ab.code,    // keep short on the button
            code: ab.code,
            description: ab.desc,        // tooltip content
            abilityRef: ab,              // store the full catalog ref
            cost: 2,
        }));

        // Mix pools, shuffle, keep 4
        const mixed = Phaser.Utils.Array.Shuffle([
            ...Phaser.Utils.Array.Shuffle(consumables).slice(0, 3), // cap so we usually get some variety
            ...abilityPicks
        ]).slice(0, 4);

        gameState.dailyItems = mixed;
    }

    drawShop(startX = 100, startY = 250) {

        if (this.shopContainer?.list?.length) this.shopContainer.removeAll(true);
        const spacingY = 90;


        gameState.dailyItems.forEach((item, i) => {
            const x = startX, y = startY + i * spacingY;

            const nameTxt = addText(this, x, y, item.name, {
                fontSize: '12px', fill: '#fff', backgroundColor: '#222', padding: 4
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            // tooltip on hover shows effect
            nameTxt.on('pointerover', (pointer) => {
                this.tooltip
                    .setText(item.description || '')
                    .setPosition(pointer.x + 12, pointer.y + 12)
                    .setVisible(true)
                    .setDepth(3000)
                    ;
            });
            nameTxt.on('pointermove', (pointer) => {
                if (this.tooltip?.visible) {
                    this.tooltip.setPosition(pointer.x + 12, pointer.y + 12);
                }
            });
            nameTxt.on('pointerout', () => this.tooltip.setVisible(false));


            const base = item.cost ?? 2; // default cost if not specified
            const discount = gameState.shopDiscountToday || 0;
            const price = Math.max(0, base - discount);
            const btn = addText(this, x, y + 25, `Buy $${price}`, {
                fontSize: '12px', fill: '#0f0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive();
            btn.on('pointerdown', () => {
                if (gameState.money < price) return;
                gameState.money -= price;
                btn.disableInteractive().setText('BOUGHT');

                if (item.type === 'abilityItem') {
                    // instantiate + add to inventory (draggable)
                    // In your Buy button for ability shop items:
                    const chip = {
                        id: `chip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        code: item.code,
                        name: item.name,
                        desc: item.description,
                        assignedTo: null
                    };
                    gameState.abilityInventory.push(chip);
                    this.drawAbilityInventory();
                    const inst = {
                        ...item.abilityRef,
                        instId: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
                    };
                } else {

                    // consumable flow (use your existing chooser)
                    this.promptAssignItem(item);
                }
            });

            this.shopContainer.add([nameTxt, btn]);
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
        gameState.athletes.forEach(ath => {
            const hud = this.huds[ath.name];
            if (!hud) return;

            // speed
            hud.speedText.setText(`Spd ${ath.speed.toFixed(1)}`);

            // stamina bar + text
            hud.stmBar.width = 80 * (ath.stamina / Math.max(1, ath.stamina)); // if you track current vs max, adjust here
            hud.stmText.setText(`${Math.round(ath.stamina)}/${ath.stamina}`);
            // xp squares: if you want them to reflect ath.exp.xp within (ath.level + 1), update fill here as needed
            hud.xpSquares.forEach((sq, idx) => {
                const filled = ath.exp?.xp > idx;
                sq.fillColor = filled ? 0x00ddff : 0x555555;
            });
        });
    }


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



    drawAbilityInventory() {
        if (this.inventoryContainer) this.inventoryContainer.destroy();
        this.inventoryContainer = this.add.container(720, 440); // tweak pos as you like

        const title = addText(this, 0, -30, 'Abilities', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        this.inventoryContainer.add(title);

        this.abilityChips = [];
        const chips = (gameState.abilityInventory || []);
        if (!chips.length) {
            const empty = addText(this, 0, 0, '(none)', { fontSize: '12px', fill: '#aaa' }).setOrigin(0.5);
            this.inventoryContainer.add(empty);
            return;
        }

        // Grid of chips
        const cols = 2, gapX = 120, gapY = 26;
        chips.forEach((chip, i) => {
            const cx = (i % cols) * gapX - (gapX * (cols - 1)) / 2;
            const cy = Math.floor(i / cols) * gapY;

            const t = addText(this, cx, cy, chip.code, {
                fontSize: '14px', fill: '#ff0', backgroundColor: '#222', padding: 4
            })
                .setOrigin(0.5)
                .setInteractive()
                .setDepth(5);

            t.setData('dragType', 'chip');
            t.setData('chipId', chip.id);
            t.setData('_homeX', t.x);
            t.setData('_homeY', t.y);
            this.input.setDraggable(t);

            // tooltip (optional)
            t.on('pointerover', () => {
                this.tooltip
                    ?.setText(`${chip.name}\n${chip.desc}`)
                    ?.setPosition(t.getWorldTransformMatrix().tx + 12, t.getWorldTransformMatrix().ty - 24)
                    ?.setVisible(true);
            });
            t.on('pointerout', () => this.tooltip?.setVisible(false));

            this.abilityChips.push(t);
            this.inventoryContainer.add(t);
        });
    }

    ensureInventoryDropZone() {
        if (this.inventoryDropZone) this.inventoryDropZone.destroy();
        // big drop zone behind the inventory list
        this.inventoryDropZone = this.add.zone(this.inventoryContainer.x, this.inventoryContainer.y + 20, 220, 160)
            .setOrigin(0.5)
            .setInteractive()

            .setRectangleDropZone(220, 160);
        this.inventoryDropZone.setData('type', 'inventoryZone');
        this.inventoryDropZone.setDepth(1); // behind chips
        this.inventoryDropZone = this.add
            .zone(invX, invY, invW, invH)
            .setInteractive({ dropZone: true })
    }

    drawAbilitySlotsFor(ath, spr) {
        // cleanup old
        (this.slotLabelsByAthlete[ath.name] || []).forEach(t => t.destroy());
        (this.slotZonesByAthlete[ath.name] || []).forEach(z => z.destroy());

        const labels = [];
        const zones = [];

        // capacity = number of slots (e.g., equals level)
        const slots = Math.max(1, ath.level || 1);
        ath.equippedAbilities ||= []; // make sure it exists

        const baseY = spr.y - 52;
        const startX = spr.x - (slots - 1) * 28;

        for (let s = 0; s < slots; s++) {
            const eq = ath.equippedAbilities[s] || null;
            const text = eq ? eq.code : '[slot]';
            const lbl = addText(this, startX + s * 56, baseY, text, {
                fontSize: '12px', fill: eq ? '#ff0' : '#999', backgroundColor: '#222', padding: 3
            })
                .setOrigin(0.5)
                .setInteractive();

            lbl.setData('dragType', 'slotLabel');
            lbl.setData('athleteName', ath.name);
            lbl.setData('slotIndex', s);
            lbl.setData('homeX', lbl.x);
            lbl.setData('homeY', lbl.y);
            this.input.setDraggable(lbl);

            labels.push(lbl);

            // drop zone (so chips can be dropped here)
            const z = this.add.zone(lbl.x, lbl.y, lbl.width + 16, lbl.height + 10)
                .setOrigin(0.5).setInteractive()
                .setRectangleDropZone(lbl.width + 16, lbl.height + 10);
            z.setData('type', 'abilitySlot');
            z.setData('athleteName', ath.name);
            z.setData('slotIndex', s);
            zones.push(z);
        }

        this.slotLabelsByAthlete[ath.name] = labels;
        this.slotZonesByAthlete[ath.name] = zones;
    }

    refreshAbilitySlotsFor(athName) {
        const ath = gameState.athletes.find(a => a.name === athName);
        if (!ath) return;
        const spr = this.athleteSprites[athName];
        if (!spr) return;
        this.drawAbilitySlotsFor(ath, spr);
    }

    equipAbility(athleteName, slotIndex, chipId) {
        const ath = gameState.athletes.find(a => a.name === athleteName);
        if (!ath) return;

        const inv = gameState.abilityInventory || [];
        const idx = inv.findIndex(c => c.id === chipId);
        if (idx === -1) return;
        const chip = inv.splice(idx, 1)[0]; // remove from inventory

        ath.equippedAbilities ||= [];
        // if something already in slot, put it back to inventory
        const replaced = ath.equippedAbilities[slotIndex] || null;
        if (replaced) {
            inv.push(replaced);
        }
        ath.equippedAbilities[slotIndex] = chip;

        this.drawAbilityInventory();
        this.refreshAbilitySlotsFor(athleteName);
    }

    unequipAbilityBySlot(athleteName, slotIndex) {
        const ath = gameState.athletes.find(a => a.name === athleteName);
        if (!ath) return;
        ath.equippedAbilities ||= [];

        const chip = ath.equippedAbilities[slotIndex];
        if (!chip) return;

        // put back to inventory
        gameState.abilityInventory ||= [];
        gameState.abilityInventory.push(chip);

        ath.equippedAbilities[slotIndex] = null;

        this.drawAbilityInventory();
        this.refreshAbilitySlotsFor(athleteName);
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

let _abilityInstCounter = 1;
function newInstId() {
    return 'abinst_' + (_abilityInstCounter++);
}

// Remove chip from inventory; return instance placed on athlete
function equipAbility(athlete, chipId) {
    const idx = gameState.abilityInventory.findIndex(c => c.id === chipId);
    if (idx === -1) return null;
    const chip = gameState.abilityInventory.splice(idx, 1)[0];
    const inst = {
        instId: newInstId(),
        code: chip.code,
        name: chip.name,
        desc: chip.desc,
        iconKey: chip.iconKey,
        tier: chip.tier
    };
    athlete.abilities ||= [];
    athlete.abilities.push(inst);
    return inst;
}

// Remove instance from athlete; return a chip back to inventory
function unequipAbilityByInstId(athleteName, instId) {
    const ath = gameState.athletes.find(a => a.name === athleteName);
    if (!ath || !ath.abilities) return null;
    const i = ath.abilities.findIndex(x => x && x.instId === instId);
    if (i === -1) return null;

    const inst = ath.abilities[i];
    ath.abilities[i] = null; // leave a hole for that slot
    return {
        id: 'chip_' + inst.instId, // new id for inventory
        code: inst.code,
        name: inst.name,
        desc: inst.desc,
        iconKey: inst.iconKey,
        tier: inst.tier,
        price: 3 // optional resale price, etc.
    };
}

// Redraw a single slot label under its zone
function refreshSlotLabel(scene, slotZone, athlete) {
    const idx = slotZone.getData('slotIndex');

    // remove any old text sitting on top of the slot (optional: track references)
    if (slotZone._label && !slotZone._label.destroyed) slotZone._label.destroy();

    const inst = (athlete.abilities || [])[idx] || null;
    const text = inst ? inst.code : '—';
    const color = inst ? '#ff0' : '#888';

    const lbl = scene.add.text(slotZone.x, slotZone.y, text, {
        fontSize: '12px', fill: color, backgroundColor: '#222', padding: 2
    }).setOrigin(0.5).setDepth(1001)
        .setInteractive()
        .setData('dragType', 'slotLabel')
        .setData('slotInstId', inst?.instId || null)
        .setData('slotAthlete', athlete.name);

    // Make draggable only if there is an ability in there
    if (inst) scene.input.setDraggable(lbl);

    slotZone._label = lbl;
}
