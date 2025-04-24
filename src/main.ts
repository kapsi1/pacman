import { Direction, GridPos, PxPos } from './types';
import {
  CHARACTER_SPEED,
  DIRECTION_CHANGE_BUFFER_TIME,
  GHOST_ANIMATION_FRAME_LENGTH,
  PACMAN_ANIMATION_FRAME_LENGTH,
} from './consts';
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH, TOP_MARGIN } from './canvas';
import { board, drawBoard } from './board';
import { drawPacman, ghosts, drawGhosts } from './sprites';
import { gridToPx, isHorizontalDirection, pxToGrid } from './utils';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const scoreEl = document.querySelector('#score') as HTMLDivElement;

let direction = Direction.Right;
let newDirection: Direction | null = null;
const pacmanPos = gridToPx({ x: 13, y: 23 }); // default
let pacmanFrame: 0 | 1 | 2 = 0;
let ghostFrame: 0 | 1 = 0;
let pause = false;
let lastTimestamp: number | null = null;
let lastPacmanFrameTimestamp = 0;
let lastGhostFrameTimestamp = 0;
let directionChangeTimestamp: number | null = null;
let score = 0;

// Check given cell, or neighbouring cell in the specified direction
const isCellAllowed = (gridPos: GridPos, oldDirection?: Direction, newDirection?: Direction) => {
  if (!board[gridPos.y]) return false;
  if (!board[gridPos.y][gridPos.x]) return false;
  if (board[gridPos.y][gridPos.x] === '#') return false;
  if (!newDirection) {
    return true;
  } else {
    if (newDirection === Direction.Up && oldDirection !== Direction.Down)
      return isCellAllowed({ ...gridPos, y: gridPos.y - 1 });
    if (newDirection === Direction.Down && oldDirection !== Direction.Up)
      return isCellAllowed({ ...gridPos, y: gridPos.y + 1 });
    if (newDirection === Direction.Left && oldDirection !== Direction.Right)
      return isCellAllowed({ ...gridPos, x: gridPos.x - 1 });
    if (newDirection === Direction.Right && oldDirection !== Direction.Left)
      return isCellAllowed({ ...gridPos, y: gridPos.x + 1 });
    return true;
  }
};

const getNextCell = (gridPos: GridPos, direction: Direction) => {
  let x = gridPos.x;
  let y = gridPos.y;
  if (direction === Direction.Down) y++;
  else if (direction === Direction.Up) y--;
  else if (direction === Direction.Left) x--;
  else if (direction === Direction.Right) x++;
  return { x, y };
};

function changeDirection(newPxPos: PxPos, newDirection: Direction, log = false) {
  const currentDirection = direction;
  let newGridPos = pxToGrid({ x: newPxPos.x, y: newPxPos.y });

  if (log) {
    console.groupCollapsed('getNewPos ' + currentDirection + ' -> ' + newDirection);
    console.log('current pos', pacmanPos, '\nnewGridPos', newGridPos);
  }

  let nextCell = getNextCell(newGridPos, newDirection || direction);
  // if (log) console.log('nextCell', nextCell);
  // if (log) console.log('cell [' + gridX + ', ' + gridY + '] -> [' + nextCell[0] + ', ' + nextCell[1] + ']');
  // const [currentGridX, currentGridY] = pxToGrid(posX, posY);
  // debugEl.innerText =
  //   'direction: ' +
  //   direction +
  //   '\nnewDirection: ' +
  //   newDirection +
  //   '\npos: (' +
  //   posX +
  //   ', ' +
  //   posY +
  //   ')\ngrid: (' +
  //   currentGridX +
  //   ', ' +
  //   currentGridY +
  //   ')\nnew pos: (' +
  //   newX.toFixed(4) +
  //   ', ' +
  //   newY.toFixed(4) +
  //   ')' +
  //   '\nnew grid: (' +
  //   gridX +
  //   ', ' +
  //   gridY +
  //   ')' +
  //   '\nnextCell: (' +
  //   nextCell[0] +
  //   ', ' +
  //   nextCell[1] +
  //   "): '" +
  //   (board[nextCell[1]] ? board[nextCell[1]][nextCell[0]] : null) +
  //   "'\nisAllowed: " +
  //   isCellAllowed(nextCell[0], nextCell[1], direction, newDirection);
  if (log) {
    (window as any).debugDot = { x: newPxPos.x, y: newPxPos.y };
  }
  (window as any).nextCell = gridToPx({ x: nextCell.x, y: nextCell.y });
  if (!isCellAllowed(nextCell, direction, newDirection)) {
    if (log) {
      console.log('nextCell not allowed');
    }
    console.groupEnd();
    return false;
  }

  if (isHorizontalDirection(newDirection)) {
    pacmanPos.y = gridToPx(nextCell).y;
  } else {
    pacmanPos.x = gridToPx(nextCell).x;
  }

  // let cellsToCheckOffsets;
  // //Check neighbouring cells of the next cell, and set the non-changing coordinate snapped to grid
  // if (newDirection === Direction.Left) {
  //   cellsToCheckOffsets = [
  //     [0, 1],
  //     [0, -1],
  //   ];
  // } else if (newDirection === Direction.Right) {
  //   cellsToCheckOffsets = [
  //     [0, 1],
  //     [0, -1],
  //   ];
  // } else if (newDirection === Direction.Up) {
  //   cellsToCheckOffsets = [
  //     [1, 0],
  //     [-1, 0],
  //   ];
  // } else if (newDirection === Direction.Down) {
  //   cellsToCheckOffsets = [
  //     [1, 0],
  //     [-1, 0],
  //   ];
  // }

  // if (cellsToCheckOffsets) {
  //   for (let i = 0; i < cellsToCheckOffsets.length; i++) {
  //     const offsets = cellsToCheckOffsets[i];
  //     const cellToCheck = { x: nextCell.x + (offsets[0] as number), y: nextCell.y + (offsets[1] as number) };
  //     if (log)
  //       console.log('i', i, 'offsets', offsets, 'cellToCheck', cellToCheck, 'isAllowed', isCellAllowed(cellToCheck));
  //     if (!isCellAllowed(cellToCheck)) {
  //       if (isHorizontalDirection(newDirection!)) {
  //         if (offsets[1] < 0) {
  //           // upper neighbour
  //           // if (log) console.log('up, new cell', nextCell[0], nextCell[1] + 1);
  //           // posY = gridToPx(nextCell[0], nextCell[1] + 1)[1];
  //           pacmanPos.y = gridToPx({ ...nextCell, y: nextCell.y + 1 }).y;
  //         } else {
  //           // lower neighbour
  //           // if (log) console.log('down, new cell', nextCell[0], nextCell[1]);
  //           // posY = gridToPx(nextCell[0], nextCell[1])[1];
  //           pacmanPos.y = gridToPx(nextCell).y;
  //         }
  //         // if (log) console.log('posY', posY);
  //       } else {
  //         if (offsets[0] < 0) {
  //           // left neighbour
  //           // if (log) console.log('left, new cell', nextCell[0] + 1, nextCell[1]);
  //           // posX = gridToPx(nextCell[0] + 1, nextCell[1])[0];
  //           pacmanPos.x = gridToPx({ ...nextCell, x: nextCell.x + 1 }).x;
  //         } else {
  //           // right neighbour
  //           // if (log) console.log('right, new cell', nextCell[0], nextCell[1]);
  //           // posX = gridToPx(nextCell[0], nextCell[1])[0];
  //           pacmanPos.x = gridToPx(nextCell).x;
  //         }
  //         // if (log) console.log('posX', posX);
  //       }
  //       break;
  //     }
  //   }
  // }

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
    case 'ArrowUp':
      if (direction === Direction.Up) return;
      newDirection = Direction.Up;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 's':
    case 'ArrowDown':
      if (direction === Direction.Down) return;
      newDirection = Direction.Down;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 'd':
    case 'ArrowRight':
      if (direction === Direction.Right) return;
      newDirection = Direction.Right;
      directionChangeTimestamp = lastTimestamp;
      break;
    case 'a':
    case 'ArrowLeft':
      if (direction === Direction.Left) return;
      newDirection = Direction.Left;
      directionChangeTimestamp = lastTimestamp;
      break;
  }
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(pacmanPos, direction, pacmanFrame);
  drawGhosts(ghostFrame);
});

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (CHARACTER_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  // Delete buffered direction change after specified time
  if (directionChangeTimestamp !== null && timestamp - directionChangeTimestamp > DIRECTION_CHANGE_BUFFER_TIME) {
    directionChangeTimestamp = null;
    newDirection = null;
  }

  // const currentCellCorner = getCellCornerFromPoint(pacmanPos);
  // const xOffset = pacmanPos.x - currentCellCorner.x;
  // const yOffset = pacmanPos.y - currentCellCorner.y;
  // const cellOffset = xOffset + yOffset;

  // Change direction if we're close to the cell's top left corner
  // if (cellOffset <= 1 && newDirection) {
  // console.log('cellOffset', cellOffset);

  if (newDirection) {
    const changedDirection = changeDirection(pacmanPos, newDirection, true);
    if (changedDirection) {
      direction = newDirection;
      newDirection = null;
      directionChangeTimestamp = null;
    }
  }
  let newXPx = pacmanPos.x;
  let newYPx = pacmanPos.y;

  if (direction === Direction.Right) newXPx += deltaPx;
  if (direction === Direction.Left) newXPx -= deltaPx;
  if (direction === Direction.Down) newYPx += deltaPx;
  if (direction === Direction.Up) newYPx -= deltaPx;

  // newCell - cell after moving delta pixels
  // nextCell - cell neighbouring newCell in the current direction
  const newCell = pxToGrid({ x: newXPx, y: newYPx });
  const nextCell = getNextCell(newCell, direction);
  (window as any).nextCell = gridToPx(nextCell);

  const currentCell = pxToGrid(pacmanPos);

  debugEl.innerText =
    'direction: ' +
    direction +
    '\nnewDirection: ' +
    newDirection +
    '\n      pos: (' +
    pacmanPos.x.toFixed(4) +
    ', ' +
    pacmanPos.y.toFixed(4) +
    ')\n     cell: (' +
    currentCell.x +
    ', ' +
    currentCell.y +
    ') "' +
    (board[currentCell.y] ? board[currentCell.y][currentCell.x] : null) +
    '"\n  new pos: (' +
    newXPx.toFixed(4) +
    ', ' +
    newYPx.toFixed(4) +
    ')' +
    '\n new cell: (' +
    newCell.x +
    ', ' +
    newCell.y +
    ') "' +
    (board[newCell.y] ? board[newCell.y][newCell.x] : null) +
    '"\nnext cell: (' +
    nextCell.x +
    ', ' +
    nextCell.y +
    ') "' +
    (board[nextCell.y] ? board[nextCell.y][nextCell.x] : null) +
    '"';

  let isAllowed = false;
  if (direction === Direction.Down || direction === Direction.Right) {
    isAllowed = isCellAllowed(nextCell);
  } else {
    isAllowed = isCellAllowed(newCell);
  }

  if (isAllowed) {
    pacmanPos.x = newXPx;
    pacmanPos.y = newYPx;
  } else {
    if (isHorizontalDirection(direction)) {
      pacmanPos.x = Math.round(pacmanPos.x);
    } else {
      pacmanPos.y = Math.round(pacmanPos.y);
    }
  }

  let scoreChanged = false;
  if (board[newCell.y] && board[newCell.y][newCell.x] === '.') {
    score += 10;
    scoreChanged = true;
  } else if (board[newCell.y] && board[newCell.y][newCell.x] === 'o') {
    score += 50;
    scoreChanged = true;
  }

  if (scoreChanged) {
    scoreEl.textContent = score.toString();
    const row = board[newCell.y];
    board[newCell.y] = row.substring(0, newCell.x) + ' ' + row.substring(newCell.x + 1);
  }

  // (window as any).currentCell = getCellCornerFromPoint(pacmanPos);
  (window as any).currentCell = pxToGrid(pacmanPos);

  if (timestamp - lastPacmanFrameTimestamp > PACMAN_ANIMATION_FRAME_LENGTH) {
    lastPacmanFrameTimestamp = timestamp;
    pacmanFrame++;
    if (pacmanFrame > 2) pacmanFrame = 0;
  }

  if (timestamp - lastGhostFrameTimestamp > GHOST_ANIMATION_FRAME_LENGTH) {
    lastGhostFrameTimestamp = timestamp;
    ghostFrame++;
    if (ghostFrame > 1) ghostFrame = 0;
  }

  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(pacmanPos, direction, pacmanFrame);
  drawGhosts(ghostFrame);
  requestAnimationFrame(tick);
}

drawBoard();
drawPacman(pacmanPos, Direction.Right, pacmanFrame);
drawGhosts(ghostFrame);
requestAnimationFrame(tick);
