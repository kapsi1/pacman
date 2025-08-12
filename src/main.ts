/*
TODO
fruit
ghost AI
ghosts start in cage
ghosts have different speed than pacman
ghosts have different speed in tunnels
energizers
sound
mute button
fullscreen button
next level
cutscenes
*/

import { Direction, Ghost, GridPos, PxPos } from './types';
import {
  CELL_SIZE,
  CHARACTER_SPEED,
  DEBUG_GRID,
  GHOST_ANIMATION_FRAME_LENGTH,
  GHOST_STARTS,
  NEW_LIFE_EVERY_POINTS,
  PACMAN_ANIMATION_FRAME_LENGTH,
  PACMAN_DEATH_FRAME_LENGTH,
  PACMAN_START_DIR,
  PACMAN_START_POS,
  STARTING_PAUSE,
  INITIAL_LIVES,
  board,
  DEATH_ANIMATION_TOTAL_FRAMES,
  DEATH_ANIMATION_START_PAUSE_FRAMES,
} from './consts';
import { ctx, SCREEN_HEIGHT, SCREEN_WIDTH } from './canvas';
import { drawBoard } from './board';
import { drawPacman, drawGhosts, drawDeathAnimation, drawLives } from './sprites';

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
  updateScore,
  hideReadyText,
  showGameOver,
  hideGameOver,
  showReadyText,
} from './utils';

const debugEl = document.querySelector('#debug') as HTMLDivElement;
// Max distance from cell center in pixels,
// for a point to be counted as being in the center
const epsilon = 0.3;
let pacmanPos: PxPos,
  pacmanDir: Direction,
  newDirection: Direction | null,
  isPaused: boolean,
  isGameOver: boolean,
  lastTimestamp: number | null,
  pacmanFrame: 0 | 1 | 2,
  ghostFrame: 0 | 1,
  deathAnimationFrame: number,
  lastPacmanFrameTimestamp: number,
  lastGhostFrameTimestamp: number,
  lastDeathFrameTimestamp: number,
  score: number,
  isCornering: boolean,
  lives: number,
  lastLifeScore: number,
  ghosts: Ghost[];

function resetLife() {
  isPaused = true;
  pacmanFrame = 0;
  ghostFrame = 0;
  deathAnimationFrame = 0;
  lastPacmanFrameTimestamp = 0;
  lastGhostFrameTimestamp = 0;
  lastDeathFrameTimestamp = 0;
  lastTimestamp = null;
  pacmanPos = gridToPx(PACMAN_START_POS);
  pacmanPos.x = pacmanPos.x + 3;
  pacmanDir = PACMAN_START_DIR;
  newDirection = null;
  isCornering = false;
  ghosts = JSON.parse(JSON.stringify(GHOST_STARTS));
  showReadyText();
  drawEverything(false);
  setTimeout(() => {
    hideReadyText();
    isPaused = false;
    requestAnimationFrame(tick);
  }, STARTING_PAUSE);
}

function resetGameState() {
  isGameOver = false;
  score = 0;
  lives = INITIAL_LIVES;
  lastLifeScore = 0;
  resetLife();
  updateScore('00');
  hideGameOver();
}

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
        const cellCenter: PxPos = gridToPx(ghostGridPos);
        const distanceToCellCenter = pointDistance(ghost.pos, cellCenter);
        if (distanceToCellCenter <= epsilon) {
          const { isIntersection, allowedDirections } = getAllowedDirections(ghost);

          if (isIntersection) {
            const randomDir = allowedDirections[randomInt(0, allowedDirections.length - 1)];
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
      updateScore(score.toString());
      const row = board[newCell.y];
      board[newCell.y] = row.substring(0, newCell.x) + ' ' + row.substring(newCell.x + 1);
      if (Math.floor(score / NEW_LIFE_EVERY_POINTS) > Math.floor(lastLifeScore / NEW_LIFE_EVERY_POINTS)) {
        lives += 1;
        lastLifeScore = score;
      }
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
  if (isGameOver) {
    if (event.key === ' ') resetGameState();
    return;
  }
  switch (event.key) {
    case 'f':
      // Toggle fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      break;
    case '`':
    case ' ':
      isPaused = !isPaused;
      if (!isPaused) {
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
  if (isPaused) return;
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaT = timestamp - lastTimestamp;
  const deltaPx = (CHARACTER_SPEED * deltaT) / 1000;
  lastTimestamp = timestamp;

  const isCollision = isThereCollision(ghosts, pacmanPos);
  if (isCollision) {
    if (timestamp - lastDeathFrameTimestamp > PACMAN_DEATH_FRAME_LENGTH) {
      lastDeathFrameTimestamp = timestamp;
      deathAnimationFrame++;
      if (deathAnimationFrame > DEATH_ANIMATION_TOTAL_FRAMES) {
        lives--;
        if (lives > 0) {
          resetLife();
        } else {
          isPaused = true;
          isGameOver = true;
          showGameOver();
        }
      }
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
  drawLives(lives);
  // After a collision, show ghosts for DEATH_ANIMATION_START_PAUSE_FRAMES,
  // then hide them for the rest of death animation
  if (isCollision && deathAnimationFrame >= DEATH_ANIMATION_START_PAUSE_FRAMES) {
    drawDeathAnimation(pacmanPos, deathAnimationFrame);
  } else {
    drawPacman(pacmanPos, pacmanDir, pacmanFrame);
    drawGhosts(ghosts, ghostFrame);
  }
  ctx.fillStyle = 'black';
  // Left margin to hide characters going into the left tunnel
  ctx.fillRect(0, 0, 16, SCREEN_HEIGHT);
}

// Start game
resetGameState();
