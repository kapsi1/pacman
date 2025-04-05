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
// let direction = Direction.Up;
let direction = Direction.Down;
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

  // const nextPos = getNewPos(newX, newY);
  // const nextPos = getNewPos(newX, newY, undefined, true);

  // if (nextPos) {
  let [newXGrid, newYGrid] = pxToGrid(newX, newY);

  if (isCellAllowed(newXGrid, newYGrid)) {
    // console.log('set posX', posX, 'posY', posY);
    posX = newX;
    posY = newY;
    (window as any).currentCell = pxToCell(posX, posY);
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
// const isCellAllowed = (gridX: number, gridY: number, direction?: Direction, log = false) => {
const isCellAllowed = (gridX: number, gridY: number, direction?: Direction, log = true) => {
  if (log)
    console.log(
      'isCellAllowed y',
      gridY,
      'x',
      gridX,
      'direction',
      direction,
      // 'board',
      // board,
      // `board[${gridY}]`,
      // board[gridY],
      `(${gridX}, ${gridY}) '` +
        board[gridY][gridX] +
        `', (${gridX}, ${gridY - 1}) '` +
        board[gridY - 1][gridX] +
        `', (${gridX}, ${gridY - 2}) '` +
        board[gridY - 2][gridX] +
        "'",
      // `\n(${gridX}, ${gridY}) !== '#' && (${gridX}, ${gridY - 1}) !== '#')`,
      // board[gridY][gridX] !== '#' && board[gridY - 1][gridX] !== '#',
      // `\n(${gridX}, ${gridY}) !== '#' && (${gridX}, ${gridY - 1}) === '#')`,
      // board[gridY][gridX] !== '#' && board[gridY - 1][gridX] === '#',
      '\nreturn',
      (board[gridY][gridX] !== '#' && board[gridY - 1][gridX] !== '#') ||
        (board[gridY][gridX] === '#' && board[gridY - 1][gridX] === '#' && board[gridY - 2][gridX] !== '#')
    );
  if (!board[gridY]) return false;
  // if (direction === undefined || direction === Direction.Right || direction === Direction.Down)
  //   return board[gridY][gridX] !== '#';
  // if (direction === Direction.Right || direction === Direction.Down) return board[gridY][gridX] !== '#';
  // else if (direction === Direction.Left) return board[gridX][gridY] !== '#' && board[gridX][gridY - 1] !== '#';
  // else {
  return (
    // (board[gridY][gridX] !== '#' && board[gridY - 1][gridX] !== '#') ||
    board[gridY][gridX] !== '#' ||
    (board[gridY][gridX] === '#' && board[gridY - 1][gridX] === '#' && board[gridY - 2][gridX] !== '#')
  );
  // }
};
const getNextCell = (gridX: number, gridY: number, direction: Direction, log = false) => {
  // if (log) console.log('getNextCell 1', direction, gridX, gridY);
  if (direction === Direction.Down) gridY++;
  else if (direction === Direction.Up) gridY--;
  else if (direction === Direction.Left) gridX--;
  else if (direction === Direction.Right) gridX++;
  // if (log) console.log('getNextCell 2', gridX, gridY);
  return [gridX, gridY];
};
// Called when trying to change directions on Pacman.
// Returns null if new direction is blocked,
// otherwise returns a coordinate (x if going vertical, y if horizontal), snapped to grid.
function getNewPos(newX: number, newY: number, newDirection?: Direction, log = false) {
  const currentDirection = direction;
  let [gridX, gridY] = pxToGrid(newX, newY);

  if (log) {
    // console.group('getNewPos ' + currentDirection + ' -> ' + newDirection);
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

  gridX = Math.floor(gridX);
  gridY = Math.floor(gridY);

  // let newGridX = gridX;
  // let newGridY = gridY;

  // if (newDirection === Direction.Right) {
  //   // gridX++;
  //   if (!isCellAllowed(gridX, gridY, log)) gridY++;
  // } else if (newDirection === Direction.Left) {
  //   // gridX--;
  //   if (!isCellAllowed(gridX, gridY, log)) gridY++;
  // } else if (newDirection === Direction.Down) {
  //   // gridY++;
  //   if (!isCellAllowed(gridX, gridY, log)) gridX++;
  // } else if (newDirection === Direction.Up) {
  //   // gridY--;
  //   if (!isCellAllowed(gridX, gridY, log)) gridX++;
  // }
  // if (log) console.log('2 gridX', gridX, 'gridY', gridY);

  // const nextCell = board[newGridY] ? board[newGridY][newGridX] : undefined;
  const nextCell = getNextCell(gridX, gridY, newDirection || direction, log);
  if (log)
    // console.log(
    //   'cell [' + cellX + ', ' + cellY + '] -> [' + (nextCell && nextCell[0]) + ', ' + (nextCell && nextCell[1]) + ']',
    //   'nextCell',
    //   nextCell
    // );
    console.log('cell [' + gridX + ', ' + gridY + '] -> [' + nextCell[0] + ', ' + nextCell[1] + ']');
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
    board[nextCell[1]][nextCell[0]] +
    "'\nisAllowed: " +
    isCellAllowed(nextCell[0], nextCell[1], newDirection);
  if (log) {
    (window as any).debugDot = [newX, newY];
  }
  (window as any).nextCell = gridToPx(nextCell[0], nextCell[1]);
  if (!isCellAllowed(nextCell[0], nextCell[1], newDirection)) {
    if (log) {
      console.log('nextCell not allowed');
    }
    console.groupEnd();
    return false;
  }
  // else if (isHorizontalDirection(newDirection)) return TOP_MARGIN + WALL_MARGIN + gridY * DOT_GAP;
  // else return gridX * DOT_GAP + WALL_MARGIN;
  // snap to grid
  if (isHorizontalDirection(newDirection || direction)) {
    if (log) console.log('return new y', gridToPx(0, gridY)[1]);
    console.groupEnd();
    return gridToPx(0, gridY)[1];
  } else {
    if (log) console.log('return new x', gridToPx(gridX, 0)[0]);
    console.groupEnd();
    return gridToPx(gridX, 0)[0];
  }
}

document.addEventListener('keydown', (event) => {
  let newPos: number | false;
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
        // posX = newPos;
        direction = Direction.Up;
      }
      // direction = Direction.Up;
      break;
    case 's':
      if (direction === Direction.Down) return;
      newPos = getNewPos(posX, posY, Direction.Down, log);
      if (newPos) {
        // posX = newPos;
        direction = Direction.Down;
      }
      // direction = Direction.Down;
      break;
    case 'd':
      if (direction === Direction.Right) return;
      newPos = getNewPos(posX, posY, Direction.Right, log);
      if (newPos) {
        // posY = newPos;
        direction = Direction.Right;
      }
      // direction = Direction.Right;
      break;
    case 'a':
      if (direction === Direction.Left) return;
      newPos = getNewPos(posX, posY, Direction.Left, log);
      if (newPos) {
        // posY = newPos;
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

// debugEl.innerText = 'posX: ' + posX.toFixed(2) + '\nposY: ' + posY.toFixed(2);
