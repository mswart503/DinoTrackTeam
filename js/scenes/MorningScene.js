import { gameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { getNextWeeklyScene, playBackgroundMusic, createNextButton, addText } from '../utils/uiHelpers.js';
import { morningEvents } from '../data/morningEvents.js';


export default class MorningScene extends Phaser.Scene {
    constructor() {
        super('MorningScene');
    }

    create() {
        //playBackgroundMusic(this, 'planningMusic');
        this.scene.bringToTop('HUDScene');
        addBackground(this);
        // one shared tooltip (you can reuse your helper styles)
        this.tooltip = addText(this, 0, 0, '', { fontSize: '14px', fill: '#fff', backgroundColor: '#000', padding: { x: 4, y: 2 } })
            .setVisible(false)
            .setDepth(2000);

        // center "computer" monitor
        const w = this.scale.width * 0.6;
        const h = this.scale.height * 0.5;
        const cx = this.scale.width * 0.5;
        const cy = this.scale.height * 0.5;
        this.add.rectangle(cx, cy, w, h, 0x11151a).setStrokeStyle(2, 0x74808d).setDepth(1);

        // build today's inbox (at least 1)
        this.buildInbox();

        // container that holds the list
        this.listContainer = this.add.container(cx - w / 2 + 16, cy - h / 2 + 16).setDepth(2);
        this.drawInboxList(w - 32);
    }

    buildInbox() {
        // Reset daily discount by default; events can re-enable it.
        gameState.shopDiscountToday = 0;

        // filter eligible events
        const pool = morningEvents.filter(e => e.canShow(gameState));
        Phaser.Utils.Array.Shuffle(pool);

        const count = 1; // choose 1 for now; bump later if you like
        const todays = pool.slice(0, count).map(e => {
            const mail = e.build(gameState);
            return { id: e.id, event: e, ...mail, read: false };
        });

        gameState.morningInbox = todays;
    }

    drawInboxList(rowWidth) {
        this.listContainer.removeAll(true);

        // draw each email as a bar with two lines
        gameState.morningInbox.forEach((mail, i) => {
            const row = this.add.container(0, i * 64);
            const bg = this.add.rectangle(0, 0, rowWidth, 56, 0x1e242c)
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true });
            row.add(bg);

            const sender = addText(this, 8, 6, `${mail.sender.name} <${mail.sender.email}>`, {
                fontSize: '12px', fill: '#7fb1ff'
            }).setOrigin(0, 0);
            const subj = addText(this, 8, 28, mail.subject, {
                fontSize: '16px', fill: '#fff'
            }).setOrigin(0, 0);

            row.add([sender, subj]);
            row.setSize(rowWidth, 56);

            bg.on('pointerdown', () => this.openEmail(mail));

            this.listContainer.add(row);
        });

        // If inbox is empty, continue to Prep
        if (!gameState.morningInbox.length) {
            this.scene.start('PracticePreparationScene');
        }
    }

    openEmail(mail) {
        // Grey overlay
        const ov = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6)
            .setDepth(3000)
            .setInteractive();
        const card = this.add.rectangle(400, 300, 600, 360, 0x222933)
            .setDepth(3001);
        const title = addText(this, 400, 220, mail.subject, { fontSize: '22px', fill: '#fff' })
            .setOrigin(0.5).setDepth(3002);
        const from = addText(this, 400, 248, `${mail.sender.name} <${mail.sender.email}>`, { fontSize: '14px', fill: '#9bb0c8' })
            .setOrigin(0.5).setDepth(3002);
        const body = addText(this, 400, 300, mail.body, { fontSize: '16px', fill: '#fff' })
            .setOrigin(0.5).setDepth(3002);

        // choice buttons
        const btns = [];
        mail.choices.forEach((choice, idx) => {
            const btn = addText(this, 400, 360 + idx * 36, choice.label, {
                fontSize: '18px', fill: '#0f0', backgroundColor: '#111', padding: 4
            })
                .setOrigin(0.5)
                .setDepth(3002)
                .setInteractive()
                .on('pointerdown', () => {
                    // apply the choice
                    choice.apply(this, gameState, mail);
                    // mark mail as read & remove from inbox
                    gameState.morningInbox = gameState.morningInbox.filter(m => m !== mail);
                    // clean up UI and redraw list
                    [ov, card, title, from, body, ...btns].forEach(o => o.destroy());
                    this.drawInboxList(this.scale.width * 0.6 - 32);
                });
            btns.push(btn);
        });
    }

    // --- helpers used by events ---

    toast(text) {
        const t = addText(this, 400, 560, text, { fontSize: '18px', fill: '#fff', backgroundColor: '#000', padding: 4 })
            .setOrigin(0.5).setDepth(3500);
        this.time.delayedCall(1500, () => t.destroy());
    }

    pickOneAthlete(title, onPick) {
        const ov = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6).setDepth(4000).setInteractive();
        const ttl = addText(this, 400, 180, title, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5).setDepth(4001);

        const els = [ov, ttl];
        const x0 = 180, y = 320, spacing = 200;

        gameState.athletes.forEach((ath, i) => {
            const x = x0 + i * spacing;
            const spr = this.add.sprite(x, y, ath.spriteKeyx2).setInteractive().setDepth(4001);
            const nm = addText(this, x, y + 40, ath.name, { fontSize: '14px', fill: '#fff' }).setOrigin(0.5).setDepth(4001);
            els.push(spr, nm);
            spr.on('pointerdown', () => {
                onPick(ath.name);
                els.forEach(o => o.destroy());
            });
            spr.on('pointerover', () => spr.setTint(0x88ccff));
            spr.on('pointerout', () => spr.clearTint());
        });
    }

    pickManyAthletes(title, onConfirm) {
        const ov = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6).setDepth(4100).setInteractive();
        const ttl = addText(this, 400, 180, title, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5).setDepth(4101);

        const selected = new Set();
        const els = [ov, ttl];
        const x0 = 150, y = 320, spacing = 170;

        gameState.athletes.forEach((ath, i) => {
            const x = x0 + i * spacing;
            const spr = this.add.sprite(x, y, ath.spriteKeyx2).setInteractive().setDepth(4101);
            const nm = addText(this, x, y + 40, ath.name, { fontSize: '14px', fill: '#fff' }).setOrigin(0.5).setDepth(4101);
            els.push(spr, nm);

            spr.on('pointerdown', () => {
                if (selected.has(ath.name)) {
                    selected.delete(ath.name);
                    spr.clearTint();
                } else {
                    selected.add(ath.name);
                    spr.setTint(0x55ff55);
                }
            });
        });

        const confirm = addText(this, 400, 460, 'Confirm', {
            fontSize: '18px', fill: '#0f0', backgroundColor: '#111', padding: 4
        }).setOrigin(0.5).setInteractive().setDepth(4101)
            .on('pointerdown', () => {
                onConfirm([...selected]);
                els.concat(confirm).forEach(o => o.destroy());
            });
        els.push(confirm);

        const weekNum = gameState.currentWeek + 1; // 1‑based
        gameState.schools
            .filter(s => s.name !== gameState.playerSchool)
            .forEach(school => {
                school.athletes.forEach(athlete => {
                    let minB, maxB;
                    if (weekNum <= 6) {
                        minB = 0; maxB = 2;
                    } else if (weekNum <= 10) {
                        minB = 0; maxB = 3;
                    } else {
                        minB = 1; maxB = 4;
                    }
                    // roll a random boost in [minB..maxB] for each stat
                    const sp = Phaser.Math.Between(minB, maxB);
                    const st = Phaser.Math.Between(minB, maxB);
                    athlete.speed += sp;
                    athlete.stamina += st;
                });
            });

        addText(this, 400, 60, 'Morning Time', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);
        createNextButton(this, getNextWeeklyScene(this.scene.key), this.posx = 730, this.posy = 550);
    }
}
