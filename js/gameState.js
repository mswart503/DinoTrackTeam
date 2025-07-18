import Athlete from './objects/Athlete.js';
import { createAthlete } from './utils/athleteFactory.js';

function getRandomArchetype() {
    const types = ['sprinter', 'distance', 'mixed'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  const playerTeam = [
    createAthlete('Sarah', 'dino1', 'dino1x2', 'dino1x4', 'sprinter'),
    createAthlete('Linda', 'dino2', 'dino2x2', 'dino2x4', 'distance'),
    createAthlete('Jack', 'dino3', 'dino3x2', 'dino3x4', 'mixed'),
  ];

export const gameState = {
    currentMusic: null,
    testRaceDistance: 100,
    currentWeek: 1,
    currentDayIndex: 0,  // 0 = Monday, 5 = Saturday
    madeState: false,
    totalWeeks: 12,
    stateWeeks: 2,
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    playerSchool: 'Jurassic High',
    athletes: playerTeam,
    money: 100,
    schools: [
      {
        name: 'Jurassic High',
        isPlayer: true,
        points: 0,
        athletes: playerTeam,
      },
      {
        name: 'Raptor Valley',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Randy', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Ryan', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Rex', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Stego Springs',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Stan', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Shelly', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Spike', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Ptero Peaks',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Pamela', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Peter', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Purrsephone', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Tricera Tech',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Tina', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Tracy', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Tim', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Diplo Institute',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Dominic', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Donella', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Dexter', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Allo Academy',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Ava', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Allan', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Allison', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
      {
        name: 'Tryanno High',
        isPlayer: false,
        points: 0,
        athletes: [
          createAthlete('Thomas', 'dino1', 'dino1x2', 'dino1x4', getRandomArchetype()),
          createAthlete('Tate', 'dino2', 'dino2x2', 'dino2x4', getRandomArchetype()),
          createAthlete('Theo', 'dino3', 'dino3x2', 'dino3x4', getRandomArchetype()),
        ],
      },
    ],
  };


export const gradeLevels = {
    0: 'Freshman',
    1: 'Sophomore',
    2: 'Junior',
    3: 'Senior',
};



