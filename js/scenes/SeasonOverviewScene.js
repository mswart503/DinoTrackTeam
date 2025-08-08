import { createNextButton, createSkipButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { playBackgroundMusic } from '../utils/uiHelpers.js';
import { addText, getNextWeeklyScene } from '../utils/uiHelpers.js';

function watchNPCStatChanges() {
  const wrap = (obj, key, label) => {
    let _v = obj[key];
    Object.defineProperty(obj, key, {
      get() { return _v; },
      set(v) {
        console.trace(`[NPC STAT WRITE] ${label}.${key}: ${_v} → ${v}`);
        _v = v;
      },
      configurable: true,
      enumerable: true
    });
  };

  gameState.schools.forEach(s => {
    if (s.name === gameState.playerSchool) return; // NPCs only
    s.athletes.forEach(a => {
      wrap(a, 'speed',   `${s.name}/${a.name}`);
      wrap(a, 'stamina', `${s.name}/${a.name}`);
    });
  });
}


export default class SeasonOverviewScene extends Phaser.Scene {
    constructor() {
        super('SeasonOverviewScene');
    }

    create() {
       // watchNPCStatChanges();

        playBackgroundMusic(this, 'planningMusic');
        this.scene.launch('HUDScene');

        // ─── 1) Render Top 10 PRs down the left ───
        this.renderPRRankings();

        //this.add.text(400, 300, 'Current Standings', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        //this.add.text(20, 20, `Week:${gameState.currentWeek}`, { fontSize: '40px', fill: '#fff' }).setOrigin(0.0);
        //this.add.text(20, 60, `${gameState.daysOfWeek[gameState.currentDayIndex]}`, { fontSize: '40px', fill: '#fff' }).setOrigin(0.0);
        //this.renderCalendar();
        // Check for season end
        if (gameState.currentWeek >= gameState.schedule.length) {
            // all 14 weeks done
            return this.scene.start('SeasonResultsScene');
        }

        // Otherwise, show standings for gameState.currentWeek + 1…
        addText(this, 400, 60, `Week ${gameState.currentWeek + 1} of ${gameState.schedule.length}`, {
            fontSize: '14px', fill: '#fff'
        }).setOrigin(0.5, 0);

        this.renderStandings();

        createNextButton(this, getNextWeeklyScene(this.scene.key), this.posx = 700, this.posy = 550);


    }

    /**
+     * Collect every athlete with a 100m PR, sort by fastest,
+     * take top 10, display along left with ▲/▼ arrows, then
+     * stash this week’s order for next comparison.
+     */
    renderPRRankings() {
        const all = gameState.schools.flatMap(s => s.athletes);
        const withPR = all.filter(a => typeof a.prs?.['100m'] === 'number');
        const sorted = [...withPR].sort((a, b) => a.prs['100m'] - b.prs['100m']);
        const top10 = sorted.slice(0, 10);
        const prev = gameState.lastPRRanking || [];

        const startX = 20;
        const startY = 120;
        const rowH = 48;

        // header
        addText(this, startX, startY - rowH, 'Top 10 100m PRs', {
            fontSize: '16px', fill: '#fff'
        }).setOrigin(0);

        top10.forEach((ath, i) => {
            const y = startY + i * rowH;

            // 1) Avatar sprite
            this.add.image(startX + 16, y - 10, ath.spriteKey)
                .setDisplaySize(32, 32)
                .setOrigin(0);

            // 2) Name + time
            const pr = ath.prs['100m'].toFixed(2);
            const prevIdx = prev.indexOf(ath.name);
            let arrow = '', color = '#fff';
            if (prevIdx !== -1) {
                if (prevIdx > i) { arrow = ' ▲'; color = '#0f0'; }
                else if (prevIdx < i) { arrow = ' ▼'; color = '#f00'; }
            }

            this.add.text(startX + 56, y,
                `${i + 1}. ${ath.name} — ${pr}s${arrow}`, {
                fontSize: '16px', fill: color
            }
            ).setOrigin(0, 0.5);

            // 3) School below
            const school = gameState.schools.find(s => s.athletes.includes(ath))?.name || '';
            this.add.text(startX + 56, y + 18,
                school, { fontSize: '12px', fill: '#aaa' }
            ).setOrigin(0, 0.5);

            // Highlight your own athletes with a gold background
            if (gameState.athletes.includes(ath)) {
                this.add.rectangle(
                    startX+50, y,            // top‐left corner
                    190, 30,     // width & height
                    0xFFD700,             // gold
                    0.3                   // 30% opacity
                ).setOrigin(0, 0.5);
            }
        });

        // save for next comparison
        gameState.lastPRRanking = top10.map(a => a.name);
    }


    renderStandings() {
        addText(this, 400, 40, 'Season Standings', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);

        const sortedSchools = [...gameState.schools].sort((a, b) => b.points - a.points);
        const startY = 110;
        const rowHeight = 40;

        this.tooltip = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 8, y: 4 },
            wordWrap: { width: 250 },
        }).setVisible(false).setDepth(10);

        sortedSchools.forEach((school, index) => {
            const color = school.isPlayer ? '#ff0' : '#fff';
            const text = this.add.text(
                480,
                startY + index * rowHeight,
                `${index + 1}. ${school.name} - ${school.points} pts`,
                { fontSize: '20px', fill: color }
            )/*.setOrigin(0.5)*/.setInteractive();

            text.on('pointerover', (pointer) => {
                const rosterInfo = school.athletes.map(a => {
                    return `${a.name}:\n  100m: ${a.prs?.['100m']?.toFixed(2)}`;
                }).join('\n\n');

                /* return `${a.name}:\n  100m: ${a.prs?.['100m']?.toFixed(2) ?? 'N/A'}\n  200m: ${a.prs?.['200m']?.toFixed(2) ?? 'N/A'}\n  400m: ${a.prs?.['400m']?.toFixed(2) ?? 'N/A'}`;
                }).join('\n\n');*/

                this.tooltip.setText(`Team: ${school.name}\n\n${rosterInfo}`);
                const tooltipWidth = this.tooltip.width;
                const tooltipHeight = this.tooltip.height;
                const screenWidth = this.sys.game.config.width;
                const screenHeight = this.sys.game.config.height;

                // Default position: offset from pointer
                let x = pointer.x + 10;
                let y = pointer.y + 10;

                // Adjust if tooltip would go off the right edge
                if (x + tooltipWidth > screenWidth) {
                    x = screenWidth - tooltipWidth - 10;
                }

                // Adjust if tooltip would go off the bottom edge
                if (y + tooltipHeight > screenHeight) {
                    y = screenHeight - tooltipHeight - 10;
                }

                this.tooltip.setPosition(x, y);
                this.tooltip.setVisible(true);
            });

            text.on('pointerout', () => {
                this.tooltip.setVisible(false);
            });
        });
    }
}
