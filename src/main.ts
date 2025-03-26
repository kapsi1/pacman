import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH, TOP_MARGIN } from './canvas';
import { board, drawBoard, WALL_MARGIN, DOT_GAP } from './board';
import { drawPacman, Frame } from './sprites';

export enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

const debugEl = document.querySelector('#debug') as HTMLDivElement;
// 3.5s na przejście dolnego rzędu - 202 px od pierwszej do ostatniej kropki
// 1 s = 57,71 px
const PACMAN_SPEED = 10; // px/s
// const PACMAN_SPEED = 57.71; // px/s
let direction = Direction.Right;
//position in dot grid
let posY = 211;
let posX = 111;
// let posY = 187;
// let posX = 99;
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
// console.log(board);

// Called when trying to change directions on Pacman.
// Returns null if new direction is blocked, and if it's allowed,
// returns the changed direction, snapped to grid.
function newPos(x: number, y: number, direction: Direction) {
  // let gridX = (Math.round(x) - WALL_MARGIN) / DOT_GAP;
  // let gridY = (Math.round(y) - WALL_MARGIN - TOP_MARGIN) / DOT_GAP;
  let gridX = Math.round((Math.round(x) - WALL_MARGIN) / DOT_GAP);
  let gridY = Math.round((Math.round(y) - WALL_MARGIN - TOP_MARGIN) / DOT_GAP);
  console.log(
    'x',
    x,
    'round',
    Math.round(x),
    '-11',
    Math.round(x) - WALL_MARGIN,
    '/8',
    (Math.round(x) - WALL_MARGIN) / DOT_GAP,
    'round',
    gridX,
    'toX',
    gridX * DOT_GAP + WALL_MARGIN
  );
  console.log(
    'y',
    y,
    'round',
    Math.round(y),
    '-35',
    Math.round(y) - WALL_MARGIN - TOP_MARGIN,
    '/8',
    (Math.round(x) - WALL_MARGIN - TOP_MARGIN) / DOT_GAP,
    'round',
    gridY,
    'toX',
    TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP
  );
  if (direction === Direction.Right) gridX++;
  if (direction === Direction.Left) gridX--;
  if (direction === Direction.Up) gridY--;
  if (direction === Direction.Down) gridY++;
  const char = board[gridY][gridX];
  console.log(
    // `board[${gridY}]`,
    // board[gridY],
    `char`,
    board[gridY][gridX],
    'isAllowed',
    char !== undefined && char !== '#'
  );
  if (char === undefined || char === '#') return null;
  // else return [gridX * DOT_GAP + WALL_MARGIN, TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP];
  else if (direction === Direction.Up || direction === Direction.Down) return gridX * DOT_GAP + WALL_MARGIN;
  else return TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP;
}

document.addEventListener('keydown', (event) => {
  // if (direction === Direction.Right) gridX++;
  // if (direction === Direction.Left) gridX--;
  // if (direction === Direction.Up) gridY--;
  // if (direction === Direction.Down) gridY++;
  switch (event.key) {
    case ' ':
      pause = !pause;
      if (!pause) {
        lastTimestamp = null;
        requestAnimationFrame(tick);
      }
      break;
    case 'w':
      // console.log(Direction.Up, isDirectionAllowed(posX, posY, Direction.Up));
      if (newPos(posX, posY, Direction.Up)) {
        // posY -= 8;
        direction = Direction.Up;
      }
      break;
    case 's':
      if (direction === Direction.Down) return;
      const pos = newPos(posX, posY, Direction.Down);
      if (pos) {
        posX = pos;
        direction = Direction.Down;
      }
      break;
    case 'd':
      // console.log(Direction.Right, isDirectionAllowed(posX, posY, Direction.Right));
      if (newPos(posX, posY, Direction.Right)) {
        // posX += 8;
        direction = Direction.Right;
      }
      break;
    case 'a':
      // console.log(Direction.Left, isDirectionAllowed(posX, posY, Direction.Left));
      if (newPos(posX, posY, Direction.Left)) {
        // posX -= 8;
        direction = Direction.Left;
      }
      break;
  }
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(posX, posY, direction, pacmanFrame);
});

drawBoard();
drawPacman(posX, posY, Direction.Right, pacmanFrame);
requestAnimationFrame(tick);

debugEl.innerText = 'posX: ' + posX.toFixed(2) + '\nposY: ' + posY.toFixed(2);
