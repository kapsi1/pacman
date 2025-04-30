import { TOP_MARGIN } from './canvas';
import { WALL_MARGIN, CELL_SIZE, board } from './consts';
import { Direction, Ghost, GridPos, PxPos } from './types';

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

export function pointDistance(point1: PxPos, point2: PxPos) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

export function isCellAllowed(gridPos: GridPos) {
  if (!board[gridPos.y]) return false;
  if (!board[gridPos.y][gridPos.x]) return false;
  if (board[gridPos.y][gridPos.x] === '#') return false;
  return true;
}

export function getNextCell(gridPos: GridPos, direction: Direction) {
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

export function getAllowedNeighbours(ghost: Ghost) {
  const cell = pxToGrid(ghost.pos);
  const allowedDirections: Direction[] = [];
  let isIntersection = false;

  const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
  const gDir = ghost.direction;
  for (let i = 0; i < directions.length; i++) {
    const dir = directions[i];
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
  return { isIntersection, allowedDirections };
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export function teleportCharacter(direction: Direction, cell: GridPos) {
  let newPos: PxPos = { x: 0, y: 0 };
  let newCell: GridPos = { x: 0, y: 0 };
  // console.log(direction, cell);

  // Teleport from left to right pipe
  if (direction === Direction.Left && cell.x === 0 && cell.y === 14) {
    newPos = { x: 252, y: 140 };
    newCell = { x: 31, y: 14 };
    return { pos: newPos, cell: newCell };
  }
  // Teleport from right to left pipe
  if (direction === Direction.Right && cell.x === 31 && cell.y === 14) {
    newPos = { x: 0, y: 140 };
    newCell = { x: 0, y: 14 };
    return { pos: newPos, cell: newCell };
  }

  return null;
}
