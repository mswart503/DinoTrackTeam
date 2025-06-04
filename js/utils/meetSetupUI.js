// src/utils/meetSetupUI.js
import { gameState } from '../gameState.js';

export function drawEventDropZone(scene, x, y, eventName, onDropCallback) {
    const zone = scene.add.zone(x, y, 150, 100).setRectangleDropZone(150, 100);
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRectShape(zone.getBounds());

    const label = scene.add.text(x, y - 60, `${eventName}`, {
        fontSize: '20px',
        fill: '#fff',
    }).setOrigin(0.5);

    zone.setData('event', eventName);
    zone.setData('occupied', false);

    // ✅ Important: Drop zone is interactive, but NOT draggable
    zone.setInteractive();

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (dropZone === zone && !zone.getData('occupied')) {
            const athlete = gameObject.getData('athlete');
            onDropCallback(eventName, athlete, dropZone); // updated argument order
            zone.setData('occupied', true);
        }
    });

    return { zone, graphics, label };
}


export function drawOpponentBlock(scene, eventName, athletes, x, y) {
    athletes.forEach((athlete, index) => {
        const offsetY = y - 50 + index * 25;
        const text = `${athlete.name} (PR ${athlete.prs?.[eventName]?.toFixed(2) ?? 'N/A'})`;
        scene.add.text(x, offsetY, text, { fontSize: '16px', fill: '#aaa' });
    });
}

export function drawPlayerAthleteCard(scene, athlete, x, y) {
    const card = scene.add.container(x, y);

    const bg = scene.add.rectangle(0, 0, 120, 100, 0x333333).setStrokeStyle(2, 0x00ff00);
    const name = scene.add.text(0, -30, athlete.name, { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    const sprite = scene.add.sprite(0, 0, athlete.spriteKey).setScale(1.5);
    const stats = scene.add.text(0, 30, getSummaryStats(athlete), { fontSize: '12px', fill: '#0f0' }).setOrigin(0.5);

    card.add([bg, name, sprite, stats]);
    card.setSize(120, 100);
    card.setInteractive({ draggable: true });

    card.setData('athlete', athlete);

    scene.input.setDraggable(card);

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });
}

function getSummaryStats(athlete) {
    const pr100 = athlete.prs?.['100m']?.toFixed(1) ?? 'N/A';
    const pr200 = athlete.prs?.['200m']?.toFixed(1) ?? 'N/A';
    const pr400 = athlete.prs?.['400m']?.toFixed(1) ?? 'N/A';
    return `100:${pr100} 200:${pr200} 400:${pr400}`;
}
