// utils/trainingLogic.js

export function applyTraining(athlete, type) {
    switch (type) {
        case 'Interval':
            athlete.speed += 3;
            break;
        case 'Condition':
            athlete.stamina += 3;
            break;
        case 'HIIT':
            athlete.speed += 1;
            athlete.stamina += 2;
            break;
        case 'Pace':
            athlete.speed += 2;
            athlete.stamina += 1;
            break;
    }

    athlete.lastTrainingType = type;

    // Optional: Add console log for debugging
    console.log(`${athlete.name} trained in ${type} → Speed: ${athlete.speed}, Stamina: ${athlete.stamina}`);
}
