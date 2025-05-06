import { trainingEffects } from '../config.js';

export default class Athlete {
    constructor(name, spriteKey) {
        this.name = name;
        this.spriteKey = spriteKey;
        this.strideLength = 1.5;      // meters per stride
        this.strideFrequency = 4.0;   // strides per second
        this.acceleration = 1.0;      // strides/sec²

        this.stamina = 100;  // full bar
        this.staminaEfficiency = 1.0;
        this.paceAccuracy = 1.0;
        this.personalRecord = null;  // best time in seconds, null if no record yet
        this.grade = 0;

        // Add experience points in each area
        this.exp = {
            topSpeed: 0,
            stamina: 0,
            staminaEfficiency: 0,
            paceAccuracy: 0,
        };
    }
    getTopSpeed() {
        return this.strideLength * this.strideFrequency;
    }

    applyTraining(trainingType) {
        const effect = trainingEffects[trainingType];
        if (!effect) {
            console.warn(`Unknown training type: ${trainingType}`);
            return;
        }

        if (effect.topSpeed) this.topSpeed += effect.topSpeed;
        if (effect.stamina) this.stamina += effect.stamina;
        if (effect.staminaEfficiency) this.staminaEfficiency *= effect.staminaEfficiency;
        if (effect.paceAccuracy) this.paceAccuracy *= effect.paceAccuracy;
        if (effect.strideLength) this.strideLength += effect.strideLength;
        if (effect.strideFrequency) this.strideFrequency += effect.strideFrequency;
        if (effect.acceleration) this.acceleration += effect.acceleration;
        this.capStats();
    }

    capStats() {
        // Add reasonable stat caps to prevent runaway values
        this.topSpeed = Math.min(this.topSpeed, 10);
        this.stamina = Math.min(this.stamina, 200);
        this.staminaEfficiency = Math.max(this.staminaEfficiency, 0.5);  // can't go below 0.5
        this.paceAccuracy = Math.max(this.paceAccuracy, 0.1);            // can't go below 0.1
    }
}


