import TitleScene from './TitleScene.js';
import SeasonOverviewScene from './SeasonOverviewScene.js';
//import DailyScheduleScene from './DailyScheduleScene.js';
import EndOfWeekScene from './EndOfWeekScene.js';
import MorningScene from './MorningScene.js';
import PracticePreparationScene from './PracticePreparationScene.js';
import PracticeResultsScene from './PracticeResultsScene.js';
import PracticeRaceScene from './PracticeRaceScene.js';
import TestPracticeRaceScene from './TestPracticeRaceScene.js';
import RaceTestSetupScene from './RaceTestSetupScene.js';
import MeetSetupScene from './MeetSetupScene.js';
import MeetRaceScene from './MeetRaceScene.js';
import MeetResultsScene from './MeetResultsScene.js';
import SeasonResultsScene from './SeasonResultsScene.js';
import StateChampionshipScene from './StateChampionshipScene.js';
import OffseasonPlanningScene from './OffSeasonPlanningScene.js';
import StartOfSeasonScene from './StartOfSeasonScene.js';
import GameOverScene from './GameOverScene.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    preload() {
        this.load.spritesheet('dino1', 'assets/images/dino1.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino2', 'assets/images/dino2.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino3', 'assets/images/dino3.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('dino4', 'assets/images/dino4.png', { frameWidth: 24, frameHeight: 24 });
        this.load.audio('planningMusic', ['assets/sounds/planningMusic.mp3']);
        this.load.audio('raceMusic', ['assets/sounds/raceMusic.mp3']);
        this.load.image('trackBg', 'assets/images/background.png');
        
    
    }

    create() {
        this.add.text(400, 300, 'Loading...', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        
        this.scene.add('TitleScene', TitleScene);
        this.scene.add('SeasonOverviewScene', SeasonOverviewScene);
        //this.scene.add('DailyScheduleScene', DailyScheduleScene);
        this.scene.add('EndOfWeekScene', EndOfWeekScene);
        this.scene.add('MorningScene', MorningScene);
        this.scene.add('PracticePreparationScene', PracticePreparationScene);
        this.scene.add('PracticeResultsScene', PracticeResultsScene);
        this.scene.add('PracticeRaceScene', PracticeRaceScene);
        this.scene.add('TestPracticeRaceScene', TestPracticeRaceScene);
        this.scene.add('RaceTestSetupScene', RaceTestSetupScene);
        this.scene.add('MeetSetupScene', MeetSetupScene);
        this.scene.add('MeetResultsScene', MeetResultsScene);
        this.scene.add('MeetRaceScene', MeetRaceScene);
        this.scene.add('SeasonResultsScene', SeasonResultsScene);
        this.scene.add('StateChampionshipScene', StateChampionshipScene);
        this.scene.add('OffseasonPlanningScene', OffseasonPlanningScene);
        this.scene.add('StartOfSeasonScene', StartOfSeasonScene);
        this.scene.add('GameOverScene', GameOverScene);
        
        this.time.delayedCall(500, () => {
            this.scene.start('TitleScene');
        });
    }
}
