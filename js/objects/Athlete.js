
export default class Athlete {
    constructor(name, spriteKey, spriteKeyx2, spriteKeyx4) {
        this.name = name;
        this.spriteKey = spriteKey;
        this.spriteKeyx2 = spriteKeyx2;
        this.spriteKeyx4 = spriteKeyx4;
        this.speed = 5;
        this.stamina = 20;  // full bar
        this.grade = 0;
        this.level = 1;
        this.abilities = [];
        this.raceHistory = [];

        // Add experience points in each area
        this.exp = {
            xp: 0,
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

    xpForNextLevel() {
        return this.level + 1;
    }


    capStats() {
        // Add reasonable stat caps to prevent runaway values
        this.topSpeed = Math.min(this.topSpeed, 10);
        this.stamina = Math.min(this.stamina, 200);
        this.staminaEfficiency = Math.max(this.staminaEfficiency, 0.5);  // can't go below 0.5
        this.paceAccuracy = Math.max(this.paceAccuracy, 0.1);            // can't go below 0.1
    }
}


