// src/Scenes/ChallengeRaceScene.js
import { advanceDay, createNextButton, getNextScene } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { getNextWeeklyScene } from '../utils/uiHelpers.js';
import { RACE_CASH_REWARDS } from '../config/gameConfig.js';
import { addText } from '../utils/uiHelpers.js';


/*
How to tune:
STAMINA_DRAIN_RATE

Lower (<1) → stamina lasts longer than its nominal seconds.

Higher (>1) → drains faster.

STAMINA_SPEED_EFFECT

Lower (<0.8) → stamina matters less for speed (more floor).

Higher (>0.8) → stamina has bigger impact.

With these two constants you can keep your athlete’s raw stamina numbers small (say 5–8) 
but have races still feel fast. Adjust STAMINA_DRAIN_RATE until 100m takes ~8–12 s, 
and tweak STAMINA_SPEED_EFFECT so slowdown happens gradually.
*/

//const finishLine = 700;
const SPEED_MULTIPLIER = 2.5;
const STAMINA_DRAIN_RATE = 0.2;  // drains at half-speed (so 10 stamina lasts 20s)
const STAMINA_SPEED_EFFECT = 0.8;  // only 80% of topSpeed is modulated by stamina
// (20% is a guaranteed floor)
// how much extra drain per point of Speed (10% per speed‐point here)
const STAMINA_DRAIN_SPEED_FACTOR = 0.1;


export default class ChallengeRaceScene extends Phaser.Scene {
    constructor() {
        super('ChallengeRaceScene');
    }

    init(data) {
        // two arrays of athlete objects
        this.playerAthletes = data.playerAthletes || [];
        this.opponentAthletes = data.opponentAthletes || [];
        this.distanceLabel = data.distance;
    }

    create() {
        addBackground(this);
        this.scene.bringToTop('HUDScene');
        this.tooltip = addText(this, 0, 0, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 4, y: 2 }
        })
            .setVisible(false)
            .setDepth(10)
            .setScrollFactor(0);
        // header & line
        addText(this, 400, 100, `${this.distanceLabel} Challenge Race`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setScrollFactor(0);

        // --- Long background (4× screen width) ---
        // Camera & stage
        const cam = this.cameras.main;
        const W = this.scale.width;
        const H = this.scale.height;

        // Long background
        this.trackBG = this.add.image(0, 0, 'bgChallengeRaceLong')
            .setOrigin(0, 0)
            .setDepth(-10);

        // fit to height (keep aspect), then read world width
        const scaleY = H / this.trackBG.height;
        this.trackBG.setScale(scaleY);
        const worldW = this.trackBG.displayWidth;

        // Bounds
        cam.setBounds(0, 0, worldW, H);
        this.physics?.world?.setBounds(0, 0, worldW, H);

        // --- Distance model: entire art == 400 m ---
        const TRACK_METERS = 400;
        const leftMargin = 100;
        const rightMargin = 100;

        this.startX = leftMargin;                  // keep a handle; used elsewhere
        const usablePx = worldW - leftMargin - rightMargin;

        // pixels-per-meter so that the *whole* background = 400 m
        this.pxPerM = usablePx / TRACK_METERS;

        // raceMeters already set from SelectionScene (100/200/400)
        const raceMeters = parseInt(this.distanceLabel, 10);

        // Finish for *this* race is proportional along the 400 m track
        this.finishX = this.startX + raceMeters * this.pxPerM;

        // Lines & markers
        // Start line (0 m)
        this.add.line(this.startX, 240, 0, 0, 0, 258, 0xffffff).setOrigin(0.5, 0).setDepth(1);

        // 100 m markers across the full 400 m track so you always see them
        for (let m = 100; m < TRACK_METERS; m += 100) {
            const x = this.startX + m * this.pxPerM;
            this.add.line(x, 240, 0, 0, 0, 258, 0x888888).setOrigin(0.5, 0).setDepth(1);
            addText(this, x, 180, `${m}m`, { fontSize: '12px', fill: '#fff' })
                .setOrigin(0.5).setDepth(1);
        }

        // Finish line for the current race (green so it’s obvious)
        this.add.line(this.finishX, 240, 0, 0, 0, 258, 0x00ff00).setOrigin(0.5, 0).setDepth(1);

        // Smooth follow the leader (keep them ~60% from left)
        this.leaderOffset = Math.floor(W * 0.6);


        const allAthletes = [...this.opponentAthletes, ...this.playerAthletes];
        this.runners = allAthletes.map((athlete, i) => {
            const y = 230 + i * 60;
            //const startX = 100;

            const imageAdj = 50; // offset for player runners
            const key = athlete.spriteKeyx2;
            const sprite = this.add.sprite(this.startX, y, key).setScale(2);
            this.anims.create({ key: `${key}-run`, frames: this.anims.generateFrameNumbers(key, { start: 4, end: 10 }), frameRate: 10, repeat: -1 });
            sprite.play(`${key}-run`);
            //this.updateCameraToLeader();

            // UI container
            const ui = this.add.container(this.startX - 60 - imageAdj, y);
            // background
            ui.add(this.add.rectangle(-60 - imageAdj, 0, 210, 40, 0x222222).setOrigin(0.5));
            // speed text
            const speedText = addText(this, -140 - imageAdj, -10, 'Spd 0/0', { fontSize: '10px', fill: '#fff' }).setOrigin(0, 0.5);
            ui.add(speedText);
            // stamina bar + text
            const stmTitle = addText(this, -140 - imageAdj, 10, 'Stm', { fontSize: '10px', fill: '#fff' }).setOrigin(0, 0.5);

            const stmBarBg = this.add.rectangle(-100 - imageAdj, 10, 80, 6, 0x555555).setOrigin(0, 0.5);
            const stmBar = this.add.rectangle(-100 - imageAdj, 10, 80, 6, 0x44c236).setOrigin(0, 0.5);
            const stmText = addText(this, -10 - imageAdj, 10, '0/0', { fontSize: '10px', fill: '#fff' }).setOrigin(0, 0.5);
            ui.add([stmBarBg, stmBar, stmText, stmTitle]);
            // xp squares
            const xpSquares = [];
            for (let j = 0; j < athlete.level + 1; j++) {
                const sq = this.add.rectangle(-130 - imageAdj + j * 10, 25, 6, 6, 0x555555).setOrigin(0, 0.5);
                ui.add(sq);
                xpSquares.push(sq);
            }
            // still inside this.runners = allAthletes.map(...)
            const icons = [];
            athlete.abilities.forEach((ab, j) => {
                // place icons above the box; tweak X/Y as you like
                const icon = this.add.text(
                    -60 + j * 40,    // X offset in container
                    -20,             // Y offset in container
                    ab.code,
                    { fontSize: '12px', fill: '#ff0', backgroundColor: '#222', padding: 2 }
                )
                    .setOrigin(0.5)
                    .setInteractive()
                    .setDepth(3);

                // add into the same UI container so it moves with the runner
                ui.add(icon);
                icons.push(icon);

                // hover → show tooltip
                icon.on('pointerover', () => {
                    this.tooltip
                        .setText(`${ab.name}\n${ab.desc}`)
                        // get world position of the icon
                        .setPosition(
                            icon.getWorldTransformMatrix().tx,
                            icon.getWorldTransformMatrix().ty - 20
                        )
                        .setVisible(true);
                });
                icon.on('pointerout', () => {
                    this.tooltip.setVisible(false);
                });
            });

            // remember these icons for later highlighting
            athlete.abilityIcons = icons;


            //const initialX = startX;
            sprite.x = this.startX;

            return {
                athlete,
                sprite,
                uiContainer: ui,
                xPos: this.startX,
                yPos: y,
                stamina: athlete.stamina,
                speedText,
                stmBar,
                stmTitle,
                stmText,
                xpSquares,
                // ability flags…
                noDrainSecs: athlete.abilities.some(a => a.code === 'DS2') ? 2 : 0,
                r50: athlete.abilities.some(a => a.code === 'R50'),
                d50Enabled: athlete.abilities.some(a => a.code === 'D50'),
                d50Used: false,
                dashActive: false,
                slowActive: false,
                speedBuff: 0,
                raceBuffs: [],
                timeElapsed: 0,
                abilityIcons: athlete.abilityIcons,

            };
        });


        // attach partner references
        const oppCount = this.opponentAthletes.length;
        const oppRunners = this.runners.slice(0, oppCount);
        const plyRunners = this.runners.slice(oppCount);
        oppRunners.forEach((r, i) => r.partner = oppRunners[1 - i]);
        plyRunners.forEach((r, i) => r.partner = plyRunners[1 - i]);

        // schedule ability-driven effects
        this.runners.forEach(runner => {
            const codes = runner.athlete.abilities.map(a => a.code);
            // DH-: dash for 2s then slow
            if (codes.includes('DH-')) {
                runner.dashActive = true;
                this.time.delayedCall(2000, () => {
                    runner.dashActive = false;
                    runner.slowActive = true;
                    this.time.delayedCall(4000, () => runner.slowActive = false);
                });
            }
            // SP+: every 4s, +1 speed
            if (codes.includes('SP+')) {
                runner.speedBuff = 0;
                this.time.addEvent({
                    delay: 2000, loop: true, callback: () => {
                        runner.speedBuff++
                        const icon = runner.abilityIcons.find(ic => ic.text === 'SP+');
                        if (icon) {
                            icon.setTint(0x00ff00);
                            this.time.delayedCall(600, () => icon.clearTint());
                        }
                    }
                });
            }
            // ST+: every 3s, +1 stamina
            if (codes.includes('ST+')) {
                this.time.addEvent({
                    delay: 3000, loop: true, callback: () => {
                        runner.stamina = Math.min(runner.athlete.stamina, runner.stamina + 1)
                        const icon = runner.abilityIcons.find(ic => ic.text === 'ST+');
                        if (icon) {
                            icon.setTint(0x00ff00);
                            this.time.delayedCall(600, () => icon.clearTint());
                        }
                    }
                });
            }
            // partner effects: PSP/PST/PRS/BD1
            if (codes.includes('PSP')) {
                runner.partner.speedBuff = (runner.partner.speedBuff || 0) + 3;
                const icon = runner.abilityIcons.find(ic => ic.text === 'PSP');
                if (icon) {
                    icon.setTint(0x00ff00);
                    this.time.delayedCall(600, () => icon.clearTint());
                }
                // BD1: dash when boosting partner
                if (codes.includes('BD1')) {
                    runner.dashActive = true;
                    this.time.delayedCall(1000, () => runner.dashActive = false);
                    const icon = runner.abilityIcons.find(ic => ic.text === 'BD1');
                    if (icon) {
                        icon.setTint(0x00ff00);
                        this.time.delayedCall(600, () => icon.clearTint());
                    }
                }
            }
            if (codes.includes('PST')) {
                runner.partner.stamina = Math.min(runner.partner.athlete.stamina, runner.partner.stamina + 4);
                const icon = runner.abilityIcons.find(ic => ic.text === 'PST');
                if (icon) {
                    icon.setTint(0x00ff00);
                    this.time.delayedCall(600, () => icon.clearTint());
                }
                if (codes.includes('BD1')) {
                    runner.dashActive = true;
                    this.time.delayedCall(1000, () => runner.dashActive = false);
                    const icon = runner.abilityIcons.find(ic => ic.text === 'BD1');
                    if (icon) {
                        icon.setTint(0x00ff00);
                        this.time.delayedCall(600, () => icon.clearTint());
                    }
                }
            }
            if (codes.includes('PRS')) {
                this.time.addEvent({
                    delay: 3000, loop: true, callback: () => {
                        runner.partner.stamina = Math.min(runner.partner.athlete.stamina, runner.partner.stamina + 2)
                        const icon = runner.abilityIcons.find(ic => ic.text === 'PRS');
                        if (icon) {
                            icon.setTint(0x00ff00);
                            this.time.delayedCall(600, () => icon.clearTint());
                        }
                    }
                });
            }
        });

        // ─── 3) Attach buffs ───
        this.runners.forEach(runner => {
            runner.raceBuffs = gameState.activeBuffs.filter(b =>
                b.athleteName === runner.athlete.name && b.type === 'buffNextRace'
            );
        });
        gameState.activeBuffs = gameState.activeBuffs.filter(b => b.type !== 'buffNextRace');

        // ─── 4) Setup speed multipliers, buttons, then start sim ───
        this.speedMultiplier = SPEED_MULTIPLIER;

        // init UI bars/names
        this.runners.forEach(runner => {
            runner.stamina = runner.athlete.stamina;
        });

        // Camera logic: keep leader ~60% into the screen
        this.leaderOffset = Math.floor(W * 0.6);

        this.updateCameraToLeader = () => {
            const leaderX = Math.max(...this.runners.map(r => r.sprite.x));
            const desiredScrollX = Phaser.Math.Clamp(leaderX - this.leaderOffset, 0, worldW - W);
            // smooth scroll
            cam.scrollX = Phaser.Math.Linear(cam.scrollX, desiredScrollX, 0.15);
        };

        this.simulateOneOnOne(parseInt(this.distanceLabel));
    }

    simulateOneOnOne(distance) {

        this.time.removeAllEvents();
        this.resultsShown = false;

        this.time.addEvent({
            delay: 100, loop: true, callback: () => {
                const dt = 0.1 * this.speedMultiplier;

                let allDone = true;
                this.runners.forEach(runner => {
                    if (runner.finished) return;
                    allDone = false;

                    // apply raceBuffs
                    let drainRate = STAMINA_DRAIN_RATE;
                    let noDrain = runner.noDrainSecs;
                    let speedBonus = runner.speedBuff || 0;
                    runner.raceBuffs.forEach(b => {
                        if (b.buff === 'drainReduce') drainRate *= (1 - b.amount);
                        if (b.buff === 'noDrainFirst') noDrain = b.amount;
                        if (b.stat === 'speed') speedBonus += b.amount;
                    });

                    // D50
                    const ratio = runner.stamina / runner.athlete.stamina;
                    if (runner.d50Enabled && !runner.d50Used && ratio <= 0.5) {
                        runner.d50Used = true;
                        runner.dashActive = true;
                        // highlight the D50 icon briefly
                        const icon = runner.abilityIcons.find(ic => ic.text === 'D50');
                        if (icon) {
                            icon.setTint(0x00ff00);
                            this.time.delayedCall(600, () => icon.clearTint());
                        }
                    }

                    // Drain stamina
                    if (runner.timeElapsed >= noDrain && !runner.dashActive) {
                        const mul = 1 + runner.athlete.speed * STAMINA_DRAIN_SPEED_FACTOR;
                        runner.stamina = Math.max(0, runner.stamina - dt * drainRate * mul);
                    }
                    // Compute speed
                    let actualSpeed;
                    const baseMax = runner.athlete.speed + speedBonus;
                    const varn = (Math.random() - 0.5);
                    if (runner.dashActive) actualSpeed = baseMax + varn;
                    else if (runner.slowActive) actualSpeed = baseMax * 0.5;
                    else if (runner.r50 && ratio > 0.5) actualSpeed = baseMax + varn;
                    else {
                        const floor = baseMax * (1 - STAMINA_SPEED_EFFECT);
                        const scaled = baseMax * STAMINA_SPEED_EFFECT * ratio;
                        actualSpeed = Math.max(0, floor + scaled + varn);
                    }

                    // Tie animation
                    const rawTop = runner.athlete.speed;
                    const rawRate = Phaser.Math.Clamp(actualSpeed / rawTop, 0.5, 2);
                    runner.currentAnimScale = Phaser.Math.Linear(runner.currentAnimScale || 1, rawRate, 0.1);
                    runner.sprite.anims.timeScale = runner.currentAnimScale;

                    // Advance

                    runner.timeElapsed += dt;

                    // Advance X by fraction of race distance
                    // actualSpeed (m/s) * dt = meters moved; convert to pixels via pxPerM
                    runner.xPos += actualSpeed * dt * this.pxPerM;
                    runner.sprite.x = runner.xPos;

                    // Keep the UI box following the runner
                    runner.uiContainer.x = runner.sprite.x - 30;
                    runner.uiContainer.y = runner.yPos;

                    // Check finish
                    if (runner.xPos >= this.finishX) {
                        runner.xPos = this.finishX;
                        runner.sprite.x = this.finishX;
                        runner.finished = true;
                        runner.finishTime = runner.timeElapsed;
                    }



                    // Update speedText and stamina UI
                    runner.speedText.setText(`Spd ${actualSpeed.toFixed(1)}/${(runner.athlete.speed + runner.speedBuff).toFixed(1)}`);
                    const pct = runner.stamina / runner.athlete.stamina;
                    runner.stmBar.width = pct * 80;

                    runner.stmText.setText(`${Math.round(runner.stamina)}/${runner.athlete.stamina}`);
                    runner.xpSquares.forEach((sq, i) => {
                        sq.fillColor = i < runner.athlete.exp.xp ? 0x00ddff : 0x555555;
                    });

                    /*if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                    }*/
                });

                this.updateCameraToLeader();

                if (allDone && !this.resultsShown) {
                    this.showResult();
                    this.resultsShown = true;
                }
            }
        });
    }

    showResult() {
        if (this.resultsShown) return;
        this.resultsShown = true;
        this.time.removeAllEvents();

        // ─── 0) Update PRs ───
        this.runners.forEach(runner => {
            const key = this.distanceLabel;
            const prev = runner.athlete.prs[key];
            if (!prev || runner.finishTime < prev) {
                runner.athlete.prs[key] = runner.finishTime;
                runner.athlete.setNewPR = true;
            } else {
                runner.athlete.setNewPR = false;
            }
        });

        // ===== anchor everything to the current camera view =====
        const cam = this.cameras.main;
        const viewX = cam.scrollX;
        const viewW = cam.width;
        const viewH = cam.height;


        // --- 2) Header, fixed to screen ---
        addText(this, viewW / 2, 60, 'Week Results', { fontSize: '28px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Place labels down each lane, at the right edge of the current screen
        const placeLabels = ['1st', '2nd', '3rd', '4th'];
        const xAtRight = viewX + viewW - 80;  // world X near the right edge of the camera
        const sorted = [...this.runners].sort((a, b) => a.finishTime - b.finishTime);

        sorted.forEach((runner, idx) => {
            addText(this, xAtRight-150, runner.yPos, placeLabels[idx], {
                fontSize: '18px',
                fill: '#ff0',
                backgroundColor: '#000'
            }).setOrigin(0.5);
        });

        // --- 4) Tooltip for ability hovers (fixed to screen) ---
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 4, y: 2 }
        }).setVisible(false).setScrollFactor(0);

        // --- 5) Bottom info boxes: fixed to screen ---
        const boxW = 180, boxH = 80;
        const totalW = boxW * 4;
        const startX = (viewW - totalW) / 2 + boxW / 2;   // screen-centered
        const y = viewH - boxH / 2 - 10;

        this.runners.forEach((runner, i) => {
            const ax = startX + i * boxW;

            this.add.rectangle(ax, y, boxW - 4, boxH, 0x000000, 0.6)
                .setOrigin(0.5)
                .setScrollFactor(0);

            const pr = runner.athlete.prs[this.distanceLabel];
            const prText = pr ? pr.toFixed(1) + 's' : '—';

            this.add.text(ax - boxW / 2 + 10, y - boxH / 2 + 10, `PR: ${prText}`, { fontSize: '12px', fill: '#fff' })
                .setOrigin(0)
                .setScrollFactor(0);

            this.add.text(ax - boxW / 2 + 10, y - boxH / 2 + 30, `Spd: ${runner.athlete.speed.toFixed(1)}`, { fontSize: '12px', fill: '#fff' })
                .setOrigin(0)
                .setScrollFactor(0);

            // Ability icons — use text fallback if you don’t have textures
            (runner.athlete.abilities || []).forEach((ab, j) => {
                const icon = this.add.text(
                    ax - boxW / 2 + 10 + j * 24,
                    y + boxH / 2 - 20,
                    ab.code || 'AB',
                    { fontSize: '12px', fill: '#ff0', backgroundColor: '#222', padding: 2 }
                ).setOrigin(0, 0.5).setScrollFactor(0).setInteractive();

                icon.on('pointerover', (pointer) => {
                    this.tooltip
                        .setText(`${ab.name}\n${ab.desc}`)
                        .setPosition(pointer.x + 10, pointer.y - 30)
                        .setVisible(true);
                });
                icon.on('pointerout', () => this.tooltip.setVisible(false));
            });
        });

        // --- 6) Next button (fixed to screen) ---
        const next = createNextButton(this, getNextWeeklyScene(this.scene.key), viewW - 80, viewH - 40);
        next.setScrollFactor(0);
    }

}
