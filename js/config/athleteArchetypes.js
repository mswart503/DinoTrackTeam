export const athleteArchetypes = {
    sprinter: {
        speed: [15, 20],
        stamina: [5, 10],

        //strideLength: [1.6, 2.0],
        //strideFrequency: [4.5, 5.5],
        //acceleration: [1.2, 1.8],
        //staminaEfficiency: [0.9, 1.2],
        //paceAccuracy: [1.0, 1.5], // worse pacing
    },
    distance: {
        speed: [1, 3],
        stamina: [15, 20],

        /*strideLength: [1.3, 1.6],
        strideFrequency: [3.5, 4.2],
        acceleration: [0.8, 1.2],
        staminaEfficiency: [0.5, 0.8],
        paceAccuracy: [0.3, 0.6], // tight pacing
        */
    },
    mixed: {
        speed: [10, 15],
        stamina: [10, 15],
/*
        strideLength: [1.4, 1.8],
        strideFrequency: [4.0, 4.8],
        acceleration: [1.0, 1.4],
        staminaEfficiency: [0.7, 1.0],
        paceAccuracy: [0.5, 1.0],
    */
        }
};
