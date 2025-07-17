import { sceneBackgrounds } from '../config/backgrounds.js';

export function addBackground(scene) {
  const bgKey = sceneBackgrounds[scene.scene.key];
  if (!bgKey) return;            // no background configured
  const { width, height } = scene.sys.game.config;
  scene.add.image(width/2, height/2, bgKey)
       .setOrigin(0.5)
       .setDepth(-100);         // behind everything
}
