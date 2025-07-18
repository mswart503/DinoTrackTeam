
export default class Athlete {
    constructor(name, spriteKey, spriteKeyx2, spriteKeyx4) {
        this.name = name;
        this.spriteKey = spriteKey;
        this.spriteKeyx2 = spriteKeyx2;
        this.spriteKeyx4 = spriteKeyx4;
        this.speed = 5;
        //this.strideLength = 1.5;      // meters per stride
        //this.strideFrequency = 4.0;   // strides per second
        //this.acceleration = 1.0;      // strides/sec²

        this.stamina = 20;  // full bar
        //this.staminaEfficiency = 1.0;
        //this.paceAccuracy = 1.0;
        //this.personalRecord = {};  // best time in seconds, null if no record yet
        this.grade = 0;
        this.raceHistory = [];
        //this.lastTrainingType = null; // Track last training type for highlights
        // This adds a time to the race history array
        //this.raceHistory.push({ distance: '100m', time, week: gameState.currentWeek });

        // Add experience points in each area
        this.exp = {
            speed: 0,
            stamina: 0,
            //staminaEfficiency: 0,
            //paceAccuracy: 0,
        };

        this.prs = {
            '100m': 999.0,
            '200m': 999.0,
            '400m': 999.0,
        };
        
        
    }
    getTopSpeed() {
        return this.strideLength * this.strideFrequency;
    }


    capStats() {
        // Add reasonable stat caps to prevent runaway values
        this.topSpeed = Math.min(this.topSpeed, 10);
        this.stamina = Math.min(this.stamina, 200);
        this.staminaEfficiency = Math.max(this.staminaEfficiency, 0.5);  // can't go below 0.5
        this.paceAccuracy = Math.max(this.paceAccuracy, 0.1);            // can't go below 0.1
    }
}


