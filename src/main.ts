import { Direction, GridPos, PxPos } from './types';
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH, TOP_MARGIN } from './canvas';
import { board, drawBoard, WALL_MARGIN, CELL_SIZE } from './board';
import { drawPacman, ghosts, drawGhosts } from './sprites';

const isHorizontalDirection = (direction: Direction) => direction === Direction.Left || direction === Direction.Right;
// const gridToPx = (gridX: number, gridY: number) => [
//   WALL_MARGIN + gridX * CELL_SIZE,
//   TOP_MARGIN + WALL_MARGIN + gridY * CELL_SIZE,
// ];
// Returns middle point of the cell
function gridToPx(gridPos: GridPos): PxPos {
  return {
    x: WALL_MARGIN + gridPos.x * CELL_SIZE + CELL_SIZE / 2,
    y: TOP_MARGIN + WALL_MARGIN + gridPos.y * CELL_SIZE + CELL_SIZE / 2,
  };
}
function pxToGrid(pxPos: PxPos): GridPos {
  return {
    x: Math.floor((pxPos.x - WALL_MARGIN) / CELL_SIZE),
    y: Math.floor((pxPos.y - WALL_MARGIN - TOP_MARGIN) / CELL_SIZE),
  };
}
// get coordinates of top left corner of the cell containing the point
const getCellCornerFromPoint = (pxPos: PxPos): PxPos => {
  const gridPos = pxToGrid(pxPos);
  const cellCenter = gridToPx(gridPos);
  return {
    x: cellCenter.x - CELL_SIZE / 2,
    y: cellCenter.y - CELL_SIZE / 2,
  };
};

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const scoreEl = document.querySelector('#score') as HTMLDivElement;
const DIRECTION_CHANGE_BUFFER_TIME = 500;
const PACMAN_ANIMATION_FRAME_LENGTH = 70;
const GHOST_ANIMATION_FRAME_LENGTH = 300;
// const CHARACTER_SPEED = 5; // px/s
const CHARACTER_SPEED = 20; // px/s
// const CHARACTER_SPEED = 60; // px/s // default
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
  if (direction === Direction.Down) gridPos.y++;
  else if (direction === Direction.Up) gridPos.y--;
  else if (direction === Direction.Left) gridPos.x--;
  else if (direction === Direction.Right) gridPos.x++;
  return gridPos;
};

function changeDirection(newPxPos: PxPos, newDirection?: Direction, log = false) {
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

  let cellsToCheckOffsets;
  //Check neighbouring cells of the next cell, and get the non-changing coordinate snapped to grid
  if (newDirection === Direction.Left) {
    cellsToCheckOffsets = [
      [0, 1],
      [0, -1],
    ];
  } else if (newDirection === Direction.Right) {
    cellsToCheckOffsets = [
      [0, 1],
      [0, -1],
    ];
  } else if (newDirection === Direction.Up) {
    cellsToCheckOffsets = [
      [1, 0],
      [-1, 0],
    ];
  } else if (newDirection === Direction.Down) {
    cellsToCheckOffsets = [
      [1, 0],
      [-1, 0],
    ];
  }

  if (cellsToCheckOffsets) {
    for (let i = 0; i < cellsToCheckOffsets.length; i++) {
      const offsets = cellsToCheckOffsets[i];
      const cellToCheck = { x: nextCell.x + (offsets[0] as number), y: nextCell.y + (offsets[1] as number) };
      if (log)
        console.log('i', i, 'offsets', offsets, 'cellToCheck', cellToCheck, 'isAllowed', isCellAllowed(cellToCheck));
      if (!isCellAllowed(cellToCheck)) {
        if (isHorizontalDirection(newDirection!)) {
          if (offsets[1] < 0) {
            // upper neighbour
            // if (log) console.log('up, new cell', nextCell[0], nextCell[1] + 1);
            // posY = gridToPx(nextCell[0], nextCell[1] + 1)[1];
            pacmanPos.y = gridToPx({ ...nextCell, y: nextCell.y + 1 }).y;
          } else {
            // lower neighbour
            // if (log) console.log('down, new cell', nextCell[0], nextCell[1]);
            // posY = gridToPx(nextCell[0], nextCell[1])[1];
            pacmanPos.y = gridToPx(nextCell).y;
          }
          // if (log) console.log('posY', posY);
        } else {
          if (offsets[0] < 0) {
            // left neighbour
            // if (log) console.log('left, new cell', nextCell[0] + 1, nextCell[1]);
            // posX = gridToPx(nextCell[0] + 1, nextCell[1])[0];
            pacmanPos.x = gridToPx({ ...nextCell, x: nextCell.x + 1 }).x;
          } else {
            // right neighbour
            // if (log) console.log('right, new cell', nextCell[0], nextCell[1]);
            // posX = gridToPx(nextCell[0], nextCell[1])[0];
            pacmanPos.x = gridToPx(nextCell).x;
          }
          // if (log) console.log('posX', posX);
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

  const currentCellCorner = getCellCornerFromPoint(pacmanPos);
  const xOffset = pacmanPos.x - currentCellCorner.x;
  const yOffset = pacmanPos.y - currentCellCorner.y;
  const cellOffset = xOffset + yOffset;

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
  let newX = pacmanPos.x;
  let newY = pacmanPos.y;

  if (direction === Direction.Right) newX += deltaPx;
  if (direction === Direction.Left) newX -= deltaPx;
  if (direction === Direction.Down) newY += deltaPx;
  if (direction === Direction.Up) newY -= deltaPx;

  // console.log('pacmanPos', pacmanPos, 'deltaPx', deltaPx, 'newX', newX, 'newY', newY);

  // newCell - cell after moving delta pixels
  // nextCell - cell neighbouring newCell in the current direction
  const newCell = pxToGrid({ x: newX, y: newY });
  const nextCell = getNextCell(newCell, direction);
  (window as any).nextCell = gridToPx(nextCell);

  const currentCell = pxToGrid(pacmanPos);

  debugEl.innerText =
    'direction: ' +
    direction +
    '\nnewDirection: ' +
    newDirection +
    '\n      pos: (' +
    pacmanPos.x +
    ', ' +
    pacmanPos.y +
    ')\n     cell: (' +
    currentCell.x +
    ', ' +
    currentCell.y +
    ') "' +
    (board[currentCell.y] ? board[currentCell.y][currentCell.x] : null) +
    '"\n  new pos: (' +
    newX +
    ', ' +
    newY +
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
    pacmanPos.x = newX;
    pacmanPos.y = newY;
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

  (window as any).currentCell = getCellCornerFromPoint(pacmanPos);

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
