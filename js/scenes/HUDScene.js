// HUDScene.js
import { gameState } from '../gameState.js';
import { addText } from '../utils/uiHelpers.js';

export default class HUDScene extends Phaser.Scene {
  constructor() { super('HUDScene'); }
  create() {
    this.moneyText = addText(this, 10, 10, `Money: \n$${gameState.money}`, {
      fontSize: '16px', fill: '#fff', backgroundColor: '#000', padding: 4
    });
    this.events.on('update',()=> this.moneyText.setText(`Money: $${gameState.money}`));
  }
}
