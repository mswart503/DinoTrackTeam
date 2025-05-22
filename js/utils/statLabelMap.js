export function mapLabelToStatKey(label) {
    return {
        StrideLen: 'strideLength',
        StrideFreq: 'strideFrequency',
        Accel: 'acceleration',
        Stamina: 'stamina',
        Eff: 'staminaEfficiency',
        Pace: 'paceAccuracy',
    }[label];
}
export function getStatDisplay(label, athlete) {
    switch (label) {
        case 'StrideLen': return athlete.strideLength.toFixed(2);
        case 'StrideFreq': return athlete.strideFrequency.toFixed(2);
        case 'Accel': return athlete.acceleration.toFixed(2);
        case 'Stamina': return athlete.stamina.toFixed(0);
        case 'Eff': return athlete.staminaEfficiency.toFixed(2);
        case 'Pace': return athlete.paceAccuracy.toFixed(2);
    }
}