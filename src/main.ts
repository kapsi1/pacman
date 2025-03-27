import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH, TOP_MARGIN } from './canvas';
import { board, drawBoard, WALL_MARGIN, DOT_GAP } from './board';
import { drawPacman, Frame } from './sprites';

export enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

const isHorizontalDirection = (direction: Direction) => direction === Direction.Left || direction === Direction.Right;
const gridToPx = (gridX: number, gridY: number) => [
  WALL_MARGIN + gridX * DOT_GAP,
  TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP,
];
const pxToGrid = (pxX: number, pxY: number) => [
  (pxX - WALL_MARGIN) / DOT_GAP,
  (pxY - WALL_MARGIN - TOP_MARGIN) / DOT_GAP,
];

const debugEl = document.querySelector('#debug') as HTMLDivElement;
// 3.5s na przejście dolnego rzędu - 202 px od pierwszej do ostatniej kropki
// 1 s = 57,71 px
// const PACMAN_SPEED = 1; // px/s
const PACMAN_SPEED = 5; // px/s
// const PACMAN_SPEED = 20; // px/s
// const PACMAN_SPEED = 57.71; // px/s
// const PACMAN_SPEED = 60; // px/s
let direction = Direction.Right;
// let direction = Direction.Up;
//position in dot grid
// let posY = 211;
// let posX = 111;
// let posX = 150;
// let posX = 160;
// let posY = 187;
// let posX = 99;
// let [posX, posY] = gridToPx(20, 14);
// let [posX, posY] = gridToPx(13, 22); //default
let [posX, posY] = gridToPx(19, 13); //default
posX -= 4;
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
const isCellAllowed = (gridX: number, gridY: number, log = false) => {
  if (log) console.log('isCellAllowed', gridX, gridY, board[gridY] ? board[gridY][gridX] !== '#' : false);
  return board[gridY] ? board[gridY][gridX] !== '#' : false;
};
// console.log(board);
// Called when trying to change directions on Pacman.
// Returns null if new direction is blocked, and if it's allowed,
// returns the changed direction coordinate, snapped to grid.
function newPos(pxX: number, pxY: number, newDirection: Direction, log = false) {
  const currentDirection = direction;
  let [gridX, gridY] = pxToGrid(pxX, pxY);
  let newGridX = gridX;
  let newGridY = gridY;
  if (log) {
    console.group(currentDirection + ' -> ' + newDirection);
    console.log('pxX', pxX.toFixed(2), 'gridX', gridX.toFixed(2), 'pxY', pxY.toFixed(2), 'gridY', gridY.toFixed(2));
  }
  // if (newDirection === Direction.Right) {
  if (isHorizontalDirection(newDirection)) {
    if (log)
      console.log(
        'round(gridY)',
        Math.round(gridY),
        'floor(gridY)',
        Math.floor(gridY),
        'ceil(gridY)',
        Math.ceil(gridY)
      );
    if (currentDirection === Direction.Down) {
      // gridY = Math.ceil(gridY);
      // if (log) console.log('y ceil', gridY);
      gridY = Math.floor(gridY);
      if (log) console.log('y floor', gridY);
      // gridY = Math.round(gridY);
      // if (log) console.log('y round', gridY);
    } else {
      // gridY = Math.floor(gridY);
      // if (log) console.log('y floor', gridY);
      gridY = Math.ceil(gridY);
      if (log) console.log('y ceil', gridY);
      // gridY = Math.round(gridY);
      // if (log) console.log('y round', gridY);
    }
    gridX = Math.ceil(gridX);
    // if (log) console.log('x ceil', gridX);
    // if (log) {
    //   console.log('floor(gridX)', Math.floor(gridX));
    //   console.log('round(gridY)', Math.round(gridY));
    // }
    // gridX = Math.floor(gridX);
    // gridY = Math.round(gridY);
    // } else if (newDirection === Direction.Left) {
    //   if (log) {
    //     console.log('ceil(gridX)', Math.ceil(gridX));
    //     console.log('round(gridY)', Math.round(gridY));
    //   }
    //   gridX = Math.ceil(gridX);
    //   gridY = Math.round(gridY);
    // } else if (newDirection === Direction.Down) {
    //   if (log) {
    //     console.log('round(gridX)', Math.round(gridX));
    //     console.log('floor(gridY)', Math.floor(gridY));
    //   }
    //   gridX = Math.round(gridX);
    //   gridY = Math.floor(gridY);
    // } else if (newDirection === Direction.Up) {
  } else {
    if (log)
      console.log(
        'round(gridX)',
        Math.round(gridX),
        'floor(gridX)',
        Math.floor(gridX),
        'ceil(gridX)',
        Math.ceil(gridX)
      );
    // gridX = Math.round(gridX);
    if (currentDirection === Direction.Right) {
      gridX = Math.ceil(gridX);
      if (log) console.log('x ceil', gridX);
    } else {
      gridX = Math.floor(gridX);
      if (log) console.log('x floor', gridX);
    }
    gridY = Math.ceil(gridY);
    // if (log) console.log('y ceil', gridY);
  }
  newGridX = gridX;
  newGridY = gridY;
  if (newDirection === Direction.Right) {
    newGridX++;
    if (!isCellAllowed(newGridX, newGridY - 1, log)) newGridY++;
  }
  if (newDirection === Direction.Left) {
    newGridX--;
    if (!isCellAllowed(newGridX, newGridY - 1, log)) newGridY++;
  }
  if (newDirection === Direction.Down) {
    newGridY++;
    // if (!isCellAllowed(newGridX - 1, newGridY, log)) newGridY++;
  }
  if (newDirection === Direction.Up) {
    newGridY--;
    // if (!isCellAllowed(newGridX - 1, newGridY, log)) newGridY++;
  }
  const nextCell = board[newGridY] ? board[newGridY][newGridX] : undefined;
  if (log)
    console.log(
      'grid [' + gridX + ', ' + gridY + '] -> [' + newGridX + ', ' + newGridY + ']',
      'nextCell',
      nextCell,
      'isAllowed',
      isCellAllowed(newGridX, newGridY)
    );
  debugEl.innerText =
    'direction: ' +
    newDirection +
    '\nx: ' +
    pxX.toFixed(2) +
    '\ngridX: ' +
    gridX +
    '\nnextX: ' +
    newGridX +
    '\ny: ' +
    pxY.toFixed(2) +
    '\ngridY: ' +
    gridY +
    '\nnextY: ' +
    newGridY +
    '\nnextCell: ' +
    nextCell +
    '\nisAllowed: ' +
    isCellAllowed(newGridX, newGridY);
  if (log) {
    (window as any).debugDot = [pxX, pxY];
    console.groupEnd();
  }
  if (!isCellAllowed(newGridX, newGridY)) return null;
  // else if (isHorizontalDirection(newDirection)) return TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP;
  // else return gridX * DOT_GAP + WALL_MARGIN;
  // snap to grid
  else if (isHorizontalDirection(newDirection)) return gridToPx(0, newGridY)[1];
  else return gridToPx(newGridX, 0)[0];
}

document.addEventListener('keydown', (event) => {
  let pos: number | null;
  let log = true;
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
      pos = newPos(posX, posY, Direction.Up, log);
      if (pos) {
        posX = pos;
        direction = Direction.Up;
      }
      // direction = Direction.Up;
      break;
    case 's':
      if (direction === Direction.Down) return;
      pos = newPos(posX, posY, Direction.Down, log);
      if (pos) {
        posX = pos;
        direction = Direction.Down;
      }
      // direction = Direction.Down;
      break;
    case 'd':
      if (direction === Direction.Right) return;
      pos = newPos(posX, posY, Direction.Right, log);
      if (pos) {
        posY = pos;
        direction = Direction.Right;
      }
      // direction = Direction.Right;
      break;
    case 'a':
      if (direction === Direction.Left) return;
      pos = newPos(posX, posY, Direction.Left, log);
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
