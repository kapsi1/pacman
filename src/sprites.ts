import { ctx } from './canvas';

const sprites = document.images[0];

export enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

export function drawPacman(destX: number, destY: number, direction: Direction) {
  let spriteWidth: number;
  let spriteHeight: number;
  let angle = 0;
  let spriteOffset = 0;
  if (direction === Direction.Right || direction === Direction.Left) {
    spriteWidth = 10;
    spriteHeight = 11;
    if (direction === Direction.Right) angle = Math.PI;
  } else {
    spriteWidth = 11;
    spriteOffset = spriteWidth;
    spriteHeight = 10;
    if (direction === Direction.Down) angle = Math.PI;
  }
  if (angle > 0) {
    ctx.save();
    ctx.translate(destX + spriteWidth / 2, destY + spriteHeight / 2);
    ctx.rotate(angle);
    // drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight)
    ctx.drawImage(
      sprites,
      spriteOffset,
      0,
      spriteWidth,
      spriteHeight,
      -spriteWidth / 2,
      -spriteHeight / 2,
      spriteWidth,
      spriteHeight
    );
    ctx.restore();
  } else {
    ctx.drawImage(sprites, spriteOffset, 0, spriteWidth, spriteHeight, destX, destY, spriteWidth, spriteHeight);
  }
}
