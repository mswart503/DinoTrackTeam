import { createNextButton } from '../utils/uiHelpers.js';
import { gameState } from '../gameState.js';
import { drawEventDropZone, drawPlayerAthleteCard, drawOpponentBlock } from '../utils/meetSetupUI.js';



export default class MeetSetupScene extends Phaser.Scene {
    constructor() {
        super('MeetSetupScene');
    }


    create() {
        this.add.text(400, 50, 'Meet Setup', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        //createNextButton(this, 'MeetRsultsScene', 700);
        this.assignments = {
            '100m': null,
            '200m': null,
            '400m': null
        };
        const events = ['100m', '200m', '400m'];
        const selectedSchools = Phaser.Utils.Array.Shuffle([...gameState.schools])
            .filter(s => s.name !== gameState.playerSchool)
            .slice(0, 3);

        // Set up opponent mapping
        gameState.currentMeetOpponents = { '100m': [], '200m': [], '400m': [] };

        selectedSchools.forEach(school => {
            const shuffledAthletes = Phaser.Utils.Array.Shuffle([...school.athletes]);

            // Assign one unique athlete from this school to each event
            ['100m', '200m', '400m'].forEach((event, idx) => {
                const athlete = shuffledAthletes[idx];
                if (athlete) {
                    gameState.currentMeetOpponents[event].push(athlete);
                }
            });
        });

        // Draw drop zones and opponent visuals
        ['100m', '200m', '400m'].forEach((event, index) => {
            const y = 100 + index * 150;
            drawEventDropZone(this, event, 400, y);
            drawOpponentBlock(this, event, gameState.currentMeetOpponents[event], 100, y);
        });


        // Player athlete assignment
        gameState.meetAssignments = {
            '100m': null,
            '200m': null,
            '400m': null,
        };

        // Draw player athlete cards (draggable)
        gameState.athletes.forEach((athlete, i) => {
            drawPlayerAthleteCard(this, athlete, 150 + i * 200, 550);
        });

        this.dropZones = {};

        events.forEach((event, i) => {
            const x = 200 + i * 200;
            const y = 300;

            this.dropZones[event] = drawEventDropZone(this, x, y, event, (eventName, athlete, dropZone) => {
                this.handleAssignment(eventName, athlete, dropZone);
            });
        });

        // Create Next button, initially disabled
        this.nextButton = createNextButton(this, 'MeetRaceScene', 400, 500);
        this.nextButton.setAlpha(0.5).disableInteractive();
    }

    update() {
        const filled = Object.values(gameState.meetAssignments).every(a => a);
        this.nextButton.setAlpha(filled ? 1 : 0.5);
        this.nextButton.setInteractive(filled);
    }

    handleAssignment(eventName, athlete, dropZone) {
        if (gameState.meetAssignments[eventName]) return; // prevent overwriting

        gameState.meetAssignments[eventName] = athlete.name;

        // Show name in box
        this.add.text(dropZone.x, dropZone.y, athlete.name, {
            fontSize: '18px', fill: '#0f0'
        }).setOrigin(0.5);

        // Check if all events are assigned
        const allAssigned = Object.values(gameState.meetAssignments).every(a => a);
        if (allAssigned) {
            this.nextButton.setAlpha(1).setInteractive();
        }
    }


}
//createNextButton(this, 'MeetResultsScene');
