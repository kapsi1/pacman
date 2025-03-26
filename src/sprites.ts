import { ctx } from './canvas';
import { Direction } from './main';

// state of Pacman's mouth
// open, half, closed
export type Frame = 0 | 1 | 2;

const sprites = document.images[0];
const pacmanSpriteSize = 13;

export function drawPacman(x: number, y: number, direction: Direction, frame: Frame) {
  // console.log('drawPacman', x, y, direction, frame);
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
  const dotX = x;
  const dotY = y;
  //offset position by sprite size
  y = Math.round(y - pacmanSpriteSize / 2) + 1;
  x = Math.round(x - pacmanSpriteSize / 2) + 1;
  // drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight)
  ctx.drawImage(sprites, srcX, srcY, pacmanSpriteSize, pacmanSpriteSize, x, y, pacmanSpriteSize, pacmanSpriteSize);
  ctx.fillStyle = 'orange';
  ctx.fillRect(dotX, dotY, 2, 2);
}
