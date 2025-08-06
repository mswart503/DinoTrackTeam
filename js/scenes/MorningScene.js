import { gameState } from '../gameState.js';
import { addBackground } from '../utils/sceneHelpers.js';
import { getNextWeeklyScene, playBackgroundMusic, createNextButton , addText} from '../utils/uiHelpers.js';


export default class MorningScene extends Phaser.Scene {
    constructor() {
        super('MorningScene');
    }

    create() {
        //playBackgroundMusic(this, 'planningMusic');
        this.scene.bringToTop('HUDScene');
        addBackground(this);

        const weekNum = gameState.currentWeek + 1; // 1‑based
        gameState.schools
            .filter(s => s.name !== gameState.playerSchool)
            .forEach(school => {
                school.athletes.forEach(athlete => {
                    let minB, maxB;
                    if (weekNum <= 6) {
                        minB = 0; maxB = 2;
                    } else if (weekNum <= 10) {
                        minB = 0; maxB = 3;
                    } else {
                        minB = 1; maxB = 4;
                    }
                    // roll a random boost in [minB..maxB] for each stat
                    const sp = Phaser.Math.Between(minB, maxB);
                    const st = Phaser.Math.Between(minB, maxB);
                    athlete.speed += sp;
                    athlete.stamina += st;
                });
            });

        addText(this, 400, 60, 'Morning Time', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);
        createNextButton(this, getNextWeeklyScene(this.scene.key), this.posx = 730, this.posy = 550);
    }
}
