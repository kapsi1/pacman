import { TOP_MARGIN } from './canvas';
import { WALL_MARGIN, CELL_SIZE, board, FULL_SPEED, GHOST_NO_UP_TILES, SCATTER_TARGETS } from './consts';
import { Direction, GhostMode, GhostName } from './types';
import type { Ghost, GridPos, PxPos, PacmanState } from './types';

export const isHorizontalDir = (direction: Direction) => direction === Direction.Left || direction === Direction.Right;

// Returns middle point of the cell
export function gridToPx(gridPos: GridPos): PxPos {
  return {
    x: WALL_MARGIN + gridPos.x * CELL_SIZE + CELL_SIZE / 2,
    y: TOP_MARGIN + WALL_MARGIN + gridPos.y * CELL_SIZE + CELL_SIZE / 2,
  };
}

export function pxToGrid(pxPos: PxPos): GridPos {
  return {
    x: Math.floor((pxPos.x - WALL_MARGIN) / CELL_SIZE),
    y: Math.floor((pxPos.y - WALL_MARGIN - TOP_MARGIN) / CELL_SIZE),
  };
}

export function pointDistance(point1: PxPos, point2: PxPos): number {
  // d = √((x₂ - x₁)² + (y₂ - y₁)²)
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

// Squared Euclidean distance — cheaper than pointDistance for comparisons.
export function pointDistanceSq(point1: PxPos, point2: PxPos): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return dx * dx + dy * dy;
}

export function isCellAllowed(gridPos: GridPos): boolean {
  if (!board[gridPos.y]) return false;
  if (!board[gridPos.y][gridPos.x]) return false;
  if (board[gridPos.y][gridPos.x] === '#') return false;
  return true;
}

export function getNextCell(gridPos: GridPos, direction: Direction): GridPos {
  let x = gridPos.x;
  let y = gridPos.y;
  if (direction === Direction.Down) y++;
  else if (direction === Direction.Up) y--;
  else if (direction === Direction.Left) x--;
  else if (direction === Direction.Right) x++;
  return { x, y };
}

export function offsetPos(pos: PxPos, deltaPx: number, direction: Direction): PxPos {
  const newPos = { x: pos.x, y: pos.y };
  if (direction === Direction.Right) newPos.x += deltaPx;
  if (direction === Direction.Left) newPos.x -= deltaPx;
  if (direction === Direction.Down) newPos.y += deltaPx;
  if (direction === Direction.Up) newPos.y -= deltaPx;
  return newPos;
}

export function getAllowedDirections(ghost: Ghost) {
  const cell = pxToGrid(ghost.pos);
  const allowedDirections: Direction[] = [];
  let isIntersection = false;

  const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
  const gDir = ghost.direction;

  for (let i = 0; i < directions.length; i++) {
    const dir = directions[i];
    // Don't allow reversing direction
    if (dir === Direction.Left && gDir === Direction.Right) continue;
    if (dir === Direction.Right && gDir === Direction.Left) continue;
    if (dir === Direction.Up && gDir === Direction.Down) continue;
    if (dir === Direction.Down && gDir === Direction.Up) continue;
    const nextCell = getNextCell(cell, dir);
    if (isCellAllowed(nextCell)) {
      if (isHorizontalDir(dir) && !isHorizontalDir(gDir)) isIntersection = true;
      if (!isHorizontalDir(dir) && isHorizontalDir(gDir)) isIntersection = true;
      allowedDirections.push(dir);
    }
  }

  // Remove UP direction if on a forbidden tile and not frightened
  if (!ghost.frightened) {
    const isForbidden = GHOST_NO_UP_TILES.some((tile) => tile.x === cell.x && tile.y === cell.y);
    if (isForbidden) {
      const upIndex = allowedDirections.indexOf(Direction.Up);
      if (upIndex !== -1) {
        allowedDirections.splice(upIndex, 1);
      }
    }
  }

  return { isIntersection, allowedDirections };
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function teleportCharacter(direction: Direction, cell: GridPos) {
  let newPos: PxPos = { x: 0, y: 0 };
  let newCell: GridPos = { x: 0, y: 0 };

  // Teleport from left to right tunnel
  if (direction === Direction.Left && cell.x === 0 && cell.y === 14) {
    newPos = { x: 252, y: 140 };
    newCell = { x: 31, y: 14 };
    return { pos: newPos, cell: newCell };
  }
  // Teleport from right to left tunnel
  if (direction === Direction.Right && cell.x === 31 && cell.y === 14) {
    newPos = { x: 0, y: 140 };
    newCell = { x: 0, y: 14 };
    return { pos: newPos, cell: newCell };
  }

  return null;
}

export function isThereCollision(ghosts: Ghost[], pacmanPos: PxPos): boolean {
  for (let i = 0; i < ghosts.length; i++) {
    const ghost = ghosts[i];
    if (ghost.isEyes) continue;
    if (pointDistanceSq(ghost.pos, pacmanPos) <= 1) {
      return true;
    }
  }
  return false;
}

const scoreEl = document.querySelector('#score') as HTMLDivElement;
const highScoreEl = document.querySelector('#high-score') as HTMLDivElement;

export function updateScore(score: string) {
  if (!scoreEl) return;
  scoreEl.textContent = score;
  let highScore = localStorage.getItem('highScore') || '0';

  if (parseInt(score) > parseInt(highScore)) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    if (highScoreEl) highScoreEl.textContent = highScore;
  }
}

if (highScoreEl) highScoreEl.textContent = localStorage.getItem('highScore') || '00';

const readyTextEl = document.querySelector('#ready') as HTMLDivElement;
export function showReadyText() {
  if (readyTextEl) readyTextEl.style.display = 'block';
}

export function hideReadyText() {
  if (readyTextEl) readyTextEl.style.display = 'none';
}

const gameOverTextEl = document.querySelector('#game-over') as HTMLDivElement;
export function showGameOver() {
  if (gameOverTextEl) gameOverTextEl.style.display = 'block';
}

export function hideGameOver() {
  if (gameOverTextEl) gameOverTextEl.style.display = 'none';
}

export function getPacmanSpeed(level: number, isFright = false): number {
  if (level === 1) {
    return isFright ? FULL_SPEED * 0.9 : FULL_SPEED * 0.8;
  } else if (level >= 2 && level <= 4) {
    return isFright ? FULL_SPEED * 0.95 : FULL_SPEED * 0.9;
  } else if (level >= 5 && level <= 20) {
    return FULL_SPEED;
  } else {
    return FULL_SPEED * 0.9;
  }
}

export function getGhostSpeed(level: number, isFright = false, isTunnel = false, isEyes = false): number {
  if (isEyes) return FULL_SPEED * 2;
  if (level === 1) {
    if (isFright) return FULL_SPEED * 0.5;
    if (isTunnel) return FULL_SPEED * 0.4;
    return FULL_SPEED * 0.75;
  } else if (level >= 2 && level <= 4) {
    if (isFright) return FULL_SPEED * 0.55;
    if (isTunnel) return FULL_SPEED * 0.45;
    return FULL_SPEED * 0.85;
  } else if (level >= 5 && level <= 20) {
    if (isFright) return FULL_SPEED * 0.6;
    if (isTunnel) return FULL_SPEED * 0.5;
    return FULL_SPEED * 0.95;
  } else {
    if (isTunnel) return FULL_SPEED * 0.5;
    return FULL_SPEED * 0.95;
  }
}

export function getBestDirection(ghost: Ghost, target: PxPos, allowedDirections: Direction[]): Direction {
  if (allowedDirections.length === 0) return ghost.direction;
  let bestDir = allowedDirections[0];
  let minDistance = Infinity;
  const currentCell = pxToGrid(ghost.pos);

  for (const dir of allowedDirections) {
    const nextCell = getNextCell(currentCell, dir);
    const nextPos = gridToPx(nextCell);
    const dist = pointDistanceSq(nextPos, target);
    if (dist < minDistance) {
      minDistance = dist;
      bestDir = dir;
    }
  }
  return bestDir;
}

export function getGhostTarget(ghost: Ghost, pacman: PacmanState, blinkyPos: PxPos, currentMode: GhostMode): PxPos {
  if (currentMode === GhostMode.Scatter) {
    switch (ghost.name) {
      case GhostName.Blinky: return gridToPx(SCATTER_TARGETS.Blinky);
      case GhostName.Pinky: return gridToPx(SCATTER_TARGETS.Pinky);
      case GhostName.Inky: return gridToPx(SCATTER_TARGETS.Inky);
      case GhostName.Clyde: return gridToPx(SCATTER_TARGETS.Clyde);
    }
  }

  const pacmanGridPos = pxToGrid(pacman.pos);

  switch (ghost.name) {
    case GhostName.Blinky:
      return pacman.pos;

    case GhostName.Pinky: {
      let targetGrid = getNextCell(pacmanGridPos, pacman.dir);
      for (let i = 1; i < 4; i++) {
        targetGrid = getNextCell(targetGrid, pacman.dir);
      }
      if (pacman.dir === Direction.Up) {
        targetGrid.x -= 4;
      }
      return gridToPx(targetGrid);
    }

    case GhostName.Inky: {
      let pivotGrid = getNextCell(pacmanGridPos, pacman.dir);
      pivotGrid = getNextCell(pivotGrid, pacman.dir);
      if (pacman.dir === Direction.Up) {
        pivotGrid.x -= 2;
      }
      const pivotPx = gridToPx(pivotGrid);
      const vectorX = pivotPx.x - blinkyPos.x;
      const vectorY = pivotPx.y - blinkyPos.y;
      return {
        x: pivotPx.x + vectorX,
        y: pivotPx.y + vectorY,
      };
    }

    case GhostName.Clyde: {
      const dist = pointDistanceSq(ghost.pos, pacman.pos);
      if (dist > (8 * CELL_SIZE) ** 2) {
        return pacman.pos;
      }
      return gridToPx(SCATTER_TARGETS.Clyde);
    }

    default:
      return pacman.pos;
  }
}
