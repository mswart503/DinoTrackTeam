// src/Scenes/ChallengeRaceScene.js
import { advanceDay, createNextButton, getNextScene } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { getNextWeeklyScene } from '../utils/uiHelpers.js';



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

const finishLine = 700;
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
        // redraw background & HUD
        addBackground(this);
        this.scene.bringToTop('HUDScene');

        // header
        this.add.text(400, 40, `${this.distanceLabel} Challenge Race`, {
            fontSize: '32px', fill: '#fff'
        }).setOrigin(0.5);

        // finish line
        this.add.line(finishLine, 240, 0, 0, 0, 258, 0xffffff)
            .setOrigin(0.5, 0).displayWidth = 10;

        // ─── 1) BUILD your runner list first ───
        const allRunners = [
            ...this.opponentAthletes,
            ...this.playerAthletes
        ];

        // ─── 2) NOW map them into runner‐objects & sprites ───
        this.runners = allRunners.map((athlete, i) => {
            const y = 230 + i * 60;       // lanes
            const key = athlete.spriteKeyx2;

            // sprite + animation
            const sprite = this.add.sprite(100, y, key).setScale(2);
            this.anims.create({
                key: `${key}-run`,
                frames: this.anims.generateFrameNumbers(key, { start: 4, end: 10 }),
                frameRate: 10, repeat: -1
            });
            sprite.play(`${key}-run`);

            // stamina bar
            this.add.rectangle(50, y + 20, 60, 8, 0x555555).setOrigin(0.5);
            const bar = this.add.rectangle(50, y + 20, 60, 8, 0x00ff00).setOrigin(0.5);

            // name
            this.add.text(50, y, athlete.name, {
                fontSize: '14px', fill: '#fff'
            }).setOrigin(0.5);

            return {
                athlete,
                sprite,
                staminaBar: bar,
                xPos: 100,
                yPos: y,
                stamina: athlete.stamina,
                strideFreq: 0,
                distanceLeft: parseInt(this.distanceLabel),
                timeElapsed: 0,
                finished: false
            };
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
        // … your +/- button code here …
        this.simulateOneOnOne(parseInt(this.distanceLabel));
    }

    simulateOneOnOne(distance) {
        // Kill off any previous events so they don’t pile up:
        this.time.removeAllEvents();
        this.resultsShown = false;
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                const timeStep = 0.1 * this.speedMultiplier;
                let allDone = true;

                this.runners.forEach(runner => {
                    if (runner.finished) return;
                    allDone = false;

                    // --- NEW: Gather this runner’s race buffs ---
                    let drainRate = STAMINA_DRAIN_RATE;  // base drain rate
                    let noDrainSecs = 0;                   // seconds at start with zero drain
                    let speedBonus = 0;                   // flat speed bonus next race

                    runner.raceBuffs.forEach(b => {
                        if (b.buff === 'drainReduce') drainRate *= (1 - b.amount);
                        if (b.buff === 'noDrainFirst') noDrainSecs = b.amount;
                        if (b.stat === 'speed') speedBonus += b.amount;
                    });

                    // compute a speed‑based penalty: faster runners lose stamina more quickly
                    const speedPenaltyMultiplier = 1 + runner.athlete.speed * STAMINA_DRAIN_SPEED_FACTOR;
                    // --- 1) Drain stamina (with no‐drain window) ---
                    if (runner.timeElapsed >= noDrainSecs) {
                        runner.stamina = Math.max(0, runner.stamina - timeStep * drainRate * speedPenaltyMultiplier);
                    }
                    const ratio = runner.stamina / runner.athlete.stamina;

                    // --- 2) Recompute top speed including +speed buffs ---
                    const baseMax = runner.athlete.speed + speedBonus;
                    const floor = baseMax * (1 - STAMINA_SPEED_EFFECT);
                    const scaled = baseMax * STAMINA_SPEED_EFFECT * ratio;
                    const variation = (Math.random() - 0.5);
                    const actualSpeed = Math.max(0, floor + scaled + variation);

                    // 2.5) TIE ANIMATION TO SPEED
                    // **NEW** tie animation speed to actualSpeed
                    if (!runner.currentAnimScale) {
                        runner.currentAnimScale = 1;    // initialize
                    }

                    // compute your raw rate as before
                    const rawTop = runner.athlete.speed + speedBonus;
                    const rawRate = Phaser.Math.Clamp(actualSpeed / rawTop, 0.5, 2.0);

                    // smooth it: move 10% of the way there each tick
                    runner.currentAnimScale = Phaser.Math.Linear(
                        runner.currentAnimScale,
                        rawRate,
                        0.1    // smoothing factor: 0.1 = fairly quick but not instant
                    );

                    // apply to animation
                    runner.sprite.anims.timeScale = runner.currentAnimScale;

                    // --- 3) Advance as before ---
                    runner.timeElapsed += timeStep;
                    runner.distanceLeft -= actualSpeed * timeStep;
                    runner.xPos += (finishLine - 100) * (actualSpeed * timeStep / distance);
                    runner.sprite.x = runner.xPos;

                    // --- 4) Update the stamina bar & color ---
                    const pct = runner.stamina / runner.athlete.stamina;
                    runner.staminaBar.width = pct * 60;
                    runner.staminaBar.fillColor = pct < 0.3 ? 0xff0000 : (pct < 0.6 ? 0xffff00 : 0x00ff00);

                    // inside your runners.forEach:
                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.finishTime = runner.timeElapsed;
                        runner.sprite.x = finishLine;
                        console.log(`➔ ${runner.athlete.name} finished in ${runner.finishTime.toFixed(2)}s`);
                    }

                });
                let dispResults = this.resultsShown;
                console.log({
                    allDone,
                    dispResults,      // or leaderboardActive, whichever you use
                    finishedCount: this.runners.filter(r => r.finished).length
                });

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

        // ─── 1) Sort & award points ───
        const sorted = [...this.runners].sort((a, b) => a.finishTime - b.finishTime);
        const pts = [4, 2, 1, 0];
        sorted.forEach((runner, idx) => {
            const school = gameState.schools.find(s => s.athletes.includes(runner.athlete));
            if (school) school.points += pts[idx];
        });

        // ─── 2) Draw your results UI ───
        this.add.text(400, 100, '🏁 Week Results 🏁', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        const placeLabels = ['1st', '2nd', '3rd', '4th'];
        sorted.forEach((runner, idx) => {
            this.add.text(finishLine + 40, runner.yPos, placeLabels[idx], {
                fontSize: '20px', fill: '#ff0'
            }).setOrigin(0.5);
        });



        // 4) Prepare a tooltip for ability hovers
        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 4, y: 2 }
        }).setVisible(false);

        // 5) Draw 4 info‑boxes at bottom: [opp1, opp2, you1, you2]
        const boxW = 180, boxH = 80;
        const totalW = boxW * 4;
        const startX = (this.sys.game.config.width - totalW) / 2 + boxW / 2;
        const y = this.sys.game.config.height - boxH / 2 - 10;

        this.runners.forEach((runner, i) => {
            const ax = startX + i * boxW;

            // background rectangle
            const bg = this.add.rectangle(ax, y, boxW - 4, boxH, 0x000000, 0.6)
                .setOrigin(0.5);

            // PR display
            const pr = runner.athlete.prs[this.distanceLabel];
            const prText = pr
                ? pr.toFixed(1) + 's'
                : '—';
            const t1 = this.add.text(
                ax - boxW / 2 + 10,
                y - boxH / 2 + 10,
                `PR: ${prText}`,
                { fontSize: '12px', fill: '#fff' }
            ).setOrigin(0);

            // Speed display
            const t2 = this.add.text(
                ax - boxW / 2 + 10,
                y - boxH / 2 + 30,
                `Spd: ${runner.athlete.speed.toFixed(1)}`,
                { fontSize: '12px', fill: '#fff' }
            ).setOrigin(0);

            // Abilities icons (assumes athlete.abilities = [{ iconKey, name, description }, ...])
            (runner.athlete.abilities || []).forEach((ab, j) => {
                const icon = this.add.image(
                    ax - boxW / 2 + 10 + j * 24,
                    y + boxH / 2 - 20,
                    ab.iconKey
                )
                    .setScale(0.5)
                    .setInteractive();

                // hover tooltip
                icon.on('pointerover', () => {
                    this.tooltip
                        .setText(`${ab.name}\n${ab.description}`)
                        .setPosition(icon.x + 10, icon.y - 30)
                        .setVisible(true);
                });
                icon.on('pointerout', () => {
                    this.tooltip.setVisible(false);
                });
            });
        });

        // 6) After a delay, go to next week’s SeasonOverview
        this.time.delayedCall(3000, () => {
            createNextButton(this, getNextWeeklyScene(this.scene.key));
        });
    }

}
