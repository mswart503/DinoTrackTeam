import { createNextButton } from '../utils/uiHelpers.js';

export default class SeasonResultsScene extends Phaser.Scene {
    constructor() {
        super('SeasonResultsScene');
    }

    create() {
        this.add.text(400, 300, 'Season Results', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        createNextButton(this, 'StateChampionshipScene');
    }
}
