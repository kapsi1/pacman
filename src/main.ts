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
// const PACMAN_SPEED = 5; // px/s
// const PACMAN_SPEED = 20; // px/s
const PACMAN_SPEED = 57.71; // px/s
let direction = Direction.Right;
//position in dot grid
let posY = 211;
// let posX = 111;
let posX = 150;
// let posX = 162;
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

  let newX = posX;
  let newY = posY;
  if (direction === Direction.Right) newX += deltaPx;
  if (direction === Direction.Left) newX -= deltaPx;
  if (direction === Direction.Down) newY += deltaPx;
  if (direction === Direction.Up) newY -= deltaPx;

  const pos = newPos(newX!, newY!, direction);
  if (pos) {
    //   if (direction === Direction.Up || direction === Direction.Down) posX = pos;
    //   else posY = pos;
    posX = newX;
    posY = newY;
    //   // if (direction === Direction.Up || direction === Direction.Down) {
    //   //   posX = pos;
    //   //   posY = newY;
    //   // } else {
    //   //   posX = newX;
    //   //   posY = pos;
    //   // }
  }
  // posX = newX;
  // posY = newY;

  // change animation frame every 60 ms
  if (timestamp - lastFrameTimestamp > 60) {
    lastFrameTimestamp = timestamp;
    pacmanFrame++;
    if (pacmanFrame > 2) pacmanFrame = 0;
  }

  // debugEl.innerText = 'posX: ' + posX.toFixed(2) + '\nposY: ' + posY.toFixed(2);
  drawBoard();
  drawPacman(posX, posY, direction, pacmanFrame);

  requestAnimationFrame(tick);
}
// console.log(board);

const isHorizontalDirection = (direction: Direction) => direction === Direction.Left || direction === Direction.Right;
// Called when trying to change directions on Pacman.
// Returns null if new direction is blocked, and if it's allowed,
// returns the changed direction coordinate, snapped to grid.
function newPos(x: number, y: number, direction: Direction, log = false) {
  // let gridX = Math.round((Math.round(x) - WALL_MARGIN) / DOT_GAP);
  // let gridY = Math.round((Math.round(y) - WALL_MARGIN - TOP_MARGIN) / DOT_GAP);
  // let gridX = Math.round((x - WALL_MARGIN) / DOT_GAP);
  // let gridY = Math.round((y - WALL_MARGIN - TOP_MARGIN) / DOT_GAP);
  // let gridX = Math.floor((x - WALL_MARGIN) / DOT_GAP);
  // let gridY = Math.floor((y - WALL_MARGIN - TOP_MARGIN) / DOT_GAP);
  // let gridX = Math.ceil((x - WALL_MARGIN) / DOT_GAP);
  // let gridY = Math.ceil((y - WALL_MARGIN - TOP_MARGIN) / DOT_GAP);
  let gridX = (x - WALL_MARGIN) / DOT_GAP;
  let gridY = (y - WALL_MARGIN - TOP_MARGIN) / DOT_GAP;
  if (direction === Direction.Right) {
    gridX = Math.floor(gridX);
    gridY = Math.round(gridY);
  } else if (direction === Direction.Left) {
    gridX = Math.ceil(gridX);
    gridY = Math.round(gridY);
  } else if (direction === Direction.Down) {
    gridY = Math.floor(gridY);
    gridX = Math.round(gridX);
  } else if (direction === Direction.Up) {
    gridY = Math.ceil(gridY);
    gridX = Math.round(gridX);
  }
  let nextX = gridX;
  let nextY = gridY;
  // console.log(
  //   // 'direction',
  //   // direction,
  //   'x',
  //   x,
  //   // 'round',
  //   // Math.round(x),
  //   '-11',
  //   x - WALL_MARGIN,
  //   '/8',
  //   (x - WALL_MARGIN) / DOT_GAP,
  //   'gridX',
  //   gridX,
  //   'toPx',
  //   gridX * DOT_GAP + WALL_MARGIN
  // );
  // console.log(
  //   'y',
  //   y,
  //   'round',
  //   Math.round(y),
  //   '-35',
  //   Math.round(y) - WALL_MARGIN - TOP_MARGIN,
  //   '/8',
  //   (Math.round(x) - WALL_MARGIN - TOP_MARGIN) / DOT_GAP,
  //   'round',
  //   gridY,
  //   'toX',
  //   TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP
  // );
  if (direction === Direction.Right) nextX++;
  if (direction === Direction.Left) nextX--;
  if (direction === Direction.Down) nextY++;
  if (direction === Direction.Up) nextY--;
  const nextCell = board[nextY] ? board[nextY][nextX] : undefined;
  // console.log(`nextCell`, board[nextY][nextX], 'isAllowed', nextCell !== undefined && nextCell !== '#');
  debugEl.innerText =
    'direction: ' +
    direction +
    '\nx: ' +
    x.toFixed(2) +
    '\ngridX: ' +
    gridX +
    '\nnextX: ' +
    nextX +
    '\ny: ' +
    y.toFixed(2) +
    '\ngridY: ' +
    gridY +
    '\nnextY: ' +
    nextY +
    '\nnextCell: ' +
    nextCell +
    '\nisAllowed: ' +
    (nextCell === undefined || nextCell === '#' ? 'false' : 'true');
  if (nextCell === undefined || nextCell === '#') return null;
  else if (isHorizontalDirection(direction)) return TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP;
  else return gridX * DOT_GAP + WALL_MARGIN;
}

document.addEventListener('keydown', (event) => {
  let pos;
  switch (event.key) {
    case ' ':
      pause = !pause;
      if (!pause) {
        lastTimestamp = null;
        requestAnimationFrame(tick);
      }
      break;
    case 'w':
      if (direction === Direction.Up) return;
      pos = newPos(posX, posY, Direction.Up, true);
      if (pos) {
        posX = pos;
        direction = Direction.Up;
      }
      // direction = Direction.Up;
      break;
    case 's':
      if (direction === Direction.Down) return;
      pos = newPos(posX, posY, Direction.Down, true);
      if (pos) {
        posX = pos;
        direction = Direction.Down;
      }
      // direction = Direction.Down;
      break;
    case 'd':
      if (direction === Direction.Right) return;
      pos = newPos(posX, posY, Direction.Right, true);
      if (pos) {
        posY = pos;
        direction = Direction.Right;
      }
      // direction = Direction.Right;
      break;
    case 'a':
      if (direction === Direction.Left) return;
      pos = newPos(posX, posY, Direction.Left, true);
      if (pos) {
        posY = pos;
        direction = Direction.Left;
      }
      // direction = Direction.Left;
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
