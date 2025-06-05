// MeetRaceScene.js
import { gameState } from '../gameState.js';
import { createNextButton } from '../utils/uiHelpers.js';

export default class MeetRaceScene extends Phaser.Scene {
    constructor() {
        super('MeetRaceScene');
        this.eventOrder = ['100m', '200m', '400m'];
        this.currentEventIndex = 0;
        this.selectedSchools = [];
        this.backgroundResults = { '100m': [], '200m': [], '400m': [] };
    }

    create() {
        this.selectedSchools = gameState.schools.filter(s =>
            s.name === gameState.playerSchool || gameState.currentMeetOpponents['100m']?.some(a => s.athletes.includes(a))
        );
    
        const nonCompetingSchools = gameState.schools.filter(s =>
            !this.selectedSchools.includes(s)
        );
    
        nonCompetingSchools.forEach(school => {
            const shuffledAthletes = Phaser.Utils.Array.Shuffle([...school.athletes]);
            ['100m', '200m', '400m'].forEach((event, idx) => {
                const athlete = shuffledAthletes[idx];
                if (athlete) {
                    this.backgroundResults[event].push(athlete);
                }
            });
        });
    
        this.runEvent(this.eventOrder[this.currentEventIndex]);
    }

    runEvent(eventName) {
        this.clearScene();
        this.add.text(400, 40, `${eventName} Race!`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        const finishLine = 700;
        const distance = parseInt(eventName);
        this.add.line(finishLine, 100, 0, 0, 0, 300, 0xffffff).setOrigin(0.5, 0);

        // Get racers: player + 3 rivals
        const playerName = gameState.meetAssignments[eventName];
        const playerAthlete = gameState.athletes.find(a => a.name === playerName);

        if (!playerAthlete) {
            console.error(`No athlete assigned for ${eventName}`);
            return;  // Or handle gracefully
        }
        const opponents = gameState.currentMeetOpponents[eventName] || [];
        const allRacers = [playerAthlete, ...opponents];
        console.log('All racers:', allRacers.map(r => ({
            name: r?.name,
            spriteKey: r?.spriteKey
        })));
        const runnerObjects = allRacers.map((athlete, i) => {
            const sprite = this.add.sprite(100, 150 + i * 80, athlete.spriteKey).setScale(2);
            const staminaBar = this.add.rectangle(100, 130 + i * 80, 60, 8, 0x00ff00).setOrigin(0.5);

            this.anims.create({
                key: `${athlete.spriteKey}-run`,
                frames: this.anims.generateFrameNumbers(athlete.spriteKey, { start: 4, end: 10 }),
                frameRate: 10,
                repeat: -1,
            });
            sprite.play(`${athlete.spriteKey}-run`);

            return {
                athlete,
                sprite,
                staminaBar,
                yPos: 150 + i * 80,
                xPos: 100,
                stamina: athlete.stamina,
                strideFreq: 0,
                distanceLeft: distance,
                timeElapsed: 0,
                finished: false,
            };
        });

        let resultsShown = false;
        const timeStep = 0.25;
        this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                let allFinished = true;
                runnerObjects.forEach(runner => {
                    if (runner.finished) return;
                    allFinished = false;

                    if (runner.strideFreq < runner.athlete.strideFrequency) {
                        runner.strideFreq += runner.athlete.acceleration * 0.1;
                        runner.strideFreq = Math.min(runner.strideFreq, runner.athlete.strideFrequency);
                    }

                    const paceFluct = (Math.random() * 2 - 1) * runner.athlete.paceAccuracy;
                    let speed = Math.max(0, runner.athlete.strideLength * runner.strideFreq + paceFluct);
                    if (runner.stamina <= 0) speed /= 2;

                    runner.stamina -= speed * runner.athlete.staminaEfficiency * timeStep;
                    runner.stamina = Math.max(0, runner.stamina);
                    runner.distanceLeft -= speed * timeStep;
                    runner.timeElapsed += timeStep;

                    runner.xPos += (finishLine - 100) * (speed * timeStep / distance);
                    runner.sprite.x = runner.xPos;
                    runner.staminaBar.width = (runner.stamina / runner.athlete.stamina) * 60;

                    if (runner.distanceLeft <= 0) {
                        runner.finished = true;
                        runner.sprite.x = finishLine;
                        runner.finishTime = runner.timeElapsed;
                    }
                });

                if (allFinished && !resultsShown) {
                    resultsShown = true;
                    this.showResults(eventName, runnerObjects);
                }
            }
        });
    }

    showResults(eventName, runners) {
        const sorted = [...runners].sort((a, b) => a.finishTime - b.finishTime);
        const points = [5, 3, 1, 0];
        sorted.forEach((runner, idx) => {
            const school = this.getAthleteSchool(runner.athlete);
            const schoolObj = gameState.schools.find(s => s.name === school);
            if (schoolObj) {
                if (typeof schoolObj.points !== 'number') schoolObj.points = 0;
                schoolObj.points += points[idx];
            }

            if (!runner.athlete.prs[eventName] || runner.finishTime < runner.athlete.prs[eventName]) {
                runner.athlete.prs[eventName] = runner.finishTime;
            }
        });
        console.log(`🏁 ${eventName} Results:`);
        sorted.forEach((r, i) => {
            const s = this.getAthleteSchool(r.athlete);
            console.log(`${i + 1}. ${r.athlete.name} (${s}) - ${r.finishTime.toFixed(2)}s → ${points[i]} pts`);
        });

        this.time.delayedCall(1000, () => this.createNextButton());
    }

    createNextButton() {
        if (this.currentEventIndex < this.eventOrder.length - 1) {
            createNextButton(this, 'MeetRaceScene', 400, 500).on('pointerdown', () => {
                this.currentEventIndex++;
                this.runEvent(this.eventOrder[this.currentEventIndex]);
            });
        } else {
            Object.entries(this.backgroundResults).forEach(([event, athletes]) => {
                this.simulateRace(athletes, event);
            });
            
            createNextButton(this, 'SeasonOverviewScene', 400, 500);
        }
    }

    getAthleteSchool(athlete) {
        if (gameState.athletes.includes(athlete)) return gameState.playerSchool;
        const school = gameState.schools.find(s => s.athletes.includes(athlete));
        return school?.name || 'Unknown';
    }

    clearScene() {
        this.children.removeAll();
        this.time.removeAllEvents();
    }


    
    simulateRace(athletes, event) {
        const results = athletes.map(athlete => {
            // Simulate time based on stats + randomness
            let strideFreq = athlete.strideFrequency;
            let acceleration = athlete.acceleration;
            let time = 0;
            let distanceLeft = parseInt(event); // 100, 200, or 400
            let speed = 0;
    
            while (distanceLeft > 0) {
                if (speed < strideFreq) {
                    speed += acceleration * 0.1;
                    if (speed > strideFreq) speed = strideFreq;
                }
    
                const fluct = (Math.random() * 2 - 1) * athlete.paceAccuracy;
                let stepSpeed = Math.max(0, athlete.strideLength * speed + fluct);
                distanceLeft -= stepSpeed * 0.1;
                time += 0.1;
            }
    
            return { athlete, time };
        });
    
        // Sort & award points
        results.sort((a, b) => a.time - b.time);
        const points = [5, 3, 1, 0];
        results.forEach((r, i) => {
            // Update PR
            if (!r.athlete.prs[event] || r.time < r.athlete.prs[event]) {
                r.athlete.prs[event] = r.time;
            }
    
            // Add school points
            const school = gameState.schools.find(s => s.athletes.includes(r.athlete));
            if (school) {
                if (typeof school.points !== 'number') school.points = 0;
                school.points += points[i];
              }
        });
    }
    
}
