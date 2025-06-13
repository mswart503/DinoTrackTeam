import Athlete from '../objects/Athlete.js';
import { athleteArchetypes } from '../config/athleteArchetypes.js';

export function createAthlete(name, spriteKey, archetype, grade = 0) {
    const base = athleteArchetypes[archetype];

    const getRandom = ([min, max]) => Phaser.Math.FloatBetween(min, max);

    const athlete = new Athlete(name, spriteKey);
    athlete.grade = grade;
    athlete.archetype = archetype;
    

    athlete.strideLength = getRandom(base.strideLength);
    athlete.strideFrequency = getRandom(base.strideFrequency);
    athlete.acceleration = getRandom(base.acceleration);
    athlete.stamina = Phaser.Math.Between(...base.stamina);
    athlete.staminaEfficiency = getRandom(base.staminaEfficiency);
    athlete.paceAccuracy = getRandom(base.paceAccuracy);

    return athlete;
}
