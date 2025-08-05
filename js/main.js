import HUDScene from './scenes/HUDScene.js';
import BootScene from './scenes/BootScene.js';
//import TestPracticeRaceScene from './scenes/TestPracticeRaceScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,  // <- only center left/right
    },
    parent: 'game-container',
    scene: [BootScene,
        HUDScene,
    ],
};

const game = new Phaser.Game(config);
