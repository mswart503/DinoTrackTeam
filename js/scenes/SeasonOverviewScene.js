import { createNextButton, createSkipButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { playBackgroundMusic } from '../utils/uiHelpers.js';
import { getNextWeeklyScene } from '../utils/uiHelpers.js';


export default class SeasonOverviewScene extends Phaser.Scene {
    constructor() {
        super('SeasonOverviewScene');
    }

    create() {
        playBackgroundMusic(this, 'planningMusic');
        this.scene.launch('HUDScene');
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
        this.add.text(400, 60, `Week ${gameState.currentWeek + 1} of ${gameState.schedule.length}`, {
            fontSize: '18px', fill: '#fff'
        }).setOrigin(0.5, 0);

        this.renderStandings();

        createNextButton(this, getNextWeeklyScene(this.scene.key));


    }


    /*renderCalendar() {
        const startWeek = Math.max(1, gameState.currentWeek - 1);  // show previous week if possible
        const endWeek = Math.min(gameState.totalWeeks, startWeek + 3);

        let yPos = 80;

        for (let week = startWeek; week <= endWeek; week++) {
            const weekLabel = this.add.text(100, yPos, `Week ${week}:`, { fontSize: '24px', fill: '#fff' });

            for (let d = 0; d < gameState.daysOfWeek.length; d++) {
                const dayName = gameState.daysOfWeek[d];
                let color = '#aaa';
                if (week === gameState.currentWeek) {
                    if (d === gameState.currentDayIndex) {
                        color = '#0f0';  // current day
                    } else if (d < gameState.currentDayIndex) {
                        color = '#fff';  // past days
                    }
                }

                this.add.text(220 + d * 80, yPos + 12, dayName[0], { fontSize: '20px', fill: color }).setOrigin(0.5);
            }

            yPos += 40;
        }
    }*/

    renderStandings() {
        this.add.text(400, 40, 'Season Standings', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

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
                    return `${a.name}:\n  100m: ${a.prs?.['100m']?.toFixed(2) ?? 'N/A'}\n  200m: ${a.prs?.['200m']?.toFixed(2) ?? 'N/A'}\n  400m: ${a.prs?.['400m']?.toFixed(2) ?? 'N/A'}`;
                }).join('\n\n');

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
