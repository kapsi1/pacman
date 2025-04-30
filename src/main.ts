import { Direction } from './types';
import {
  CELL_SIZE,
  CHARACTER_SPEED,
  GHOST_ANIMATION_FRAME_LENGTH,
  PACMAN_ANIMATION_FRAME_LENGTH,
  board,
} from './consts';
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from './canvas';
import { drawBoard } from './board';
import { drawPacman, drawGhosts } from './sprites';
import { gridToPx, isHorizontalDirection, pxToGrid, pointDistance, getNextCell, isCellAllowed } from './utils';

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
let score = 0;
let isCornering = false;

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
      break;
    case 's':
    case 'ArrowDown':
      if (direction === Direction.Down) return;
      newDirection = Direction.Down;
      break;
    case 'd':
    case 'ArrowRight':
      if (direction === Direction.Right) return;
      newDirection = Direction.Right;
      break;
    case 'a':
    case 'ArrowLeft':
      if (direction === Direction.Left) return;
      newDirection = Direction.Left;
      break;
  }
  drawEverything();
});

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (CHARACTER_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  let newPos = { x: pacmanPos.x, y: pacmanPos.y };

  if (direction === Direction.Right) newPos.x += deltaPx;
  if (direction === Direction.Left) newPos.x -= deltaPx;
  if (direction === Direction.Down) newPos.y += deltaPx;
  if (direction === Direction.Up) newPos.y -= deltaPx;

  const currentCell = pxToGrid(pacmanPos);

  // During cornering Pacman moves diagonally until he reaches
  // the centerline of the new direction's path
  if (isCornering) {
    const cellCenter = gridToPx(currentCell);
    const xOffset = pacmanPos.x - cellCenter.x;
    const yOffset = pacmanPos.y - cellCenter.y;
    const epsilon = 0.3;

    if (!isHorizontalDirection(direction)) {
      if (xOffset < -epsilon) newPos.x += deltaPx;
      if (xOffset > epsilon) newPos.x -= deltaPx;
      if (xOffset >= -epsilon && xOffset <= epsilon) {
        newPos.x = Math.round(newPos.x);
        isCornering = false;
      }
    } else {
      if (yOffset < -epsilon) newPos.y += deltaPx;
      if (yOffset > epsilon) newPos.y -= deltaPx;
      if (yOffset >= -epsilon && yOffset <= epsilon) {
        newPos.y = Math.round(newPos.y);
        isCornering = false;
      }
    }
  }

  if (newDirection) {
    const nextCell = getNextCell(currentCell, newDirection);
    const isAllowed = isCellAllowed(nextCell);

    if (isAllowed) {
      if (
        (isHorizontalDirection(direction) && !isHorizontalDirection(newDirection)) ||
        (!isHorizontalDirection(direction) && isHorizontalDirection(newDirection))
      ) {
        isCornering = true;
      }
      direction = newDirection;
      newDirection = null;
    }
  }

  // newCell - cell after moving delta pixels
  // nextCell - cell neighbouring newCell in the current direction
  let newCell = pxToGrid(newPos);

  // Teleport from left to right pipe
  if (direction === Direction.Left && newCell.x === 0 && newCell.y === 14) {
    newPos = { x: 252, y: 140 };
    newCell = { x: 31, y: 14 };
  }
  // Teleport from right to left pipe
  if (direction === Direction.Right && newCell.x === 31 && newCell.y === 14) {
    newPos = { x: 0, y: 140 };
    newCell = { x: 0, y: 14 };
  }
  const nextCell = getNextCell(newCell, direction);

  (window as any).currentCell = pxToGrid(pacmanPos);
  (window as any).nextCell = nextCell;

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
    newPos.x.toFixed(4) +
    ', ' +
    newPos.y.toFixed(4) +
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

  let isAllowed = true;
  const isNextCellAllowed = isCellAllowed(nextCell);
  const distanceToNextCell = pointDistance(newPos, gridToPx(nextCell));
  if (!isNextCellAllowed && distanceToNextCell <= CELL_SIZE) {
    isAllowed = false;
  }

  if (isAllowed) {
    pacmanPos.x = newPos.x;
    pacmanPos.y = newPos.y;

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
  } else {
    if (isHorizontalDirection(direction)) {
      pacmanPos.x = Math.round(pacmanPos.x);
    } else {
      pacmanPos.y = Math.round(pacmanPos.y);
    }
  }

  if (isAllowed && timestamp - lastPacmanFrameTimestamp > PACMAN_ANIMATION_FRAME_LENGTH) {
    lastPacmanFrameTimestamp = timestamp;
    pacmanFrame++;
    if (pacmanFrame > 2) pacmanFrame = 0;
  }

  if (timestamp - lastGhostFrameTimestamp > GHOST_ANIMATION_FRAME_LENGTH) {
    lastGhostFrameTimestamp = timestamp;
    ghostFrame++;
    if (ghostFrame > 1) ghostFrame = 0;
  }
  drawEverything();
  requestAnimationFrame(tick);
}

function drawEverything() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  drawPacman(pacmanPos, direction, pacmanFrame);
  drawGhosts(ghostFrame);
  ctx.fillStyle = 'black';
  //left margin to hide Pacman going into left tunnel
  ctx.fillRect(0, 0, 16, SCREEN_HEIGHT);
}

drawEverything();
requestAnimationFrame(tick);
