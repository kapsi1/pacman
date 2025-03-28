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
// get coordinates of top left corner of the cell containing the point
const pxToCell = (pxX: number, pxY: number) => {
  const g = pxToGrid(pxX, pxY);
  return gridToPx(Math.floor(g[0]), Math.floor(g[1]));
};

const debugEl = document.querySelector('#debug') as HTMLDivElement;
// 3.5s na przejście dolnego rzędu - 202 px od pierwszej do ostatniej kropki
// 1 s = 57,71 px
// const PACMAN_SPEED = 1; // px/s
const PACMAN_SPEED = 5; // px/s
// const PACMAN_SPEED = 20; // px/s
// const PACMAN_SPEED = 57.71; // px/s
// const PACMAN_SPEED = 60; // px/s
let direction = Direction.Down;
// let direction = Direction.Up;
//position in dot grid
// let posY = 211;
// let posX = 111;
// let posX = 150;
// let posX = 160;
// let posY = 187;
// let posX = 99;
// let [posX, posY] = gridToPx(20, 14);
// let [posX, posY] = gridToPx(13, 22); // default
// posX -= 4; // center default position
let [posX, posY] = gridToPx(17, 10);
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

  const nextPos = getNewPos(newX!, newY!, direction);
  if (nextPos) {
    posX = newX;
    posY = newY;
  }

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
const isSideCellAllowed = (gridX: number, gridY: number, direction: Direction) => {
  console.log('isSideCellAllowed 1', direction, gridX, gridY);
  if (direction === Direction.Down) gridY++;
  else if (direction === Direction.Up) gridY--;
  else if (direction === Direction.Left) gridX--;
  else if (direction === Direction.Right) gridX++;
  console.log('isSideCellAllowed 2', gridX, gridY);
  return isCellAllowed(gridX, gridY);
};
// Called when trying to change directions on Pacman.
// Returns null if new direction is blocked,
// otherwise returns a coordinate (x if going vertical, y if horizontal), snapped to grid.
function getNewPos(pxX: number, pxY: number, newDirection: Direction, log = false) {
  const currentDirection = direction;
  let [gridX, gridY] = pxToGrid(pxX, pxY);
  let newGridX = gridX;
  let newGridY = gridY;
  if (log) {
    console.group(currentDirection + ' -> ' + newDirection);
    // console.log('pxX', pxX.toFixed(2), 'gridX', gridX.toFixed(2), 'pxY', pxY.toFixed(2), 'gridY', gridY.toFixed(2));
    console.log('pxX', pxX, 'gridX', gridX, 'pxY', pxY, 'gridY', gridY);
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
      gridY = Math.floor(gridY);
      if (log) console.log('y floor', gridY);
      // gridY = Math.ceil(gridY);
      // if (log) console.log('y ceil', gridY);
      // gridY = Math.round(gridY);
      // if (log) console.log('y round', gridY);
    }
    // gridX = Math.ceil(gridX);
    gridX = Math.floor(gridX);
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
      // gridX = Math.ceil(gridX);
      // if (log) console.log('x ceil', gridX);
      gridX = Math.floor(gridX);
      if (log) console.log('x floor', gridX);
    } else {
      gridX = Math.floor(gridX);
      if (log) console.log('x floor', gridX);
    }
    gridY = Math.floor(gridY);
    // if (log) console.log('y ceil', gridY);
  }

  newGridX = gridX;
  newGridY = gridY;
  if (newDirection === Direction.Right) {
    newGridX++;
    // if (!isCellAllowed(newGridX, newGridY, log)) newGridY++;
  }
  if (newDirection === Direction.Left) {
    newGridX--;
    // if (!isCellAllowed(newGridX, newGridY, log)) newGridY++;
  }
  if (newDirection === Direction.Down) {
    newGridY++;
    // if (!isCellAllowed(newGridX, newGridY, log)) newGridX++;
  }
  if (newDirection === Direction.Up) {
    newGridY--;
    // if (!isCellAllowed(newGridX, newGridY, log)) newGridX++;
  }
  const sideCell = board[newGridY] ? board[newGridY][newGridX] : undefined;
  if (log)
    console.log(
      'grid [' + gridX + ', ' + gridY + '] -> [' + newGridX + ', ' + newGridY + ']',
      'nextCell',
      sideCell,
      'isCellAllowed',
      isCellAllowed(newGridX, newGridY),
      'isSideCellAllowed',
      isSideCellAllowed(gridX, gridY, newDirection)
    );
  const [originalGridX, originalGridY] = pxToGrid(pxX, pxY);
  debugEl.innerText =
    'direction: ' +
    direction +
    '\nnewDirection: ' +
    newDirection +
    '\nx: ' +
    pxX.toFixed(4) +
    '\ny: ' +
    pxY.toFixed(4) +
    '\noriginalGrid: (' +
    originalGridX.toFixed(4) +
    ', ' +
    originalGridY.toFixed(4) +
    ')' +
    '\ngrid: (' +
    gridX +
    ', ' +
    gridY +
    ')' +
    '\nnewGrid: (' +
    newGridX +
    ', ' +
    newGridY +
    ')' +
    '\nside cell content: ' +
    sideCell +
    '\nisAllowed: ' +
    isCellAllowed(newGridX, newGridY) +
    '\nisSideCellAllowed: ' +
    isSideCellAllowed(gridX, gridY, newDirection);
  if (log) {
    (window as any).debugDot = [pxX, pxY];
    console.groupEnd();
  }
  (window as any).currentCell = pxToCell(pxX, pxY);
  (window as any).nextCell = gridToPx(newGridX, newGridY);
  if (!isCellAllowed(newGridX, newGridY)) return null;
  // else if (isHorizontalDirection(newDirection)) return TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP;
  // else return gridX * DOT_GAP + WALL_MARGIN;
  // snap to grid
  else if (isHorizontalDirection(newDirection)) return gridToPx(0, newGridY)[1];
  else return gridToPx(newGridX, 0)[0];
}

document.addEventListener('keydown', (event) => {
  let newPos: number | null;
  let log = true;
  switch (event.key) {
    case '`':
    case ' ':
      pause = !pause;
      if (!pause) {
        lastTimestamp = null;
        requestAnimationFrame(tick);
      }
      break;
    case 'w':
      if (direction === Direction.Up) return;
      newPos = getNewPos(posX, posY, Direction.Up, log);
      if (newPos) {
        posX = newPos;
        direction = Direction.Up;
      }
      // direction = Direction.Up;
      break;
    case 's':
      if (direction === Direction.Down) return;
      newPos = getNewPos(posX, posY, Direction.Down, log);
      if (newPos) {
        posX = newPos;
        direction = Direction.Down;
      }
      // direction = Direction.Down;
      break;
    case 'd':
      if (direction === Direction.Right) return;
      newPos = getNewPos(posX, posY, Direction.Right, log);
      if (newPos) {
        posY = newPos;
        direction = Direction.Right;
      }
      // direction = Direction.Right;
      break;
    case 'a':
      if (direction === Direction.Left) return;
      newPos = getNewPos(posX, posY, Direction.Left, log);
      if (newPos) {
        posY = newPos;
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
