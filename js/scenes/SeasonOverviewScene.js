import { createNextButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { playBackgroundMusic } from '../utils/uiHelpers.js';

export default class SeasonOverviewScene extends Phaser.Scene {
    constructor() {
        super('SeasonOverviewScene');
    }

    create() {
        playBackgroundMusic(this, 'planningMusic');

        //this.add.text(400, 300, 'Current Standings', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        //this.add.text(20, 20, `Week:${gameState.currentWeek}`, { fontSize: '40px', fill: '#fff' }).setOrigin(0.0);
        //this.add.text(20, 60, `${gameState.daysOfWeek[gameState.currentDayIndex]}`, { fontSize: '40px', fill: '#fff' }).setOrigin(0.0);
        this.renderCalendar();
        this.renderStandings();
        let nextScene;
        console.log(gameState.currentDayIndex)
        if (gameState.madeState === false) {
            if (gameState.currentDayIndex === 5) { // Saturday
                nextScene = 'MeetSetupScene';
            }
            else {
                nextScene = 'MorningScene';
            }
        } else {
            if (gameState.currentDayIndex === 5) { // Saturday
                nextScene = 'StateChampionshipScene';
            }
            else {
                nextScene = 'MorningScene';
            }
        }

        createNextButton(this, nextScene, 700);
        
    }

    
    renderCalendar() {
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

                this.add.text(220 + d * 80, yPos+12, dayName[0], { fontSize: '20px', fill: color }).setOrigin(0.5);
            }

            yPos += 40;
        }
    }

    renderStandings() {
        this.add.text(400, 40, 'Season Standings', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Sort schools by points (descending)
        const sortedSchools = [...gameState.schools].sort((a, b) => b.points - a.points);

        const startY = 250;
        const rowHeight = 40;

        sortedSchools.forEach((school, index) => {
            const color = school.isPlayer ? '#ff0' : '#fff';
            this.add.text(
                400,
                startY + index * rowHeight,
                `${index + 1}. ${school.name} - ${school.points} pts`,
                { fontSize: '24px', fill: color }
            ).setOrigin(0.5);
        });
    }
}
