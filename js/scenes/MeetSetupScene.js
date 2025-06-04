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
        const schools = [...gameState.schools];
        Phaser.Utils.Array.Shuffle(schools);
        const selectedSchools = schools.slice(0, 3);

        // Create a fresh event opponent list
        gameState.currentMeetOpponents = {};
        const allOpponents = selectedSchools.flatMap(s => s.athletes);
        Phaser.Utils.Array.Shuffle(allOpponents);

        events.forEach((event, index) => {
            const y = 100 + index * 150;

            // Opponents for the event
            gameState.currentMeetOpponents[event] = allOpponents.slice(index * 3, index * 3 + 3);

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
        if (this.assignments[eventName]) return; // prevent overwriting
    
        this.assignments[eventName] = athlete;
    
        // Show name in box
        this.add.text(dropZone.x, dropZone.y, athlete.name, {
            fontSize: '18px', fill: '#0f0'
        }).setOrigin(0.5);
    
        // Check if all events are assigned
        const allAssigned = Object.values(this.assignments).every(a => a);
        if (allAssigned) {
            this.nextButton.setAlpha(1).setInteractive();
        }
    }
    

}
//createNextButton(this, 'MeetResultsScene');
