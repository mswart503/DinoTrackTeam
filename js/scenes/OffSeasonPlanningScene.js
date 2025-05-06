import { createNextButton } from '../utils/uiHelpers.js';

export default class OffseasonPlanningScene extends Phaser.Scene {
    constructor() {
        super('OffseasonPlanningScene');
    }

    create() {
        this.add.text(400, 300, 'Plan the Offseason', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'StartOfSeasonScene');
    }
}
