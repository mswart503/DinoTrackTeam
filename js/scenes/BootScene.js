import TitleScene from './TitleScene.js';
//import HUDScene from './HUDScene.js';
import SeasonOverviewScene from './SeasonOverviewScene.js';
//import DailyScheduleScene from './DailyScheduleScene.js';
//import EndOfWeekScene from './EndOfWeekScene.js';
import MorningScene from './MorningScene.js';
import PracticePreparationScene from './PracticePreparationScene.js';
import PracticeResultsScene from './PracticeResultsScene.js';
//import PracticeRaceScene from '../Archive/PracticeRaceScene.js';
import TestPracticeRaceScene from './TestPracticeRaceScene.js';
import RaceTestSetupScene from './RaceTestSetupScene.js';
import ChallengeSelectionScene from './ChallengeSelectionScene.js';
import ChallengeRaceScene from './ChallengeRaceScene.js';
import AbilitySelectionScene from './AbilitySelectionScene.js';
//import MeetSetupScene from './MeetSetupScene.js';
//import MeetRaceScene from './MeetRaceScene.js';
//import MeetResultsScene from './MeetResultsScene.js';
import SeasonResultsScene from './SeasonResultsScene.js';
import StateChampionshipScene from './StateChampionshipScene.js';
import OffseasonPlanningScene from './OffSeasonPlanningScene.js';
import StartOfSeasonScene from './StartOfSeasonScene.js';
import GameOverScene from './GameOverScene.js';
import { sceneBackgrounds } from '../config/backgrounds.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { generateRoundRobinSchedule } from '../utils/schedule.js';

import { gameState } from '../gameState.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    preload() {
        // Load player athlete sprites
        this.load.spritesheet('dino1', 'assets/images/dino1.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2', 'assets/images/dino2.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3', 'assets/images/dino3.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4', 'assets/images/dino4.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1x2', 'assets/images/dino1x2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1x4', 'assets/images/dino1x4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2x2', 'assets/images/dino2x2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2x4', 'assets/images/dino2x4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3x2', 'assets/images/dino3x2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3x4', 'assets/images/dino3x4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4x2', 'assets/images/dino4x2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4x4', 'assets/images/dino4x4.png', { frameWidth: 96, frameHeight: 96 });

        // Load Allo Academy sprites
        this.load.spritesheet('dino1AlloAcademy', 'assets/images/dino1AlloAcademy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2AlloAcademy', 'assets/images/dino2AlloAcademy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3AlloAcademy', 'assets/images/dino3AlloAcademy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4AlloAcademy', 'assets/images/dino4AlloAcademy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1AlloAcademyx2', 'assets/images/dino1AlloAcademyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1AlloAcademyx4', 'assets/images/dino1AlloAcademyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2AlloAcademyx2', 'assets/images/dino2AlloAcademyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2AlloAcademyx4', 'assets/images/dino2AlloAcademyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3AlloAcademyx2', 'assets/images/dino3AlloAcademyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3AlloAcademyx4', 'assets/images/dino3AlloAcademyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4AlloAcademyx2', 'assets/images/dino4AlloAcademyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4AlloAcademyx4', 'assets/images/dino4AlloAcademyx4.png', { frameWidth: 96, frameHeight: 96 });

        // Load Diplo Institute sprites
        this.load.spritesheet('dino1DiploInstitute', 'assets/images/dino1DiploInstitute.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2DiploInstitute', 'assets/images/dino2DiploInstitute.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3DiploInstitute', 'assets/images/dino3DiploInstitute.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4DiploInstitute', 'assets/images/dino4DiploInstitute.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1DiploInstitutex2', 'assets/images/dino1DiploInstitutex2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1DiploInstitutex4', 'assets/images/dino1DiploInstitutex4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2DiploInstitutex2', 'assets/images/dino2DiploInstitutex2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2DiploInstitutex4', 'assets/images/dino2DiploInstitutex4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3DiploInstitutex2', 'assets/images/dino3DiploInstitutex2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3DiploInstitutex4', 'assets/images/dino3DiploInstitutex4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4DiploInstitutex2', 'assets/images/dino4DiploInstitutex2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4DiploInstitutex4', 'assets/images/dino4DiploInstitutex4.png', { frameWidth: 96, frameHeight: 96 });

        // Load Ptero Peaks sprites
        this.load.spritesheet('dino1PteroPeaks', 'assets/images/dino1PteroPeaks.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2PteroPeaks', 'assets/images/dino2PteroPeaks.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3PteroPeaks', 'assets/images/dino3PteroPeaks.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4PteroPeaks', 'assets/images/dino4PteroPeaks.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1PteroPeaksx2', 'assets/images/dino1PteroPeaksx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1PteroPeaksx4', 'assets/images/dino1PteroPeaksx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2PteroPeaksx2', 'assets/images/dino2PteroPeaksx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2PteroPeaksx4', 'assets/images/dino2PteroPeaksx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3PteroPeaksx2', 'assets/images/dino3PteroPeaksx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3PteroPeaksx4', 'assets/images/dino3PteroPeaksx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4PteroPeaksx2', 'assets/images/dino4PteroPeaksx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4PteroPeaksx4', 'assets/images/dino4PteroPeaksx4.png', { frameWidth: 96, frameHeight: 96 });

        this.load.spritesheet('dino1RaptorValley', 'assets/images/dino1RaptorValley.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2RaptorValley', 'assets/images/dino2RaptorValley.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3RaptorValley', 'assets/images/dino3RaptorValley.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4RaptorValley', 'assets/images/dino4RaptorValley.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1RaptorValleyx2', 'assets/images/dino1RaptorValleyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1RaptorValleyx4', 'assets/images/dino1RaptorValleyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2RaptorValleyx2', 'assets/images/dino2RaptorValleyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2RaptorValleyx4', 'assets/images/dino2RaptorValleyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3RaptorValleyx2', 'assets/images/dino3RaptorValleyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3RaptorValleyx4', 'assets/images/dino3RaptorValleyx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4RaptorValleyx2', 'assets/images/dino4RaptorValleyx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4RaptorValleyx4', 'assets/images/dino4RaptorValleyx4.png', { frameWidth: 96, frameHeight: 96 });

        this.load.spritesheet('dino1StegoSprings', 'assets/images/dino1StegoSprings.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2StegoSprings', 'assets/images/dino2StegoSprings.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3StegoSprings', 'assets/images/dino3StegoSprings.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4StegoSprings', 'assets/images/dino4StegoSprings.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1StegoSpringsx2', 'assets/images/dino1StegoSpringsx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1StegoSpringsx4', 'assets/images/dino1StegoSpringsx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2StegoSpringsx2', 'assets/images/dino2StegoSpringsx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2StegoSpringsx4', 'assets/images/dino2StegoSpringsx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3StegoSpringsx2', 'assets/images/dino3StegoSpringsx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3StegoSpringsx4', 'assets/images/dino3StegoSpringsx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4StegoSpringsx2', 'assets/images/dino4StegoSpringsx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4StegoSpringsx4', 'assets/images/dino4StegoSpringsx4.png', { frameWidth: 96, frameHeight: 96 });

        this.load.spritesheet('dino1TriceraTech', 'assets/images/dino1TriceraTech.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2TriceraTech', 'assets/images/dino2TriceraTech.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3TriceraTech', 'assets/images/dino3TriceraTech.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4TriceraTech', 'assets/images/dino4TriceraTech.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1TriceraTechx2', 'assets/images/dino1TriceraTechx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1TriceraTechx4', 'assets/images/dino1TriceraTechx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2TriceraTechx2', 'assets/images/dino2TriceraTechx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2TriceraTechx4', 'assets/images/dino2TriceraTechx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3TriceraTechx2', 'assets/images/dino3TriceraTechx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3TriceraTechx4', 'assets/images/dino3TriceraTechx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4TriceraTechx2', 'assets/images/dino4TriceraTechx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4TriceraTechx4', 'assets/images/dino4TriceraTechx4.png', { frameWidth: 96, frameHeight: 96 });

        this.load.spritesheet('dino1TyrannoHigh', 'assets/images/dino1TyrannoHigh.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2TyrannoHigh', 'assets/images/dino2TyrannoHigh.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3TyrannoHigh', 'assets/images/dino3TyrannoHigh.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4TyrannoHigh', 'assets/images/dino4TyrannoHigh.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino1TyrannoHighx2', 'assets/images/dino1TyrannoHighx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino1TyrannoHighx4', 'assets/images/dino1TyrannoHighx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino2TyrannoHighx2', 'assets/images/dino2TyrannoHighx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino2TyrannoHighx4', 'assets/images/dino2TyrannoHighx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino3TyrannoHighx2', 'assets/images/dino3TyrannoHighx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino3TyrannoHighx4', 'assets/images/dino3TyrannoHighx4.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('dino4TyrannoHighx2', 'assets/images/dino4TyrannoHighx2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('dino4TyrannoHighx4', 'assets/images/dino4TyrannoHighx4.png', { frameWidth: 96, frameHeight: 96 });


        this.load.audio('planningMusic', ['assets/sounds/planningMusic.m4a']);
        this.load.audio('raceMusic', ['assets/sounds/raceMusic.mp3']);
        this.load.image('trackBg', 'assets/images/background.png');
        Object.values(sceneBackgrounds).forEach(bgKey => {
            this.load.image(bgKey, `assets/images/${bgKey}.png`);
        });

    }

    create() {
        addBackground(this);

        this.add.text(400, 300, 'Loading...', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.scene.add('TitleScene', TitleScene);
        //this.scene.add('HUDScene', HUDScene);
        this.scene.add('SeasonOverviewScene', SeasonOverviewScene);
        //this.scene.add('DailyScheduleScene', DailyScheduleScene);
        //this.scene.add('EndOfWeekScene', EndOfWeekScene);
        this.scene.add('MorningScene', MorningScene);
        this.scene.add('PracticePreparationScene', PracticePreparationScene);
        this.scene.add('PracticeResultsScene', PracticeResultsScene);
        //this.scene.add('PracticeRaceScene', PracticeRaceScene);
        this.scene.add('ChallengeSelectionScene', ChallengeSelectionScene);
        this.scene.add('ChallengeRaceScene', ChallengeRaceScene);
        this.scene.add('TestPracticeRaceScene', TestPracticeRaceScene);
        this.scene.add('RaceTestSetupScene', RaceTestSetupScene);
        this.scene.add('AbilitySelectionScene', AbilitySelectionScene);
        //this.scene.add('MeetSetupScene', MeetSetupScene);
        //this.scene.add('MeetResultsScene', MeetResultsScene);
        //this.scene.add('MeetRaceScene', MeetRaceScene);
        this.scene.add('SeasonResultsScene', SeasonResultsScene);
        this.scene.add('StateChampionshipScene', StateChampionshipScene);
        this.scene.add('OffseasonPlanningScene', OffseasonPlanningScene);
        this.scene.add('StartOfSeasonScene', StartOfSeasonScene);
        this.scene.add('GameOverScene', GameOverScene);

        // Build schedule: list of 14 rounds, each with 4 matches
        const names = gameState.schools.map(s => s.name);
        gameState.schedule = generateRoundRobinSchedule(names);
        gameState.currentWeek = 0;

        this.time.delayedCall(500, () => {
            //this.scene.launch('HUDScene');

            this.scene.start('TitleScene');
        });
    }
}
