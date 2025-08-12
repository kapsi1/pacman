import { ctx } from './canvas';
import { Direction, Ghost, GhostName, PxPos } from './types';
import { DOT_SIZE, DEBUG_PACMAN, DEATH_ANIMATION_START_PAUSE_FRAMES, DEATH_ANIMATION_END_PAUSE_FRAMES } from './consts';

// Prepare sprites: load into a new <canvas>, get imageData,
// and turn black pixels transparent
const spritesEl: HTMLImageElement = document.images[0];
const spriteCanvas = document.createElement('canvas');
spriteCanvas.style.setProperty('image-rendering', 'pixelated');
const spriteCtx = spriteCanvas.getContext('2d') as CanvasRenderingContext2D;
spriteCtx.imageSmoothingEnabled = false;
spriteCtx.drawImage(spritesEl, 0, 0);
const imageData = spriteCtx.getImageData(0, 0, spritesEl.width, spritesEl.height);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
  const isBlack = data[i] + data[i + 1] + data[i + 2] === 0;
  if (isBlack) data[i + 3] = 0;
}
spriteCtx.putImageData(imageData, 0, 0);

export function drawPacman(pos: PxPos, direction: Direction, frame: 0 | 1 | 2) {
  const size = 13;
  let srcX: number;
  let srcY: number;
  if (frame === 0) {
    srcX = 33;
    srcY = 1;
  } else {
    if (frame === 1) srcX = 1;
    else srcX = 17;
    if (direction === Direction.Right) srcY = 1;
    else if (direction === Direction.Left) srcY = 17;
    else if (direction === Direction.Up) srcY = 33;
    else srcY = 49;
  }
  const destX = Math.round(pos.x - size / 2);
  const destY = Math.round(pos.y - size / 2);
  if (DEBUG_PACMAN) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(pos.x - DOT_SIZE / 2, pos.y - DOT_SIZE / 2, 2, 2);
    ctx.globalAlpha = 0.1;
  }
  ctx.drawImage(spriteCanvas, srcX, srcY, size, size, destX, destY, size, size);
  if (DEBUG_PACMAN) ctx.globalAlpha = 1;
}

function drawGhost(ghost: GhostName, pos: PxPos, direction: Direction, frame: 0 | 1) {
  const size = 14;
  let srcX = 1;
  let srcY = 65;
  if (direction === Direction.Left) srcX += 2 * (size + 2);
  if (direction === Direction.Up) srcX += 4 * (size + 2);
  if (direction === Direction.Down) srcX += 6 * (size + 2);
  if (frame === 1) srcX += size + 2;
  if (ghost === GhostName.Pinky) srcY += size + 2;
  if (ghost === GhostName.Inky) srcY += 2 * (size + 2);
  if (ghost === GhostName.Clyde) srcY += 3 * (size + 2);
  const destX = Math.round(pos.x - size / 2);
  const destY = Math.round(pos.y - size / 2);
  ctx.drawImage(spriteCanvas, srcX, srcY, size, size, destX, destY, size, size);
}

export function drawGhosts(ghosts: Ghost[], frame: 0 | 1) {
  ghosts.forEach((ghost) => drawGhost(ghost.name, ghost.pos, ghost.direction, frame));
}

export function drawDeathAnimation(pos: PxPos, frame: number) {
  const size = 15;
  if (frame < DEATH_ANIMATION_START_PAUSE_FRAMES) return;
  if (frame > DEATH_ANIMATION_START_PAUSE_FRAMES + DEATH_ANIMATION_END_PAUSE_FRAMES) return;
  let srcX = 48 + (size + 1) * (frame - DEATH_ANIMATION_START_PAUSE_FRAMES);
  let srcY = 1;
  const destX = Math.round(pos.x - size / 2);
  const destY = Math.round(pos.y - size / 2);
  ctx.drawImage(spriteCanvas, srcX, srcY, size, size, destX, destY, size, size);
}

export function drawLives(lifeCount: number) {
  const srcX = 131;
  const srcY = 18;
  const destX = 35;
  const destY = 274;
  const size = 11;
  const margin = 5;

  for (let i = 0; i < lifeCount; i++) {
    ctx.drawImage(spriteCanvas, srcX, srcY, size, size, destX + i * (size + margin), destY, size, size);
  }
}
