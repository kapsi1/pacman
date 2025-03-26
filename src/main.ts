import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from './canvas';
import { drawBoard } from './board';
import { drawPacman, Direction, Frame } from './sprites';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
// 3.5s na przejście dolnego rzędu - 202 px od pierwszej do ostatniej kropki
// 1 s = 57,71 px
// const PACMAN_SPEED = 20; // px/s
const PACMAN_SPEED = 57.71; // px/s
let direction = Direction.Right;
const PACMAN_SPRITE_SIZE = 13;
//position in dot grid
let posY = 211;
let posX = 111;
// //offset position by sprite size
// posY = Math.round(posY - PACMAN_SPRITE_SIZE / 2) + 1;
// posX = Math.round(posX - PACMAN_SPRITE_SIZE / 2) + 1;
let pacmanFrame: Frame = 0;
let pause = false;
let lastTimestamp: number | null = null;
let lastFrameTimestamp = 0;

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (PACMAN_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  // TODO clear only needed part of the screen
  // ctx.clearRect(posX, posY, 11, 11);
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  if (direction === Direction.Right) posX += deltaPx;
  if (direction === Direction.Left) posX -= deltaPx;
  if (direction === Direction.Up) posY -= deltaPx;
  if (direction === Direction.Down) posY += deltaPx;

  // change animation frame every 60 ms
  if (timestamp - lastFrameTimestamp > 60) {
    lastFrameTimestamp = timestamp;
    pacmanFrame++;
    if (pacmanFrame > 2) pacmanFrame = 0;
  }

  debugEl.innerText = 'x: ' + posX.toFixed(2) + '\ny: ' + posY.toFixed(2);
  drawBoard();
  drawPacman(posX, posY, direction, pacmanFrame);

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
drawPacman(posX, posY, Direction.Right, pacmanFrame);
requestAnimationFrame(tick);

debugEl.innerText = 'posX: ' + posX.toFixed(2) + '\nposY: ' + posY.toFixed(2);
