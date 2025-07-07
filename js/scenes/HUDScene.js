// HUDScene.js
import { gameState } from '../gameState.js';

export default class HUDScene extends Phaser.Scene {
  constructor() { super('HUDScene'); }
  create() {
    this.moneyText = this.add.text(10,10,`Money: $${gameState.money}`,{fontSize:'18px',fill:'#fff'});
    this.events.on('update',()=> this.moneyText.setText(`Money: $${gameState.money}`));
  }
}
