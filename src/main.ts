import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from './canvas';
import { drawBoard } from './board';
import { drawPacman, Direction } from './sprites';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
let lastTimestamp: number | null = null;

// 3.5s na przejście dolnego rzędu - 202 px od pierwszej do ostatniej kropki
// 1 s = 57,71 px
// const PACMAN_SPEED = 20; // px/s
const PACMAN_SPEED = 57.71; // px/s
let direction = Direction.Right;
let posX = 107;
let posY = 207;
let pause = false;

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (PACMAN_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  // ctx.clearRect(posX, posY, 11, 11);
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  if (direction === Direction.Right) posX += deltaPx;
  if (direction === Direction.Left) posX -= deltaPx;
  if (direction === Direction.Up) posY -= deltaPx;
  if (direction === Direction.Down) posY += deltaPx;

  // const roundedPosX = Math.round(posX * 2) / 2;
  const roundedPosX = Math.round(posX);
  const roundedPosY = Math.round(posY);

  debugEl.innerText =
    'posX: ' +
    posX.toFixed(4) +
    '\nroundedPosX: ' +
    roundedPosX +
    '\nposY: ' +
    posY.toFixed(4) +
    '\nroundedPosY: ' +
    roundedPosY;
  drawBoard();
  drawPacman(roundedPosX, roundedPosY, direction);

  requestAnimationFrame(tick);
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case ' ':
      pause = !pause;
      if (!pause) {
        lastTimestamp = null;
        requestAnimationFrame(tick);
      }
      break;
    case 'w':
      direction = Direction.Up;
      break;
    case 's':
      direction = Direction.Down;
      break;
    case 'd':
      direction = Direction.Right;
      break;
    case 'a':
      direction = Direction.Left;
      break;
  }
});

drawBoard();
drawPacman(posX, posY, Direction.Right);
requestAnimationFrame(tick);
