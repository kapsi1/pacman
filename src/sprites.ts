import { ctx } from './canvas';
import { Direction } from './types';
import { PxPos } from './types';
// const DEBUG_PACMAN = false;
const DEBUG_PACMAN = true;

const sprites = document.images[0];
const pacmanSpriteSize = 13;

export function drawPacman(pos: PxPos, direction: Direction, frame: 0 | 1 | 2) {
  let posX = pos.x;
  let posY = pos.y;
  const dotX = posX;
  const dotY = posY;
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
  //offset position by sprite size
  posX = Math.round(posX - pacmanSpriteSize / 2);
  posY = Math.round(posY - pacmanSpriteSize / 2);
  if (DEBUG_PACMAN) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(dotX, dotY, 2, 2);
    ctx.globalAlpha = 0.1;
    ctx.drawImage(
      sprites,
      srcX,
      srcY,
      pacmanSpriteSize,
      pacmanSpriteSize,
      posX,
      posY,
      pacmanSpriteSize,
      pacmanSpriteSize
    );
    ctx.globalAlpha = 1;
  } else {
    ctx.drawImage(
      sprites,
      srcX,
      srcY,
      pacmanSpriteSize,
      pacmanSpriteSize,
      posX,
      posY,
      pacmanSpriteSize,
      pacmanSpriteSize
    );
  }
}

export enum GhostName {
  Blinky,
  Pinky,
  Inky,
  Clyde,
}

export type Ghost = {
  name: GhostName;
  pos: number[];
  direction: Direction;
};

const ghostSpriteSize = 14;
export const ghosts: Ghost[] = [
  { name: GhostName.Blinky, pos: [111, 115], direction: Direction.Left },
  { name: GhostName.Inky, pos: [95, 140], direction: Direction.Up },
  { name: GhostName.Pinky, pos: [111, 140], direction: Direction.Down },
  { name: GhostName.Clyde, pos: [127, 140], direction: Direction.Up },
];

export function drawGhost(ghost: GhostName, x: number, y: number, direction: Direction, frame: 0 | 1) {
  let srcX = 1;
  let srcY = 65;
  if (direction === Direction.Left) srcX += 2 * (ghostSpriteSize + 2);
  if (direction === Direction.Up) srcX += 4 * (ghostSpriteSize + 2);
  if (direction === Direction.Down) srcX += 6 * (ghostSpriteSize + 2);
  if (frame === 1) srcX += ghostSpriteSize + 2;
  if (ghost === GhostName.Pinky) srcY += ghostSpriteSize + 2;
  if (ghost === GhostName.Inky) srcY += 2 * (ghostSpriteSize + 2);
  if (ghost === GhostName.Clyde) srcY += 3 * (ghostSpriteSize + 2);
  y = Math.round(y - ghostSpriteSize / 2) + 1;
  x = Math.round(x - ghostSpriteSize / 2) + 1;
  ctx.drawImage(sprites, srcX, srcY, ghostSpriteSize, ghostSpriteSize, x, y, ghostSpriteSize, ghostSpriteSize);
}

export function drawGhosts(frame: 0 | 1) {
  ghosts.forEach((ghost) => drawGhost(ghost.name, ghost.pos[0], ghost.pos[1], ghost.direction, frame));
}
