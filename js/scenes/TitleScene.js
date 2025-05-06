export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        this.add.text(400, 200, 'Dino Track Team', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        
        const startButton = this.add.text(400, 400, 'Start Game', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
        
        startButton.on('pointerdown', () => {
            this.scene.start('SeasonOverviewScene');
        });
    }
}
