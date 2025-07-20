import { playBackgroundMusic } from '../utils/uiHelpers.js';
import { addBackground } from '../utils/sceneHelpers.js';



export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        //playBackgroundMusic(this, 'planningMusic');
        addBackground(this);
        this.add.text(400, 170, 'Dino Track Team', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        const startButton = this.add.text(400, 380, 'Start Game', { fontSize: '32px', fill: '#000' }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('SeasonOverviewScene');
        });

       /* const testModeButton = this.add.text(400, 450, 'Race Test Mode', { fontSize: '28px', fill: '#000' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('RaceTestSetupScene');
            });*/

    }
}
