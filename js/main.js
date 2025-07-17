import HUDScene from './scenes/HUDScene.js';
import BootScene from './scenes/BootScene.js';
//import TestPracticeRaceScene from './scenes/TestPracticeRaceScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: [BootScene,
        HUDScene,
        ],
};

const game = new Phaser.Game(config);
