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
        const w = this.scale.width * 0.6 -20;
        const h = this.scale.height * 0.5 -30;
        const cx = this.scale.width * 0.5-10;
        const cy = this.scale.height * 0.5-12;
        this.add.rectangle(cx, cy, w, h, 0xa0e0F3).setStrokeStyle(2, 0x74808d).setDepth(1);

        // build today's inbox (at least 1)
        this.buildInbox();
        this.inbox = gameState.morningInbox;   // <-- add this

        // container that holds the list
        this.listContainer = this.add.container(cx - w / 2 + 16, cy - h / 2 + 16).setDepth(2);
        this.drawInboxList();
        this.nextBtn = addText(this, 720, 560, 'Next', { fontSize: '22px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start(getNextWeeklyScene(this.scene.key));
            });
    }

    buildInbox() {
        // Reset daily discount by default; events can re-enable it.
        gameState.shopDiscountToday = 0;

        // filter eligible events
        const pool = morningEvents.filter(e => e.canShow(gameState));
        Phaser.Utils.Array.Shuffle(pool);

        const count = 1; // choose 1 for now; bump later if you like
        const todays = pool.slice(0, count).map(e => {
            const mail = this.normalizeMail(e.build(gameState));
            return { id: e.id, event: e, ...mail, read: false };
        });
        gameState.morningInbox = todays;
    }

    normalizeMail(mail) {
        // Old names -> new names
        if (!mail.resolveAll && typeof mail.applyAll === 'function') {
            mail.resolveAll = mail.applyAll;
        }
        if (!mail.resolveOne && typeof mail.chooseOne === 'function') {
            mail.resolveOne = mail.chooseOne;
        }
        // If using a generic "choices" array, convert first two into handlers
        if (!mail.resolveAll && !mail.resolveOne && Array.isArray(mail.choices)) {
            const all = mail.choices.find(c => /all/i.test(c.label));
            const one = mail.choices.find(c => /athlete|one/i.test(c.label));
            if (all) mail.resolveAll = (scene) => all.apply(scene, gameState);
            if (one) mail.resolveOne = (scene, athlete) => one.apply(scene, gameState, athlete);
        }
        return mail;
    }

    drawInboxList() {
        // Clear previous rows inside the computer panel
        if (this.listContainer) this.listContainer.removeAll(true);

        // Width of the panel content (same numbers you used when drawing the monitor)
        const panelContentW = this.scale.width * 0.6 - 32; // 16px padding on each side
        const rowH = 48;

        this.inbox.forEach((mail, i) => {
            const y = 24 + i * rowH; // 24px top padding inside panel
            const bar = this.add.rectangle(panelContentW / 2-10, y, panelContentW-20, 40, mail.resolved ? 0xa2cdec : 0x4C656d)
                /*.setStrokeStyle(1, 0xffffff)*/
                .setInteractive();

            const sender = addText(this, 16, y - 8, `${mail.sender.name}`, { fontSize: '14px' }) //<${mail.sender.email}>`
                .setOrigin(0, 0.5);

            const subj = addText(this, 16, y + 10, mail.subject, { fontSize: '12px', fill: '#aaa' })
                .setOrigin(0, 0.5);

            const status = addText(this, panelContentW - 16, y, mail.resolved ? '✓' : '', { fontSize: '14px', fill: '#0f0' })
                .setOrigin(1, 0.5);

            bar.on('pointerdown', () => this.openEmailModal(mail));

            // add all into the panel container
            this.listContainer.add([bar, sender, subj, status]);
        });
    }


    openEmailModal(mail) {
        console.log('Email modal:', mail.subject, {
            resolveAll: typeof mail.resolveAll,
            resolveOne: typeof mail.resolveOne
        });
        // overlay + panel
        const ov = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.6).setDepth(100).setInteractive();
        const panel = this.add.rectangle(400, 300, 600, 380, 0x222222).setDepth(101);

        const fromName = mail.fromName ?? mail.sender?.name ?? 'Unknown';
        const fromEmail = mail.fromEmail ?? mail.sender?.email ?? '';
        const from = addText(this, 220, 170, `${fromName} <${fromEmail}>`, { fontSize: '14px' }).setDepth(101).setOrigin(0, 0.5);
        const subj = addText(this, 220, 200, mail.subject, { fontSize: '16px' }).setDepth(101).setOrigin(0, 0.5);
        const body = addText(this, 220, 240, mail.body, { fontSize: '14px', wordWrap: { width: 520 } }).setDepth(101).setOrigin(0, 0);

        const closeBtn = addText(this, 680, 130, '✕', { fontSize: '18px' })
            .setDepth(102).setOrigin(1, 0.5).setInteractive()
            .on('pointerdown', () => cleanup());

        const els = [ov, panel, from, subj, body, closeBtn];

        // Helper to make a button
        const makeBtn = (x, label, handler) => {
            const b = addText(this, x, 520, label, { fontSize: '16px', fill: '#fff', backgroundColor: '#333', padding: 4 })
                .setDepth(102).setOrigin(0.5).setInteractive()
                .on('pointerdown', handler);
            els.push(b);
            return b;
        };

        // Prefer choices[] if provided
        if (Array.isArray(mail.choices) && mail.choices.length) {
            const baseX = 340, spacing = 160;
            mail.choices.forEach((choice, i) => {
                makeBtn(baseX + i * spacing, choice.label, () => {
                    // remember which mail to resolve after any pickers
                    this._mailAwaitingResolution = mail;
                    // close the modal first (so pickers show cleanly)
                    cleanup();
                    try {
                        choice.apply(this, gameState);
                        // If the choice was synchronous (no picker opened), resolve now
                        if (!this._pickerOpen) {
                            mail.resolved = true;
                            this._mailAwaitingResolution = null;
                            this.drawInboxList();
                        }
                    } catch (err) {
                        console.error('Choice handler failed:', err);
                        this._mailAwaitingResolution = null;
                    }
                });
            });
        } else {
            // Back-compat: resolveAll / resolveOne
            if (typeof mail.resolveAll === 'function') {
                makeBtn(340, 'Apply to all', () => {
                    mail.resolveAll(this);
                    mail.resolved = true;
                    cleanup();
                    this.drawInboxList();
                });
            }
            if (typeof mail.resolveOne === 'function') {
                makeBtn(500, 'Choose athlete', () => {
                    // keep modal open or close? close for clarity
                    cleanup();
                    this._mailAwaitingResolution = mail;
                    this.pickOneAthlete('Choose an athlete', (name) => {
                        const athlete = gameState.athletes.find(a => a.name === name);
                        if (athlete) mail.resolveOne(this, athlete);
                        // picker will mark resolved & refresh via pickOneAthlete()
                    });
                });
            }
            // If no actions at all, provide OK
            if (els.length === 6) { // only the base 6 elements exist
                makeBtn(420, 'OK', () => { cleanup(); this.drawInboxList(); });
            }
        }

        function cleanup() { els.forEach(e => e.destroy()); }
    }

    // --- helpers used by events ---

    toast(text) {
        const t = addText(this, 400, 560, text, { fontSize: '18px', fill: '#fff', backgroundColor: '#000', padding: 4 })
            .setOrigin(0.5).setDepth(3500);
        this.time.delayedCall(1500, () => t.destroy());
    }

    pickOneAthlete(title, onPick) {
        this._pickerOpen = true;

        const ov = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75)
            .setDepth(200).setInteractive();
        const panel = this.add.rectangle(400, 300, 500, 320, 0x111111).setDepth(201);
        const ttl = addText(this, 400, 170, title, { fontSize: '18px' })
            .setDepth(202).setOrigin(0.5);

        const els = [ov, panel, ttl];
        const startX = 200, startY = 220, col = 220, row = 60;

        gameState.athletes.forEach((ath, i) => {
            const x = startX + (i % 2) * col;
            const y = startY + Math.floor(i / 2) * row;
            const btn = addText(this, x, y, ath.name, {
                fontSize: '16px', fill: '#fff', backgroundColor: '#333', padding: 4
            })
                .setDepth(202).setOrigin(0.5).setInteractive()
                .on('pointerdown', () => {
                    onPick(ath.name);
                    els.forEach(e => e.destroy());
                    this._pickerOpen = false;
                    // If this was launched from an email, mark it resolved & refresh the list
                    if (this._mailAwaitingResolution) {
                        this._mailAwaitingResolution.resolved = true;
                        this._mailAwaitingResolution = null;
                        this.drawInboxList();
                    }
                });
            els.push(btn);
        });

        const cancel = addText(this, 400, 520, 'Cancel', { fontSize: '14px', fill: '#aaa' })
            .setDepth(202).setOrigin(0.5).setInteractive()
            .on('pointerdown', () => {
                els.forEach(e => e.destroy());
                this._pickerOpen = false;
                // don’t resolve the email on cancel
            });
        els.push(cancel);
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


    }
}
