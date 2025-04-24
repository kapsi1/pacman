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
  Math.floor((pxX - WALL_MARGIN) / DOT_GAP),
  Math.floor((pxY - WALL_MARGIN - TOP_MARGIN) / DOT_GAP),
];
// get coordinates of top left corner of the cell containing the point
const getCellCornerFromPoint = (pxX: number, pxY: number) => {
  const g = pxToGrid(pxX, pxY);
  return gridToPx(Math.floor(g[0]), Math.floor(g[1]));
};

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const DIRECTION_CHANGE_BUFFER_TIME = 200;
// const PACMAN_SPEED = 5; // px/s
// const PACMAN_SPEED = 10; // px/s
const PACMAN_SPEED = 60; // px/s // default
let direction = Direction.Right;
let newDirection: Direction | null = null;
let [posX, posY] = gridToPx(13, 23); // default
posX += 4; // center default position
let pacmanFrame: Frame = 0;
let pause = false;
let lastTimestamp: number | null = null;
let lastFrameTimestamp = 0;
let directionChangeTimestamp: number | null = null;

// Check given cell, or neighbouring cell in the specified direction
const isCellAllowed = (gridX: number, gridY: number, oldDirection?: Direction, newDirection?: Direction) => {
  if (!board[gridY]) return false;
  if (!board[gridY][gridX]) return false;
  if (board[gridY][gridX] === '#') return false;
  if (!newDirection) {
    return true;
  } else {
    if (newDirection === Direction.Up && oldDirection !== Direction.Down) return isCellAllowed(gridX, gridY - 1);
    if (newDirection === Direction.Down && oldDirection !== Direction.Up) return isCellAllowed(gridX, gridY + 1);
    if (newDirection === Direction.Left && oldDirection !== Direction.Right) return isCellAllowed(gridX - 1, gridY);
    if (newDirection === Direction.Right && oldDirection !== Direction.Left) return isCellAllowed(gridX + 1, gridY);
    return true;
  }
};

const getNextCell = (gridX: number, gridY: number, direction: Direction, log = false) => {
  if (direction === Direction.Down) gridY++;
  else if (direction === Direction.Up) gridY--;
  else if (direction === Direction.Left) gridX--;
  else if (direction === Direction.Right) gridX++;
  return [gridX, gridY];
};

function changeDirections(newX: number, newY: number, newDirection?: Direction, log = false) {
  const currentDirection = direction;
  let [gridX, gridY] = pxToGrid(newX, newY);

  if (log) {
    console.groupCollapsed('getNewPos ' + currentDirection + ' -> ' + newDirection);
    console.log(
      'posX',
      posX,
      'posY',
      posY,
      '\nnewX',
      newX,
      'gridX',
      gridX,
      'floor',
      Math.floor(gridX),
      '\nnewY',
      newY,
      'gridY',
      gridY,
      'floor',
      Math.floor(gridY)
    );
  }

  // gridX = Math.floor(gridX);
  // gridY = Math.floor(gridY);
  let nextCell = getNextCell(gridX, gridY, newDirection || direction, log);
  if (log) console.log('nextCell', nextCell);

  if (log) console.log('cell [' + gridX + ', ' + gridY + '] -> [' + nextCell[0] + ', ' + nextCell[1] + ']');
  const [currentGridX, currentGridY] = pxToGrid(posX, posY);
  debugEl.innerText =
    'direction: ' +
    direction +
    '\nnewDirection: ' +
    newDirection +
    '\npos: (' +
    posX +
    ', ' +
    posY +
    ')\ngrid: (' +
    currentGridX +
    ', ' +
    currentGridY +
    ')\nnew pos: (' +
    newX.toFixed(4) +
    ', ' +
    newY.toFixed(4) +
    ')' +
    '\nnew grid: (' +
    gridX +
    ', ' +
    gridY +
    ')' +
    '\nnextCell: (' +
    nextCell[0] +
    ', ' +
    nextCell[1] +
    "): '" +
    (board[nextCell[1]] ? board[nextCell[1]][nextCell[0]] : null) +
    "'\nisAllowed: " +
    isCellAllowed(nextCell[0], nextCell[1], direction, newDirection);
  if (log) {
    (window as any).debugDot = [newX, newY];
  }
  (window as any).nextCell = gridToPx(nextCell[0], nextCell[1]);
  if (!isCellAllowed(nextCell[0], nextCell[1], direction, newDirection)) {
    if (log) {
      console.log('nextCell not allowed');
    }
    console.groupEnd();
    return false;
  }

  let cellsToCheckOffsets;
  //Check neighbouring cells of the next cell, and get the non-changing coordinate snapped to grid
  if (newDirection === Direction.Left) {
    cellsToCheckOffsets = [
      [0, 1],
      [0, -1],
      [-1, 1],
      [-1, -1],
    ];
  } else if (newDirection === Direction.Right) {
    cellsToCheckOffsets = [
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
    ];
  } else if (newDirection === Direction.Up) {
    cellsToCheckOffsets = [
      [1, 0],
      [-1, 0],
      [1, -1],
      [-1, -1],
    ];
  } else if (newDirection === Direction.Down) {
    cellsToCheckOffsets = [
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, 1],
    ];
  }

  if (cellsToCheckOffsets) {
    for (let i = 0; i < cellsToCheckOffsets.length; i++) {
      const offsets = cellsToCheckOffsets[i];
      const cellToCheck = [nextCell[0] + (offsets[0] as number), nextCell[1] + (offsets[1] as number)];
      if (log)
        console.log(
          'i',
          i,
          'offsets',
          offsets,
          'cellToCheck',
          cellToCheck,
          'isAllowed',
          isCellAllowed(cellToCheck[0], cellToCheck[1])
        );
      if (!isCellAllowed(cellToCheck[0], cellToCheck[1])) {
        if (isHorizontalDirection(newDirection!)) {
          if (offsets[1] < 0) {
            // upper neighbour
            if (log) console.log('up, new cell', nextCell[0], nextCell[1] + 1);
            posY = gridToPx(nextCell[0], nextCell[1] + 1)[1];
          } else {
            // lower neighbour
            if (log) console.log('down, new cell', nextCell[0], nextCell[1]);
            posY = gridToPx(nextCell[0], nextCell[1])[1];
          }
          if (log) console.log('posY', posY);
        } else {
          if (offsets[0] < 0) {
            // left neighbour
            if (log) console.log('left, new cell', nextCell[0] + 1, nextCell[1]);
            posX = gridToPx(nextCell[0] + 1, nextCell[1])[0];
          } else {
            // right neighbour
            if (log) console.log('right, new cell', nextCell[0], nextCell[1]);
            posX = gridToPx(nextCell[0], nextCell[1])[0];
          }
          if (log) console.log('posX', posX);
        }
        break;
      }
    }
  }

  console.groupEnd();
  return true;
}

document.addEventListener('keydown', (event) => {
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
      newDirection = Direction.Up;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 's':
      if (direction === Direction.Down) return;
      newDirection = Direction.Down;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 'd':
      if (direction === Direction.Right) return;
      newDirection = Direction.Right;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 'a':
      if (direction === Direction.Left) return;
      newDirection = Direction.Left;
      directionChangeTimestamp = lastTimestamp;
      break;
  }
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(posX, posY, direction, pacmanFrame);
});

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (PACMAN_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  // Delete buffered direction change after some time
  if (directionChangeTimestamp !== null && timestamp - directionChangeTimestamp > DIRECTION_CHANGE_BUFFER_TIME) {
    directionChangeTimestamp = null;
    newDirection = null;
  }
  if (newDirection) {
    const changedDirection = changeDirections(posX, posY, newDirection, true);
    if (changedDirection) {
      direction = newDirection;
      newDirection = null;
      directionChangeTimestamp = null;
    }
  }
  let newX = posX;
  let newY = posY;
  if (direction === Direction.Right) newX += deltaPx;
  if (direction === Direction.Left) newX -= deltaPx;
  if (direction === Direction.Down) newY += deltaPx;
  if (direction === Direction.Up) newY -= deltaPx;
  let [newXGrid, newYGrid] = pxToGrid(newX, newY);
  const nextCell = getNextCell(newXGrid, newYGrid, direction);
  (window as any).nextCell = gridToPx(nextCell[0], nextCell[1]);

  const currentCell = pxToGrid(posX, posY);

  debugEl.innerText =
    'direction: ' +
    direction +
    '\nnewDirection: ' +
    newDirection +
    '\n      pos: (' +
    posX +
    ', ' +
    posY +
    ')\n     cell: (' +
    currentCell[0] +
    ', ' +
    currentCell[1] +
    ') "' +
    (board[currentCell[1]] ? board[currentCell[1]][currentCell[0]] : null) +
    '"\n  new pos: (' +
    newX +
    ', ' +
    newY +
    ')' +
    '\n new cell: (' +
    newXGrid +
    ', ' +
    newYGrid +
    ') "' +
    board[newYGrid][newXGrid] +
    '"\nnext cell: (' +
    nextCell[0] +
    ', ' +
    nextCell[1] +
    ') "' +
    (board[nextCell[1]] ? board[nextCell[1]][nextCell[0]] : null) +
    '"';

  // let moveAllowed = true;
  // if (!board[nextCell[1]] || !board[nextCell[1]][nextCell[0]]) moveAllowed = false;
  // if (board[nextCell[1]] && board[nextCell[1]][nextCell[0]] === '#') moveAllowed = false;

  if (isCellAllowed(nextCell[0], nextCell[1])) {
    posX = newX;
    posY = newY;
  } else {
    if (isHorizontalDirection(direction)) {
      posX = Math.round(posX);
    } else {
      posY = Math.round(posY);
    }
  }
  (window as any).currentCell = getCellCornerFromPoint(posX, posY);
  // change animation frame every 60 ms
  if (timestamp - lastFrameTimestamp > 60) {
    lastFrameTimestamp = timestamp;
    pacmanFrame++;
    if (pacmanFrame > 2) pacmanFrame = 0;
  }

  // TODO clear only needed part of the screen
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(posX, posY, direction, pacmanFrame);
  requestAnimationFrame(tick);
}

drawBoard();
drawPacman(posX, posY, Direction.Right, pacmanFrame);
requestAnimationFrame(tick);
