import { createNextButton } from '../utils/uiHelpers.js';

export default class MeetSetupScene extends Phaser.Scene {
    constructor() {
        super('MeetSetupScene');
    }

    create() {
        this.add.text(400, 300, 'Meet Setup', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'MeetResultsScene');
    }
}
