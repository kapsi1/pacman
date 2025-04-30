import { ctx } from './canvas';
import { Direction, Ghost, GhostName, PxPos } from './types';
import { DOT_SIZE, DEBUG_PACMAN } from './consts';

// Prepare sprites: load into a new <canvas>, get imageData,
// and turn black pixels into transparent pixels
const spritesEl: HTMLImageElement = document.images[0];
const spriteCanvas = document.createElement('canvas');
spriteCanvas.style.setProperty('image-rendering', 'pixelated');
const spriteCtx = spriteCanvas.getContext('2d') as CanvasRenderingContext2D;
spriteCtx.imageSmoothingEnabled = false;
spriteCtx.drawImage(spritesEl, 0, 0);
const imageData = spriteCtx.getImageData(0, 0, 224, 211);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
  const isBlack = data[i] + data[i + 1] + data[i + 2] === 0;
  if (isBlack) data[i + 3] = 0;
}
spriteCtx.putImageData(imageData, 0, 0);

const pacmanSize = 13;
export function drawPacman(pos: PxPos, direction: Direction, frame: 0 | 1 | 2) {
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
  const destX = Math.round(pos.x - pacmanSize / 2);
  const destY = Math.round(pos.y - pacmanSize / 2);
  if (DEBUG_PACMAN) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(pos.x - DOT_SIZE / 2, pos.y - DOT_SIZE / 2, 2, 2);
    ctx.globalAlpha = 0.1;
  }
  ctx.drawImage(spriteCanvas, srcX, srcY, pacmanSize, pacmanSize, destX, destY, pacmanSize, pacmanSize);
  if (DEBUG_PACMAN) ctx.globalAlpha = 1;
}

const ghostSize = 14;

function drawGhost(ghost: GhostName, pos: PxPos, direction: Direction, frame: 0 | 1) {
  let srcX = 1;
  let srcY = 65;
  if (direction === Direction.Left) srcX += 2 * (ghostSize + 2);
  if (direction === Direction.Up) srcX += 4 * (ghostSize + 2);
  if (direction === Direction.Down) srcX += 6 * (ghostSize + 2);
  if (frame === 1) srcX += ghostSize + 2;
  if (ghost === GhostName.Pinky) srcY += ghostSize + 2;
  if (ghost === GhostName.Inky) srcY += 2 * (ghostSize + 2);
  if (ghost === GhostName.Clyde) srcY += 3 * (ghostSize + 2);
  const destX = Math.round(pos.x - ghostSize / 2);
  const destY = Math.round(pos.y - ghostSize / 2);
  ctx.drawImage(spriteCanvas, srcX, srcY, ghostSize, ghostSize, destX, destY, ghostSize, ghostSize);
}

export function drawGhosts(ghosts: Ghost[], frame: 0 | 1) {
  ghosts.forEach((ghost) => drawGhost(ghost.name, ghost.pos, ghost.direction, frame));
}

// Frame = 0..10
const deathSize = 15;
export function drawPacmanDeath(pos: PxPos, frame: number) {
  if (frame < 0) return;
  let srcX = 48 + (deathSize + 1) * frame;
  let srcY = 1;
  const destX = Math.round(pos.x - deathSize / 2);
  const destY = Math.round(pos.y - deathSize / 2);
  ctx.drawImage(spriteCanvas, srcX, srcY, deathSize, deathSize, destX, destY, deathSize, deathSize);
}
