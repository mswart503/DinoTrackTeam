import Athlete from './objects/Athlete.js';


export const gameState = {
    currentMusic: null,
    testRaceDistance: 100,
    currentWeek: 1,
    currentDayIndex: 0,  // 0 = Monday, 5 = Saturday
    madeState: false,
    totalWeeks: 12,
    stateWeeks: 2,
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    schoolStandings: [
        { name: 'Jurassic High', points: 10 },
        { name: 'Raptor Valley', points: 20 },
        { name: 'Stego Springs', points: 30 },
        { name: 'Ptero Peaks', points: 40 },
        { name: 'Tricera Tech', points: 50 },
        { name: 'Diplo Institute', points: 60 },
        { name: 'Allo Academy', points: 70 },
        { name: 'Tryanno High', points: 80 },
    ],
    playerSchool: 'Jurassic High',
    athletes: [
        new Athlete('Bronte', 'dino1'),
        new Athlete('Allan', 'dino2'),
        new Athlete('Stephanie', 'dino3'),
    ],
};

export const gradeLevels = {
    0: 'Freshman',
    1: 'Sophomore',
    2: 'Junior',
    3: 'Senior',
};



