import Athlete from './objects/Athlete.js';
import { createAthlete } from './utils/athleteFactory.js';

function getRandomArchetype() {
  const types = ['topTierOpponent', 'midTierOpponent', 'lowTierOpponent'];
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
  money: 0,
  trainingSlotsUnlocked: 2,    // start with only 2 slots
  machineUpgrades: {
    0: { speed: 0, stamina: 0 },
    1: { speed: 0, stamina: 0 },
    2: { speed: 0, stamina: 0 },
    3: { speed: 0, stamina: 0 },
  },
  // shop reroll state
  dailyItems: [],
  activeBuffs: [],       // ← add this line


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
        createAthlete('Randy', 'dino1RaptorValley', 'dino1RaptorValleyx2', 'dino1RaptorValleyx4', getRandomArchetype()),
        createAthlete('Ryan', 'dino2RaptorValley', 'dino2RaptorValleyx2', 'dino2RaptorValleyx4', getRandomArchetype()),
        createAthlete('Rex', 'dino3RaptorValley', 'dino3RaptorValleyx2', 'dino3RaptorValleyx4', getRandomArchetype()),
      ],
    },
    {
      name: 'Stego Springs',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Stan', 'dino1StegoSprings', 'dino1StegoSpringsx2', 'dino1StegoSpringsx4', getRandomArchetype()),
        createAthlete('Shelly', 'dino2StegoSprings', 'dino2StegoSpringsx2', 'dino2StegoSpringsx4', getRandomArchetype()),
        createAthlete('Spike', 'dino3StegoSprings', 'dino3StegoSpringsx2', 'dino3StegoSpringsx4', getRandomArchetype()),
      ],
    },
    {
      name: 'Ptero Peaks',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Pamela', 'dino1PteroPeaks', 'dino1PteroPeaksx2', 'dino1PteroPeaksx4', getRandomArchetype()),
        createAthlete('Peter', 'dino2PteroPeaks', 'dino2PteroPeaksx2', 'dino2PteroPeaksx4', getRandomArchetype()),
        createAthlete('Purrsephone', 'dino3PteroPeaks', 'dino3PteroPeaksx2', 'dino3PteroPeaksx4', getRandomArchetype()),
      ],
    },
    {
      name: 'Tricera Tech',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Tina', 'dino1TriceraTech', 'dino1TriceraTechx2', 'dino1TriceraTechx4', getRandomArchetype()),
        createAthlete('Tracy', 'dino2TriceraTech', 'dino2TriceraTechx2', 'dino2TriceraTechx4', getRandomArchetype()),
        createAthlete('Tim', 'dino3TriceraTech', 'dino3TriceraTechx2', 'dino3TriceraTechx4', getRandomArchetype()),
      ],
    },
    {
      name: 'Diplo Institute',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Dominic', 'dino1DiploInstitute', 'dino1DiploInstitutex2', 'dino1DiploInstitutex4', getRandomArchetype()),
        createAthlete('Donella', 'dino2DiploInstitute', 'dino2DiploInstitutex2', 'dino2DiploInstitutex4', getRandomArchetype()),
        createAthlete('Dexter', 'dino3DiploInstitute', 'dino3DiploInstitutex2', 'dino3DiploInstitutex4', getRandomArchetype()),
      ],
    },
    {
      name: 'Allo Academy',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Ava', 'dino1AlloAcademy', 'dino1AlloAcademyx2', 'dino1AlloAcademyx4', getRandomArchetype()),
        createAthlete('Allan', 'dino2AlloAcademy', 'dino2AlloAcademyx2', 'dino2AlloAcademyx4', getRandomArchetype()),
        createAthlete('Allison', 'dino3AlloAcademy', 'dino3AlloAcademyx2', 'dino3AlloAcademyx4', getRandomArchetype()),
      ],
    },
    {
      name: 'Tyranno High',
      isPlayer: false,
      points: 0,
      athletes: [
        createAthlete('Thomas', 'dino1TyrannoHigh', 'dino1TyrannoHighx2', 'dino1TyrannoHighx4', getRandomArchetype()),
        createAthlete('Tate', 'dino2TyrannoHigh', 'dino2TyrannoHighx2', 'dino2TyrannoHighx4', getRandomArchetype()),
        createAthlete('Theo', 'dino3TyrannoHigh', 'dino3TyrannoHighx2', 'dino3TyrannoHighx4', getRandomArchetype()),
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



