
// game.js
// First we'll define all scene classes, then create the game configuration

// Global game state
let gameState = {
    week: 1,
    day: 1,
    teamName: "Jurassic High Raptors",
    division: "1A",
    seasonPoints: 0,
    qualifiedForState: false,
    funds: 1000,
    athletes: [
        { id: 1, name: "Rex", type: "T-Rex", speed: 3, strength: 5, endurance: 2, technique: 1, level: 1, experience: 0 },
        { id: 2, name: "Tri", type: "Triceratops", speed: 2, strength: 4, endurance: 4, technique: 2, level: 1, experience: 0 },
        { id: 3, name: "Petrie", type: "Pterodactyl", speed: 5, strength: 1, endurance: 3, technique: 3, level: 1, experience: 0 },
        { id: 4, name: "Velo", type: "Velociraptor", speed: 5, strength: 2, endurance: 3, technique: 2, level: 1, experience: 0 },
    ],
    trainingTechniques: ["Basic", "Intermediate"],
    events: ["100m Dash", "Long Jump", "Javelin Throw", "800m Run"]
};

// Helper function to create buttons
function createButton(scene, x, y, text, callback) {
    const buttonStyle = { 
        backgroundColor: '#4a6c2f',
        padding: { x: 10, y: 10 },
        fontFamily: 'Arial',
        fontSize: '18px'
    };
    
    const button = scene.add.text(x, y, text, { 
        fontFamily: 'Arial', 
        fontSize: '18px', 
        fill: '#ffffff' 
    })
    .setOrigin(0.5)
    .setPadding(10)
    .setStyle(buttonStyle)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => callback())
    .on('pointerover', () => button.setStyle({ fill: '#ffff00' }))
    .on('pointerout', () => button.setStyle({ fill: '#ffffff' }));
    
    const buttonBackground = scene.add.rectangle(
        x, 
        y, 
        button.width + 20, 
        button.height + 10, 
        0x4a6c2f
    ).setOrigin(0.5);
    
    buttonBackground.setInteractive()
        .on('pointerdown', () => callback());
    
    button.setDepth(1);
    return { text: button, background: buttonBackground };
}

// Boot Scene
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    
    preload() {
        // Preload assets here
        this.load.image('logo', 'https://via.placeholder.com/300x100?text=Dino+Track+Team');
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');
        this.add.text(400, 300, 'Loading...', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);
        
        // Simulate loading assets
        setTimeout(() => {
            this.scene.start('TitleScene');
        }, 1000);
    }
}

// Title Scene
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Logo
        this.add.image(400, 200, 'logo').setOrigin(0.5);
        
        // Title
        this.add.text(400, 150, 'DINO TRACK TEAM', { 
            fontSize: '48px', 
            fontFamily: 'Arial', 
            fontWeight: 'bold',
            fill: '#4a6c2f' 
        }).setOrigin(0.5);
        
        // Start button
        createButton(this, 400, 400, 'Start New Season', () => {
            this.scene.start('SeasonOverviewScene');
        });
    }
}

// Season Overview Scene
class SeasonOverviewScene extends Phaser.Scene {
    constructor() {
        super('SeasonOverviewScene');
    }
    
    create() {
        this.add.text(400, 50, 'Season Overview', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        this.add.text(400, 100, `Team: ${gameState.teamName}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 140, `Division: ${gameState.division}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 180, `Week: ${gameState.week} / 12`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 220, `Funds: $${gameState.funds}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        // Display athletes
        this.add.text(400, 270, `Your Team:`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        gameState.athletes.forEach((athlete, index) => {
            this.add.text(400, 310 + (index * 30), 
                `${athlete.name} (${athlete.type}) - Speed: ${athlete.speed}, Strength: ${athlete.strength}, Endurance: ${athlete.endurance}, Technique: ${athlete.technique}`, 
                { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        });
        
        createButton(this, 400, 500, 'Start Week', () => {
            this.scene.start('DailyScheduleScene');
        });
    }
}

// Daily Schedule Scene
class DailyScheduleScene extends Phaser.Scene {
    constructor() {
        super('DailyScheduleScene');
    }
    
    create() {
        this.add.text(400, 50, `Week ${gameState.week} - Day ${gameState.day}`, { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        if (gameState.day <= 5) {
            // Practice day
            this.add.text(400, 150, `Today is a Practice Day`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
            
            createButton(this, 400, 300, 'Start Morning Activities', () => {
                this.scene.start('MorningScene');
            });
        } else {
            // Meet day
            this.add.text(400, 150, `Today is a Meet Day!`, { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5);
            
            createButton(this, 400, 300, 'Setup Meet Events', () => {
                this.scene.start('MeetSetupScene');
            });
        }
    }
}

// Morning Scene
class MorningScene extends Phaser.Scene {
    constructor() {
        super('MorningScene');
    }
    
    create() {
        this.add.text(400, 50, 'Morning Activities', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 100, 'How will you spend your morning?', { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        createButton(this, 300, 250, 'Research Training Techniques', () => {
            this.add.text(400, 350, 'You spent the morning researching new techniques!', { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
            
            // Enable continue button after choice is made
            const continueButton = createButton(this, 400, 450, 'Continue to Practice Prep', () => {
                this.scene.start('PracticePreparationScene');
            });
        });
        
        createButton(this, 500, 250, 'Fundraise for Team', () => {
            const fundsEarned = Math.floor(Math.random() * 200) + 100;
            gameState.funds += fundsEarned;
            
            this.add.text(400, 350, `You raised $${fundsEarned} for the team!`, { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
            
            // Enable continue button after choice is made
            const continueButton = createButton(this, 400, 450, 'Continue to Practice Prep', () => {
                this.scene.start('PracticePreparationScene');
            });
        });
    }
}

// Practice Preparation Scene
class PracticePreparationScene extends Phaser.Scene {
    constructor() {
        super('PracticePreparationScene');
    }
    
    create() {
        this.add.text(400, 50, 'Practice Preparation', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 100, 'Set today\'s training focus:', { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        // Training options
        const trainingOptions = [
            { name: 'Speed Training', stat: 'speed' },
            { name: 'Strength Training', stat: 'strength' },
            { name: 'Endurance Training', stat: 'endurance' },
            { name: 'Technique Training', stat: 'technique' }
        ];
        
        trainingOptions.forEach((option, index) => {
            createButton(this, 400, 180 + (index * 60), option.name, () => {
                this.selectedTraining = option;
                this.add.text(400, 450, `Selected: ${option.name}`, { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
                
                // Enable continue button after choice is made
                if (!this.continueButton) {
                    this.continueButton = createButton(this, 400, 500, 'Start Practice', () => {
                        // Pass selected training to next scene
                        this.scene.start('PracticeResultsScene', { training: this.selectedTraining });
                    });
                }
            });
        });
    }
}

// Practice Results Scene
class PracticeResultsScene extends Phaser.Scene {
    constructor() {
        super('PracticeResultsScene');
    }
    
    init(data) {
        this.selectedTraining = data.training;
    }
    
    create() {
        this.add.text(400, 50, 'Practice Results', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        if (this.selectedTraining) {
            this.add.text(400, 100, `Today's focus: ${this.selectedTraining.name}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        }
        
        // Show how each athlete performed
        gameState.athletes.forEach((athlete, index) => {
            // Calculate experience gain based on selected training
            let expGain = Math.floor(Math.random() * 5) + 1;
            let statIncrease = 0;
            
            // If training matches athlete's strengths, they gain more
            if (this.selectedTraining) {
                // Update athlete stats temporarily for display
                let updatedAthlete = {...athlete};
                if (Math.random() > 0.7) {  // 30% chance of stat increase
                    updatedAthlete[this.selectedTraining.stat]++;
                    statIncrease = 1;
                }
                
                this.add.text(400, 150 + (index * 80), 
                    `${athlete.name} gained ${expGain} experience points!`, 
                    { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
                    
                if (statIncrease > 0) {
                    this.add.text(400, 170 + (index * 80), 
                        `${athlete.name}'s ${this.selectedTraining.stat} increased to ${updatedAthlete[this.selectedTraining.stat]}!`, 
                        { fontSize: '18px', fill: '#008800' }).setOrigin(0.5);
                } else {
                    this.add.text(400, 170 + (index * 80), 
                        `No stat increase for ${athlete.name}`, 
                        { fontSize: '16px', fill: '#666666' }).setOrigin(0.5);
                }
            }
        });
        
        // End practice day and move to next day
        createButton(this, 400, 500, 'End Day', () => {
            // Progress to next day
            gameState.day++;
            
            // Check if week is over or continue to next day
            if (gameState.day > 6) {
                gameState.day = 1;
                gameState.week++;
                
                // Check if season is over
                if (gameState.week > 12) {
                    this.scene.start('SeasonResultsScene');
                } else {
                    this.scene.start('SeasonOverviewScene');
                }
            } else {
                this.scene.start('DailyScheduleScene');
            }
        });
    }
}

// Meet Setup Scene
class MeetSetupScene extends Phaser.Scene {
    constructor() {
        super('MeetSetupScene');
    }
    
    create() {
        this.add.text(400, 50, 'Meet Day Setup', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 100, 'Assign athletes to events:', { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        // Simple version: just click to simulate meet assignments
        this.add.text(400, 200, 'For this prototype, click to simulate\nassigning athletes to events', 
            { fontSize: '20px', fill: '#000', align: 'center' }).setOrigin(0.5);
        
        // Events list (simplified)
        this.add.text(400, 280, 'Available Events:', { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
        
        gameState.events.forEach((event, index) => {
            this.add.text(400, 320 + (index * 30), 
                `${event}`, 
                { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
        });
        
        createButton(this, 400, 500, 'Start Meet', () => {
            this.scene.start('MeetResultsScene');
        });
    }
}

// Meet Results Scene
class MeetResultsScene extends Phaser.Scene {
    constructor() {
        super('MeetResultsScene');
    }
    
    create() {
        this.add.text(400, 50, 'Meet Results', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        // Generate random results for this prototype
        const meetPoints = Math.floor(Math.random() * 30) + 10;
        gameState.seasonPoints += meetPoints;
        
        this.add.text(400, 150, `Your team scored ${meetPoints} points!`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 200, `Total season points: ${gameState.seasonPoints}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        // Generate some random event placements
        const places = ['1st', '2nd', '3rd', '4th', '5th'];
        
        this.add.text(400, 250, 'Individual Results:', { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
        
        gameState.athletes.forEach((athlete, index) => {
            const randomEvent = gameState.events[Math.floor(Math.random() * gameState.events.length)];
            const randomPlace = places[Math.floor(Math.random() * places.length)];
            
            this.add.text(400, 300 + (index * 30), 
                `${athlete.name} - ${randomEvent}: ${randomPlace} place`, 
                { fontSize: '18px', fill: '#000' }).setOrigin(0.5);
        });
        
        // End meet day and move to next week
        createButton(this, 400, 500, 'End Meet', () => {
            // Progress to next week
            gameState.day = 1;
            gameState.week++;
            
            // Check if season is over
            if (gameState.week > 12) {
                // Check if qualified for state
                if (gameState.seasonPoints > 150) { // Arbitrary threshold for this prototype
                    gameState.qualifiedForState = true;
                    this.scene.start('StateChampionshipScene');
                } else {
                    this.scene.start('SeasonResultsScene');
                }
            } else {
                this.scene.start('SeasonOverviewScene');
            }
        });
    }
}

// Season Results Scene
class SeasonResultsScene extends Phaser.Scene {
    constructor() {
        super('SeasonResultsScene');
    }
    
    create() {
        this.add.text(400, 50, 'Season Results', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        if (gameState.qualifiedForState) {
            this.add.text(400, 150, `Your team qualified for state!`, { fontSize: '28px', fill: '#008800' }).setOrigin(0.5);
        } else {
            this.add.text(400, 150, `Your team did not qualify for state.`, { fontSize: '28px', fill: '#880000' }).setOrigin(0.5);
        }
        
        this.add.text(400, 200, `Final season points: ${gameState.seasonPoints}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        // Final team standings
        this.add.text(400, 250, `Division ${gameState.division} Final Standings:`, { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
        
        // Generate some fake standings
        const teamNames = [
            "Cretaceous Crushers",
            "Triassic Titans",
            "Jurassic High Raptors", // Player team
            "Paleozoic Panthers",
            "Mesozoic Maulers"
        ];
        
        // Sort based on points with player team in appropriate position
        let standings = [];
        let playerRank = 0;
        
        if (gameState.seasonPoints > 200) {
            playerRank = 0; // 1st place
        } else if (gameState.seasonPoints > 150) {
            playerRank = 1; // 2nd place
        } else if (gameState.seasonPoints > 100) {
            playerRank = 2; // 3rd place
        } else {
            playerRank = Math.min(3, teamNames.length - 1); // 4th place or lower
        }
        
        // Create standings array
        for (let i = 0; i < teamNames.length; i++) {
            if (i === playerRank) {
                standings.push({
                    name: gameState.teamName,
                    points: gameState.seasonPoints,
                    isPlayer: true
                });
            } else {
                const randomPoints = 220 - (i * 40) + Math.floor(Math.random() * 20);
                standings.push({
                    name: teamNames[i === playerRank ? teamNames.length - 1 : i],
                    points: randomPoints,
                    isPlayer: false
                });
            }
        }
        
        // Display standings
        standings.sort((a, b) => b.points - a.points);
        
        standings.forEach((team, index) => {
            const color = team.isPlayer ? '#0000ff' : '#000000';
            this.add.text(400, 300 + (index * 30), 
                `${index + 1}. ${team.name} - ${team.points} pts`, 
                { fontSize: '18px', fill: color }).setOrigin(0.5);
        });
        
        createButton(this, 400, 500, 'Continue', () => {
            // If qualified for state, go to state championship, otherwise game over
            if (gameState.qualifiedForState) {
                this.scene.start('StateChampionshipScene');
            } else {
                this.scene.start('GameOverScene');
            }
        });
    }
}

// State Championship Scene
class StateChampionshipScene extends Phaser.Scene {
    constructor() {
        super('StateChampionshipScene');
    }
    
    create() {
        this.add.text(400, 50, 'State Championship', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 100, 'Your team is competing at state!', { fontSize: '28px', fill: '#008800' }).setOrigin(0.5);
        
        // For the prototype, just simulate the results
        this.add.text(400, 200, 'Click to simulate state championship', { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
        
        createButton(this, 400, 300, 'Compete at State', () => {
            // Determine if team did well enough to move up a division
            const statePoints = Math.floor(Math.random() * 50) + 50;
            const movedUpDivision = statePoints > 75; // Arbitrary threshold
            
            if (movedUpDivision) {
                this.add.text(400, 350, `Your team scored ${statePoints} points at state!`, { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
                this.add.text(400, 400, `Congratulations! Your team is moving up to ${gameState.division === "1A" ? "2A" : "3A"} division!`, 
                    { fontSize: '22px', fill: '#008800' }).setOrigin(0.5);
            } else {
                this.add.text(400, 350, `Your team scored ${statePoints} points at state.`, { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
                this.add.text(400, 400, `Your team will remain in ${gameState.division} division next season.`, 
                    { fontSize: '22px', fill: '#000' }).setOrigin(0.5);
            }
            
            createButton(this, 400, 500, 'Finish Season', () => {
                this.scene.start('GameOverScene');
            });
        });
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }
    
    create() {
        this.add.text(400, 50, 'Season Complete!', { fontSize: '36px', fill: '#000' }).setOrigin(0.5);
        
        // Season summary
        this.add.text(400, 150, `Final season points: ${gameState.seasonPoints}`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        if (gameState.qualifiedForState) {
            this.add.text(400, 200, `Your team qualified for state championships!`, { fontSize: '24px', fill: '#008800' }).setOrigin(0.5);
        }
        
        // Athlete progress
        this.add.text(400, 270, `Athlete Progress:`, { fontSize: '24px', fill: '#000' }).setOrigin(0.5);
        
        gameState.athletes.forEach((athlete, index) => {
            this.add.text(400, 310 + (index * 30), 
                `${athlete.name} - Speed: ${athlete.speed}, Strength: ${athlete.strength}, Endurance: ${athlete.endurance}, Technique: ${athlete.technique}`, 
                { fontSize: '16px', fill: '#000' }).setOrigin(0.5);
        });
        
        // Restart button
        createButton(this, 400, 500, 'Start New Season', () => {
            // Reset game state
            gameState = {
                week: 1,
                day: 1,
                teamName: "Jurassic High Raptors",
                division: "1A",
                seasonPoints: 0,
                qualifiedForState: false,
                funds: 1000,
                athletes: [
                    { id: 1, name: "Rex", type: "T-Rex", speed: 3, strength: 5, endurance: 2, technique: 1, level: 1, experience: 0 },
                    { id: 2, name: "Tri", type: "Triceratops", speed: 2, strength: 4, endurance: 4, technique: 2, level: 1, experience: 0 },
                    { id: 3, name: "Petrie", type: "Pterodactyl", speed: 5, strength: 1, endurance: 3, technique: 3, level: 1, experience: 0 },
                    { id: 4, name: "Velo", type: "Velociraptor", speed: 5, strength: 2, endurance: 3, technique: 2, level: 1, experience: 0 },
                ],
                trainingTechniques: ["Basic", "Intermediate"],
                events: ["100m Dash", "Long Jump", "Javelin Throw", "800m Run"]
            };
            
            this.scene.start('TitleScene');
        });
    }
}

// Now that all scenes are defined, create the game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    scene: [
        BootScene, 
        TitleScene, 
        SeasonOverviewScene, 
        DailyScheduleScene, 
        MorningScene,
        PracticePreparationScene,
        PracticeResultsScene,
        MeetSetupScene,
        MeetResultsScene,
        SeasonResultsScene,
        StateChampionshipScene,
        GameOverScene
    ]
};

// Initialize game
const game = new Phaser.Game(config);