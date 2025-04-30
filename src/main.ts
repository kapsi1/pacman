import { Direction, Ghost, GhostName, GridPos, PxPos } from './types';
import {
  CELL_SIZE,
  CHARACTER_SPEED,
  DEBUG_GRID,
  GHOST_ANIMATION_FRAME_LENGTH,
  PACMAN_ANIMATION_FRAME_LENGTH,
  PACMAN_DEATH_FRAME_LENGTH,
  board,
} from './consts';
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from './canvas';
import { drawBoard } from './board';
import { drawPacman, drawGhosts, drawPacmanDeath } from './sprites';
import {
  gridToPx,
  isHorizontalDir,
  pxToGrid,
  pointDistance,
  getNextCell,
  isCellAllowed,
  offsetPos,
  getAllowedDirections,
  randomInt,
  teleportCharacter,
  isThereCollision,
} from './utils';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
const scoreEl = document.querySelector('#score') as HTMLDivElement;

const pacmanPos = gridToPx({ x: 15, y: 23 }); // default
pacmanPos.x += 3;
let pacmanDir = Direction.Right;
let newDirection: Direction | null = null;
let pause = false;
let lastTimestamp: number | null = null;
let pacmanFrame: 0 | 1 | 2 = 0;
let ghostFrame: 0 | 1 = 0;
// Death animation has 10 frames [0..10],
// to this we add 10 fake frames to add a delay before death animation
let deathFrame = -10;
let lastPacmanFrameTimestamp = 0;
let lastGhostFrameTimestamp = 0;
let lastDeathFrameTimestamp = 0;
let score = 0;
let isCornering = false;
// Max distance from cell center in pixels,
// for a point to be counted as being in the center
const epsilon = 0.3;

// export const ghosts: Ghost[] = [
//   { name: GhostName.Blinky, pos: { x: 140, y: 116 }, direction: Direction.Left, lastChangedDirection: 0 },
//   { name: GhostName.Inky, pos: { x: 112, y: 140 }, direction: Direction.Up, lastChangedDirection: 0 },
//   { name: GhostName.Pinky, pos: { x: 128, y: 140 }, direction: Direction.Down, lastChangedDirection: 0 },
//   { name: GhostName.Clyde, pos: { x: 144, y: 140 }, direction: Direction.Up, lastChangedDirection: 0 },
// ];
export const ghosts: Ghost[] = [
  { name: GhostName.Blinky, pos: { x: 120, y: 116 }, direction: Direction.Left, lastChangedDirection: 0 },
  { name: GhostName.Inky, pos: { x: 136, y: 116 }, direction: Direction.Right, lastChangedDirection: 0 },
  { name: GhostName.Pinky, pos: { x: 120, y: 164 }, direction: Direction.Left, lastChangedDirection: 0 },
  { name: GhostName.Clyde, pos: { x: 136, y: 164 }, direction: Direction.Right, lastChangedDirection: 0 },
];

// TODO different speed for Pacman and ghosts
function moveGhosts(deltaPx: number, timestamp: number) {
  for (const ghost of ghosts) {
    if (ghost.lastChangedDirection === 0) ghost.lastChangedDirection = timestamp;
    const minDeltaT = (1 / CHARACTER_SPEED) * 1000 * 4;

    if (timestamp - ghost.lastChangedDirection > minDeltaT) {
      const ghostGridPos: GridPos = pxToGrid(ghost.pos);
      const teleported = teleportCharacter(ghost.direction, ghostGridPos);
      if (teleported !== null) {
        ghost.pos = teleported.pos;
      } else {
        const cellMiddle: PxPos = gridToPx(ghostGridPos);
        const distanceToCellMiddle = pointDistance(ghost.pos, cellMiddle);
        if (distanceToCellMiddle <= epsilon) {
          const { isIntersection, allowedDirections } = getAllowedDirections(ghost);

          if (isIntersection) {
            const randomDir = allowedDirections[randomInt(0, allowedDirections.length)];
            ghost.direction = randomDir;
            ghost.lastChangedDirection = timestamp;
            if (isHorizontalDir(ghost.direction)) {
              ghost.pos.y = Math.round(ghost.pos.y);
            } else {
              ghost.pos.x = Math.round(ghost.pos.x);
            }
          }
        }
      }
    }
    ghost.pos = offsetPos(ghost.pos, deltaPx, ghost.direction);
  }
}

function movePacman(deltaPx: number) {
  let newPos = { x: pacmanPos.x, y: pacmanPos.y };
  newPos = offsetPos(newPos, deltaPx, pacmanDir);
  const currentCell = pxToGrid(pacmanPos);

  // During cornering Pacman moves diagonally until he reaches
  // the centerline of the new direction's path
  if (isCornering) {
    const cellCenter = gridToPx(currentCell);
    const xOffset = pacmanPos.x - cellCenter.x;
    const yOffset = pacmanPos.y - cellCenter.y;

    if (!isHorizontalDir(pacmanDir)) {
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
        (isHorizontalDir(pacmanDir) && !isHorizontalDir(newDirection)) ||
        (!isHorizontalDir(pacmanDir) && isHorizontalDir(newDirection))
      ) {
        isCornering = true;
      }
      pacmanDir = newDirection;
      newDirection = null;
    }
  }

  // newCell - cell after moving delta pixels
  // nextCell - cell neighbouring newCell in the current direction
  let newCell = pxToGrid(newPos);

  const teleported = teleportCharacter(pacmanDir, newCell);
  if (teleported !== null) {
    newPos = teleported.pos;
    newCell = teleported.cell;
  }
  const nextCell = getNextCell(newCell, pacmanDir);

  if (DEBUG_GRID) {
    (window as any).currentCell = pxToGrid(pacmanPos);
    (window as any).nextCell = nextCell;
  }

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
    if (isHorizontalDir(pacmanDir)) {
      pacmanPos.x = Math.round(pacmanPos.x);
    } else {
      pacmanPos.y = Math.round(pacmanPos.y);
    }
  }
  return isAllowed;
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
      if (pacmanDir === Direction.Up) return;
      newDirection = Direction.Up;
      break;
    case 's':
    case 'ArrowDown':
      if (pacmanDir === Direction.Down) return;
      newDirection = Direction.Down;
      break;
    case 'd':
    case 'ArrowRight':
      if (pacmanDir === Direction.Right) return;
      newDirection = Direction.Right;
      break;
    case 'a':
    case 'ArrowLeft':
      if (pacmanDir === Direction.Left) return;
      newDirection = Direction.Left;
      break;
  }
  drawEverything(false);
});

function tick(timestamp: number) {
  if (pause) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (CHARACTER_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  const isCollision = isThereCollision(ghosts, pacmanPos);
  if (isCollision) {
    if (timestamp - lastDeathFrameTimestamp > PACMAN_DEATH_FRAME_LENGTH) {
      lastDeathFrameTimestamp = timestamp;
      deathFrame++;
      if (deathFrame > 10) pause = true;
    }
  } else {
    const pacmanMoved = movePacman(deltaPx);
    if (pacmanMoved && timestamp - lastPacmanFrameTimestamp > PACMAN_ANIMATION_FRAME_LENGTH) {
      lastPacmanFrameTimestamp = timestamp;
      pacmanFrame++;
      if (pacmanFrame > 2) pacmanFrame = 0;
    }

    moveGhosts(deltaPx, timestamp);
    if (timestamp - lastGhostFrameTimestamp > GHOST_ANIMATION_FRAME_LENGTH) {
      lastGhostFrameTimestamp = timestamp;
      ghostFrame++;
      if (ghostFrame > 1) ghostFrame = 0;
    }
  }

  drawEverything(isCollision);
  requestAnimationFrame(tick);
}

function drawEverything(isCollision: boolean) {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  drawBoard();
  if (isCollision && deathFrame >= 0) {
    drawPacmanDeath(pacmanPos, deathFrame);
  } else {
    drawPacman(pacmanPos, pacmanDir, pacmanFrame);
    drawGhosts(ghosts, ghostFrame);
  }
  ctx.fillStyle = 'black';
  // Left margin to hide characters going into the left tunnel
  ctx.fillRect(0, 0, 16, SCREEN_HEIGHT);
}

drawEverything(false);
requestAnimationFrame(tick);
